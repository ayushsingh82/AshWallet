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
      
      {/* Navigation Links - Center */}
      <div className="flex-1 flex justify-center gap-4">
        <Link
          href="/bridge"
          className="text-white px-6 py-2 rounded-lg hover:bg-gray-800/50 transition-colors"
        >
          Bridge
        </Link>
        <Link
          href="/generate"
          className="text-white px-6 py-2 rounded-lg hover:bg-gray-800/50 transition-colors"
        >
          Generate
        </Link>
      </div>
      
      {/* Wallet Selector - Right */}
      <WalletSelector />
    </nav>
  );
};

export default Navbar;


