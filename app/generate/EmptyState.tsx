"use client";

interface EmptyStateProps {
  onGenerateClick: () => void;
}

export default function EmptyState({ onGenerateClick }: EmptyStateProps) {
  return (
    <div className="bg-[#141414] border border-gray-700 p-12 text-center relative group">
      <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-[#EBF73F]"></div>
      <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-[#EBF73F]"></div>
      <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-[#EBF73F]"></div>
      <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-[#EBF73F]"></div>
      <div className="w-20 h-20 bg-[#EBF73F]/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg
          className="w-10 h-10 text-[#EBF73F]"
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
      </div>
      <h3 className="text-lg font-semibold mb-2">No Wallets Yet</h3>
      <p className="text-sm text-gray-400 mb-6">
        Generate your first multichain wallet to get started
      </p>
      <button
        onClick={onGenerateClick}
        className="px-6 py-3 bg-gradient-to-r from-[#EBF73F] to-[#EBF73F] text-black font-semibold rounded-lg hover:opacity-90 transition-all"
      >
        Generate Wallet
      </button>
    </div>
  );
}

