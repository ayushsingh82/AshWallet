"use client";

import Image from "next/image";
import { Wallet, WalletAddress } from "./types";
import { CHAINS } from "./constants";
import { copyAddress } from "./utils";

interface WalletCardProps {
  wallet: Wallet;
}

export default function WalletCard({ wallet }: WalletCardProps) {
  const walletTotal = wallet.addresses.reduce(
    (sum, addr) => sum + addr.balance,
    0
  );

  const getChainInfo = (chainId: string) => {
    return CHAINS.find((c) => c.id === chainId);
  };

  return (
    <div className="bg-[#141414] border border-gray-700 p-6 relative group">
      <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-[#EBF73F]"></div>
      <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-[#EBF73F]"></div>
      <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-[#EBF73F]"></div>
      <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-[#EBF73F]"></div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-[#EBF73F] mb-1">
            {wallet.name}
          </h3>
          <p className="text-sm text-gray-400">
            Created {new Date(wallet.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Total Balance</p>
          <p className="text-2xl font-bold text-[#EBF73F]">
            ${walletTotal.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Addresses for each chain */}
      <div className="space-y-3">
        {wallet.addresses.map((addr) => {
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
                    <p className={`text-sm mt-1 ${chain.id === 'zcash' ? 'text-[#B8860B]' : 'text-[#EBF73F]'}`}>
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
}

