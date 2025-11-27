"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Wallet } from "../types";
import { CHAINS } from "../constants";
import { copyAddress } from "../utils";

export default function WalletsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedChain = searchParams.get("chain") || "all";
  const [wallets, setWallets] = useState<Wallet[]>([]);

  // Load wallets from localStorage
  useEffect(() => {
    const savedWallets = localStorage.getItem("multichain_wallets");
    if (savedWallets) {
      setWallets(JSON.parse(savedWallets));
    }
  }, []);

  const getChainInfo = (chainId: string) => {
    return CHAINS.find((c) => c.id === chainId);
  };

  const filteredWallets = wallets.filter((wallet) => {
    if (selectedChain === "all") return true;
    return wallet.addresses.some((addr) => addr.chainId === selectedChain);
  });

  const getWalletCountByChain = (chainId: string): number => {
    return wallets.filter((wallet) =>
      wallet.addresses.some((addr) => addr.chainId === chainId)
    ).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/generate"
            className="inline-flex items-center gap-2 text-[#97FBE4] hover:text-[#7EE7D6] mb-4 transition-colors"
          >
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Generate
          </Link>
          <h1 className="text-2xl md:text-3xl font-semibold mb-4 bg-gradient-to-r from-[#97FBE4] to-[#7EE7D6] bg-clip-text text-transparent">
            Wallet Addresses
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            View and manage all your wallet addresses
          </p>
        </div>

        {/* Chain Filter */}
        <div className="bg-zinc-950/70 border border-[#97FBE4]/40 rounded-2xl p-6 backdrop-blur-lg mb-8">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push("/generate/wallets?chain=all")}
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedChain === "all"
                  ? "bg-[#97FBE4] text-black font-semibold"
                  : "bg-zinc-800 text-gray-300 hover:bg-zinc-700"
              }`}
            >
              All ({wallets.length})
            </button>
            {CHAINS.map((chain) => {
              const count = getWalletCountByChain(chain.id);
              return (
                <button
                  key={chain.id}
                  onClick={() => router.push(`/generate/wallets?chain=${chain.id}`)}
                  className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                    selectedChain === chain.id
                      ? "bg-[#97FBE4] text-black font-semibold"
                      : "bg-zinc-800 text-gray-300 hover:bg-zinc-700"
                  }`}
                >
                  <Image
                    src={chain.icon}
                    alt={chain.name}
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                  {chain.name} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Wallets List */}
        {filteredWallets.length === 0 ? (
          <div className="bg-zinc-950/70 border border-[#97FBE4]/40 rounded-2xl p-12 backdrop-blur-lg text-center">
            <div className="w-20 h-20 bg-[#97FBE4]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-[#97FBE4]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">No Wallets Found</h3>
            <p className="text-sm text-gray-400 mb-6">
              {selectedChain === "all"
                ? "Generate your first wallet to get started"
                : `No ${getChainInfo(selectedChain)?.name || ""} wallets found`}
            </p>
            <Link
              href="/generate"
              className="inline-block px-6 py-3 bg-gradient-to-r from-[#97FBE4] to-[#7EE7D6] text-black font-semibold rounded-lg hover:opacity-90 transition-all"
            >
              Generate Wallet
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredWallets.map((wallet) => {
              const walletTotal = wallet.addresses.reduce(
                (sum, addr) => sum + addr.balance,
                0
              );

              // Filter addresses based on selected chain
              const displayAddresses =
                selectedChain === "all"
                  ? wallet.addresses
                  : wallet.addresses.filter(
                      (addr) => addr.chainId === selectedChain
                    );

              if (displayAddresses.length === 0) return null;

              return (
                <div
                  key={wallet.id}
                  className="bg-zinc-950/70 border border-[#97FBE4]/40 rounded-2xl p-6 backdrop-blur-lg"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-[#97FBE4] mb-1">
                        {wallet.name}
                      </h3>
                      <p className="text-xs text-gray-400">
                        Created {new Date(wallet.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Total Balance</p>
                      <p className="text-xl font-semibold text-[#97FBE4]">
                        ${walletTotal.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Addresses for each chain */}
                  <div className="space-y-3">
                    {displayAddresses.map((addr) => {
                      const chain = getChainInfo(addr.chainId);
                      if (!chain) return null;

                      return (
                        <div
                          key={addr.chainId}
                          className="bg-zinc-900/50 border border-zinc-700 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div
                                className={`w-12 h-12 rounded-full bg-gradient-to-br ${chain.color} p-0.5`}
                              >
                                <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center">
                                  <Image
                                    src={chain.icon}
                                    alt={chain.name}
                                    width={28}
                                    height={28}
                                    className="rounded-full"
                                  />
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-semibold">{chain.name}</p>
                                  <span className="text-xs text-gray-500">
                                    ({chain.symbol})
                                  </span>
                                </div>
                                <p className="text-sm text-gray-400 font-mono">
                                  {addr.address}
                                </p>
                                <p className="text-sm text-[#97FBE4] mt-1">
                                  {addr.balance.toFixed(4)} {chain.symbol}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => copyAddress(addr.address)}
                              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors text-sm ml-4"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

