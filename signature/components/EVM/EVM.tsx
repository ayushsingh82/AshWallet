"use client";

import { useState, useEffect, useRef } from "react";
import Web3 from "web3";

import { useDebounce } from "../../hooks/debounce";
import { SIGNET_CONTRACT, MPC_CONTRACT } from "../../config";
import { chainAdapters } from "chainsig.js";
import { createPublicClient, http } from "viem";
import { bigIntToDecimal } from "../../utils/bigIntToDecimal";
import { TransferForm } from "./Transfer";
import { FunctionCallForm } from "./Function";
import { setupHotWallet } from "@near-wallet-selector/hot-wallet";
import {
  setupWalletSelector,
  WalletSelector,
  WalletModuleFactory,
} from "@near-wallet-selector/core";


type StatusSetter = (value: string | React.ReactNode) => void;

export interface ExternalSigner {
  accountId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signAndSendTransactions: (params: { transactions: any[] }) => Promise<unknown>;
}

interface EVMViewProps {
  props: {
    setStatus: StatusSetter;
    network: {
      network: string;
      token: string;
      rpcUrl: string;
      explorerUrl: string;
      contractAddress: string;
    };
  };
  signer?: ExternalSigner;
}

export function EVMView({
    props: {
      setStatus,
      network: { network, token, rpcUrl, explorerUrl, contractAddress },
    },
    signer,
  }: EVMViewProps) {
    // If external signer provided, prefer it; else create local Hot Wallet selector
    const [nearSelector, setNearSelector] = useState<WalletSelector | null>(null);
    const [nearAccountId, setNearAccountId] = useState<string | null>(signer?.accountId ?? null);
    
    // Use external signer or fallback to local selector
    const finalAccountId = signer?.accountId ?? nearAccountId;
    const finalSignAndSendTransactions = signer?.signAndSendTransactions ?? (async (params: { transactions: any[] }) => {
      if (!nearSelector) throw new Error("NEAR Hot Wallet not initialized");
      const wallet = await nearSelector.wallet();
      return await wallet.signAndSendTransactions(params);
    });
  
    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState("request");
    const [senderLabel, setSenderLabel] = useState("");
    const [senderAddress, setSenderAddress] = useState<string>("");
    const [balance, setBalance] = useState<string>("");
    const [action, setAction] = useState("transfer");
    const [derivationPath, setDerivationPath] = useState(
      `${network.replace(/\s/g, "").toLowerCase()}-1`,
    );
    const [signedTransaction, setSignedTransaction] = useState<any>(null);
    const [gasPriceInGwei, setGasPriceInGwei] = useState("");
    const [txCost, setTxCost] = useState("");
  
    const debouncedDerivationPath = useDebounce(derivationPath, 1200);
    const childRef = useRef<any>(null);
    const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
  
    const publicClient = createPublicClient({
      transport: http(rpcUrl),
    });
  
    const Evm = new chainAdapters.evm.EVM({
      publicClient,
      contract: SIGNET_CONTRACT,
    });
  
    useEffect(() => {
      async function fetchEthereumGasPrice() {
        try {
          // Fetch gas price in Wei
          const gasPriceInWei = await web3.eth.getGasPrice();
  
          // Convert gas price from Wei to Gwei
          const gasPriceInGwei = web3.utils.fromWei(gasPriceInWei, "gwei");
  
          // Gas limit for a standard ETH transfer
          const gasLimit = 21000;
  
          // Calculate transaction cost in ETH (gwei * gasLimit) / 1e9
          const txCost = (parseFloat(gasPriceInGwei) * gasLimit) / 1000000000;
  
          // Format both gas price and transaction cost to 7 decimal places
          const formattedGasPriceInGwei = parseFloat(gasPriceInGwei).toFixed(7);
          const formattedTxCost = txCost.toFixed(7);
  
          console.log(
            `Current Sepolia Gas Price: ${formattedGasPriceInGwei} Gwei`,
          );
          console.log(`Estimated Transaction Cost: ${formattedTxCost} ${token}`);
  
          setTxCost(formattedTxCost);
          setGasPriceInGwei(formattedGasPriceInGwei);
        } catch (error) {
          console.error("Error fetching gas price:", error);
        }
      }
  
      fetchEthereumGasPrice();
    }, []);
  
    // Handle changes to derivation path and query Ethereum address and balance
    useEffect(() => {
      resetAddressState();
      fetchEthereumAddress();
    }, [debouncedDerivationPath, finalAccountId]);
  
    const resetAddressState = () => {
      setSenderLabel("Waiting for you to stop typing...");
      setSenderAddress("");
      setStatus("");
      setBalance(""); // Reset balance when derivation path changes
      setCurrentStep("request");
    };
  
    const fetchEthereumAddress = async () => {
      if (!finalAccountId) return;
      
      const { address } = await Evm.deriveAddressAndPublicKey(
        finalAccountId,
        debouncedDerivationPath,
      );
      setSenderAddress(address);
      setSenderLabel(address);
      const balance = await Evm.getBalance(address);
      setBalance(bigIntToDecimal(balance.balance, balance.decimals));
    };
  
    async function chainSignature() {
      setStatus("🏗️ Creating transaction");
  
      const { transaction, hashesToSign } =
        await childRef.current.createTransaction();
  
      setStatus(
        `🕒 Asking ${MPC_CONTRACT} to sign the transaction, this might take a while`,
      );
  
      try {
        const rsvSignatures = await SIGNET_CONTRACT.sign({
          payloads: hashesToSign,
          path: debouncedDerivationPath,
          keyType: "Ecdsa",
          signerAccount: {
            accountId: finalAccountId!,
            signAndSendTransactions: finalSignAndSendTransactions,
          },
        });
  
        const finalizedTransaction = Evm.finalizeTransactionSigning({
          transaction,
          rsvSignatures,
        });
  
        setSignedTransaction(finalizedTransaction);
  
        setStatus(
          `✅ Signed payload ready to be relayed to the Ethereum network`,
        );
        setCurrentStep("relay");
      } catch (e: any) {
        console.log(e);
        setStatus(`❌ Error: ${e.message}`);
        setIsLoading(false);
      }
    }
  
    async function relayTransaction() {
      setIsLoading(true);
      setStatus(
        "🔗 Relaying transaction to the Ethereum network... this might take a while",
      );
  
      try {
        const transactionHash = await Evm.broadcastTx(signedTransaction);
        setStatus(
          <>
            <a href={`${explorerUrl}${transactionHash.hash}`} target="_blank">
              {" "}
              ✅ Successful{" "}
            </a>
          </>,
        );
        childRef.current.afterRelay();
      } catch (e: any) {
        setStatus(`❌ Error: ${e.message}`);
      }
  
      setCurrentStep("request");
      setIsLoading(false);
    }
  
    const UIChainSignature = async () => {
      setIsLoading(true);
      await chainSignature();
      setIsLoading(false);
    };
  
    return (
      <div>
        {/* Form Inputs */}
  
        <div className="input-group input-group-sm my-2 mb-2">
          <span className="input-group-text bg-primary text-white" id="chain">
            PATH
          </span>
          <input
            type="text"
            className="form-control form-control-sm"
            value={derivationPath}
            onChange={(e) => setDerivationPath(e.target.value)}
            disabled={isLoading}
          />
        </div>
  
        {/* ADDRESS & BALANCE */}
        <div className="card">
          <div className="row mb-0">
            <label className="col-sm-2 col-form-label text-end">Address:</label>
            <div className="col-sm-10 fs-5">
              <div className="form-text" id="eth-sender">
                {senderLabel}
              </div>
            </div>
          </div>
          <div className="row mb-0">
            <label className="col-sm-2 col-form-label text-end">Balance:</label>
            <div className="col-sm-10 fs-5">
              <div className="form-text text-muted ">
                {balance ? (
                  `${balance} ${token}`
                ) : (
                  <span className="text-warning">Fetching balance...</span>
                )}
              </div>
            </div>
          </div>
        </div>
  
        <div className="input-group input-group-sm my-2 mb-4">
          <span className="input-group-text bg-info text-white" id="chain">
            ACTION
          </span>
          <select
            className="form-select"
            aria-describedby="chain"
            onChange={(e) => setAction(e.target.value)}
            disabled={isLoading}
          >
            <option value="transfer">Ξ Transfer</option>
            <option value="function-call">Ξ Call Counter</option>
          </select>
        </div>
  
        {action === "transfer" ? (
          <TransferForm
            ref={childRef}
            props={{ Evm, senderAddress, isLoading, token }}
          />
        ) : (
          <FunctionCallForm
            ref={childRef}
            props={{
              contractAddress,
              senderAddress,
              rpcUrl,
              isLoading,
              Evm,
            }}
          />
        )}
  
        <div className="text-center d-flex justify-content-center">
          <div className="table-responsive " style={{ maxWidth: "400px" }}>
            <table className="table table-hover text-center w-auto">
              <caption className="caption-top text-center">
                Sepolia Gas Prices
              </caption>
              <thead>
                <tr className="table-light">
                  <th scope="col">Price</th>
                  <th scope="col">Unit</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{gasPriceInGwei}</td>
                  <td>GWEI</td>
                </tr>
                <tr>
                  <td>{txCost}</td>
                  <td>{token}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
  
        {/* Execute Buttons */}
        <div className="d-grid gap-2">
          {currentStep === "request" && (
            <button
              className="btn btn-outline-success text-center btn-lg"
              onClick={UIChainSignature}
              disabled={isLoading}
            >
              Request Signature
            </button>
          )}
          {currentStep === "relay" && (
            <button
              className="btn btn-success text-center"
              onClick={relayTransaction}
              disabled={isLoading}
            >
              Relay Transaction
            </button>
          )}
        </div>
      </div>
    );
  }
  