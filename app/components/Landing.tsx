"use client";

import React, { useState } from 'react';
import CreativeMetallicEffect from './CreativeMetallicEffect';
import MagicBento from './MagicBento';
import SplashCursor from './SplashCursor';
 
 
const Landing = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const faqs = [
    {
      question: "What is this cross-chain privacy solution?",
      answer: "A revolutionary platform that connects Zcash with multiple blockchains using NEAR intents SDK, enabling ZEC holders to access DeFi across chains while maintaining privacy. Lend, borrow, and build DeFi primitives with your ZEC on any supported chain."
    },
    {
      question: "How does cross-chain lending work with ZEC?",
      answer: "Using NEAR intents, you can seamlessly lend your ZEC on other chains without leaving the Zcash network. Our intent-based system orchestrates cross-chain actions, allowing you to earn yield on protocols like Aave, Compound, and more while your ZEC remains private."
    },
    {
      question: "What is wrapped ZEC and how can I use it?",
      answer: "Wrapped ZEC (wZEC) is ZEC tokenized on other blockchains, enabling you to use your ZEC in DeFi protocols across Ethereum, NEAR, and other chains. You can build DeFi primitives like ZEC-backed stablecoins, liquidity pools, and more."
    },
    {
      question: "Do I need to bridge my ZEC manually?",
      answer: "No! NEAR intents handle all cross-chain orchestration automatically. Simply express your intent (e.g., 'lend my ZEC on Ethereum'), and our system handles the rest - no manual bridging or complex transactions required."
    },
    {
      question: "Is my privacy maintained across chains?",
      answer: "Yes. While wrapped ZEC on other chains follows those chains' transparency, the original ZEC remains on Zcash with full privacy. Our system is designed to maximize privacy while enabling cross-chain functionality."
    },
    {
      question: "What DeFi primitives can I build with wrapped ZEC?",
      answer: "You can build ZEC-backed stablecoins, liquidity pools, yield farms, lending protocols, and more. The wrapped ZEC acts as collateral across multiple chains, unlocking the full potential of your ZEC holdings in the broader DeFi ecosystem."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };
  return (
    <div className="min-h-screen bg-black relative">
      {/* Hero Section */}
      <section className="px-8 py-16 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0">
          <SplashCursor />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col items-center justify-center text-center">
            <h1 className="text-5xl md:text-6xl font-semibold font-serif text-white mb-6 leading-tight">
              Cross-Chain Privacy for <span className="zcash-glow">Zcash</span>
            </h1>
            <p className="text-2xl text-gray-300 leading-tight mb-10 max-w-3xl">
              Connect Zcash with multiple chains using NEAR intents. Lend, build DeFi primitives, and utilize your ZEC across the entire DeFi ecosystem — all while maintaining privacy.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-8 py-16 bg-black">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-white mb-8">
            Unlock ZEC Across All Chains
          </h3>
          <p className="text-lg text-gray-300 mb-16 max-w-3xl mx-auto">
            Powered by NEAR intents SDK, seamlessly orchestrate cross-chain actions with your ZEC. Access DeFi on any chain, build innovative primitives, and spend your ZEC anywhere — all with intent-based simplicity.
          </p>

          <MagicBento 
            textAutoHide={true}
            enableStars={true}
            enableSpotlight={true}
            enableBorderGlow={true}
            enableTilt={true}
            enableMagnetism={true}
            clickEffect={true}
            spotlightRadius={300}
            particleCount={12}
            glowColor="255, 200, 0"
          />

        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-700 hover:border-yellow-400 rounded-lg transition-colors">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-yellow-800/30 transition-colors hover:border-yellow-400"
                >
                  <h3 className="text-lg font-semibold text-white">{faq.question}</h3>
                  <span className="text-2xl font-light text-gray-400">
                    {openFAQ === index ? '−' : '+'}
                  </span>
                </button>
                {openFAQ === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-300">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Landing;
