import Image from "next/image";

const ZEC_ICON =
  "https://s2.coinmarketcap.com/static/img/coins/128x128/1437.png";
const NEAR_ICON =
  "https://s2.coinmarketcap.com/static/img/coins/128x128/6535.png";

export default function BridgePage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="max-w-xl w-full bg-zinc-950/70 border border-yellow-400/40 rounded-2xl shadow-[0_0_40px_rgba(250,204,21,0.35)] p-6 md:p-8 backdrop-blur-lg">
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
              <span className="text-xs text-yellow-400">
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
              <span className="text-xs text-yellow-400">
                ZEC on Zcash network
              </span>
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
                  Estimated after routing
                </p>
              </div>
            </div>
          </div>

          {/* Intent summary */}
          <div className="rounded-xl border border-yellow-500/40 bg-yellow-500/5 p-4 text-sm text-yellow-100">
            <p className="font-medium mb-1">NEAR Intent</p>
            <p className="text-xs text-yellow-200/80 leading-relaxed">
              “Bridge my NEAR on NEAR to private ZEC on Zcash, then expose
              wrapped ZEC liquidity to DeFi on other chains.” This is a UX mock;
              wiring to actual intents and bridge contracts comes next.
            </p>
          </div>

          <button
            className="w-full mt-1 rounded-xl bg-yellow-400 text-black font-semibold py-3 text-sm tracking-wide hover:bg-yellow-300 transition-colors"
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


