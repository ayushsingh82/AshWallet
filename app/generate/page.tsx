"use client";

import { useState } from "react";
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
}

const CHAINS: Chain[] = [
  {
    id: "solana",
    name: "Solana",
    icon: SOL_ICON,
    color: "from-purple-500 to-pink-500",
    enabled: true,
  },
  {
    id: "zcash",
    name: "Zcash",
    icon: ZEC_ICON,
    color: "from-yellow-500 to-orange-500",
    enabled: true,
  },
  {
    id: "near",
    name: "NEAR",
    icon: NEAR_ICON,
    color: "from-green-500 to-emerald-500",
    enabled: true,
  },
];

export default function GeneratePage() {
  const [selectedChains, setSelectedChains] = useState<string[]>([]);
  const [walletName, setWalletName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [walletAddresses, setWalletAddresses] = useState<Record<string, string>>({});

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
      const addresses: Record<string, string> = {};
      selectedChains.forEach((chainId) => {
        // Generate a mock address (in production, this would be actual wallet generation)
        const chain = CHAINS.find((c) => c.id === chainId);
        if (chain) {
          addresses[chainId] = `${chain.name.substring(0, 3).toLowerCase()}1${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
        }
      });
      setWalletAddresses(addresses);
      setGenerated(true);
      setIsGenerating(false);
    }, 2000);
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    alert("Address copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#97FBE4] to-[#5eead4] bg-clip-text text-transparent">
            Generate Multichain Wallet
          </h1>
          <p className="text-gray-400 text-lg">
            Create a unified wallet supporting Solana, Zcash, and NEAR
          </p>
        </div>

        {!generated ? (
          <div className="bg-zinc-950/70 border border-green-800/50 rounded-2xl p-8 backdrop-blur-lg shadow-2xl">
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
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#97FBE4] transition-colors"
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
                        ? "border-[#97FBE4] bg-[#97FBE4]/10 shadow-lg shadow-[#97FBE4]/20"
                        : "border-zinc-700 bg-zinc-900/50 hover:border-zinc-600"
                    } ${!chain.enabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${chain.color} p-0.5`}>
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
                        <div className="absolute top-2 right-2 w-6 h-6 bg-[#97FBE4] rounded-full flex items-center justify-center">
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
              className="w-full py-4 bg-gradient-to-r from-[#97FBE4] to-[#5eead4] text-black font-semibold rounded-lg hover:shadow-lg hover:shadow-[#97FBE4]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
        ) : (
          <div className="bg-zinc-950/70 border border-green-800/50 rounded-2xl p-8 backdrop-blur-lg shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-[#97FBE4] to-[#5eead4] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-black"
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
              <h2 className="text-2xl font-bold mb-2">Wallet Generated Successfully!</h2>
              <p className="text-gray-400">
                {walletName || "Your multichain wallet"} is ready to use
              </p>
            </div>

            {/* Wallet Addresses */}
            <div className="space-y-4">
              {selectedChains.map((chainId) => {
                const chain = CHAINS.find((c) => c.id === chainId);
                const address = walletAddresses[chainId];
                if (!chain || !address) return null;

                return (
                  <div
                    key={chainId}
                    className="bg-zinc-900/50 border border-zinc-700 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${chain.color} p-0.5`}>
                          <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center">
                            <Image
                              src={chain.icon}
                              alt={chain.name}
                              width={24}
                              height={24}
                              className="rounded-full"
                            />
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold">{chain.name}</p>
                          <p className="text-sm text-gray-400 font-mono">
                            {address.slice(0, 8)}...{address.slice(-8)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => copyAddress(address)}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors text-sm"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => {
                setGenerated(false);
                setSelectedChains([]);
                setWalletAddresses({});
                setWalletName("");
              }}
              className="w-full mt-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg transition-colors"
            >
              Generate Another Wallet
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

