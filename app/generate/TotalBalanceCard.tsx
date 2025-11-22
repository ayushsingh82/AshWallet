"use client";

import { Wallet } from "./types";
import { calculateTotalBalance } from "./utils";

interface TotalBalanceCardProps {
  wallets: Wallet[];
  onGenerateClick: () => void;
}

export default function TotalBalanceCard({
  wallets,
  onGenerateClick,
}: TotalBalanceCardProps) {
  const totalBalance = calculateTotalBalance(wallets);

  return (
    <div className="bg-zinc-950/70 border border-yellow-300/40 rounded-2xl p-8 backdrop-blur-lg mb-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-2">Total Balance</p>
          <p className="text-4xl font-bold text-yellow-300">
            ${totalBalance.toFixed(2)}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Across {wallets.length} wallet{wallets.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={onGenerateClick}
          className="px-6 py-3 bg-gradient-to-r from-yellow-300 to-yellow-500 text-black font-semibold rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Generate New Wallet
        </button>
      </div>
    </div>
  );
}

