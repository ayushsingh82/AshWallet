"use client";

interface EmptyStateProps {
  onGenerateClick: () => void;
}

export default function EmptyState({ onGenerateClick }: EmptyStateProps) {
  return (
    <div className="bg-zinc-950/70 border border-yellow-300/40 rounded-2xl p-12 backdrop-blur-lg text-center">
      <div className="w-20 h-20 bg-yellow-300/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg
          className="w-10 h-10 text-yellow-300"
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
      <h3 className="text-xl font-semibold mb-2">No Wallets Yet</h3>
      <p className="text-gray-400 mb-6">
        Generate your first multichain wallet to get started
      </p>
      <button
        onClick={onGenerateClick}
        className="px-6 py-3 bg-gradient-to-r from-yellow-300 to-yellow-500 text-black font-semibold rounded-lg hover:opacity-90 transition-all"
      >
        Generate Wallet
      </button>
    </div>
  );
}

