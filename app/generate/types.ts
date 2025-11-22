export interface Chain {
  id: string;
  name: string;
  icon: string;
  color: string;
  enabled: boolean;
  symbol: string;
}

export interface WalletAddress {
  chainId: string;
  address: string;
  balance: number;
}

export interface Wallet {
  id: string;
  name: string;
  addresses: WalletAddress[];
  createdAt: string;
}

