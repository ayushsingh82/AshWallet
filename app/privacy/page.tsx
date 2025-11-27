"use client";

import { useState, useEffect } from "react";
import { PrivacyWalletManager } from "../generate/PrivacyWalletManager";
import { PrivacyWallet, PrivacyTransaction, PrivacyLevel, PrivacyFlowConfig } from "../generate/types";
import { CHAINS } from "../generate/constants";
import Image from "next/image";

interface PrivacyFlowStep {
  id: string;
  title: string;
  icon: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
}

export default function PrivacyPage() {
  const [currentStep, setCurrentStep] = useState<'config' | 'generate' | 'bridge' | 'interact'>('config');
  const [flowConfig, setFlowConfig] = useState<PrivacyFlowConfig>({
    zcashAmount: 0,
    destinationChain: 'solana',
    privacyLevel: 'high',
    purpose: '',
    dappUrl: ''
  });
  const [privacyWallet, setPrivacyWallet] = useState<PrivacyWallet | null>(null);
  const [transaction, setTransaction] = useState<PrivacyTransaction | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');

  const steps: PrivacyFlowStep[] = [
    {
      id: 'config',
      title: 'Configure Privacy Settings',
      icon: '🔒',
      description: 'Set up your privacy preferences and transaction details',
      status: currentStep === 'config' ? 'active' : 'completed'
    },
    {
      id: 'generate',
      title: 'Generate Temporary Wallet',
      icon: '🔑',
      description: 'Create a secure temporary wallet for anonymous transactions',
      status: currentStep === 'generate' ? 'active' : currentStep === 'config' ? 'pending' : 'completed'
    },
    {
      id: 'bridge',
      title: 'Execute Privacy Bridge',
      icon: '🌉',
      description: 'Bridge your ZCash through NEAR to destination chain',
      status: currentStep === 'bridge' ? 'active' : ['config', 'generate'].includes(currentStep) ? 'pending' : 'completed'
    },
    {
      id: 'interact',
      title: 'Interact with DApp',
      icon: '🚀',
      description: 'Use your temporary wallet to interact with DeFi protocols',
      status: currentStep === 'interact' ? 'active' : 'pending'
    }
  ];

  // Auto-cleanup expired wallets on component mount
  useEffect(() => {
    PrivacyWalletManager.cleanupExpiredWallets();
  }, []);

  const handleConfigSubmit = async () => {
    if (!flowConfig.zcashAmount || !flowConfig.purpose) {
      setError('Please fill in all required fields');
      return;
    }

    setError('');
    setIsProcessing(true);

    try {
      // Generate privacy wallet
      const wallet = await PrivacyWalletManager.generatePrivacyWallet(
        flowConfig.destinationChain,
        flowConfig.privacyLevel,
        flowConfig.purpose,
        flowConfig.zcashAmount
      );

      setPrivacyWallet(wallet);
      setCurrentStep('generate');
    } catch (err) {
      setError('Failed to generate privacy wallet');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartBridge = async () => {
    if (!privacyWallet) return;

    setIsProcessing(true);
    setError('');

    try {
      // Create privacy transaction
      const tx = PrivacyWalletManager.createPrivacyTransaction(
        privacyWallet.id,
        flowConfig.zcashAmount,
        flowConfig.destinationChain
      );

      setTransaction(tx);
      setCurrentStep('bridge');

      // Simulate bridge process (in real implementation, call privacy-bridge.ts)
      setTimeout(() => {
        PrivacyWalletManager.updateTransactionStep(tx.id, 'step_2', 'in_progress');
        setTimeout(() => {
          PrivacyWalletManager.updateTransactionStep(tx.id, 'step_2', 'completed');
          PrivacyWalletManager.updateTransactionStep(tx.id, 'step_3', 'in_progress');
          setTimeout(() => {
            PrivacyWalletManager.updateTransactionStep(tx.id, 'step_3', 'completed');
            PrivacyWalletManager.updateTransactionStep(tx.id, 'step_4', 'completed');
            PrivacyWalletManager.updatePrivacyTransaction(tx.id, { status: 'completed' });
            setCurrentStep('interact');
            setIsProcessing(false);
          }, 3000);
        }, 4000);
      }, 2000);

    } catch (err) {
      setError('Failed to start bridge process');
      console.error(err);
      setIsProcessing(false);
    }
  };

  const getDestinationChainInfo = () => {
    return CHAINS.find(c => c.id === flowConfig.destinationChain);
  };

  const formatTimeRemaining = () => {
    if (!privacyWallet) return '';
    return PrivacyWalletManager.formatRemainingTime(privacyWallet);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-[#97FBE4] to-[#7EE7D6] bg-clip-text text-transparent">
            Privacy-Preserving Cross-Chain Bridge
          </h1>
          <p className="text-gray-400 text-lg">
            Interact with DeFi protocols anonymously using temporary wallets
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-12 h-12 rounded-full text-2xl
                  ${step.status === 'active' ? 'bg-[#97FBE4] text-black' : 
                    step.status === 'completed' ? 'bg-green-500 text-white' : 
                    step.status === 'failed' ? 'bg-red-500 text-white' : 
                    'bg-gray-700 text-gray-400'}
                `}>
                  {step.icon}
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    w-16 h-1 mx-4
                    ${step.status === 'completed' ? 'bg-green-500' : 'bg-gray-700'}
                  `} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">
              {steps.find(s => s.status === 'active')?.title}
            </h2>
            <p className="text-gray-400">
              {steps.find(s => s.status === 'active')?.description}
            </p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {/* Step Content */}
        <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-8">
          {currentStep === 'config' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-6">Configure Your Privacy Transaction</h3>
              
              {/* Important Notice */}
              <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="text-blue-400 text-xl">ℹ️</div>
                  <div>
                    <h4 className="font-semibold text-blue-400 mb-2">How Privacy Bridge Works</h4>
                    <div className="text-blue-200 text-sm space-y-2">
                      <p><strong>1. ZCash Source:</strong> You need ZCash already bridged to NEAR as <code className="bg-blue-800/50 px-1 rounded">zec.omft.near</code></p>
                      <p><strong>2. Temporary Wallet:</strong> We generate a new wallet with private keys for anonymous transactions</p>
                      <p><strong>3. Bridge Route:</strong> ZCash → NEAR → Destination Chain (Solana/Ethereum)</p>
                      <p><strong>4. Fund Safety:</strong> Temp wallets are saved locally with recovery options</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* ZCash Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  ZCash Amount * <span className="text-xs text-gray-400">(must be bridged to NEAR as zec.omft.near)</span>
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={flowConfig.zcashAmount || ''}
                  onChange={(e) => setFlowConfig({...flowConfig, zcashAmount: parseFloat(e.target.value) || 0})}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-[#97FBE4]"
                  placeholder="0.1"
                />
                <div className="mt-2 text-xs text-gray-400">
                  💡 Bridge ZCash to NEAR first using the POA bridge at zec.omft.near
                </div>
              </div>

              {/* Destination Chain */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Destination Chain *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {CHAINS.filter(c => c.id !== 'zcash' && c.id !== 'near').map(chain => (
                    <button
                      key={chain.id}
                      onClick={() => setFlowConfig({...flowConfig, destinationChain: chain.id})}
                      className={`
                        p-4 border rounded-lg flex items-center gap-3 transition-colors
                        ${flowConfig.destinationChain === chain.id 
                          ? 'border-[#97FBE4] bg-[#97FBE4]/10' 
                          : 'border-zinc-600 hover:border-[#97FBE4]/50'}
                      `}
                    >
                      <Image src={chain.icon} alt={chain.name} width={24} height={24} className="rounded-full" />
                      <span>{chain.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Privacy Level */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Privacy Level *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['high', 'medium', 'low'] as PrivacyLevel[]).map(level => (
                    <button
                      key={level}
                      onClick={() => setFlowConfig({...flowConfig, privacyLevel: level})}
                      className={`
                        p-4 border rounded-lg text-center transition-colors
                        ${flowConfig.privacyLevel === level 
                          ? 'border-[#97FBE4] bg-[#97FBE4]/10' 
                          : 'border-zinc-600 hover:border-[#97FBE4]/50'}
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

              {/* Purpose */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Purpose Description *
                </label>
                <input
                  type="text"
                  value={flowConfig.purpose}
                  onChange={(e) => setFlowConfig({...flowConfig, purpose: e.target.value})}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-[#97FBE4]"
                  placeholder="e.g., Uniswap trading, Aave lending"
                />
              </div>

              {/* DApp URL (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  DApp URL (Optional)
                </label>
                <input
                  type="url"
                  value={flowConfig.dappUrl || ''}
                  onChange={(e) => setFlowConfig({...flowConfig, dappUrl: e.target.value})}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-[#97FBE4]"
                  placeholder="https://app.uniswap.org"
                />
              </div>

              <button
                onClick={handleConfigSubmit}
                disabled={isProcessing}
                className="w-full py-3 bg-[#97FBE4] text-black font-semibold rounded-lg hover:bg-[#7EE7D6] transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Generating...' : 'Generate Privacy Wallet'}
              </button>
            </div>
          )}

          {currentStep === 'generate' && privacyWallet && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-6">Temporary Privacy Wallet Generated</h3>
              
              <div className="bg-zinc-800/50 border border-zinc-600 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">Wallet Details</h4>
                  <div className="text-sm text-[#97FBE4]">
                    Expires in: {formatTimeRemaining()}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-400 text-sm">Purpose:</span>
                    <div className="font-mono">{privacyWallet.purposeDescription}</div>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Privacy Level:</span>
                    <div className="capitalize">{privacyWallet.privacyLevel}</div>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Destination Chain:</span>
                    <div className="flex items-center gap-2">
                      {getDestinationChainInfo() && (
                        <>
                          <Image 
                            src={getDestinationChainInfo()!.icon} 
                            alt={getDestinationChainInfo()!.name}
                            width={20} 
                            height={20} 
                            className="rounded-full" 
                          />
                          {getDestinationChainInfo()!.name}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h5 className="text-sm font-medium text-gray-300 mb-3">Generated Addresses:</h5>
                  <div className="space-y-2">
                    {privacyWallet.addresses.map(addr => {
                      const chain = CHAINS.find(c => c.id === addr.chainId);
                      return (
                        <div key={addr.chainId} className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-lg">
                          {chain && (
                            <Image src={chain.icon} alt={chain.name} width={20} height={20} className="rounded-full" />
                          )}
                          <div className="flex-1">
                            <div className="text-sm text-gray-400">{chain?.name}</div>
                            <div className="font-mono text-sm">{addr.address}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                onClick={handleStartBridge}
                disabled={isProcessing}
                className="w-full py-3 bg-[#97FBE4] text-black font-semibold rounded-lg hover:bg-[#7EE7D6] transition-colors disabled:opacity-50"
              >
                Start Privacy Bridge
              </button>
            </div>
          )}

          {currentStep === 'bridge' && transaction && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-6">Executing Privacy Bridge</h3>
              
              {/* Simulation Notice */}
              <div className="bg-[#97FBE4]/20 border border-[#97FBE4] rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[#97FBE4]">⚠️</span>
                  <span className="font-semibold text-[#97FBE4]">Demo Mode</span>
                </div>
                <div className="text-[#97FBE4] text-sm">
                  <p><strong>Real:</strong> Live market prices and bridge routes from 1Click API</p>
                  <p><strong>Simulated:</strong> Transaction execution (requires actual ZCash funds)</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {transaction.steps.map(step => (
                  <div key={step.id} className="flex items-center gap-4 p-4 bg-zinc-800/50 border border-zinc-600 rounded-lg">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm
                      ${step.status === 'completed' ? 'bg-green-500 text-white' :
                        step.status === 'in_progress' ? 'bg-[#97FBE4] text-black' :
                        step.status === 'failed' ? 'bg-red-500 text-white' :
                        'bg-gray-600 text-gray-300'}
                    `}>
                      {step.status === 'completed' ? '✓' :
                       step.status === 'in_progress' ? '⟳' :
                       step.status === 'failed' ? '✗' : '○'}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{step.name}</div>
                      {step.status === 'in_progress' && (
                        <div className="text-sm text-[#97FBE4]">Processing...</div>
                      )}
                      {step.txHash && (
                        <div className="text-xs text-gray-400 font-mono">{step.txHash}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {isProcessing && (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#97FBE4]"></div>
                  <div className="mt-2 text-gray-400">Processing bridge transaction...</div>
                </div>
              )}
            </div>
          )}

          {currentStep === 'interact' && privacyWallet && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-6">Ready for DApp Interaction</h3>
              
              <div className="bg-green-900/20 border border-green-500 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">✓</div>
                  <h4 className="font-semibold text-green-400">Privacy Bridge Completed</h4>
                </div>
                <p className="text-green-200 mb-4">
                  Your ZCash has been successfully bridged to {getDestinationChainInfo()?.name} through NEAR. 
                  You can now interact with DeFi protocols anonymously using your temporary wallet.
                </p>
                
                <div className="bg-zinc-800/50 rounded-lg p-4 mb-4">
                  <div className="text-sm text-gray-400 mb-2">Temporary Wallet Address:</div>
                  <div className="font-mono text-sm break-all">
                    {privacyWallet.addresses.find(a => a.chainId === flowConfig.destinationChain)?.address}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Time Remaining:</span>
                  <span className="text-[#97FBE4] font-medium">{formatTimeRemaining()}</span>
                </div>
              </div>

              {flowConfig.dappUrl && (
                <div className="text-center">
                  <a
                    href={flowConfig.dappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#97FBE4] text-black font-semibold rounded-lg hover:bg-[#7EE7D6] transition-colors"
                  >
                    Open DApp
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}

              <div className="text-center">
                <button
                  onClick={() => {
                    setCurrentStep('config');
                    setPrivacyWallet(null);
                    setTransaction(null);
                    setFlowConfig({
                      zcashAmount: 0,
                      destinationChain: 'solana',
                      privacyLevel: 'high',
                      purpose: '',
                      dappUrl: ''
                    });
                  }}
                  className="px-6 py-2 border border-zinc-600 text-gray-300 rounded-lg hover:border-[#97FBE4] hover:text-[#97FBE4] transition-colors"
                >
                  Start New Privacy Transaction
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
