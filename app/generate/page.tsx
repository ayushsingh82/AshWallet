"use client";

import { useState, useEffect } from "react";
import { Wallet, WalletAddress } from "./types";
import { CHAINS } from "./constants";
import TotalBalanceCard from "./TotalBalanceCard";
import GenerateWalletForm from "./GenerateWalletForm";
import WalletCard from "./WalletCard";
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
            Multichain Wallet Manager
          </h1>
          <p className="text-gray-400 text-lg">
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

        {/* Wallets List */}
        {wallets.length === 0 && !showGenerateForm ? (
          <EmptyState onGenerateClick={() => setShowGenerateForm(true)} />
        ) : (
          <div className="space-y-4">
            {wallets.map((wallet) => (
              <WalletCard key={wallet.id} wallet={wallet} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
