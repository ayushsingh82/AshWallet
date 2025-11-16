"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import CreativeMetallicEffect from './CreativeMetallicEffect';
import MagicBento from './MagicBento';
import SplashCursor from './SplashCursor';
 

const Landing = () => {
  const router = useRouter();
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [selectedNav, setSelectedNav] = useState<number>(0);

  const navItems = ['Home', 'Developers', 'Blog'];

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
      {/* Navbar */}
      <nav className="flex items-center justify-between px-16 py-4">
        <div className="text-2xl font-bold text-white">ZEC × NEAR</div>
        <div className="flex items-center space-x-2">
          {navItems.map((item, index) => (
            <button
              key={item}
              onClick={() => setSelectedNav(index)}
              className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                selectedNav === index
                  ? 'bg-white text-black border-black'
                  : 'bg-black text-white border-black hover:bg-gray-800'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        <button
          className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          onClick={() => router.push("/bridge")}
        >
          Get Started
        </button>
      </nav>

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

      {/* Footer */}
      <footer className="bg-black text-white px-8 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="text-xl font-bold">ZEC × NEAR</div>
          <div className="flex items-center space-x-6">
            <a href="#" className="hover:text-gray-400 transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </a>
            <a href="#" className="hover:text-gray-400 transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
