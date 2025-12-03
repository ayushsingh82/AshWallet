// Utility functions for managing derived wallets in localStorage

export interface DerivedWallet {
  id: string;
  path: string;
  address: string;
  chain: 'solana' | 'near' | 'evm';
  accountId: string;
  createdAt: string;
  balance?: string;
}

const STORAGE_KEY = 'derived_wallets';

export function saveDerivedWallet(wallet: DerivedWallet): void {
  if (typeof window === 'undefined') return;
  
  const existing = getDerivedWallets();
  // Check if wallet with same path and accountId already exists
  const index = existing.findIndex(
    w => w.path === wallet.path && w.accountId === wallet.accountId && w.chain === wallet.chain
  );
  
  if (index >= 0) {
    // Update existing
    existing[index] = wallet;
  } else {
    // Add new
    existing.push(wallet);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function getDerivedWallets(accountId?: string): DerivedWallet[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  
  const wallets: DerivedWallet[] = JSON.parse(stored);
  
  if (accountId) {
    return wallets.filter(w => w.accountId === accountId);
  }
  
  return wallets;
}

export function deleteDerivedWallet(walletId: string): void {
  if (typeof window === 'undefined') return;
  
  const existing = getDerivedWallets();
  const filtered = existing.filter(w => w.id !== walletId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function getWalletsByChain(accountId: string, chain: 'solana' | 'near' | 'evm'): DerivedWallet[] {
  return getDerivedWallets(accountId).filter(w => w.chain === chain);
}

