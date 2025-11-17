import { NetworkId } from "../lib/config/near";

export const MPC_CONTRACT = 'v1.signer-prod.testnet'
export const MPC_KEY = 'secp256k1:4NfTiv3UsGahebgTaHyD9vF8KYKMBnfd6kh94mK6xv8fGBiJB8TBtFMP5WWXz6B89Ac1fbpzPwAvoyQebemHFwx3';

// Lazy load chainsig.js to avoid importing Node.js dependencies in client components
// Only import on server-side
let SIGNET_CONTRACT: any = null;

export const getSignetContract = async () => {
  // Only load on server-side
  if (typeof window !== 'undefined') {
    throw new Error('getSignetContract can only be called on the server');
  }
  
  if (!SIGNET_CONTRACT) {
    try {
      const { contracts } = await import("chainsig.js");
      SIGNET_CONTRACT = new contracts.ChainSignatureContract({
        networkId: NetworkId,
        contractId: MPC_CONTRACT,
      });
    } catch (error) {
      console.error('Failed to load chainsig.js:', error);
      throw error;
    }
  }
  return SIGNET_CONTRACT;
};

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
  ];