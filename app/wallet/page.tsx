"use client";

import { useState, useEffect } from "react";
import { PrivacyWalletManager } from "../generate/PrivacyWalletManager";
import { PrivacyWallet, PrivacyLevel } from "../generate/types";
import { CHAINS } from "../generate/constants";
import Image from "next/image";

interface WalletStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed';
}

export default function WalletPage() {
  const [currentStep, setCurrentStep] = useState<'generate' | 'deposit' | 'processing' | 'ready'>('generate');
  const [wallet, setWallet] = useState<PrivacyWallet | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [depositDetected, setDepositDetected] = useState(false);
  const [config, setConfig] = useState({
    destinationChain: 'solana',
    privacyLevel: 'medium' as PrivacyLevel
  });

  const steps: WalletStep[] = [
    {
      id: 'generate',
      title: 'Generate Wallet',
      description: 'We create your anonymous wallet',
      status: currentStep === 'generate' ? 'active' : 'completed'
    },
    {
      id: 'deposit',
      title: 'Deposit ZCash',
      description: 'Bridge your ZCash to the generated wallet',
      status: currentStep === 'deposit' ? 'active' : currentStep === 'generate' ? 'pending' : 'completed'
    },
    {
      id: 'processing',
      title: 'Auto Processing',
      description: 'We automatically route to your destination chain',
      status: currentStep === 'processing' ? 'active' : ['generate', 'deposit'].includes(currentStep) ? 'pending' : 'completed'
    },
    {
      id: 'ready',
      title: 'Ready to Use',
      description: 'Your tokens are ready on the destination chain',
      status: currentStep === 'ready' ? 'active' : 'pending'
    }
  ];

  const handleGenerateWallet = async () => {
    setIsGenerating(true);
    
    try {
      const newWallet = await PrivacyWalletManager.generatePrivacyWallet(
        config.destinationChain,
        config.privacyLevel,
        'Anonymous DeFi Wallet',
        0 // No amount needed upfront
      );
      
      setWallet(newWallet);
      setCurrentStep('deposit');
    } catch (error) {
      console.error('Failed to generate wallet:', error);
      alert('Failed to generate wallet. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const startMonitoring = async () => {
    if (!wallet) return;
    
    setIsMonitoring(true);
    setCurrentStep('processing');
    
    // Simulate deposit detection and processing
    setTimeout(() => {
      setDepositDetected(true);
      // Simulate intent execution
      setTimeout(() => {
        setCurrentStep('ready');
        setIsMonitoring(false);
      }, 3000);
    }, 5000);
  };

  const exportPrivateKey = (chainId: string) => {
    if (!wallet) return;
    
    const address = wallet.addresses.find(a => a.chainId === chainId);
    if (!address || !address.privateKey) {
      alert('Private key not available');
      return;
    }

    // Create export data
    const exportData = {
      walletName: wallet.name,
      chain: chainId,
      address: address.address,
      privateKey: address.privateKey,
      expiresAt: wallet.expiresAt,
      warning: '⚠️ KEEP THIS PRIVATE KEY SECURE! Anyone with this key can access your funds.',
      instructions: [
        '1. Copy the private key below',
        '2. Import it into your preferred wallet (MetaMask, Phantom, etc.)',
        '3. You can now use this wallet for anonymous transactions',
        '4. Remember: This wallet expires automatically for privacy'
      ]
    };

    // Show in modal or download
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `privacy-wallet-${chainId}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert(`Private key exported! Import this into your ${chainId} wallet to start using it.`);
  };

  const getChainInfo = (chainId: string) => {
    return CHAINS.find(c => c.id === chainId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
            Privacy Wallet
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Generate anonymous temporary wallets for private DeFi interactions. 
            No KYC, no tracking, just privacy.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-12 h-12 rounded-full text-sm font-bold
                  ${step.status === 'active' ? 'bg-yellow-400 text-black' : 
                    step.status === 'completed' ? 'bg-green-500 text-white' : 
                    'bg-gray-700 text-gray-400'}
                `}>
                  {step.status === 'completed' ? '✓' : index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    w-20 h-1 mx-4
                    ${step.status === 'completed' ? 'bg-green-500' : 'bg-gray-700'}
                  `} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">
              {steps.find(s => s.status === 'active')?.title}
            </h2>
            <p className="text-gray-400">
              {steps.find(s => s.status === 'active')?.description}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-zinc-900/50 border border-zinc-700 rounded-2xl p-8">
          {currentStep === 'generate' && (
            <div className="space-y-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">Generate Your Privacy Wallet</h3>
                <p className="text-gray-400 mb-8">
                  We'll create an anonymous wallet for you. Choose your destination chain and privacy level.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Configuration */}
                <div className="space-y-6">

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Destination Chain
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {CHAINS.filter(c => c.id !== 'zcash' && c.id !== 'near').map(chain => (
                        <button
                          key={chain.id}
                          onClick={() => setConfig({...config, destinationChain: chain.id})}
                          className={`
                            p-4 border rounded-lg flex items-center gap-3 transition-colors
                            ${config.destinationChain === chain.id 
                              ? 'border-yellow-400 bg-yellow-400/10' 
                              : 'border-zinc-600 hover:border-yellow-400/50'}
                          `}
                        >
                          <Image src={chain.icon} alt={chain.name} width={24} height={24} className="rounded-full" />
                          <span className="font-medium">{chain.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Privacy Level
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['high', 'medium', 'low'] as PrivacyLevel[]).map(level => (
                        <button
                          key={level}
                          onClick={() => setConfig({...config, privacyLevel: level})}
                          className={`
                            p-3 border rounded-lg text-center transition-colors
                            ${config.privacyLevel === level 
                              ? 'border-yellow-400 bg-yellow-400/10' 
                              : 'border-zinc-600 hover:border-yellow-400/50'}
                          `}
                        >
                          <div className="font-semibold capitalize">{level}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {level === 'high' ? '5 min' : level === 'medium' ? '15 min' : '1 hour'}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-zinc-800/50 rounded-xl p-6">
                  <h4 className="font-bold mb-4 text-yellow-400">Wallet Preview</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Destination:</span>
                      <span className="capitalize">{config.destinationChain}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Privacy:</span>
                      <span className="capitalize">{config.privacyLevel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Expires:</span>
                      <span>
                        {config.privacyLevel === 'high' ? '5 minutes' : 
                         config.privacyLevel === 'medium' ? '15 minutes' : '1 hour'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Process:</span>
                      <span className="text-green-400">Fully Automated</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-3 bg-blue-900/20 border border-blue-500 rounded-lg">
                    <p className="text-blue-200 text-xs">
                      💡 Your wallet will be completely anonymous and automatically expire for maximum privacy protection.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={handleGenerateWallet}
                  disabled={isGenerating}
                  className="px-8 py-4 bg-yellow-400 text-black font-bold text-lg rounded-lg hover:bg-yellow-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? 'Generating Wallet...' : 'Generate Privacy Wallet'}
                </button>
                <p className="text-sm text-gray-400 mt-3">
                  We'll create an anonymous wallet and show you where to deposit your ZCash
                </p>
              </div>
            </div>
          )}

          {currentStep === 'deposit' && wallet && (
            <div className="space-y-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">Deposit Your ZCash</h3>
                <p className="text-gray-400 mb-8">
                  Your anonymous wallet is ready! Bridge your ZCash to the address below and we'll automatically handle the rest.
                </p>
              </div>

              <div className="bg-green-900/20 border border-green-500 rounded-xl p-6 mb-8">
                <h4 className="font-bold mb-4 text-green-400">✓ Wallet Generated Successfully</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Destination Chain:</p>
                    <p className="font-bold capitalize">{config.destinationChain}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Auto-expires in:</p>
                    <p className="font-bold text-yellow-400">{PrivacyWalletManager.formatRemainingTime(wallet)}</p>
                  </div>
                </div>
              </div>

              {/* Deposit Address */}
              <div className="bg-yellow-900/20 border border-yellow-500 rounded-xl p-6 mb-8">
                <h4 className="font-bold mb-4 text-yellow-400">📍 Deposit Address</h4>
                <p className="text-sm text-gray-300 mb-4">
                  Bridge your ZCash to this NEAR address. We'll automatically detect the deposit and route it to {config.destinationChain}.
                </p>
                
                <div className="bg-zinc-900 rounded-lg p-4 mb-4">
                  <p className="text-xs text-gray-400 mb-2">NEAR Wallet Address (for ZCash bridge):</p>
                  <div className="flex items-center gap-3">
                    <p className="font-mono text-sm flex-1 break-all">
                      {wallet.addresses.find(a => a.chainId === 'near')?.address || 'near-address-here'}
                    </p>
                    <button
                      onClick={() => {
                        const address = wallet.addresses.find(a => a.chainId === 'near')?.address;
                        if (address) {
                          navigator.clipboard.writeText(address);
                          alert('Address copied to clipboard!');
                        }
                      }}
                      className="px-3 py-1 bg-yellow-400 text-black text-xs rounded hover:bg-yellow-300 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
                  <p className="text-blue-200 text-sm">
                    💡 <strong>How to bridge:</strong> Use the ZCash POA bridge to convert your ZEC to zec.omft.near tokens, 
                    then send them to the address above. We'll automatically detect the deposit and route to {config.destinationChain}.
                  </p>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={startMonitoring}
                  disabled={isMonitoring}
                  className="px-8 py-4 bg-yellow-400 text-black font-bold text-lg rounded-lg hover:bg-yellow-300 transition-colors disabled:opacity-50"
                >
                  {isMonitoring ? 'Monitoring for Deposits...' : 'Start Monitoring (Demo)'}
                </button>
                <p className="text-xs text-gray-400 mt-2">
                  In demo mode - Real version would automatically detect deposits
                </p>
              </div>
            </div>
          )}

          {currentStep === 'processing' && wallet && (
            <div className="space-y-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">Processing Your Deposit</h3>
                <p className="text-gray-400 mb-8">
                  {depositDetected ? 'Deposit detected! Routing to your destination chain...' : 'Monitoring for your ZCash deposit...'}
                </p>
              </div>

              <div className="bg-blue-900/20 border border-blue-500 rounded-xl p-6 mb-8">
                <h4 className="font-bold mb-4 text-blue-400">🔄 Automatic Processing</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                      depositDetected ? 'bg-green-500 text-white' : 'bg-yellow-400 text-black animate-pulse'
                    }`}>
                      {depositDetected ? '✓' : '⏳'}
                    </div>
                    <span>Monitoring for ZCash deposit</span>
                    {depositDetected && <span className="text-green-400 text-sm">✓ Detected!</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                      depositDetected ? 'bg-yellow-400 text-black animate-pulse' : 'bg-gray-600 text-gray-300'
                    }`}>
                      {depositDetected ? '⏳' : '2'}
                    </div>
                    <span>Executing NEAR intents to {config.destinationChain}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-gray-300 text-sm font-bold">3</div>
                    <span>Delivering tokens to destination chain</span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mb-4"></div>
                <p className="text-gray-400">
                  {depositDetected ? 'Processing your deposit...' : 'Waiting for deposit...'}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  This process is fully automated - no action needed from you
                </p>
              </div>
            </div>
          )}

          {currentStep === 'ready' && wallet && (
            <div className="space-y-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">🎉 Your Tokens Are Ready!</h3>
                <p className="text-gray-400 mb-8">
                  Your ZCash has been successfully routed to {config.destinationChain}. Your anonymous wallet now has tokens ready to use!
                </p>
              </div>

              <div className="bg-green-900/20 border border-green-500 rounded-xl p-6 mb-8">
                <h4 className="font-bold mb-4 text-green-400">✓ Processing Complete</h4>
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-400">Processed</p>
                    <p className="font-bold">ZCash Deposit</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Destination</p>
                    <p className="font-bold capitalize">{config.destinationChain}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Estimated Received</p>
                    <p className="font-bold">~0.356 {config.destinationChain.toUpperCase()}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="font-bold text-xl text-center">Export Your Wallet</h4>
                
                {wallet.addresses.map(address => {
                  const chain = getChainInfo(address.chainId);
                  if (!chain) return null;
                  
                  return (
                    <div key={address.chainId} className="bg-zinc-800/50 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Image src={chain.icon} alt={chain.name} width={32} height={32} className="rounded-full" />
                          <div>
                            <h5 className="font-bold">{chain.name} Wallet</h5>
                            <p className="text-sm text-gray-400">Ready to import</p>
                          </div>
                        </div>
                        <button
                          onClick={() => exportPrivateKey(address.chainId)}
                          className="px-6 py-3 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-300 transition-colors"
                        >
                          Use This Wallet
                        </button>
                      </div>
                      
                      <div className="bg-zinc-900 rounded-lg p-4">
                        <p className="text-xs text-gray-400 mb-2">Wallet Address:</p>
                        <p className="font-mono text-sm break-all">{address.address}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-red-900/20 border border-red-500 rounded-xl p-4">
                <p className="text-red-200 text-sm">
                  ⚠️ <strong>Important:</strong> This wallet expires in {PrivacyWalletManager.formatRemainingTime(wallet)} for privacy. 
                  Export your private keys now and use the funds before expiration.
                </p>
              </div>

              <div className="bg-yellow-900/20 border border-yellow-500 rounded-xl p-6 mb-8">
                <h4 className="font-bold mb-3 text-yellow-400">🎯 Your Anonymous Wallet</h4>
                <p className="text-yellow-200 text-sm mb-4">
                  Your tokens are now in an anonymous wallet on {config.destinationChain}. The wallet address and private key are shown below for your records.
                </p>
                
                <div className="bg-zinc-900 rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-2">{config.destinationChain.charAt(0).toUpperCase() + config.destinationChain.slice(1)} Wallet Address:</p>
                  <div className="flex items-center gap-3">
                    <p className="font-mono text-sm flex-1 break-all">
                      {wallet.addresses.find(a => a.chainId === config.destinationChain)?.address}
                    </p>
                    <button
                      onClick={() => {
                        const address = wallet.addresses.find(a => a.chainId === config.destinationChain)?.address;
                        if (address) {
                          navigator.clipboard.writeText(address);
                          alert('Address copied!');
                        }
                      }}
                      className="px-3 py-1 bg-yellow-400 text-black text-xs rounded hover:bg-yellow-300 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-4">
                <p className="text-gray-300">
                  🎉 <strong>Success!</strong> Your anonymous wallet now has {config.destinationChain} tokens ready to use for private DeFi interactions.
                </p>
                
                <button
                  onClick={() => {
                    setCurrentStep('generate');
                    setWallet(null);
                    setDepositDetected(false);
                    setIsMonitoring(false);
                    setConfig({
                      destinationChain: 'solana',
                      privacyLevel: 'medium'
                    });
                  }}
                  className="px-6 py-3 border border-zinc-600 text-gray-300 rounded-lg hover:border-yellow-400 hover:text-yellow-400 transition-colors"
                >
                  Create Another Wallet
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
