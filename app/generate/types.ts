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
  privateKey?: string; // For temporary wallets only
}

export interface Wallet {
  id: string;
  name: string;
  addresses: WalletAddress[];
  createdAt: string;
}

// Privacy-focused wallet types
export interface PrivacyWallet extends Wallet {
  isTemporary: boolean;
  expiresAt: string;
  sourceZcashAmount: number;
  privacyLevel: 'high' | 'medium' | 'low';
  destinationChain: string;
  purposeDescription: string;
  autoCleanup: boolean;
}

export interface PrivacyTransaction {
  id: string;
  tempWalletId: string;
  sourceZcash: number;
  nearTokens: number;
  destinationChain: string;
  destinationTokens: number;
  status: 'initiated' | 'bridging_to_near' | 'routing_to_dest' | 'completed' | 'expired' | 'failed';
  steps: PrivacyTransactionStep[];
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface PrivacyTransactionStep {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  txHash?: string;
  timestamp: string;
  details?: any;
}

export type PrivacyLevel = 'high' | 'medium' | 'low';

export interface PrivacyFlowConfig {
  zcashAmount: number;
  destinationChain: string;
  dappUrl?: string;
  privacyLevel: PrivacyLevel;
  purpose: string;
  maxDuration?: number; // in minutes
}

