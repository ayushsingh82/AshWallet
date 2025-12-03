"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import WalletSelector from "../../components/ui/WalletSelector";

const Navbar = () => {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-between px-16 py-4 bg-black/80 backdrop-blur-md border-b border-zinc-900">
      <Link href="/" className="text-2xl font-bold text-[#EBF73F]">
        AshWallet
      </Link>
      
      {/* Navigation Links - Center */}
      <div className="flex-1 flex justify-center gap-4">
        <Link
          href="/wallet"
          className="text-white px-6 py-2 rounded-lg border border-white/30 hover:bg-gray-800/50 transition-colors relative"
        >
          Generate Wallet
          <span className="absolute -top-2 -right-2 bg-[#EBF73F] text-black text-xs px-1.5 py-0.5 rounded-full font-bold border-2 border-black">
            NEW
          </span>
        </Link>
      </div>

      {/* NEAR Wallet Connection - Right */}
      <div className="flex items-center">
        <WalletSelector />
      </div>
    </nav>
  );
};

export default Navbar;


