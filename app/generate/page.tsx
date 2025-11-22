"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Wallet, WalletAddress } from "./types";
import { CHAINS } from "./constants";
import TotalBalanceCard from "./TotalBalanceCard";
import GenerateWalletForm from "./GenerateWalletForm";
import WalletCountCard from "./WalletCountCard";
import EmptyState from "./EmptyState";

export default function GeneratePage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [showGenerateForm, setShowGenerateForm] = useState(false);

  // Load wallets from localStorage on mount
  useEffect(() => {
    const savedWallets = localStorage.getItem("multichain_wallets");
    if (savedWallets) {
      setWallets(JSON.parse(savedWallets));
    }
  }, []);

  // Save wallets to localStorage whenever wallets change
  useEffect(() => {
    if (wallets.length > 0) {
      localStorage.setItem("multichain_wallets", JSON.stringify(wallets));
    }
  }, [wallets]);

  const generateWallet = async (
    selectedChains: string[],
    walletName: string
  ) => {
    return new Promise<void>((resolve) => {
      // Simulate wallet generation
      setTimeout(() => {
        const addresses: WalletAddress[] = [];
        selectedChains.forEach((chainId) => {
          const chain = CHAINS.find((c) => c.id === chainId);
          if (chain) {
            // Generate a mock address and random balance
            const address = `${chain.name.substring(0, 3).toLowerCase()}1${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
            const balance = Math.random() * 100; // Random balance between 0-100
            addresses.push({
              chainId,
              address,
              balance: parseFloat(balance.toFixed(4)),
            });
          }
        });

        const newWallet: Wallet = {
          id: Date.now().toString(),
          name: walletName || `Wallet ${wallets.length + 1}`,
          addresses,
          createdAt: new Date().toISOString(),
        };

        setWallets([...wallets, newWallet]);
        setShowGenerateForm(false);
        resolve();
      }, 2000);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold mb-4 bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
            Multichain Wallet Manager
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage your wallets across Solana, Zcash, and NEAR
          </p>
        </div>

        {/* Total Balance Card */}
        <TotalBalanceCard
          wallets={wallets}
          onGenerateClick={() => setShowGenerateForm(true)}
        />

        {/* Generate Form */}
        {showGenerateForm && (
          <GenerateWalletForm
            onGenerate={generateWallet}
            onClose={() => {
              setShowGenerateForm(false);
            }}
          />
        )}

        {/* Wallet Count Cards */}
        {!showGenerateForm && (
          <>
            <WalletCountCard wallets={wallets} />
            
            {/* View All Wallets Link */}
            {wallets.length > 0 && (
              <div className="mt-6 text-center">
                <Link
                  href="/generate/wallets"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-300 to-yellow-500 text-black font-semibold rounded-lg hover:opacity-90 transition-all"
                >
                  View All Wallet Addresses
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {wallets.length === 0 && !showGenerateForm && (
          <EmptyState onGenerateClick={() => setShowGenerateForm(true)} />
        )}
      </div>
    </div>
  );
}
