"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import CreativeMetallicEffect from './CreativeMetallicEffect';
import MagicBento from './MagicBento';
import SplashCursor from './SplashCursor';
 
 
const Landing = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const faqs = [
    {
      question: "What are Privacy Wallets?",
      answer: "Privacy Wallets use chain signatures to derive unique addresses on Solana, NEAR, and EVM chains from a single NEAR account. Each wallet name (path) generates a different address, providing privacy without linking to your main wallet. No KYC, no tracking."
    },
    {
      question: "How do I use a Privacy Wallet?",
      answer: "Connect your NEAR wallet, enter a unique wallet name, and the system will derive a unique address on your chosen chain (Solana, NEAR, or EVM) using chain signatures. Swap your ZEC to the destination chain via NEAR intents, and use the derived address for anonymous DeFi interactions."
    },
    {
      question: "How do chain signatures work?",
      answer: "Chain signatures allow you to derive addresses on multiple chains (Solana, NEAR, EVM) from a single NEAR account. Each unique wallet name (path) generates a different address, providing privacy and flexibility. The addresses are cryptographically derived and can be recreated anytime with the same NEAR account and path."
    },
    {
      question: "Can I generate multiple addresses?",
      answer: "Yes! You can generate unlimited addresses by using different wallet names (paths). Each unique name will generate a different address on your chosen chain. This allows you to separate different DeFi activities for enhanced privacy."
    },
    {
      question: "Which chains are supported?",
      answer: "We support Solana, NEAR, and EVM chains (Ethereum, Polygon, and more). You can derive addresses on any of these chains using chain signatures from your NEAR account. Swap ZEC to any supported chain via NEAR intents."
    },
    {
      question: "Is this really anonymous?",
      answer: "Yes! The temporary wallets have no connection to your identity. They're generated with random keys, funded via privacy-preserving bridges, and expire automatically. No KYC, no tracking, complete anonymity."
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
            <h1 className="text-5xl md:text-6xl font-semibold font-serif mb-6 leading-tight">
              <span className="text-white hover:text-[#EBF73F] transition-colors">Anonymous</span> <span className="text-white hover:text-[#EBF73F] transition-colors">Privacy Wallets</span>
            </h1>
            <p className="text-2xl text-gray-300 leading-tight mb-8 max-w-3xl">
              Generate anonymous wallets using chain signatures. Derive addresses on Solana, NEAR, and EVM chains from a single NEAR account. Swap ZCash via NEAR intents.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/wallet"
                className="px-8 py-4 bg-[#EBF73F] text-black font-bold rounded-lg hover:bg-[#e8eb9f] transition-colors text-lg"
              >
                Generate Privacy Wallet
              </Link>
              <Link
                href="#how-it-works"
                className="px-8 py-4 border border-[#EBF73F] text-[#EBF73F] font-bold rounded-lg hover:bg-[#EBF73F] hover:text-black transition-colors text-lg"
              >
                How It Works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="px-8 py-16 bg-black">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-white mb-8">
            How Privacy Wallets Work
          </h3>
          <p className="text-lg text-gray-300 mb-16 max-w-3xl mx-auto">
            Use chain signatures to derive unique addresses on Solana, NEAR, and EVM chains. Swap ZCash to any supported chain via NEAR intents. Each wallet name generates a different address.
          </p>

          {/* Simple 4-step process */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-2 mb-16">
            <div className="text-center flex-1">
              <div className="w-16 h-16 bg-[#141414] border border-gray-700 flex items-center justify-center text-2xl font-bold mx-auto mb-4 relative group hover:bg-black transition-colors">
                <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-[#EBF73F]"></div>
                <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-[#EBF73F]"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-[#EBF73F]"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-[#EBF73F]"></div>
                <span className="text-[#EBF73F] relative z-10">1</span>
              </div>
              <h4 className="font-bold text-lg mb-2 text-white">Enter Wallet Name</h4>
              <p className="text-gray-400 text-sm">Provide a unique name that will be used as the derivation path</p>
            </div>
            <div className="hidden md:block text-[#EBF73F] text-3xl">→</div>
            <div className="text-center flex-1">
              <div className="w-16 h-16 bg-[#141414] border border-gray-700 flex items-center justify-center text-2xl font-bold mx-auto mb-4 relative group hover:bg-black transition-colors">
                <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-[#EBF73F]"></div>
                <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-[#EBF73F]"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-[#EBF73F]"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-[#EBF73F]"></div>
                <span className="text-[#EBF73F] relative z-10">2</span>
              </div>
              <h4 className="font-bold text-lg mb-2 text-white">Derive Address</h4>
              <p className="text-gray-400 text-sm">Chain signature derives unique address on Solana, NEAR, or EVM</p>
            </div>
            <div className="hidden md:block text-[#EBF73F] text-3xl">→</div>
            <div className="text-center flex-1">
              <div className="w-16 h-16 bg-[#141414] border border-gray-700 flex items-center justify-center text-2xl font-bold mx-auto mb-4 relative group hover:bg-black transition-colors">
                <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-[#EBF73F]"></div>
                <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-[#EBF73F]"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-[#EBF73F]"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-[#EBF73F]"></div>
                <span className="text-[#EBF73F] relative z-10">3</span>
              </div>
              <h4 className="font-bold text-lg mb-2 text-white">Swap via Intents</h4>
              <p className="text-gray-400 text-sm">Swap ZEC on NEAR to SOL (or other tokens) via NEAR intents</p>
            </div>
            <div className="hidden md:block text-[#EBF73F] text-3xl">→</div>
            <div className="text-center flex-1">
              <div className="w-16 h-16 bg-[#141414] border border-gray-700 flex items-center justify-center text-2xl font-bold mx-auto mb-4 relative group hover:bg-black transition-colors">
                <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-[#EBF73F]"></div>
                <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-[#EBF73F]"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-[#EBF73F]"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-[#EBF73F]"></div>
                <span className="text-[#EBF73F] relative z-10">4</span>
              </div>
              <h4 className="font-bold text-lg mb-2 text-white">Ready to Use</h4>
              <p className="text-gray-400 text-sm">Your tokens arrive at the derived address, ready for DeFi</p>
            </div>
          </div>

          <h3 className="text-3xl font-bold text-white mb-8 text-center">
            Features
          </h3>

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
            glowColor="235, 247, 63"
          />

        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className={`bg-[#141414] border border-gray-700 relative group transition-colors ${openFAQ === index ? 'hover:bg-black' : 'hover:bg-black'}`}>
                <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-[#EBF73F]"></div>
                <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-[#EBF73F]"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-[#EBF73F]"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-[#EBF73F]"></div>
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between transition-colors relative z-10"
                >
                  <h3 className="text-lg font-semibold text-white">{faq.question}</h3>
                  <span className="text-2xl font-light text-[#EBF73F]">
                    {openFAQ === index ? '−' : '+'}
                  </span>
                </button>
                {openFAQ === index && (
                  <div className="px-6 pb-4 relative z-10">
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
