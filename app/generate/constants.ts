export const ZEC_ICON =
  "https://s2.coinmarketcap.com/static/img/coins/128x128/1437.png";
export const NEAR_ICON =
  "https://s2.coinmarketcap.com/static/img/coins/128x128/6535.png";
export const SOL_ICON =
  "https://s2.coinmarketcap.com/static/img/coins/128x128/5426.png";

import { Chain } from "./types";

export const CHAINS: Chain[] = [
  {
    id: "solana",
    name: "Solana",
    icon: SOL_ICON,
    color: "from-purple-500 to-pink-500",
    enabled: true,
    symbol: "SOL",
  },
  {
    id: "zcash",
    name: "Zcash",
    icon: ZEC_ICON,
    color: "from-[#97FBE4] to-[#7EE7D6]",
    enabled: true,
    symbol: "ZEC",
  },
  {
    id: "near",
    name: "NEAR",
    icon: NEAR_ICON,
    color: "from-[#97FBE4] to-[#7EE7D6]",
    enabled: true,
    symbol: "NEAR",
  },
];

