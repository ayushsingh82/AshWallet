"use client";

import { useState, useEffect } from "react";
import { useNearWallet } from "../../src/provider/wallet";
import { Connection as SolanaConnection } from "@solana/web3.js";
import { chainAdapters } from "chainsig.js";
import { SIGNET_CONTRACT } from "../../signature/config";
import { useDebounce } from "../../signature/hooks/debounce";
import { bigIntToDecimal } from "../../signature/utils/bigIntToDecimal";

interface WalletStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed';
}

const connection = new SolanaConnection("https://api.mainnet-beta.solana.com");
const Solana = new chainAdapters.solana.Solana({
  solanaConnection: connection,
  contract: SIGNET_CONTRACT,
});

export default function WalletPage() {
  const { accountId, status } = useNearWallet();
  const [currentStep, setCurrentStep] = useState<'name' | 'derive' | 'swap' | 'ready'>('name');
  const [walletName, setWalletName] = useState('');
  const [derivedAddress, setDerivedAddress] = useState('');
  const [solBalance, setSolBalance] = useState('');
  const [isDeriving, setIsDeriving] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [zecAmount, setZecAmount] = useState('');
  const [error, setError] = useState('');

  const debouncedWalletName = useDebounce(walletName, 500);

  const steps: WalletStep[] = [
    {
      id: 'name',
      title: 'Enter Wallet Name',
      description: 'Give your wallet a unique name (this will be the path)',
      status: currentStep === 'name' ? 'active' : 'completed'
    },
    {
      id: 'derive',
      title: 'Derive Solana Address',
      description: 'We derive your Solana address using chain signature',
      status: currentStep === 'derive' ? 'active' : currentStep === 'name' ? 'pending' : 'completed'
    },
    {
      id: 'swap',
      title: 'Swap ZEC to SOL',
      description: 'Swap your ZEC on NEAR to SOL on Solana via intents',
      status: currentStep === 'swap' ? 'active' : ['name', 'derive'].includes(currentStep) ? 'pending' : 'completed'
    },
    {
      id: 'ready',
      title: 'Ready to Use',
      description: 'Your SOL is ready on the derived address',
      status: currentStep === 'ready' ? 'active' : 'pending'
    }
  ];

  // Validate wallet name (base58 characters for Solana paths)
  const isValidWalletName = (name: string): boolean => {
    if (!name || name.trim().length === 0) return false;
    // Allow alphanumeric, hyphens, and underscores for path names
    // The path itself doesn't need to be base58, but we'll validate it's reasonable
    const validPattern = /^[a-zA-Z0-9_-]+$/;
    return validPattern.test(name) && name.length <= 50;
  };

  // Derive Solana address when wallet name changes
  useEffect(() => {
    if (!debouncedWalletName || !accountId || currentStep !== 'name') return;
    
    // Validate wallet name
    if (!isValidWalletName(debouncedWalletName)) {
      if (debouncedWalletName.trim().length > 0) {
        setError('Wallet name can only contain letters, numbers, hyphens, and underscores');
      } else {
        setError('');
      }
      return;
    }

    const deriveAddress = async () => {
      try {
        setIsDeriving(true);
        setError('');

        // Sanitize the path - ensure it's safe for derivation
        const sanitizedPath = debouncedWalletName.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
        
        const { publicKey } = await Solana.deriveAddressAndPublicKey(
          accountId,
          sanitizedPath
        );

        setDerivedAddress(publicKey);

        // Get balance
        const balance = await Solana.getBalance(publicKey);
        setSolBalance(bigIntToDecimal(balance.balance, balance.decimals));

        setCurrentStep('derive');
      } catch (err) {
        console.error('Error deriving address:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to derive address';
        // Provide more helpful error messages
        if (errorMessage.includes('base58') || errorMessage.includes('Non-base58')) {
          setError('Invalid wallet name. Please use only letters, numbers, hyphens, and underscores.');
        } else {
          setError(errorMessage);
        }
      } finally {
        setIsDeriving(false);
      }
    };

    deriveAddress();
  }, [debouncedWalletName, accountId]);

  const handleSwap = async () => {
    if (!derivedAddress || !zecAmount || !accountId) {
      setError('Please fill in all fields');
      return;
    }

    setIsSwapping(true);
    setError('');

    try {
      // TODO: Implement actual swap using NEAR intents
      // This is a placeholder - you'll need to integrate with privacy-bridge.ts
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setCurrentStep('ready');
    } catch (err) {
      console.error('Error swapping:', err);
      setError(err instanceof Error ? err.message : 'Failed to swap');
    } finally {
      setIsSwapping(false);
    }
  };

  const isConnected = status === 'authenticated' && accountId;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white hover:text-[#EBF73F] transition-colors">
            Privacy Wallet
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Generate anonymous Solana addresses using chain signatures. 
            Swap ZEC to SOL via NEAR intents.
          </p>
        </div>

        {/* Check Wallet Connection */}
        {!isConnected && (
          <div className="bg-yellow-900/20 border border-yellow-500 rounded-xl p-6 mb-8 text-center">
            <p className="text-yellow-200 text-lg mb-4">
              ⚠️ Please connect your NEAR wallet first
            </p>
            <p className="text-yellow-300 text-sm">
              Use the "Connect NEAR Wallet" button in the navbar
            </p>
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-12 h-12 text-sm font-bold bg-[#141414] border border-gray-700 relative group hover:bg-black transition-colors
                  ${step.status === 'active' ? 'text-[#EBF73F]' : 
                    step.status === 'completed' ? 'text-[#EBF73F]' : 
                    'text-gray-400'}
                `}>
                  <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-[#EBF73F]"></div>
                  <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-[#EBF73F]"></div>
                  <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-[#EBF73F]"></div>
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-[#EBF73F]"></div>
                  <span className="relative z-10">{step.status === 'completed' ? '✓' : index + 1}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    w-20 h-1 mx-4
                    ${step.status === 'completed' ? 'bg-[#EBF73F]' : 'bg-gray-700'}
                  `} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">
              {steps.find(s => s.status === 'active')?.title}
            </h2>
            <p className="text-gray-400">
              {steps.find(s => s.status === 'active')?.description}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-[#141414] border border-gray-700 p-8 relative group">
          <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-[#EBF73F]"></div>
          <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-[#EBF73F]"></div>
          <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-[#EBF73F]"></div>
          <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-[#EBF73F]"></div>

          {/* Step 1: Enter Wallet Name */}
          {currentStep === 'name' && (
            <div className="space-y-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">Enter Wallet Name</h3>
                <p className="text-gray-400 mb-8">
                  Give your wallet a unique name. This name will be used as the path to derive your Solana address.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Wallet Name (Path)
                  </label>
                  <input
                    type="text"
                    value={walletName}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only allow alphanumeric, hyphens, and underscores
                      if (value === '' || /^[a-zA-Z0-9_-]*$/.test(value)) {
                        setWalletName(value);
                        setError(''); // Clear error when user types
                      }
                    }}
                    placeholder="e.g., defi-swap-1, nft-purchase, yield-farming"
                    className={`w-full px-4 py-3 bg-black border rounded-lg text-white placeholder-gray-500 focus:outline-none ${
                      error && walletName ? 'border-red-500' : 'border-gray-600 focus:border-[#EBF73F]'
                    }`}
                    disabled={!isConnected || isDeriving}
                    maxLength={50}
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Each unique name will generate a different Solana address. Use only letters, numbers, hyphens (-), and underscores (_).
                  </p>
                </div>

                {isConnected && (
                  <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
                    <p className="text-blue-200 text-sm">
                      💡 Connected as: <span className="font-mono">{accountId}</span>
                    </p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
                    <p className="text-red-200 text-sm">{error}</p>
                  </div>
                )}
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-400">
                  {isDeriving ? 'Deriving address...' : 'Enter a name above to continue'}
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Derived Address */}
          {currentStep === 'derive' && derivedAddress && (
            <div className="space-y-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">✓ Address Derived Successfully</h3>
                <p className="text-gray-400 mb-8">
                  Your Solana address has been derived using chain signature
                </p>
              </div>

              <div className="bg-[#141414] border border-gray-700 p-6 mb-8 relative group">
                <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-[#EBF73F]"></div>
                <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-[#EBF73F]"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-[#EBF73F]"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-[#EBF73F]"></div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Wallet Name (Path):</p>
                    <p className="font-mono text-lg text-[#EBF73F]">{walletName}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Derived Solana Address:</p>
                    <div className="flex items-center gap-3">
                      <p className="font-mono text-sm flex-1 break-all">{derivedAddress}</p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(derivedAddress);
                          alert('Address copied!');
                        }}
                        className="px-3 py-1 bg-[#EBF73F] text-black text-xs rounded hover:bg-[#e8eb9f] transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400 mb-2">Current SOL Balance:</p>
                    <p className="font-bold text-lg">{solBalance || '0'} SOL</p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => setCurrentStep('swap')}
                  className="px-8 py-4 bg-[#EBF73F] text-black font-bold text-lg rounded-lg hover:bg-[#e8eb9f] transition-colors"
                >
                  Continue to Swap
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Swap ZEC to SOL */}
          {currentStep === 'swap' && (
            <div className="space-y-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">Swap ZEC to SOL</h3>
                <p className="text-gray-400 mb-8">
                  Swap your ZEC on NEAR to SOL on Solana via NEAR intents
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    ZEC Amount (on NEAR)
                  </label>
                  <input
                    type="number"
                    value={zecAmount}
                    onChange={(e) => setZecAmount(e.target.value)}
                    placeholder="0.0"
                    step="0.00000001"
                    min="0"
                    className="w-full px-4 py-3 bg-black border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-[#EBF73F] focus:outline-none"
                    disabled={isSwapping}
                  />
                </div>

                <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
                  <p className="text-blue-200 text-sm">
                    💡 <strong>How it works:</strong> Your ZEC on NEAR will be swapped to SOL and sent to your derived Solana address: <span className="font-mono text-xs">{derivedAddress.slice(0, 20)}...</span>
                  </p>
                </div>

                {error && (
                  <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
                    <p className="text-red-200 text-sm">{error}</p>
                  </div>
                )}
              </div>

              <div className="text-center">
                <button
                  onClick={handleSwap}
                  disabled={isSwapping || !zecAmount}
                  className="px-8 py-4 bg-[#EBF73F] text-black font-bold text-lg rounded-lg hover:bg-[#e8eb9f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSwapping ? 'Swapping...' : 'Swap ZEC to SOL'}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Ready */}
          {currentStep === 'ready' && (
            <div className="space-y-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">🎉 Ready to Use!</h3>
                <p className="text-gray-400 mb-8">
                  Your SOL has been sent to your derived Solana address
                </p>
              </div>

              <div className="bg-[#141414] border border-gray-700 p-6 mb-8 relative group">
                <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-[#EBF73F]"></div>
                <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-[#EBF73F]"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-[#EBF73F]"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-[#EBF73F]"></div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Solana Address:</p>
                    <div className="flex items-center gap-3">
                      <p className="font-mono text-sm flex-1 break-all">{derivedAddress}</p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(derivedAddress);
                          alert('Address copied!');
                        }}
                        className="px-3 py-1 bg-[#EBF73F] text-black text-xs rounded hover:bg-[#e8eb9f] transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400 mb-2">SOL Balance:</p>
                    <p className="font-bold text-lg">{solBalance} SOL</p>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-4">
                <p className="text-gray-300">
                  🎉 <strong>Success!</strong> You can now use this Solana address for DeFi interactions.
                </p>
                
                <button
                  onClick={() => {
                    setCurrentStep('name');
                    setWalletName('');
                    setDerivedAddress('');
                    setSolBalance('');
                    setZecAmount('');
                    setError('');
                  }}
                  className="px-6 py-3 border border-zinc-600 text-gray-300 rounded-lg hover:border-white hover:text-[#EBF73F] transition-colors"
                >
                  Create Another Wallet
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
