"use client";

import { useState, useEffect } from 'react';
import { PrivacyWalletManager } from '../generate/PrivacyWalletManager';
import { PrivacyWallet, PrivacyTransaction } from '../generate/types';
import { CHAINS } from '../generate/constants';
import Image from 'next/image';
import Link from 'next/link';

export default function PrivacyWalletDashboard() {
  const [activeWallets, setActiveWallets] = useState<PrivacyWallet[]>([]);
  const [transactions, setTransactions] = useState<PrivacyTransaction[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<PrivacyWallet | null>(null);
  const [walletsNeedingRecovery, setWalletsNeedingRecovery] = useState<PrivacyWallet[]>([]);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryAddress, setRecoveryAddress] = useState('');

  useEffect(() => {
    // Load active wallets and transactions
    const loadData = () => {
      const wallets = PrivacyWalletManager.getActivePrivacyWallets();
      const txs = PrivacyWalletManager.getStoredPrivacyTransactions();
      const needingRecovery = PrivacyWalletManager.getWalletsNeedingRecovery();
      setActiveWallets(wallets);
      setTransactions(txs);
      setWalletsNeedingRecovery(needingRecovery);
    };

    loadData();
    
    // Update every 10 seconds to show remaining time
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const getChainInfo = (chainId: string) => {
    return CHAINS.find(c => c.id === chainId);
  };

  const getTransactionForWallet = (walletId: string) => {
    return transactions.find(tx => tx.tempWalletId === walletId);
  };

  const handleCleanupWallet = (walletId: string) => {
    PrivacyWalletManager.cleanupWallet(walletId);
    setActiveWallets(prev => prev.filter(w => w.id !== walletId));
    setTransactions(prev => prev.filter(tx => tx.tempWalletId !== walletId));
    setWalletsNeedingRecovery(prev => prev.filter(w => w.id !== walletId));
    if (selectedWallet?.id === walletId) {
      setSelectedWallet(null);
    }
  };

  const handleFundRecovery = (walletId: string) => {
    if (!recoveryAddress) {
      alert('Please enter a recovery address');
      return;
    }
    
    try {
      const { recoveryId, instructions } = PrivacyWalletManager.createFundRecovery(
        walletId, 
        recoveryAddress, 
        'manual'
      );
      
      // Show recovery instructions
      alert(`Fund recovery created!\nRecovery ID: ${recoveryId}\n\nCheck console for detailed instructions.`);
      console.log('Fund Recovery Instructions:', instructions);
      
      setShowRecoveryModal(false);
      setRecoveryAddress('');
    } catch (error) {
      alert('Failed to create fund recovery: ' + (error as Error).message);
    }
  };

  const handleExportWallet = (walletId: string) => {
    try {
      const exportData = PrivacyWalletManager.exportWalletData(walletId);
      
      // Create download link
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `privacy-wallet-${walletId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert('Wallet data exported! Keep this file secure - it contains private keys.');
    } catch (error) {
      alert('Failed to export wallet: ' + (error as Error).message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'in_progress': case 'bridging_to_near': case 'routing_to_dest': return 'text-yellow-400';
      case 'failed': case 'expired': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (activeWallets.length === 0) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-8 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-xl font-semibold mb-2">No Active Privacy Wallets</h3>
        <p className="text-gray-400 mb-6">
          Create a privacy wallet to interact with DeFi protocols anonymously
        </p>
        <Link
          href="/privacy"
          className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition-colors"
        >
          Create Privacy Wallet
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Active Privacy Wallets</h2>
        <Link
          href="/privacy"
          className="px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition-colors text-sm"
        >
          + New Privacy Wallet
        </Link>
      </div>

      {/* Fund Recovery Alert */}
      {walletsNeedingRecovery.length > 0 && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-red-400 text-xl">⚠️</span>
            <h3 className="font-semibold text-red-400">Wallets Expiring Soon!</h3>
          </div>
          <p className="text-red-200 text-sm mb-3">
            {walletsNeedingRecovery.length} wallet(s) will expire in less than 10 minutes. 
            Recover funds to prevent loss!
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowRecoveryModal(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
            >
              Recover All Funds
            </button>
            <button
              onClick={() => {
                walletsNeedingRecovery.forEach(wallet => {
                  console.log(`Wallet ${wallet.name} expires at:`, wallet.expiresAt);
                  console.log('Private keys:', wallet.addresses.map(a => ({ chain: a.chainId, key: a.privateKey })));
                });
                alert('Wallet details logged to console. Save your private keys!');
              }}
              className="px-4 py-2 border border-red-500 text-red-400 hover:bg-red-900/30 rounded-lg text-sm transition-colors"
            >
              Export Keys
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {activeWallets.map(wallet => {
          const transaction = getTransactionForWallet(wallet.id);
          const remainingTime = PrivacyWalletManager.formatRemainingTime(wallet);
          const destinationChain = getChainInfo(wallet.destinationChain);
          
          return (
            <div
              key={wallet.id}
              className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6 hover:border-yellow-400/50 transition-colors cursor-pointer"
              onClick={() => setSelectedWallet(selectedWallet?.id === wallet.id ? null : wallet)}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-400">Active</span>
                </div>
                <div className="text-sm text-yellow-400 font-mono">
                  {remainingTime}
                </div>
              </div>

              {/* Purpose */}
              <h3 className="font-semibold mb-2 truncate" title={wallet.purposeDescription}>
                {wallet.purposeDescription}
              </h3>

              {/* Details */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Privacy Level:</span>
                  <span className={`capitalize font-medium ${
                    wallet.privacyLevel === 'high' ? 'text-red-400' :
                    wallet.privacyLevel === 'medium' ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    {wallet.privacyLevel}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Destination:</span>
                  <div className="flex items-center gap-1">
                    {destinationChain && (
                      <>
                        <Image 
                          src={destinationChain.icon} 
                          alt={destinationChain.name}
                          width={16} 
                          height={16} 
                          className="rounded-full" 
                        />
                        <span className="text-white">{destinationChain.name}</span>
                      </>
                    )}
                  </div>
                </div>

                {wallet.sourceZcashAmount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">ZCash Amount:</span>
                    <span className="text-white font-mono">{wallet.sourceZcashAmount} ZEC</span>
                  </div>
                )}

                {transaction && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className={`capitalize font-medium ${getStatusColor(transaction.status)}`}>
                      {transaction.status.replace('_', ' ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Addresses Preview */}
              <div className="mt-4 pt-4 border-t border-zinc-700">
                <div className="text-xs text-gray-400 mb-2">Addresses:</div>
                <div className="space-y-1">
                  {wallet.addresses.slice(0, 2).map(addr => {
                    const chain = getChainInfo(addr.chainId);
                    return (
                      <div key={addr.chainId} className="flex items-center gap-2">
                        {chain && (
                          <Image src={chain.icon} alt={chain.name} width={12} height={12} className="rounded-full" />
                        )}
                        <span className="text-xs font-mono text-gray-300 truncate">
                          {addr.address.length > 20 ? `${addr.address.slice(0, 8)}...${addr.address.slice(-8)}` : addr.address}
                        </span>
                      </div>
                    );
                  })}
                  {wallet.addresses.length > 2 && (
                    <div className="text-xs text-gray-400">
                      +{wallet.addresses.length - 2} more
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExportWallet(wallet.id);
                  }}
                  className="flex-1 px-2 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  title="Export wallet data"
                >
                  💾
                </button>
                {walletsNeedingRecovery.some(w => w.id === wallet.id) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedWallet(wallet);
                      setShowRecoveryModal(true);
                    }}
                    className="flex-1 px-2 py-2 text-xs bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                    title="Recover funds"
                  >
                    🔄
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Are you sure? This will permanently delete the wallet. Make sure to recover funds first!')) {
                      handleCleanupWallet(wallet.id);
                    }
                  }}
                  className="flex-1 px-2 py-2 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  title="Delete wallet"
                >
                  🗑️
                </button>
                {transaction?.status === 'completed' && wallet.destinationChain && (
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 px-3 py-2 text-xs bg-yellow-400 hover:bg-yellow-300 text-black rounded-lg transition-colors"
                  >
                    Use
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed View Modal */}
      {selectedWallet && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Privacy Wallet Details</h3>
              <button
                onClick={() => setSelectedWallet(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Wallet Info */}
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <h4 className="font-semibold mb-3">Wallet Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Purpose:</span>
                    <div className="font-medium">{selectedWallet.purposeDescription}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Privacy Level:</span>
                    <div className="font-medium capitalize">{selectedWallet.privacyLevel}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Created:</span>
                    <div className="font-medium">{new Date(selectedWallet.createdAt).toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Expires:</span>
                    <div className="font-medium text-yellow-400">
                      {PrivacyWalletManager.formatRemainingTime(selectedWallet)}
                    </div>
                  </div>
                </div>
              </div>

              {/* All Addresses */}
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <h4 className="font-semibold mb-3">Generated Addresses</h4>
                <div className="space-y-3">
                  {selectedWallet.addresses.map(addr => {
                    const chain = getChainInfo(addr.chainId);
                    return (
                      <div key={addr.chainId} className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-lg">
                        {chain && (
                          <Image src={chain.icon} alt={chain.name} width={24} height={24} className="rounded-full" />
                        )}
                        <div className="flex-1">
                          <div className="font-medium">{chain?.name}</div>
                          <div className="font-mono text-sm text-gray-300 break-all">{addr.address}</div>
                        </div>
                        <button
                          onClick={() => navigator.clipboard.writeText(addr.address)}
                          className="px-2 py-1 text-xs bg-zinc-700 hover:bg-zinc-600 rounded transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Transaction Status */}
              {(() => {
                const tx = getTransactionForWallet(selectedWallet.id);
                if (!tx) return null;

                return (
                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <h4 className="font-semibold mb-3">Transaction Status</h4>
                    <div className="space-y-3">
                      {tx.steps.map(step => (
                        <div key={step.id} className="flex items-center gap-3">
                          <div className={`
                            w-6 h-6 rounded-full flex items-center justify-center text-xs
                            ${step.status === 'completed' ? 'bg-green-500 text-white' :
                              step.status === 'in_progress' ? 'bg-yellow-400 text-black' :
                              step.status === 'failed' ? 'bg-red-500 text-white' :
                              'bg-gray-600 text-gray-300'}
                          `}>
                            {step.status === 'completed' ? '✓' :
                             step.status === 'in_progress' ? '⟳' :
                             step.status === 'failed' ? '✗' : '○'}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{step.name}</div>
                            <div className="text-xs text-gray-400">
                              {new Date(step.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Fund Recovery Modal */}
      {showRecoveryModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-red-400">Fund Recovery</h3>
              <button
                onClick={() => {
                  setShowRecoveryModal(false);
                  setRecoveryAddress('');
                  setSelectedWallet(null);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-red-900/20 border border-red-500 rounded-lg p-3">
                <p className="text-red-200 text-sm">
                  ⚠️ This will create recovery instructions for your temporary wallet funds. 
                  You'll need to manually execute the transfers using the private keys.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Recovery Address *
                </label>
                <input
                  type="text"
                  value={recoveryAddress}
                  onChange={(e) => setRecoveryAddress(e.target.value)}
                  placeholder="Enter your main wallet address"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-400"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Address where you want to recover the funds
                </p>
              </div>

              {selectedWallet && (
                <div className="bg-zinc-800/50 rounded-lg p-3">
                  <p className="text-sm text-gray-300 mb-2">
                    <strong>Wallet:</strong> {selectedWallet.name}
                  </p>
                  <p className="text-sm text-gray-300">
                    <strong>Expires:</strong> {PrivacyWalletManager.formatRemainingTime(selectedWallet)}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (selectedWallet) {
                      handleFundRecovery(selectedWallet.id);
                    } else {
                      // Recover all expiring wallets
                      if (recoveryAddress) {
                        PrivacyWalletManager.sweepExpiringWallets(recoveryAddress)
                          .then(recoveryIds => {
                            alert(`Created ${recoveryIds.length} fund recovery instructions. Check console for details.`);
                            setShowRecoveryModal(false);
                            setRecoveryAddress('');
                          })
                          .catch(error => {
                            alert('Failed to create recoveries: ' + error.message);
                          });
                      } else {
                        alert('Please enter a recovery address');
                      }
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                >
                  Create Recovery
                </button>
                <button
                  onClick={() => {
                    setShowRecoveryModal(false);
                    setRecoveryAddress('');
                    setSelectedWallet(null);
                  }}
                  className="px-4 py-2 border border-zinc-600 text-gray-300 rounded-lg text-sm hover:border-yellow-400 hover:text-yellow-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
