"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import WalletSelector from "../../components/ui/WalletSelector";

const Navbar = () => {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-between px-16 py-4 bg-black/80 backdrop-blur-md border-b border-zinc-900">
      <Link href="/" className="text-2xl font-bold text-white">
        ZEC × NEAR
      </Link>
      
      {/* Wallet Selector - Center */}
      <div className="flex-1 flex justify-center">
        <WalletSelector />
      </div>
      
      <Link
        href="/bridge"
        className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors border border-yellow-400/60 shadow-[0_0_18px_rgba(250,204,21,0.55)]"
      >
        Get Started
      </Link>
    </nav>
  );
};

export default Navbar;


