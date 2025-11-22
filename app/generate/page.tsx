"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const ZEC_ICON =
  "https://s2.coinmarketcap.com/static/img/coins/128x128/1437.png";
const NEAR_ICON =
  "https://s2.coinmarketcap.com/static/img/coins/128x128/6535.png";
const SOL_ICON =
  "https://s2.coinmarketcap.com/static/img/coins/128x128/5426.png";

interface Chain {
  id: string;
  name: string;
  icon: string;
  color: string;
  enabled: boolean;
  symbol: string;
}

interface WalletAddress {
  chainId: string;
  address: string;
  balance: number;
}

interface Wallet {
  id: string;
  name: string;
  addresses: WalletAddress[];
  createdAt: string;
}

const CHAINS: Chain[] = [
  {
    id: "solana",
    name: "Solana",
    icon: SOL_ICON,
    color: "from-purple-500 to-pink-500",
    enabled: true,
    symbol: "SOL",
  },
  {
    id: "zcash",
    name: "Zcash",
    icon: ZEC_ICON,
    color: "from-yellow-500 to-orange-500",
    enabled: true,
    symbol: "ZEC",
  },
  {
    id: "near",
    name: "NEAR",
    icon: NEAR_ICON,
    color: "from-yellow-400 to-yellow-600",
    enabled: true,
    symbol: "NEAR",
  },
];

export default function GeneratePage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedChains, setSelectedChains] = useState<string[]>([]);
  const [walletName, setWalletName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);

  // Load wallets from localStorage on mount
  useEffect(() => {
    const savedWallets = localStorage.getItem("multichain_wallets");
    if (savedWallets) {
      setWallets(JSON.parse(savedWallets));
    }
  }, []);

  // Save wallets to localStorage whenever wallets change
  useEffect(() => {
    if (wallets.length > 0) {
      localStorage.setItem("multichain_wallets", JSON.stringify(wallets));
    }
  }, [wallets]);

  const toggleChain = (chainId: string) => {
    if (selectedChains.includes(chainId)) {
      setSelectedChains(selectedChains.filter((id) => id !== chainId));
    } else {
      setSelectedChains([...selectedChains, chainId]);
    }
  };

  const generateWallet = async () => {
    if (selectedChains.length === 0) {
      alert("Please select at least one chain");
      return;
    }

    setIsGenerating(true);

    // Simulate wallet generation
    setTimeout(() => {
      const addresses: WalletAddress[] = [];
      selectedChains.forEach((chainId) => {
        const chain = CHAINS.find((c) => c.id === chainId);
        if (chain) {
          // Generate a mock address and random balance
          const address = `${chain.name.substring(0, 3).toLowerCase()}1${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
          const balance = Math.random() * 100; // Random balance between 0-100
          addresses.push({
            chainId,
            address,
            balance: parseFloat(balance.toFixed(4)),
          });
        }
      });

      const newWallet: Wallet = {
        id: Date.now().toString(),
        name: walletName || `Wallet ${wallets.length + 1}`,
        addresses,
        createdAt: new Date().toISOString(),
      };

      setWallets([...wallets, newWallet]);
      setSelectedChains([]);
      setWalletName("");
      setIsGenerating(false);
      setShowGenerateForm(false);
    }, 2000);
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    alert("Address copied to clipboard!");
  };

  const calculateTotalBalance = () => {
    return wallets.reduce((total, wallet) => {
      return (
        total +
        wallet.addresses.reduce((walletTotal, addr) => {
          return walletTotal + addr.balance;
        }, 0)
      );
    }, 0);
  };

  const getChainInfo = (chainId: string) => {
    return CHAINS.find((c) => c.id === chainId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            Multichain Wallet Manager
          </h1>
          <p className="text-gray-400 text-lg">
            Manage your wallets across Solana, Zcash, and NEAR
          </p>
        </div>

        {/* Total Balance Card */}
        <div className="bg-zinc-950/70 border border-yellow-400/60 rounded-2xl p-8 backdrop-blur-lg shadow-[0_0_40px_rgba(250,204,21,0.35)] mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-2">Total Balance</p>
              <p className="text-4xl font-bold text-yellow-400">
                ${calculateTotalBalance().toFixed(2)}
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Across {wallets.length} wallet{wallets.length !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={() => setShowGenerateForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold rounded-lg hover:shadow-lg hover:shadow-yellow-400/50 transition-all flex items-center gap-2"
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

        {/* Generate Form */}
        {showGenerateForm && (
          <div className="bg-zinc-950/70 border border-yellow-400/60 rounded-2xl p-8 backdrop-blur-lg shadow-[0_0_40px_rgba(250,204,21,0.35)] mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-yellow-400">
                Generate New Wallet
              </h2>
              <button
                onClick={() => {
                  setShowGenerateForm(false);
                  setSelectedChains([]);
                  setWalletName("");
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Wallet Name Input */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Wallet Name (Optional)
              </label>
              <input
                type="text"
                value={walletName}
                onChange={(e) => setWalletName(e.target.value)}
                placeholder="My Multichain Wallet"
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition-colors"
              />
            </div>

            {/* Chain Selection */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-300 mb-4">
                Select Chains to Support
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {CHAINS.map((chain) => (
                  <button
                    key={chain.id}
                    onClick={() => toggleChain(chain.id)}
                    disabled={!chain.enabled}
                    className={`relative p-6 rounded-xl border-2 transition-all ${
                      selectedChains.includes(chain.id)
                        ? "border-yellow-400 bg-yellow-400/10 shadow-lg shadow-yellow-400/20"
                        : "border-zinc-700 bg-zinc-900/50 hover:border-zinc-600"
                    } ${!chain.enabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div
                        className={`w-16 h-16 rounded-full bg-gradient-to-br ${chain.color} p-0.5`}
                      >
                        <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center">
                          <Image
                            src={chain.icon}
                            alt={chain.name}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        </div>
                      </div>
                      <span className="font-semibold text-lg">{chain.name}</span>
                      {selectedChains.includes(chain.id) && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-black"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateWallet}
              disabled={selectedChains.length === 0 || isGenerating}
              className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold rounded-lg hover:shadow-lg hover:shadow-yellow-400/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Generating Wallet...
                </>
              ) : (
                "Generate Wallet"
              )}
            </button>
          </div>
        )}

        {/* Wallets List */}
        {wallets.length === 0 && !showGenerateForm ? (
          <div className="bg-zinc-950/70 border border-yellow-400/60 rounded-2xl p-12 backdrop-blur-lg text-center">
            <div className="w-20 h-20 bg-yellow-400/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-yellow-400"
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
              onClick={() => setShowGenerateForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold rounded-lg hover:shadow-lg hover:shadow-yellow-400/50 transition-all"
            >
              Generate Wallet
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {wallets.map((wallet) => {
              const walletTotal = wallet.addresses.reduce(
                (sum, addr) => sum + addr.balance,
                0
              );

              return (
                <div
                  key={wallet.id}
                  className="bg-zinc-950/70 border border-yellow-400/60 rounded-2xl p-6 backdrop-blur-lg shadow-[0_0_40px_rgba(250,204,21,0.35)]"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-yellow-400 mb-1">
                        {wallet.name}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Created {new Date(wallet.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Total Balance</p>
                      <p className="text-2xl font-bold text-yellow-400">
                        ${walletTotal.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Addresses for each chain */}
                  <div className="space-y-3">
                    {wallet.addresses.map((addr) => {
                      const chain = getChainInfo(addr.chainId);
                      if (!chain) return null;

                      return (
                        <div
                          key={addr.chainId}
                          className="bg-zinc-900/50 border border-zinc-700 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div
                                className={`w-12 h-12 rounded-full bg-gradient-to-br ${chain.color} p-0.5`}
                              >
                                <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center">
                                  <Image
                                    src={chain.icon}
                                    alt={chain.name}
                                    width={28}
                                    height={28}
                                    className="rounded-full"
                                  />
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-semibold">{chain.name}</p>
                                  <span className="text-xs text-gray-500">
                                    ({chain.symbol})
                                  </span>
                                </div>
                                <p className="text-sm text-gray-400 font-mono">
                                  {addr.address}
                                </p>
                                <p className="text-sm text-yellow-400 mt-1">
                                  {addr.balance.toFixed(4)} {chain.symbol}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => copyAddress(addr.address)}
                              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors text-sm ml-4"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
