"use client";

import {
  useContext,
  createContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { distinctUntilChanged, map } from "rxjs";
import "@near-wallet-selector/modal-ui/styles.css";
import { setupModal } from "@near-wallet-selector/modal-ui";
import {
  WalletSelector,
  setupWalletSelector,
  WalletModuleFactory,
} from "@near-wallet-selector/core";

import { VertoContract, NetworkId } from "../lib/config/near";
import { providers } from "near-api-js";
import { MethodParameters } from "../lib/type/type";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import { setupHotWallet } from "@near-wallet-selector/hot-wallet";
import { setupBitteWallet } from "@near-wallet-selector/bitte-wallet";

const THIRTY_TGAS = "30000000000000";
const NO_DEPOSIT = "0";

type AuthStatusType = "loading" | "authenticated" | "unauthenticated" | "error";

interface ViewMethodParams {
  contractId: string;
  method: string;
  args?: Record<string, unknown>;
}

interface CallMethodParams {
  contractId: string;
  method: string;
  args: Record<string, unknown>;
  gas: string;
  deposit: string;
}

const NearWalletContext = createContext<{
  signIn: () => Promise<void | string>;
  signOut: () => void;
  viewMethod: (params: ViewMethodParams) => Promise<unknown>;
  callMethod: (params: CallMethodParams) => Promise<unknown>;
  callMethods: (walletParameters: MethodParameters[]) => Promise<unknown>;
  accountId: string | null;
  status: AuthStatusType;
  getTransactionResult: (transactionHash: string) => Promise<unknown>;
}>({
  viewMethod: async () => {},
  callMethod: async () => {},
  getTransactionResult: async () => {},
  callMethods: async () => {},
  status: "loading",
  accountId: null,
  signIn: async () => {},
  signOut: () => {},
});

const NearWalletProvider = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState<AuthStatusType>("loading");
  const [walletSelector, setWalletSelector] = useState<WalletSelector | null>(
    null
  );
  const [accountId, setAccountId] = useState<string | null>(null);

  useEffect(() => {
    setupWalletSelector({
      network: NetworkId,
      modules: [
        setupMeteorWallet({}) as WalletModuleFactory,
        setupBitteWallet({}) as WalletModuleFactory,
        setupHotWallet() as WalletModuleFactory,
      ],
    }).then((selector) => {
      setWalletSelector(selector);
      setStatus(selector.isSignedIn() ? "authenticated" : "unauthenticated");
      selector.store.observable
        .pipe(
          map((state) => state.accounts),
          distinctUntilChanged()
        )
        .subscribe((accounts) => {
          const signedAccount = accounts.find(
            (account) => account.active
          )?.accountId;
          setAccountId(signedAccount || null);
          setStatus(signedAccount ? "authenticated" : "unauthenticated");
        });
    });
  }, []);

  const signIn = async () => {
    if (!walletSelector) {
      console.error("Wallet selector not initialized");
      return;
    }
    
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const modal = setupModal(walletSelector as any, {
        contractId: VertoContract,
      });
      modal.show();
    } catch (error) {
      console.error("Error setting up modal:", error);
    }
  };

  const signOut = async () => {
    const selectedWallet = await walletSelector?.wallet();
    await selectedWallet?.signOut();
    setStatus("unauthenticated");
  };

  const viewMethod = async ({
    contractId,
    method,
    args = {},
  }: ViewMethodParams): Promise<unknown> => {
    // const url = "https://rpc.shitzuapes.xyz";
    const url = `https://rpc.${NetworkId}.near.org`;
    const provider = new providers.JsonRpcProvider({ url });

    const res = await provider.query({
      request_type: "call_function",
      account_id: contractId,
      method_name: method,
      args_base64: Buffer.from(JSON.stringify(args)).toString("base64"),
      finality: "optimistic",
    });

    // Parse the result from the NEAR RPC response
    // @ts-expect-error - NEAR RPC response structure is not fully typed
    return JSON.parse(Buffer.from(res.result).toString());
  };

  const callMethod = async ({
    contractId,
    method,
    args = {},
    gas = THIRTY_TGAS,
    deposit = NO_DEPOSIT,
  }: CallMethodParams): Promise<unknown> => {
    if (!walletSelector) {
      return;
    }
    const selectedWallet = await walletSelector.wallet();
    const outcome = await selectedWallet.signAndSendTransaction({
      receiverId: contractId,
      actions: [
        {
          type: "FunctionCall",
          params: {
            methodName: method,
            args,
            gas,
            deposit,
          },
        },
      ],
    });

    if (!outcome) {
      console.error("No outcome");
      return null;
    }
    return providers.getTransactionLastResult(outcome);
  };

  const callMethods = async (methodParameters: MethodParameters[]): Promise<unknown> => {
    if (!walletSelector) {
      return;
    }
    const selectedWallet = await walletSelector.wallet();

    const outcome = await selectedWallet.signAndSendTransactions({
      transactions: methodParameters.map((parameters) => ({
        receiverId: parameters.contractId,

        actions: [
          {
            type: "FunctionCall",
            params: {
              methodName: parameters.method,
              args: parameters.args,
              gas: parameters.gas,
              deposit: parameters.deposit,
            },
          },
        ],
      })),
    });

    if (!outcome) {
      console.error("No outcome");
      return null;
    }

    return outcome;
  };

  const getTransactionResult = async (transactionHash: string): Promise<unknown> => {
    if (!walletSelector) {
      return;
    }

    const { network } = walletSelector.options;
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });

    const transaction = await provider.txStatus(transactionHash, "unnused");

    return providers.getTransactionLastResult(transaction);
  };

  return (
    <NearWalletContext.Provider
      value={{
        accountId,
        signIn,
        signOut,
        status,
        viewMethod,
        callMethod,
        callMethods,
        getTransactionResult,
      }}
    >
      {children}
    </NearWalletContext.Provider>
  );
};

export default NearWalletProvider;

export const useNearWallet = () => {
  return useContext(NearWalletContext);
};