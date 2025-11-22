"use client";

import Image from "next/image";
import Link from "next/link";
import { Wallet } from "./types";
import { CHAINS } from "./constants";

interface WalletCountCardProps {
  wallets: Wallet[];
}

export default function WalletCountCard({ wallets }: WalletCountCardProps) {
  const getWalletCountByChain = (chainId: string): number => {
    // Count how many wallets have an address for this specific chain
    return wallets.filter((wallet) =>
      wallet.addresses.some((addr) => addr.chainId === chainId)
    ).length;
  };

  return (
    <div className="bg-zinc-950/70 border border-yellow-300/40 rounded-2xl p-8 backdrop-blur-lg">
      <h2 className="text-xl font-semibold text-yellow-300 mb-6">
        Wallet Statistics
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {CHAINS.map((chain) => {
          const count = getWalletCountByChain(chain.id);
          return (
            <Link
              key={chain.id}
              href={`/generate/wallets?chain=${chain.id}`}
              className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6 hover:border-yellow-300/50 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-16 h-16 rounded-full bg-gradient-to-br ${chain.color} p-0.5`}
                >
                  <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center">
                    <Image
                      src={chain.icon}
                      alt={chain.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-gray-400 text-sm mb-1">{chain.name}</p>
                  <p className="text-2xl font-semibold text-yellow-300">
                    {count}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    {count === 1 ? "wallet" : "wallets"} created
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

