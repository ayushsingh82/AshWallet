"use client";

import React, { useState } from 'react';
import CreativeMetallicEffect from './CreativeMetallicEffect';
import MagicBento from './MagicBento';
import SplashCursor from './SplashCursor';
 

const Landing = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [selectedNav, setSelectedNav] = useState<number>(0);

  const navItems = ['Home', 'Developers', 'Blog'];

  const faqs = [
    {
      question: "What is Aave?",
      answer: "Aave is a DeFi infrastructure platform that provides yield bidding engines and liquidity auction mechanisms for applications."
    },
    {
      question: "How does the yield bidding work?",
      answer: "Our real-time auction layer sources optimal DeFi yields across multiple protocols, ensuring the best returns for your users."
    },
    {
      question: "Do I need to write smart contracts?",
      answer: "No, Aave provides pre-built DeFi-native yield, vaults, and structured products that you can embed without writing any smart contracts."
    },
    {
      question: "What APIs do you provide?",
      answer: "We offer simple REST APIs with comprehensive documentation to make integration fast and easy for developers."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };
  return (
    <div className="min-h-screen bg-black relative">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-16 py-4">
        <div className="text-2xl font-bold text-white">Aave</div>
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
        <button className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors">
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
              Become the DeFi backbone 
            </h1>
            <p className="text-2xl text-gray-300 leading-tight mb-10 max-w-3xl">
              Instantly embed DeFi-native yield, vaults, and structured products — without writing smart contracts.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-8 py-16 bg-black">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-white mb-8">
            Features
          </h3>
          <p className="text-lg text-gray-300 mb-16 max-w-3xl mx-auto">
            From idea to a billion users — Aave gives apps the DeFi rails to scale without limits.
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
            glowColor="132, 0, 255"
          />

        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-700 hover:border-purple-400 rounded-lg transition-colors">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-purple-800/30 transition-colors hover:border-purple-400"
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
          <div className="text-xl font-bold">Aave</div>
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
