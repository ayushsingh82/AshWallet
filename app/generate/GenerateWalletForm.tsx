"use client";

import { useState } from "react";
import Image from "next/image";
import { CHAINS } from "./constants";
import { Chain } from "./types";

interface GenerateWalletFormProps {
  onGenerate: (
    selectedChains: string[],
    walletName: string
  ) => Promise<void>;
  onClose: () => void;
}

export default function GenerateWalletForm({
  onGenerate,
  onClose,
}: GenerateWalletFormProps) {
  const [selectedChains, setSelectedChains] = useState<string[]>([]);
  const [walletName, setWalletName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleChain = (chainId: string) => {
    if (selectedChains.includes(chainId)) {
      setSelectedChains(selectedChains.filter((id) => id !== chainId));
    } else {
      setSelectedChains([...selectedChains, chainId]);
    }
  };

  const handleGenerate = async () => {
    if (selectedChains.length === 0) {
      alert("Please select at least one chain");
      return;
    }

    setIsGenerating(true);
    await onGenerate(selectedChains, walletName);
    setIsGenerating(false);
    setSelectedChains([]);
    setWalletName("");
  };

  return (
    <div className="bg-zinc-950/70 border border-yellow-300/40 rounded-2xl p-8 backdrop-blur-lg mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-yellow-300">
          Generate New Wallet
        </h2>
        <button
          onClick={onClose}
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
          className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-300 transition-colors"
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
                  ? "border-yellow-300 bg-yellow-300/10"
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
                  <div className="absolute top-2 right-2 w-6 h-6 bg-yellow-300 rounded-full flex items-center justify-center">
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
        onClick={handleGenerate}
        disabled={selectedChains.length === 0 || isGenerating}
        className="w-full py-4 bg-gradient-to-r from-yellow-300 to-yellow-500 text-black font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
  );
}

