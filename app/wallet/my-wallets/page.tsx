"use client";

import { useState, useEffect } from "react";
import { useNearWallet } from "../../../src/provider/wallet";
import { getDerivedWallets, DerivedWallet, deleteDerivedWallet } from "../utils";
import Link from "next/link";

export default function MyWalletsPage() {
  const { accountId, status } = useNearWallet();
  const [wallets, setWallets] = useState<DerivedWallet[]>([]);
  const [filterChain, setFilterChain] = useState<'all' | 'solana' | 'near' | 'evm'>('all');

  useEffect(() => {
    if (accountId && status === 'authenticated') {
      const userWallets = getDerivedWallets(accountId);
      setWallets(userWallets);
    } else {
      setWallets([]);
    }
  }, [accountId, status]);

  const filteredWallets = filterChain === 'all' 
    ? wallets 
    : wallets.filter(w => w.chain === filterChain);

  const handleDelete = (walletId: string) => {
    if (confirm('Are you sure you want to delete this wallet record?')) {
      deleteDerivedWallet(walletId);
      setWallets(wallets.filter(w => w.id !== walletId));
    }
  };

  const getChainIcon = (chain: string) => {
    switch (chain) {
      case 'solana':
        return '🟣';
      case 'near':
        return '🟡';
      case 'evm':
        return '🔷';
      default:
        return '⚪';
    }
  };

  const getChainName = (chain: string) => {
    switch (chain) {
      case 'solana':
        return 'Solana';
      case 'near':
        return 'NEAR';
      case 'evm':
        return 'EVM';
      default:
        return chain;
    }
  };

  const isConnected = status === 'authenticated' && accountId;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2 text-white hover:text-[#EBF73F] transition-colors">
                My Wallets
              </h1>
              <p className="text-xl text-gray-300">
                All addresses derived from your NEAR account
              </p>
            </div>
            <Link
              href="/wallet"
              className="px-6 py-3 bg-[#EBF73F] text-black font-bold rounded-lg hover:bg-[#e8eb9f] transition-colors"
            >
              Create New Wallet
            </Link>
          </div>

          {isConnected && (
            <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
              <p className="text-blue-200">
                💡 Connected as: <span className="font-mono">{accountId}</span>
              </p>
            </div>
          )}
        </div>

        {/* Check Connection */}
        {!isConnected && (
          <div className="bg-yellow-900/20 border border-yellow-500 rounded-xl p-6 mb-8 text-center">
            <p className="text-yellow-200 text-lg mb-4">
              ⚠️ Please connect your NEAR wallet to view your wallets
            </p>
            <p className="text-yellow-300 text-sm">
              Use the "Connect NEAR Wallet" button in the navbar
            </p>
          </div>
        )}

        {/* Filter */}
        {isConnected && wallets.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-4">
              <span className="text-gray-300">Filter by chain:</span>
              {(['all', 'solana', 'near', 'evm'] as const).map(chain => (
                <button
                  key={chain}
                  onClick={() => setFilterChain(chain)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterChain === chain
                      ? 'bg-[#EBF73F] text-black'
                      : 'bg-[#141414] border border-gray-700 text-gray-300 hover:border-[#EBF73F]'
                  }`}
                >
                  {chain === 'all' ? 'All' : getChainName(chain)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Wallets List */}
        {isConnected && filteredWallets.length === 0 && wallets.length > 0 && (
          <div className="bg-[#141414] border border-gray-700 rounded-xl p-8 text-center">
            <p className="text-gray-400">
              No wallets found for the selected chain filter.
            </p>
          </div>
        )}

        {isConnected && wallets.length === 0 && (
          <div className="bg-[#141414] border border-gray-700 rounded-xl p-8 text-center">
            <p className="text-gray-400 mb-4">
              You haven't created any wallets yet.
            </p>
            <Link
              href="/wallet"
              className="inline-block px-6 py-3 bg-[#EBF73F] text-black font-bold rounded-lg hover:bg-[#e8eb9f] transition-colors"
            >
              Create Your First Wallet
            </Link>
          </div>
        )}

        {/* Wallets Grid */}
        {isConnected && filteredWallets.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWallets.map((wallet) => (
              <div
                key={wallet.id}
                className="bg-[#141414] border border-gray-700 p-6 rounded-lg relative group hover:bg-black transition-colors"
              >
                <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-[#EBF73F]"></div>
                <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-[#EBF73F]"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-[#EBF73F]"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-[#EBF73F]"></div>

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getChainIcon(wallet.chain)}</span>
                    <span className="text-sm font-medium text-[#EBF73F]">
                      {getChainName(wallet.chain)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(wallet.id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Delete
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Path (Wallet Name):</p>
                    <p className="font-mono text-sm text-[#EBF73F] break-all">
                      {wallet.path}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400 mb-1">Derived Address:</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-xs text-gray-300 break-all flex-1">
                        {wallet.address}
                      </p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(wallet.address);
                          alert('Address copied!');
                        }}
                        className="px-2 py-1 bg-[#EBF73F] text-black text-xs rounded hover:bg-[#e8eb9f] transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  {wallet.balance && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Balance:</p>
                      <p className="font-bold text-lg">
                        {wallet.balance} {wallet.chain === 'solana' ? 'SOL' : wallet.chain === 'near' ? 'NEAR' : 'ETH'}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-gray-400 mb-1">Created:</p>
                    <p className="text-sm text-gray-300">
                      {new Date(wallet.createdAt).toLocaleDateString()} {new Date(wallet.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {isConnected && wallets.length > 0 && (
          <div className="mt-12 bg-[#141414] border border-gray-700 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 text-[#EBF73F]">Statistics</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-400">Total Wallets</p>
                <p className="text-2xl font-bold">{wallets.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Solana</p>
                <p className="text-2xl font-bold">{wallets.filter(w => w.chain === 'solana').length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">NEAR</p>
                <p className="text-2xl font-bold">{wallets.filter(w => w.chain === 'near').length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">EVM</p>
                <p className="text-2xl font-bold">{wallets.filter(w => w.chain === 'evm').length}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

