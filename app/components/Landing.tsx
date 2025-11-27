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
      answer: "Privacy Wallets are temporary, anonymous wallets that auto-expire for maximum privacy. Generate them with your ZCash, get untraceable wallets on any chain, and use them for private DeFi interactions without KYC or tracking."
    },
    {
      question: "How do I use a Privacy Wallet?",
      answer: "Simple! Generate a wallet, bridge your ZCash to fund it, then export the private key. Import this key into MetaMask, Phantom, or any wallet to start using it anonymously on your chosen chain."
    },
    {
      question: "Why do wallets expire?",
      answer: "Auto-expiry is a privacy feature. Temporary wallets that self-destruct leave no trace and prevent long-term tracking. Choose from 5 minutes to 1 hour based on your privacy needs."
    },
    {
      question: "What if I forget to export my private key?",
      answer: "We have built-in fund recovery! The system alerts you before expiry and provides export options. You can also set up automatic fund recovery to a main wallet address."
    },
    {
      question: "Which chains are supported?",
      answer: "Currently Solana, Ethereum, and Polygon. Your ZCash is bridged via NEAR intents to your chosen destination chain, giving you native tokens for anonymous trading."
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
              Generate temporary anonymous wallets for private DeFi interactions. Bridge your ZCash and get untraceable wallets on any chain. No KYC, no tracking.
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
            Generate anonymous temporary wallets that auto-expire for maximum privacy. Bridge your ZCash and get untraceable wallets on Solana, Ethereum, and more.
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
              <h4 className="font-bold text-lg mb-2 text-white">We Generate Wallet</h4>
              <p className="text-gray-400 text-sm">We create anonymous wallet and show deposit address</p>
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
              <h4 className="font-bold text-lg mb-2 text-white">You Deposit ZCash</h4>
              <p className="text-gray-400 text-sm">Bridge your ZEC to our generated wallet address</p>
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
              <h4 className="font-bold text-lg mb-2 text-white">Auto Processing</h4>
              <p className="text-gray-400 text-sm">We automatically route to your chosen destination chain</p>
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
              <h4 className="font-bold text-lg mb-2 text-white">Tokens Ready</h4>
              <p className="text-gray-400 text-sm">Your anonymous wallet has tokens ready for private DeFi</p>
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
