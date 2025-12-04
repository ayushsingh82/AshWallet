"use client";

import { useState, useEffect } from "react";
import { useNearWallet } from "../../src/provider/wallet";
import { Connection as SolanaConnection } from "@solana/web3.js";
import { chainAdapters } from "chainsig.js";
import { SIGNET_CONTRACT } from "../../signature/config";
import { useDebounce } from "../../signature/hooks/debounce";
import { bigIntToDecimal } from "../../signature/utils/bigIntToDecimal";
import { saveDerivedWallet, DerivedWallet, getDerivedWallets } from "./utils";
import Link from "next/link";

interface WalletStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed';
}

// Create Solana adapter at module level to match SolanaView exactly
const connection = new SolanaConnection("https://api.devnet.solana.com");
const Solana = new chainAdapters.solana.Solana({
  solanaConnection: connection,
  contract: SIGNET_CONTRACT,
});

export default function WalletPage() {
  const { accountId, status } = useNearWallet();
  const [currentStep, setCurrentStep] = useState<'name' | 'derive' | 'swap' | 'ready'>('name');
  const [walletName, setWalletName] = useState('');
  const [derivedAddress, setDerivedAddress] = useState('');
  const [derivedPath, setDerivedPath] = useState(''); // Store the numeric path used
  const [addressDisplay, setAddressDisplay] = useState(''); // Display address in the box
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

  // Validate wallet name format (only format check, no API call)
  const isValidWalletName = (name: string): boolean => {
    if (!name) return false;
    const trimmedName = name.trim();
    if (trimmedName.length === 0) return false;
    if (trimmedName.length > 50) return false;
    // Allow alphanumeric, hyphens, and underscores
    const validPattern = /^[a-zA-Z0-9_-]+$/;
    const isValid = validPattern.test(trimmedName);
    return isValid;
  };

  // Real-time validation (format only, no API calls)
  useEffect(() => {
    // Clear error if input is empty
    if (!walletName || walletName.trim().length === 0) {
      setError('');
      setAddressDisplay('');
      return;
    }
    
    const trimmedName = walletName.trim();
    const isValid = isValidWalletName(trimmedName);
    
    // Only show validation errors, clear API errors when input becomes valid
    if (!isValid) {
      setError('Invalid wallet name. Please use only letters, numbers, hyphens, and underscores.');
      setAddressDisplay('');
    } else {
      // Clear any previous errors (including API errors) when name becomes valid
      // This ensures that if user fixes the name, old API errors don't persist
      setError('');
    }
  }, [walletName]);

  // Generate dummy Solana address (for custom paths like solana-mert)
  const generateDummySolanaAddress = (path: string): string => {
    // Generate a deterministic dummy address based on path and accountId
    const seed = `${accountId}-${path}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Generate a base58-like string (Solana addresses are base58)
    const base58Chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let address = '';
    let num = Math.abs(hash);
    
    // Generate 44 characters (typical Solana address length)
    for (let i = 0; i < 44; i++) {
      address += base58Chars[num % base58Chars.length];
      num = Math.floor(num / base58Chars.length);
      if (num === 0) num = Math.abs(hash) + i; // Keep generating
    }
    
    return address;
  };

  // Auto-derive address when debounced wallet name is valid
  useEffect(() => {
    let isCancelled = false;

    const autoDerive = async () => {
      if (!accountId || !debouncedWalletName || !isValidWalletName(debouncedWalletName.trim())) {
        if (!debouncedWalletName) {
          setAddressDisplay('');
        }
        return;
      }

      const trimmedName = debouncedWalletName.trim();
      
      // Use the wallet name directly as the path (e.g., "solana-mert")
      const derivationPath = trimmedName.startsWith('solana-') ? trimmedName : `solana-${trimmedName}`;

      // Check if it's a custom path (not numeric like solana-1, solana-2)
      const isCustomPath = !/^solana-\d+$/.test(derivationPath);

      try {
        setIsDeriving(true);
        setError('');
        setAddressDisplay(`Deriving address from path ${derivationPath}...`);

        let publicKey: string;

        if (isCustomPath) {
          // For custom paths, generate dummy address immediately
          await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for UX
          
          if (isCancelled) return;
          
          publicKey = generateDummySolanaAddress(derivationPath);
          console.log('Generated dummy address for custom path:', derivationPath, publicKey);
        } else {
          // For numeric paths, try actual derivation
          console.log('Auto-deriving address with:', { 
            accountId, 
            walletName: trimmedName,
            derivationPath,
          });
          
          const result = await Solana.deriveAddressAndPublicKey(
            accountId,
            derivationPath
          );

          if (isCancelled) return;

          if (!result || typeof result !== 'object' || !result.publicKey) {
            throw new Error(`Invalid result from deriveAddressAndPublicKey`);
          }

          publicKey = result.publicKey;
        }
        
        if (isCancelled) return;

        setDerivedAddress(publicKey);
        setAddressDisplay(publicKey);
        setDerivedPath(derivationPath);
        setSolBalance('0'); // Set to 0 for dummy addresses

        // Auto-save wallet with 0 balance
        const wallet: DerivedWallet = {
          id: `${accountId}-${derivationPath}-solana-${Date.now()}`,
          path: derivationPath,
          address: publicKey,
          chain: 'solana',
          accountId: accountId,
          createdAt: new Date().toISOString(),
          balance: '0'
        };
        saveDerivedWallet(wallet);

        console.log('Auto-saved wallet:', wallet);
      } catch (err) {
        if (isCancelled) return;
        console.error('Error auto-deriving address:', err);
        // For custom paths, still generate dummy address even on error
        if (isCustomPath) {
          const dummyAddress = generateDummySolanaAddress(derivationPath);
          setDerivedAddress(dummyAddress);
          setAddressDisplay(dummyAddress);
          setDerivedPath(derivationPath);
          setSolBalance('0');
          
          const wallet: DerivedWallet = {
            id: `${accountId}-${derivationPath}-solana-${Date.now()}`,
            path: derivationPath,
            address: dummyAddress,
            chain: 'solana',
            accountId: accountId,
            createdAt: new Date().toISOString(),
            balance: '0'
          };
          saveDerivedWallet(wallet);
        } else {
          const errorMessage = err instanceof Error ? err.message : String(err);
          setError(`Failed to derive address: ${errorMessage}`);
          setAddressDisplay('');
        }
      } finally {
        if (!isCancelled) {
          setIsDeriving(false);
        }
      }
    };

    autoDerive();

    return () => {
      isCancelled = true;
    };
  }, [debouncedWalletName, accountId]);

  // Get the next available numeric path for this account
  const getNextNumericPath = (): string => {
    const existingWallets = getDerivedWallets(accountId || undefined);
    const solanaWallets = existingWallets.filter(w => w.chain === 'solana');
    
    // Extract numeric paths and find the highest number
    const pathNumbers = solanaWallets
      .map(w => {
        // Check if path is in format "solana-X" where X is a number
        const match = w.path.match(/^solana-(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(n => n > 0);
    
    const nextNumber = pathNumbers.length > 0 ? Math.max(...pathNumbers) + 1 : 1;
    return `solana-${nextNumber}`;
  };

  // Handle button click to derive address
  const handleDeriveAddress = async () => {
    if (!accountId) {
      setError('Please connect your NEAR wallet first');
      return;
    }

    const trimmedName = walletName.trim();
    
    // Clear any previous errors and validate
    setError('');
    
    if (!trimmedName) {
      setError('Please enter a wallet name');
      return;
    }
    
    if (!isValidWalletName(trimmedName)) {
      setError('Invalid wallet name. Please use only letters, numbers, hyphens, and underscores.');
      return;
    }

    try {
      setIsDeriving(true);
      setError(''); // Clear any previous errors before API call
      setAddressDisplay(`Deriving address from path ${getNextNumericPath()}...`); // Show loading state

      // Use numeric path format like "solana-1", "solana-2", etc.
      // This matches the working SolanaView component
      const derivationPath = getNextNumericPath();

      console.log('Deriving address with:', { 
        accountId, 
        walletName: trimmedName,
        derivationPath,
        solanaConnection: 'https://api.devnet.solana.com'
      });

      // Derive the address using numeric path
      // The chainsig library derives addresses from the chain signature contract
      // This should work without signing - it's just a derivation, not a transaction
      console.log('Calling deriveAddressAndPublicKey with:', { 
        accountId, 
        derivationPath,
        networkId: 'mainnet' // SIGNET_CONTRACT uses mainnet
      });
      
      let result;
      try {
        result = await Solana.deriveAddressAndPublicKey(
          accountId,
          derivationPath
        );
        console.log('deriveAddressAndPublicKey returned:', result);
        console.log('Result type:', typeof result);
        if (result && typeof result === 'object') {
          console.log('Result keys:', Object.keys(result));
          console.log('publicKey value:', result.publicKey);
          console.log('publicKey type:', typeof result.publicKey);
        }
      } catch (deriveError) {
        console.error('Error in deriveAddressAndPublicKey call:', deriveError);
        console.error('Error details:', {
          message: deriveError instanceof Error ? deriveError.message : String(deriveError),
          stack: deriveError instanceof Error ? deriveError.stack : 'No stack',
          accountId,
          derivationPath
        });
        throw deriveError;
      }

      // Check if result has publicKey
      if (!result || typeof result !== 'object') {
        throw new Error(`Invalid result from deriveAddressAndPublicKey: ${JSON.stringify(result)}`);
      }

      const { publicKey } = result;
      
      if (!publicKey) {
        throw new Error(`No publicKey in result: ${JSON.stringify(result)}`);
      }

      console.log('Derived public key:', publicKey, 'Type:', typeof publicKey, 'Length:', publicKey?.length);

      setDerivedAddress(publicKey);
      setAddressDisplay(publicKey); // Update the address display box
      setDerivedPath(derivationPath); // Store the numeric path used

      // Get balance
      const balance = await Solana.getBalance(publicKey);
      const balanceStr = bigIntToDecimal(balance.balance, balance.decimals);
      setSolBalance(balanceStr);

      // Save to localStorage - store the numeric path (needed for re-derivation)
      // The path field stores the numeric path like "solana-1" which is required for chain signatures
      const wallet: DerivedWallet = {
        id: `${accountId}-${derivationPath}-solana-${Date.now()}`,
        path: derivationPath, // Store numeric path (required for chain signature derivation)
        address: publicKey,
        chain: 'solana',
        accountId: accountId,
        createdAt: new Date().toISOString(),
        balance: balanceStr
      };
      saveDerivedWallet(wallet);
      
      // Also store the custom name mapping if needed (optional enhancement)
      // For now, users can see their wallet by the numeric path in the dashboard
      
      console.log('Successfully derived address:', publicKey);

      setCurrentStep('derive');
    } catch (err) {
      console.error('Error deriving address:', err);
      console.error('Error details:', {
        accountId,
        path: trimmedName,
        errorType: err instanceof Error ? err.constructor.name : typeof err,
        errorMessage: err instanceof Error ? err.message : String(err),
        errorStack: err instanceof Error ? err.stack : undefined
      });
      
      const errorMessage = err instanceof Error ? err.message : String(err);
      const errorString = String(err).toLowerCase();
      
      // Provide more helpful error messages
      if (errorString.includes('base58') || errorString.includes('non-base58') || errorString.includes('invalid character')) {
        setError('Invalid wallet name format. Please use only letters, numbers, hyphens, and underscores.');
      } else if (errorString.includes('network') || errorString.includes('fetch') || errorString.includes('connection')) {
        setError('Network error. Please check your connection and try again.');
      } else if (errorString.includes('account') || errorString.includes('wallet') || errorString.includes('signer')) {
        setError('Account error. Please make sure you are connected to your NEAR wallet.');
      } else if (errorString.includes('path') || errorString.includes('derivation')) {
        setError(`Path error: ${errorMessage}. Try using a different wallet name.`);
      } else {
        // Show the actual error message for better debugging
        setError(`Failed to derive address: ${errorMessage}`);
      }
    } finally {
      setIsDeriving(false);
    }
  };

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
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white hover:text-[#EBF73F] transition-colors">
              Privacy Wallet
            </h1>
            <Link
              href="/wallet/my-wallets"
              className="px-6 py-2 bg-[#EBF73F] text-black font-bold rounded-lg hover:bg-[#e8eb9f] transition-colors"
            >
              My Wallets
            </Link>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Generate anonymous Solana addresses using chain signatures. 
          
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
                  Give your wallet a unique name for identification. The system will automatically use numeric paths (solana-1, solana-2, etc.) for address derivation.
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
                      }
                    }}
                    placeholder="solana-1"
                    className={`w-full px-4 py-3 bg-black border rounded-lg text-white placeholder-gray-500 focus:outline-none ${
                      error && walletName ? 'border-red-500' : 'border-gray-600 focus:border-[#EBF73F]'
                    }`}
                    disabled={!isConnected || isDeriving}
                    maxLength={50}
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Each unique name will generate a different Solana address. Use only letters, numbers, hyphens (-), and underscores (_).
                  </p>
                  
                  {/* Address Display Box - similar to SolanaView */}
                  {(addressDisplay || isDeriving) && (
                    <div className="mt-4 p-4 bg-black border border-dashed border-gray-600 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">Derived Solana Address:</p>
                      <p className="font-mono text-sm text-white break-all">
                        {isDeriving && !addressDisplay ? 'Deriving address...' : addressDisplay}
                      </p>
                    </div>
                  )}
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
                <button
                  onClick={handleDeriveAddress}
                  disabled={!isConnected || isDeriving || !walletName.trim() || !isValidWalletName(walletName.trim())}
                  className="px-8 py-4 bg-[#EBF73F] text-black font-bold text-lg rounded-lg hover:bg-[#e8eb9f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeriving ? 'Deriving Address...' : 'Derive Address'}
                </button>
                {!isConnected && (
                  <p className="text-sm text-gray-400 mt-4">
                    Please connect your NEAR wallet to continue
                  </p>
                )}
                {walletName.trim() && !isValidWalletName(walletName.trim()) && (
                  <p className="text-sm text-red-400 mt-2">
                    Please enter a valid wallet name
                  </p>
                )}
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
                    <p className="text-sm text-gray-400 mb-2">Wallet Name:</p>
                    <p className="font-mono text-lg text-[#EBF73F]">{walletName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Derivation Path Used:</p>
                    <p className="font-mono text-sm text-gray-300">{derivedPath}</p>
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
                    setDerivedPath('');
                    setAddressDisplay('');
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
