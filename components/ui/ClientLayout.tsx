'use client';

import NearWalletProvider from '../../src/provider/wallet';
import WalletSelector from './WalletSelector';
import Link from 'next/link';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <NearWalletProvider>
      <nav className="bg-black border-b border-green-800/50">
        <div className="container mx-auto px-6">
          <div className="flex items-center h-16">
            {/* Logo/Name - Left */}
            <div className="flex-shrink-0">
              <Link href="/" className="text-2xl font-bold text-[#97FBE4]">
                NEAR X ZEC
              </Link>
            </div>

            {/* Wallet Selector - Center */}
            <div className="flex-1 flex justify-center">
              <WalletSelector />
            </div>

            {/* Navigation Links - Right */}
            <div className="flex-shrink-0 flex items-center gap-6">
              {/* Explore Link */}
              <Link 
                href="/explore" 
                className="text-[#97FBE4] hover:text-[#5eead4] transition-colors"
              >
                Explore
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {children}
      </main>
    </NearWalletProvider>
  );
}

