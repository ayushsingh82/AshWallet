"use client";
import PropTypes from "prop-types";

import { useEffect, useState } from "react";
import { useDebounce } from "../hooks/debounce";
import { SIGNET_CONTRACT } from "../config";
import { Connection as SolanaConnection } from "@solana/web3.js";
import { chainAdapters } from "chainsig.js";
import { bigIntToDecimal } from "../utils/bigIntToDecimal";
import { decimalToBigInt } from "../utils/decimalToBigInt";
import { setupHotWallet } from "@near-wallet-selector/hot-wallet";
import {
  setupWalletSelector,
  WalletSelector,
  WalletModuleFactory,
} from "@near-wallet-selector/core";

// Configure NEAR network here (align with your app). Default to testnet.
const NEAR_NETWORK: "testnet" | "mainnet" = "testnet";

type StatusSetter = (value: string) => void;

export interface ExternalSigner {
  accountId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signAndSendTransactions: (params: { transactions: any[] }) => Promise<unknown>;
}

interface SolanaViewProps {
  props: { setStatus: StatusSetter };
  signer?: ExternalSigner;
}

const connection = new SolanaConnection("https://api.devnet.solana.com");

const Solana = new chainAdapters.solana.Solana({
  solanaConnection: connection,
  contract: SIGNET_CONTRACT,
});

export function SolanaView({ props: { setStatus }, signer }: SolanaViewProps) {
  // If external signer provided, prefer it; else create local Hot Wallet selector
  const [nearSelector, setNearSelector] = useState<WalletSelector | null>(null);
  const [nearAccountId, setNearAccountId] = useState<string | null>(signer?.accountId ?? null);

  // Basic UI state
  const [receiverAddress, setReceiverAddress] = useState(
    "G58AYKiiNy7wwjPAeBAQWTM6S1kJwP3MQ3wRWWhhSJxA",
  );
  const [transferAmount, setTransferAmount] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState("request");
  const [signedTransaction, setSignedTransaction] = useState<unknown>(null);
  const [senderAddress, setSenderAddress] = useState("");

  const [derivationPath, setDerivationPath] = useState("solana-1");
  const debouncedDerivationPath = useDebounce(derivationPath, 500);

  // Initialize local NEAR Hot Wallet selector only if external signer not provided
  useEffect(() => {
    if (signer) return;

    let sub: { unsubscribe: () => void } | null = null;

    setupWalletSelector({
      network: NEAR_NETWORK,
      modules: [setupHotWallet() as WalletModuleFactory],
    }).then((selector) => {
      setNearSelector(selector);
      const { store } = selector;
      sub = store.observable.subscribe(({ accounts }) => {
        const active = accounts.find((a) => a.active)?.accountId || null;
        setNearAccountId(active);
      });
    });

    return () => {
      if (sub) sub.unsubscribe();
    };
  }, [signer]);

  useEffect(() => {
    setSenderAddress("Waiting for you to stop typing...");
  }, [derivationPath]);

  useEffect(() => {
    setSolanaAddress();

    async function setSolanaAddress() {
      try {
        setStatus("Querying your address and balance");
        setSenderAddress(`Deriving address from path ${debouncedDerivationPath}...`);

        const accountId = signer?.accountId ?? nearAccountId;
        if (!accountId) {
          throw new Error("No account ID available. Please connect your wallet.");
        }

        console.log("Deriving address for account:", accountId);
        console.log("Using derivation path:", debouncedDerivationPath);

        const { publicKey } = await Solana.deriveAddressAndPublicKey(
          accountId,
          debouncedDerivationPath,
        );

        setSenderAddress(publicKey);

        const balance = await Solana.getBalance(publicKey);

        setStatus(
          `Your Solana address is: ${publicKey}, balance: ${bigIntToDecimal(
            balance.balance,
            balance.decimals,
          )} SOL`,
        );
      } catch (error) {
        console.error("Error deriving address:", error);
        setStatus(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }, [signer?.accountId, nearAccountId, debouncedDerivationPath, setStatus]);

  // Helper: signAndSendTransactions using provided signer or local selector (Hot Wallet)
  const signAndSendTransactions = async (params: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transactions: any[];
  }): Promise<any> => {
    if (signer) {
      return signer.signAndSendTransactions(params);
    }
    if (!nearSelector) throw new Error("NEAR Hot Wallet not initialized");
    const wallet = await nearSelector.wallet();
    return await wallet.signAndSendTransactions(params);
  };

  async function handleChainSignature() {
    setStatus("🏗️ Creating transaction");

    const {
      transaction: { transaction },
    } = await Solana.prepareTransactionForSigning({
      from: senderAddress,
      to: receiverAddress,
      amount: decimalToBigInt(transferAmount, 9),
    });

    setStatus("🕒 Asking MPC to sign the transaction, this might take a while...");

    try {
      const rsvSignatures = await SIGNET_CONTRACT.sign({
        payloads: [transaction.serializeMessage()],
        path: debouncedDerivationPath,
        keyType: "Eddsa",
        signerAccount: {
          accountId: (signer?.accountId ?? nearAccountId) || "",
          signAndSendTransactions,
        },
      });

      if (!rsvSignatures[0]) {
        throw new Error("Failed to sign transaction");
      }

      const finalizedTransaction = Solana.finalizeTransactionSigning({
        transaction,
        rsvSignatures: rsvSignatures[0] as any,
        senderAddress,
      });

      setStatus("✅ Signed payload ready to be relayed to the Solana network");
      setSignedTransaction(finalizedTransaction);
      setCurrentStep("relay");
    } catch (error: unknown) {
      console.log(error);
      const message = error instanceof Error ? error.message : String(error);
      setStatus(`❌ Error: ${message}`);
      setIsLoading(false);
    }
  }

  async function handleRelayTransaction() {
    setIsLoading(true);
    setStatus(
      "🔗 Relaying transaction to the Solana network... this might take a while",
    );

    try {
      const transactionHash = await Solana.broadcastTx(signedTransaction as any);

      const url = `https://explorer.solana.com/tx/${(transactionHash as any).hash || transactionHash}?cluster=devnet`;
      setStatus(`✅ Successfully Broadcasted: ${url}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      setStatus(`❌ Error: ${message}`);
    }

    setCurrentStep("request");
    setIsLoading(false);
  }

  const handleUIChainSignature = async () => {
    setIsLoading(true);
    await handleChainSignature();
    setIsLoading(false);
  };

  const isConnected = Boolean(signer?.accountId ?? nearAccountId);

  return (
    <>
      {/* <div className="alert alert-info text-center" role="alert" style={{ border: '1px solid #93c5fd', borderRadius: 8 }}>
        You are working with <strong>DevNet</strong>.
        <br />
        You can get funds from the faucet:
        <a
          href="https://faucet.solana.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="alert-link"
        >
          faucet.solana.com/
        </a>
      </div> */}
      <div className="row my-3" style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
        <label className="col-sm-2 col-form-label col-form-label-sm">
          Path:
        </label>
        <div className="col-sm-10">
          <input
            type="text"
            className="form-control form-control-sm"
            value={derivationPath}
            onChange={(e) => setDerivationPath(e.target.value)}
            disabled={isLoading}
            style={{ border: '1px solid #d1d5db' }}
          />
          <div className="form-text" id="sol-sender" style={{ border: '1px dashed #d1d5db', borderRadius: 6, padding: 8, marginTop: 8 }}>
             {senderAddress} 
          </div>
        </div>
      </div>
      <div className="row mb-3" style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
        <label className="col-sm-2 col-form-label col-form-label-sm">To:</label>
        <div className="col-sm-10">
          <input
            type="text"
            className="form-control form-control-sm"
            value={receiverAddress}
            onChange={(e) => setReceiverAddress(e.target.value)}
            disabled={isLoading}
            style={{ border: '1px solid #d1d5db' }}
          />
        </div>
      </div>
      <div className="row mb-3" style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
        <label className="col-sm-2 col-form-label col-form-label-sm">
          Amount:
        </label>
        <div className="col-sm-10">
          <div className="input-group">
            <input
              type="number"
              className="form-control form-control-sm"
              value={transferAmount}
              onChange={(e) => setTransferAmount(Number(e.target.value))}
              step="0.1"
              min="0"
              disabled={isLoading}
              style={{ border: '1px solid #d1d5db' }}
            />
            <span className="input-group-text bg-primary text-white fw-bold" style={{ border: '1px solid #93c5fd' }}>
              SOL
            </span>
          </div>
        </div>
      </div>

      <div className="text-center mt-3" style={{ borderTop: '1px solid #e5e7eb', paddingTop: 12 }}>
        <button
          className="btn btn-primary text-center"
          onClick={handleUIChainSignature}
          disabled={isLoading || !isConnected}
          style={{ border: '1px solid #93c5fd' }}
        >
          {isConnected ? "Sign & Derive Address" : "Connect NEAR Wallet"}
        </button>
        {currentStep === "relay" && (
          <button
            className="btn btn-success text-center ms-2"
            onClick={handleRelayTransaction}
            disabled={isLoading}
            style={{ border: '1px solid #34d399' }}
          >
             Relay Transaction 
          </button>
        )}
      </div>
    </>
  );
}

SolanaView.propTypes = {
  props: (PropTypes as any).shape({
    setStatus: (PropTypes as any).func.isRequired,
  }).isRequired,
};