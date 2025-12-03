"use client";

import { useNearWallet } from "../../src/provider/wallet";

const WalletSelector = () => {
  const { accountId, status, signIn, signOut } = useNearWallet();

  if (status === "loading") {
    return (
      <div className="px-4 py-2 text-[#EBF73F] text-sm">
        Loading...
      </div>
    );
  }

  if (status === "authenticated" && accountId) {
    return (
      <div className="flex items-center gap-3">
        <div className="px-4 py-2 bg-[#141414] border border-[#EBF73F]/30 rounded-lg">
          <span className="text-[#EBF73F] text-sm font-mono">
            {accountId.length > 20 
              ? `${accountId.slice(0, 8)}...${accountId.slice(-8)}` 
              : accountId
            }
          </span>
        </div>
        <button
          onClick={signOut}
          className="px-4 py-2 border border-red-500/50 hover:bg-red-500/10 text-red-400 text-sm rounded-lg transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={signIn}
      className="px-6 py-2 bg-[#EBF73F] text-black font-bold rounded-lg hover:bg-[#e8eb9f] transition-colors"
    >
      Connect NEAR Wallet
    </button>
  );
};

export default WalletSelector; 