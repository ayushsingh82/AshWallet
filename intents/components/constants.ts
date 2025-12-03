export const INTENTS_CONTRACT_ID = "intents.near";

export interface TokenDeployment {
  type?: "native";
  address?: string;
  decimals: number;
  chainName: string;
  bridge: string;
}

export interface GroupedToken {
  defuseAssetId: string;
  symbol: string;
  name: string;
  decimals: number;
  icon: string;
  originChainName: string;
  deployments: TokenDeployment[];
  tags: string[];
}

export interface UnifiedAsset {
  unifiedAssetId: string;
  symbol: string;
  name: string;
  icon: string;
  groupedTokens: GroupedToken[];
  tags: string[];
}

export const UNIFIED_ASSETS: UnifiedAsset[] = [
  {
    unifiedAssetId: "zcash",
    symbol: "ZEC",
    name: "Zcash",
    icon: "https://s2.coinmarketcap.com/static/img/coins/128x128/1437.png",
    groupedTokens: [
      {
        defuseAssetId: "nep141:zec.omft.near",
        symbol: "ZEC",
        name: "Zcash",
        decimals: 8,
        icon: "https://s2.coinmarketcap.com/static/img/coins/128x128/1437.png",
        originChainName: "zcash",
        deployments: [
          {
            type: "native",
            decimals: 8,
            chainName: "zcash",
            bridge: "poa",
          },
          {
            address: "zec.omft.near",
            decimals: 8,
            chainName: "near",
            bridge: "direct",
          },
          {
            address: "A7bdiYdS5GjqGFtxf17ppRHtDKPkkRqbKtR27dxvQXaS",
            decimals: 8,
            chainName: "solana",
            bridge: "near_omni",
          },
        ],
        tags: ["mc:120", "tvol:1", "aid:zec"],
      },
    ],
    tags: ["mc:120", "tvol:1", "aid:zec"],
  },
  {
    unifiedAssetId: "near",
    symbol: "NEAR",
    name: "NEAR Protocol",
    icon: "https://s2.coinmarketcap.com/static/img/coins/128x128/6535.png",
    groupedTokens: [
      {
        defuseAssetId: "nep141:wrap.near",
        symbol: "NEAR",
        name: "Near",
        decimals: 24,
        icon: "https://s2.coinmarketcap.com/static/img/coins/128x128/6535.png",
        originChainName: "near",
        deployments: [
          {
            address: "wrap.near",
            decimals: 24,
            chainName: "near",
            bridge: "direct",
          },
        ],
        tags: [],
      },
    ],
    tags: [],
  },
  {
    unifiedAssetId: "sol",
    symbol: "SOL",
    name: "Solana",
    icon: "https://s2.coinmarketcap.com/static/img/coins/128x128/5426.png",
    groupedTokens: [
      {
        defuseAssetId: "nep141:sol.omft.near",
        symbol: "SOL",
        name: "Solana",
        decimals: 9,
        icon: "https://s2.coinmarketcap.com/static/img/coins/128x128/5426.png",
        originChainName: "solana",
        deployments: [
          {
            type: "native",
            decimals: 9,
            chainName: "solana",
            bridge: "poa",
          },
          {
            address: "native",
            decimals: 9,
            chainName: "hyperliquid",
            bridge: "poa",
          },
        ],
        tags: ["mc:6", "tvol:5", "aid:sol"],
      },
    ],
    tags: ["mc:6", "tvol:5", "aid:sol"],
  },
];

// USDC on Solana
export const USDC_SOLANA: GroupedToken = {
  defuseAssetId: "nep141:sol-5ce3bf3a31af18be40ba30f721101b4341690186.omft.near",
  symbol: "USDC",
  name: "USD Coin",
  decimals: 6,
  icon: "https://s2.coinmarketcap.com/static/img/coins/128x128/3408.png",
  originChainName: "solana",
  deployments: [
    {
      address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      decimals: 6,
      chainName: "solana",
      bridge: "poa",
    },
  ],
  tags: ["mc:7", "type:stablecoin", "tvol:4", "aid:usdc"],
};

// USDT on Solana
export const USDT_SOLANA: GroupedToken = {
  defuseAssetId: "nep141:sol-c800a4bd850783ccb82c2b2c7e84175443606352.omft.near",
  symbol: "USDT",
  name: "Tether USD",
  decimals: 6,
  icon: "https://s2.coinmarketcap.com/static/img/coins/128x128/825.png",
  originChainName: "solana",
  deployments: [
    {
      address: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
      decimals: 6,
      chainName: "solana",
      bridge: "poa",
    },
  ],
  tags: ["mc:3", "type:stablecoin", "tvol:3", "aid:usdt"],
};

// Helper functions to get token addresses by chain
export const getTokenAddress = (
  unifiedAssetId: string,
  chainName: string
): string | undefined => {
  const asset = UNIFIED_ASSETS.find((a) => a.unifiedAssetId === unifiedAssetId);
  if (!asset) return undefined;

  for (const token of asset.groupedTokens) {
    const deployment = token.deployments.find(
      (d) => d.chainName === chainName
    );
    if (deployment) {
      return deployment.type === "native" ? "native" : deployment.address;
    }
  }
  return undefined;
};

export const getTokenDecimals = (
  unifiedAssetId: string,
  chainName: string
): number | undefined => {
  const asset = UNIFIED_ASSETS.find((a) => a.unifiedAssetId === unifiedAssetId);
  if (!asset) return undefined;

  for (const token of asset.groupedTokens) {
    const deployment = token.deployments.find(
      (d) => d.chainName === chainName
    );
    if (deployment) {
      return deployment.decimals;
    }
  }
  return undefined;
};

// Helper function to get defuseAssetId for a token on a specific chain
export const getDefuseAssetId = (
  unifiedAssetId: string,
  chainName: string
): string | undefined => {
  const asset = UNIFIED_ASSETS.find((a) => a.unifiedAssetId === unifiedAssetId);
  if (!asset) return undefined;

  for (const token of asset.groupedTokens) {
    const deployment = token.deployments.find(
      (d) => d.chainName === chainName
    );
    if (deployment) {
      return token.defuseAssetId;
    }
  }
  return undefined;
};

// Direct access to token defuseAssetIds
export const ZEC_NEAR_DEFUSE_ASSET_ID = "nep141:zec.omft.near";
export const SOL_DEFUSE_ASSET_ID = "nep141:sol.omft.near";
