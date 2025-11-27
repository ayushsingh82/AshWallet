"use client";

import { PrivacyWallet, PrivacyLevel, WalletAddress, PrivacyTransaction, PrivacyTransactionStep } from './types';
import { CHAINS } from './constants';

export class PrivacyWalletManager {
  private static readonly EXPIRY_TIMES = {
    high: 5 * 60 * 1000,    // 5 minutes for high privacy
    medium: 15 * 60 * 1000, // 15 minutes for medium privacy  
    low: 60 * 60 * 1000     // 1 hour for low privacy
  };

  private static readonly STORAGE_KEYS = {
    PRIVACY_WALLETS: 'privacy_wallets',
    PRIVACY_TRANSACTIONS: 'privacy_transactions'
  };

  /**
   * Generate a new temporary privacy wallet
   */
  static async generatePrivacyWallet(
    destinationChain: string,
    privacyLevel: PrivacyLevel,
    purpose: string,
    zcashAmount: number = 0
  ): Promise<PrivacyWallet> {
    const expiryTime = Date.now() + this.EXPIRY_TIMES[privacyLevel];
    
    // Generate addresses for NEAR (always needed) and destination chain
    const requiredChains = ['near'];
    if (destinationChain !== 'near') {
      requiredChains.push(destinationChain);
    }

    const addresses = await this.generateSecureAddresses(requiredChains);
    
    const privacyWallet: PrivacyWallet = {
      id: `privacy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `Privacy Wallet - ${purpose}`,
      addresses,
      createdAt: new Date().toISOString(),
      isTemporary: true,
      expiresAt: new Date(expiryTime).toISOString(),
      sourceZcashAmount: zcashAmount,
      privacyLevel,
      destinationChain,
      purposeDescription: purpose,
      autoCleanup: true
    };

    // Store the wallet
    this.storePrivacyWallet(privacyWallet);
    
    // Schedule cleanup
    this.scheduleCleanup(privacyWallet.id, expiryTime - Date.now());
    
    return privacyWallet;
  }

  /**
   * Generate cryptographically secure addresses for specified chains
   */
  private static async generateSecureAddresses(chainIds: string[]): Promise<WalletAddress[]> {
    const addresses: WalletAddress[] = [];
    
    for (const chainId of chainIds) {
      const chain = CHAINS.find(c => c.id === chainId);
      if (!chain) continue;

      // Generate secure random private key (32 bytes)
      const privateKeyBytes = new Uint8Array(32);
      crypto.getRandomValues(privateKeyBytes);
      const privateKey = Array.from(privateKeyBytes, byte => byte.toString(16).padStart(2, '0')).join('');
      
      // Generate address based on chain type
      let address: string;
      switch (chainId) {
        case 'near':
          // NEAR addresses are typically account names, generate a random one
          address = `privacy${Math.random().toString(36).substr(2, 8)}.testnet`;
          break;
        case 'solana':
          // Solana addresses are base58 encoded, generate a mock one
          address = this.generateSolanaAddress(privateKey);
          break;
        case 'zcash':
          // Zcash addresses start with 'z' for shielded addresses
          address = `zs1${Math.random().toString(36).substr(2, 40)}`;
          break;
        default:
          // Generic address format
          address = `${chain.name.substring(0, 3).toLowerCase()}1${Math.random().toString(36).substr(2, 40)}`;
      }

      addresses.push({
        chainId,
        address,
        balance: 0,
        privateKey // Store temporarily for privacy wallets
      });
    }

    return addresses;
  }

  /**
   * Generate a Solana-style address from private key
   */
  private static generateSolanaAddress(privateKey: string): string {
    // This is a simplified mock - in production, use actual Solana key derivation
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < 44; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Store privacy wallet in localStorage
   */
  private static storePrivacyWallet(wallet: PrivacyWallet): void {
    const existingWallets = this.getStoredPrivacyWallets();
    const updatedWallets = [...existingWallets, wallet];
    localStorage.setItem(this.STORAGE_KEYS.PRIVACY_WALLETS, JSON.stringify(updatedWallets));
  }

  /**
   * Get all stored privacy wallets
   */
  static getStoredPrivacyWallets(): PrivacyWallet[] {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(this.STORAGE_KEYS.PRIVACY_WALLETS);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Get active (non-expired) privacy wallets
   */
  static getActivePrivacyWallets(): PrivacyWallet[] {
    const now = Date.now();
    return this.getStoredPrivacyWallets().filter(wallet => 
      new Date(wallet.expiresAt).getTime() > now
    );
  }

  /**
   * Create a new privacy transaction
   */
  static createPrivacyTransaction(
    tempWalletId: string,
    sourceZcash: number,
    destinationChain: string
  ): PrivacyTransaction {
    const transaction: PrivacyTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tempWalletId,
      sourceZcash,
      nearTokens: 0,
      destinationChain,
      destinationTokens: 0,
      status: 'initiated',
      steps: [
        {
          id: 'step_1',
          name: 'Initialize Privacy Wallet',
          status: 'completed',
          timestamp: new Date().toISOString()
        },
        {
          id: 'step_2',
          name: 'Bridge ZCash to NEAR',
          status: 'pending',
          timestamp: new Date().toISOString()
        },
        {
          id: 'step_3',
          name: `Route to ${destinationChain}`,
          status: 'pending',
          timestamp: new Date().toISOString()
        },
        {
          id: 'step_4',
          name: 'Ready for DApp Interaction',
          status: 'pending',
          timestamp: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString()
    };

    this.storePrivacyTransaction(transaction);
    return transaction;
  }

  /**
   * Update privacy transaction status
   */
  static updatePrivacyTransaction(
    transactionId: string,
    updates: Partial<PrivacyTransaction>
  ): void {
    const transactions = this.getStoredPrivacyTransactions();
    const index = transactions.findIndex(tx => tx.id === transactionId);
    
    if (index !== -1) {
      transactions[index] = { ...transactions[index], ...updates };
      localStorage.setItem(this.STORAGE_KEYS.PRIVACY_TRANSACTIONS, JSON.stringify(transactions));
    }
  }

  /**
   * Update transaction step status
   */
  static updateTransactionStep(
    transactionId: string,
    stepId: string,
    status: 'pending' | 'in_progress' | 'completed' | 'failed',
    txHash?: string,
    details?: any
  ): void {
    const transactions = this.getStoredPrivacyTransactions();
    const transaction = transactions.find(tx => tx.id === transactionId);
    
    if (transaction) {
      const step = transaction.steps.find(s => s.id === stepId);
      if (step) {
        step.status = status;
        step.timestamp = new Date().toISOString();
        if (txHash) step.txHash = txHash;
        if (details) step.details = details;
        
        localStorage.setItem(this.STORAGE_KEYS.PRIVACY_TRANSACTIONS, JSON.stringify(transactions));
      }
    }
  }

  /**
   * Store privacy transaction
   */
  private static storePrivacyTransaction(transaction: PrivacyTransaction): void {
    const existing = this.getStoredPrivacyTransactions();
    const updated = [...existing, transaction];
    localStorage.setItem(this.STORAGE_KEYS.PRIVACY_TRANSACTIONS, JSON.stringify(updated));
  }

  /**
   * Get stored privacy transactions
   */
  static getStoredPrivacyTransactions(): PrivacyTransaction[] {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(this.STORAGE_KEYS.PRIVACY_TRANSACTIONS);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Schedule automatic cleanup of expired wallet
   */
  private static scheduleCleanup(walletId: string, delayMs: number): void {
    setTimeout(() => {
      this.cleanupWallet(walletId);
    }, delayMs);
  }

  /**
   * Securely delete a specific wallet
   */
  static cleanupWallet(walletId: string): void {
    const wallets = this.getStoredPrivacyWallets();
    const filteredWallets = wallets.filter(w => w.id !== walletId);
    
    localStorage.setItem(this.STORAGE_KEYS.PRIVACY_WALLETS, JSON.stringify(filteredWallets));
    
    // Also cleanup related transactions
    const transactions = this.getStoredPrivacyTransactions();
    const filteredTransactions = transactions.filter(tx => tx.tempWalletId !== walletId);
    localStorage.setItem(this.STORAGE_KEYS.PRIVACY_TRANSACTIONS, JSON.stringify(filteredTransactions));
  }

  /**
   * Clean up all expired wallets
   */
  static cleanupExpiredWallets(): void {
    const now = Date.now();
    const wallets = this.getStoredPrivacyWallets();
    const activeWallets = wallets.filter(wallet => 
      new Date(wallet.expiresAt).getTime() > now
    );
    
    if (activeWallets.length !== wallets.length) {
      localStorage.setItem(this.STORAGE_KEYS.PRIVACY_WALLETS, JSON.stringify(activeWallets));
      
      // Cleanup related transactions
      const expiredWalletIds = wallets
        .filter(w => new Date(w.expiresAt).getTime() <= now)
        .map(w => w.id);
      
      const transactions = this.getStoredPrivacyTransactions();
      const activeTransactions = transactions.filter(tx => 
        !expiredWalletIds.includes(tx.tempWalletId)
      );
      localStorage.setItem(this.STORAGE_KEYS.PRIVACY_TRANSACTIONS, JSON.stringify(activeTransactions));
    }
  }

  /**
   * Get wallet by ID
   */
  static getWalletById(walletId: string): PrivacyWallet | null {
    const wallets = this.getStoredPrivacyWallets();
    return wallets.find(w => w.id === walletId) || null;
  }

  /**
   * Get transaction by ID
   */
  static getTransactionById(transactionId: string): PrivacyTransaction | null {
    const transactions = this.getStoredPrivacyTransactions();
    return transactions.find(tx => tx.id === transactionId) || null;
  }

  /**
   * Get remaining time for wallet in milliseconds
   */
  static getRemainingTime(wallet: PrivacyWallet): number {
    return Math.max(0, new Date(wallet.expiresAt).getTime() - Date.now());
  }

  /**
   * Format remaining time as human readable string
   */
  static formatRemainingTime(wallet: PrivacyWallet): string {
    const remaining = this.getRemainingTime(wallet);
    const minutes = Math.floor(remaining / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }

  /**
   * Create fund recovery transaction for a wallet
   */
  static createFundRecovery(
    walletId: string,
    recoveryAddress: string,
    reason: 'expiring' | 'manual' | 'emergency'
  ): { recoveryId: string; instructions: string[] } {
    const wallet = this.getWalletById(walletId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    const recoveryId = `recovery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const instructions = [
      `Fund Recovery for Wallet: ${wallet.name}`,
      `Reason: ${reason}`,
      `Recovery Address: ${recoveryAddress}`,
      '',
      'Steps to recover funds:',
      ...wallet.addresses.map((addr, index) => {
        const chain = addr.chainId;
        return `${index + 1}. ${chain.toUpperCase()}: Transfer from ${addr.address} to ${recoveryAddress}`;
      }),
      '',
      '⚠️ IMPORTANT: Save your private keys before cleanup!',
      ...wallet.addresses.map(addr => `${addr.chainId}: ${addr.privateKey || 'N/A'}`)
    ];

    // Store recovery record
    const recoveryRecord = {
      id: recoveryId,
      walletId,
      recoveryAddress,
      reason,
      instructions,
      createdAt: new Date().toISOString(),
      status: 'pending' as const
    };

    const existingRecoveries = JSON.parse(localStorage.getItem('fund_recoveries') || '[]');
    existingRecoveries.push(recoveryRecord);
    localStorage.setItem('fund_recoveries', JSON.stringify(existingRecoveries));

    return { recoveryId, instructions };
  }

  /**
   * Get all fund recovery records
   */
  static getFundRecoveries(): any[] {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem('fund_recoveries') || '[]');
  }

  /**
   * Sweep all funds from expiring wallets to a recovery address
   */
  static async sweepExpiringWallets(recoveryAddress: string): Promise<string[]> {
    const now = Date.now();
    const expiringWallets = this.getStoredPrivacyWallets().filter(wallet => {
      const timeLeft = new Date(wallet.expiresAt).getTime() - now;
      return timeLeft < 5 * 60 * 1000; // Less than 5 minutes left
    });

    const recoveryIds: string[] = [];

    for (const wallet of expiringWallets) {
      try {
        const { recoveryId } = this.createFundRecovery(wallet.id, recoveryAddress, 'expiring');
        recoveryIds.push(recoveryId);
        
        // In a real implementation, this would execute actual fund transfers
        console.log(`Created fund recovery for expiring wallet: ${wallet.id}`);
      } catch (error) {
        console.error(`Failed to create recovery for wallet ${wallet.id}:`, error);
      }
    }

    return recoveryIds;
  }

  /**
   * Export wallet data for backup
   */
  static exportWalletData(walletId: string): string {
    const wallet = this.getWalletById(walletId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    const exportData = {
      wallet,
      exportedAt: new Date().toISOString(),
      warning: 'KEEP THIS DATA SECURE - Contains private keys!'
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Check for wallets that need fund recovery (expiring soon)
   */
  static getWalletsNeedingRecovery(): PrivacyWallet[] {
    const now = Date.now();
    return this.getStoredPrivacyWallets().filter(wallet => {
      const timeLeft = new Date(wallet.expiresAt).getTime() - now;
      return timeLeft < 10 * 60 * 1000 && timeLeft > 0; // Less than 10 minutes but not expired
    });
  }
}

// Auto-cleanup on page load
if (typeof window !== 'undefined') {
  PrivacyWalletManager.cleanupExpiredWallets();
  
  // Set up periodic cleanup every minute
  setInterval(() => {
    PrivacyWalletManager.cleanupExpiredWallets();
  }, 60000);
}
