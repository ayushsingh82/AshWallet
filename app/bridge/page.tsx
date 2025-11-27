"use client";

import { useState } from "react";
import Image from "next/image";

const ZEC_ICON =
  "https://s2.coinmarketcap.com/static/img/coins/128x128/1437.png";
const NEAR_ICON =
  "https://s2.coinmarketcap.com/static/img/coins/128x128/6535.png";
const SOL_ICON =
  "https://s2.coinmarketcap.com/static/img/coins/128x128/5426.png";

const TARGET_CHAINS = [
  {
    id: "zcash",
    label: "Zcash",
    networkLabel: "Zcash network",
    icon: ZEC_ICON,
  },
  {
    id: "solana",
    label: "Solana",
    networkLabel: "Solana network",
    icon: SOL_ICON,
  },
  {
    id: "near",
    label: "NEAR",
    networkLabel: "NEAR network",
    icon: NEAR_ICON,
  },
] as const;

type TargetChainId = (typeof TARGET_CHAINS)[number]["id"];

export default function BridgePage() {
  const [targetChain, setTargetChain] = useState<TargetChainId>("zcash");

  const selected = TARGET_CHAINS.find((c) => c.id === targetChain)!;

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="max-w-xl w-full bg-[#141414] border border-gray-700 p-6 md:p-8 relative group">
        <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-[#EBF73F]"></div>
        <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-[#EBF73F]"></div>
        <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-[#EBF73F]"></div>
        <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-[#EBF73F]"></div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">
              Intent-based ZEC Bridge
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Orchestrate cross-chain ZEC flows with NEAR intents.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* From side */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-[0.2em] text-gray-400">
                From
              </span>
              <span className="text-xs text-[#EBF73F]">
                NEAR on NEAR network
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1.5">
                <Image
                  src={NEAR_ICON}
                  alt="NEAR"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <span className="text-sm font-medium">NEAR</span>
              </div>
              <div className="flex-1 text-right">
                <input
                  type="number"
                  placeholder="0.0"
                  className="w-full bg-transparent text-right text-xl outline-none placeholder:text-zinc-600"
                />
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Balance: 0.00 NEAR
                </p>
              </div>
            </div>
          </div>

          {/* To side */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-[0.2em] text-gray-400">
                To
              </span>
              <span className="text-xs text-[#EBF73F]">
                ZEC on {selected.networkLabel}
              </span>
            </div>

            {/* Chain selector */}
            <div className="flex gap-2 mb-3">
              {TARGET_CHAINS.map((chain) => {
                const active = chain.id === targetChain;
                return (
                  <button
                    key={chain.id}
                    type="button"
                    onClick={() => setTargetChain(chain.id)}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-lg border px-2 py-1.5 text-xs transition-colors ${
                      active
                        ? "border-white bg-[#EBF73F]/10 text-[#EBF73F]"
                        : "border-zinc-700 bg-zinc-950 text-zinc-300 hover:border-white/60 hover:text-[#EBF73F]"
                    }`}
                  >
                    <Image
                      src={chain.icon}
                      alt={chain.label}
                      width={18}
                      height={18}
                      className="rounded-full"
                    />
                    <span>{chain.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1.5">
                <Image
                  src={ZEC_ICON}
                  alt="Zcash"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <span className="text-sm font-medium">ZEC</span>
              </div>
              <div className="flex-1 text-right">
                <div className="text-xl text-zinc-300">≈ 0.0 ZEC</div>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Estimated on {selected.label} after routing
                </p>
              </div>
            </div>
          </div>

          {/* Intent summary */}
          <div className="rounded-xl border border-white/40 bg-[#EBF73F]/5 p-4 text-sm text-[#EBF73F]">
            <p className="font-medium mb-1">NEAR Intent</p>
            <p className="text-xs text-[#EBF73F]/80 leading-relaxed">
              “Bridge my NEAR on NEAR to private ZEC, then surface wrapped ZEC
              liquidity on {selected.label}.” This is a UX mock; wiring to
              actual intents and bridge contracts comes next.
            </p>
          </div>

          <button
            className="w-full mt-1 rounded-xl bg-[#EBF73F] text-black font-semibold py-3 text-sm tracking-wide hover:bg-[#EBF73F] transition-colors"
            disabled
          >
            Bridge via NEAR Intents (Coming Soon)
          </button>

          <p className="text-[10px] text-zinc-500 text-center mt-2">
            This page is a visual prototype of the ZEC × NEAR cross-chain
            privacy bridge. No funds will move yet.
          </p>
        </div>
      </div>
    </div>
  );
}


