import { contracts } from "chainsig.js";

// export const NetworkId = "testnet";
// export const MPC_CONTRACT = "v1.signer-prod.testnet";

export interface NetworkConfig {
  network: string;
  token: string;
  rpcUrl: string;
  explorerUrl: string;
  contractAddress: string;
}

export const NetworksEVM: NetworkConfig[] = [
  {
    network: "Ethereum",
    token: "ETH",
    rpcUrl: "https://sepolia.drpc.org",
    explorerUrl: "https://sepolia.etherscan.io/tx/",
    contractAddress: "0xFf3171733b73Cfd5A72ec28b9f2011Dc689378c6",
  },
]

export const NetworkId = "mainnet";
export const MPC_CONTRACT = "v1.signer";

export const MPC_KEY =
  "secp256k1:4NfTiv3UsGahebgTaHyD9vF8KYKMBnfd6kh94mK6xv8fGBiJB8TBtFMP5WWXz6B89Ac1fbpzPwAvoyQebemHFwx3";

export const SIGNET_CONTRACT = new contracts.ChainSignatureContract({
  networkId: NetworkId,
  contractId: MPC_CONTRACT,
});

export const ABI = [
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_num",
          type: "uint256",
        },
      ],
      name: "set",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "get",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "num",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ] as const;

export const CHAIN_ICONS = {
  ETH: "ethereum",
  SOL: "solana",
} as const;