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
    <div className="bg-[#141414] border border-gray-700 p-8 mb-8 relative group">
      <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-[#EBF73F]"></div>
      <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-[#EBF73F]"></div>
      <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-[#EBF73F]"></div>
      <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-[#EBF73F]"></div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-2">Total Balance</p>
          <p className="text-2xl md:text-3xl font-semibold text-[#EBF73F]">
            ${totalBalance.toFixed(2)}
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Across {wallets.length} wallet{wallets.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={onGenerateClick}
          className="px-6 py-3 bg-gradient-to-r from-[#EBF73F] to-[#EBF73F] text-black font-semibold rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
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

