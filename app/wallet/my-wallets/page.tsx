"use client";

import { useState, useEffect } from "react";
import { useNearWallet } from "../../../src/provider/wallet";
import { getDerivedWallets, DerivedWallet, deleteDerivedWallet } from "../utils";
import Link from "next/link";
import { INTENTS_CONTRACT_ID, SOL_DEFUSE_ASSET_ID, ZEC_NEAR_DEFUSE_ASSET_ID } from "../../../intents/components/constants";

export default function MyWalletsPage() {
  const { accountId, status, viewMethod } = useNearWallet();
  const [wallets, setWallets] = useState<DerivedWallet[]>([]);
  const [filterChain, setFilterChain] = useState<'all' | 'solana' | 'near' | 'evm'>('all');
  const [selectedWallet, setSelectedWallet] = useState<DerivedWallet | null>(null);
  const [spendModalOpen, setSpendModalOpen] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [balances, setBalances] = useState({
    sol: "0",
    near: "0",
    zec: "0",
    loading: true
  });

  useEffect(() => {
    if (accountId && status === 'authenticated') {
      const userWallets = getDerivedWallets(accountId);
      
      // Add dummy wallet for testing (will be removed later)
      const dummyWallet: DerivedWallet = {
        id: 'dummy-solana-2',
        path: 'solana-2',
        address: '5qKow5dTuF22WbTJwxHTJD3iGuqEfc65TyV7ctBF9Cwg',
        chain: 'solana',
        accountId: accountId,
        createdAt: new Date().toISOString(),
        balance: '0.5'
      };
      
      // Check if dummy wallet already exists
      const hasDummy = userWallets.some(w => w.id === 'dummy-solana-2');
      if (!hasDummy) {
        setWallets([...userWallets, dummyWallet]);
      } else {
        setWallets(userWallets);
      }
    } else {
      setWallets([]);
    }
  }, [accountId, status]);

  // Fetch token balances
  useEffect(() => {
    const fetchBalances = async () => {
      if (!accountId || status !== 'authenticated' || !viewMethod) {
        setBalances({ sol: "0", near: "0", zec: "0", loading: false });
        return;
      }

      setBalances({ sol: "0", near: "0", zec: "0", loading: true });

      try {
        // Fetch SOL balance (on NEAR intents)
        const solBalance = await viewMethod({
          contractId: INTENTS_CONTRACT_ID,
          method: "mt_balance_of",
          args: {
            account_id: accountId,
            token_id: SOL_DEFUSE_ASSET_ID,
          },
        });

        // Fetch ZEC balance - check both FT contract and intents contract
        let zecBalanceIntents = "0";
        let zecBalanceFT = "0";
        
        // Check intents contract
        try {
          const intentsResult = await viewMethod({
            contractId: INTENTS_CONTRACT_ID,
            method: "mt_balance_of",
            args: {
              account_id: accountId,
              token_id: ZEC_NEAR_DEFUSE_ASSET_ID,
            },
          });
          zecBalanceIntents = intentsResult ? (intentsResult as string) : "0";
          console.log("ZEC balance from intents:", zecBalanceIntents);
        } catch (intentsError) {
          console.log("ZEC not found in intents contract:", intentsError);
        }
        
        // Check FT contract
        try {
          const ftResult = await viewMethod({
            contractId: "zec.omft.near",
            method: "ft_balance_of",
            args: {
              account_id: accountId,
            },
          });
          zecBalanceFT = ftResult ? (ftResult as string) : "0";
          console.log("ZEC balance from FT contract:", zecBalanceFT);
        } catch (ftError) {
          console.log("ZEC not found in FT contract:", ftError);
        }
        
        // Sum both balances
        const totalZecBalance = (BigInt(zecBalanceIntents) + BigInt(zecBalanceFT)).toString();
        console.log("Total ZEC balance (intents + FT):", totalZecBalance);

        // Fetch NEAR balance (wrapped NEAR on NEAR intents)
        const nearBalance = await viewMethod({
          contractId: INTENTS_CONTRACT_ID,
          method: "mt_balance_of",
          args: {
            account_id: accountId,
            token_id: "nep141:wrap.near",
          },
        });

        // Format balances (SOL has 9 decimals, ZEC has 8 decimals, NEAR has 24 decimals)
        const formatBalance = (balance: string | number | null | undefined, decimals: number, maxDisplayDecimals?: number): string => {
          if (!balance || balance === null || balance === undefined) {
            return "0";
          }
          
          try {
            const balanceStr = balance.toString().trim();
            if (!balanceStr || balanceStr === "0" || balanceStr === "") {
              return "0";
            }
            
            const balanceBigInt = BigInt(balanceStr);
            const divisor = BigInt(10 ** decimals);
            const whole = balanceBigInt / divisor;
            const fractional = balanceBigInt % divisor;
            
            if (fractional === 0n) {
              return whole.toString();
            }
            
            // Preserve trailing zeros by padding and not trimming
            let fractionalStr = fractional.toString().padStart(decimals, '0');
            
            // If maxDisplayDecimals is specified, limit the display
            if (maxDisplayDecimals !== undefined && maxDisplayDecimals < decimals) {
              // Round to maxDisplayDecimals
              const displayDivisor = BigInt(10 ** (decimals - maxDisplayDecimals));
              const roundedFractional = (fractional + displayDivisor / 2n) / displayDivisor;
              fractionalStr = roundedFractional.toString().padStart(maxDisplayDecimals, '0');
            }
            
            return `${whole}.${fractionalStr}`;
          } catch (error) {
            console.error("Error formatting balance:", balance, error);
            return "0";
          }
        };

        setBalances({
          sol: formatBalance(solBalance as string, 9),
          near: formatBalance(nearBalance as string, 24, 2), // Show only 2 decimal places for NEAR
          zec: formatBalance(totalZecBalance, 8),
          loading: false,
        });
      } catch (error) {
        console.error("Error fetching balances:", error);
        console.error("Error details:", {
          accountId,
          error: error instanceof Error ? error.message : String(error),
        });
        setBalances({ sol: "0", near: "0", zec: "0", loading: false });
      }
    };

    fetchBalances();
  }, [accountId, status, viewMethod]);

  const filteredWallets = filterChain === 'all' 
    ? wallets 
    : wallets.filter(w => w.chain === filterChain);

  const handleDelete = (walletId: string) => {
    if (confirm('Are you sure you want to delete this wallet record?')) {
      deleteDerivedWallet(walletId);
      setWallets(wallets.filter(w => w.id !== walletId));
    }
  };

  const handleSpendClick = (wallet: DerivedWallet) => {
    setSelectedWallet(wallet);
    setSpendModalOpen(true);
    setRecipientAddress("");
    setAmount("");
  };

  const handleSpendSubmit = () => {
    if (!selectedWallet) return;
    
    if (!recipientAddress.trim()) {
      alert("Please enter a recipient address");
      return;
    }
    
    if (!amount.trim() || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    // TODO: Implement actual spend/transfer logic here
    console.log("Spending from wallet:", selectedWallet);
    console.log("Recipient address:", recipientAddress);
    console.log("Amount:", amount);
    
    alert(`Spend transaction initiated!\nFrom: ${selectedWallet.address}\nTo: ${recipientAddress}\nAmount: ${amount}`);
    
    // Close modal and reset
    setSpendModalOpen(false);
    setSelectedWallet(null);
    setRecipientAddress("");
    setAmount("");
  };

  const handleCloseModal = () => {
    setSpendModalOpen(false);
    setSelectedWallet(null);
    setRecipientAddress("");
    setAmount("");
  };

  const getChainIcon = (chain: string) => {
    switch (chain) {
      case 'solana':
        return '';
      case 'near':
        return '';
      case 'evm':
        return '';
      default:
        return '';
    }
  };

  const getChainName = (chain: string) => {
    switch (chain) {
      case 'solana':
        return 'Solana';
      case 'near':
        return 'NEAR';
      case 'evm':
        return 'EVM';
      default:
        return chain;
    }
  };

  const isConnected = status === 'authenticated' && accountId;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2 text-white hover:text-[#EBF73F] transition-colors">
                My Wallets
              </h1>
              <p className="text-xl text-gray-300">
                All addresses derived from your NEAR account
              </p>
            </div>
            <Link
              href="/wallet"
              className="px-6 py-3 bg-[#EBF73F] text-black font-bold rounded-lg hover:bg-[#e8eb9f] transition-colors"
            >
              Create New Wallet
            </Link>
          </div>

          {isConnected && (
            <div className="space-y-4">
              <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
                <p className="text-blue-200">
                  💡 Connected as: <span className="font-mono">{accountId}</span>
                </p>
              </div>
              
              {/* Token Balances */}
              <div className="bg-[#141414] border border-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-[#EBF73F] mb-3">Token Balances</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-black border border-gray-700 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">SOL (on Solana)</p>
                    <p className="text-lg font-bold text-white">
                      {balances.loading ? "Loading..." : balances.sol}
                    </p>
                  </div>
                  <div className="bg-black border border-gray-700 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">NEAR (on NEAR)</p>
                    <p className="text-lg font-bold text-white">
                      {balances.loading ? "Loading..." : balances.near}
                    </p>
                  </div>
                  <div className="bg-black border border-gray-700 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">ZEC (on NEAR)</p>
                    <p className="text-lg font-bold text-white">
                      {balances.loading ? "Loading..." : balances.zec}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Check Connection */}
        {!isConnected && (
          <div className="bg-yellow-900/20 border border-yellow-500 rounded-xl p-6 mb-8 text-center">
            <p className="text-yellow-200 text-lg mb-4">
              ⚠️ Please connect your NEAR wallet to view your wallets
            </p>
            <p className="text-yellow-300 text-sm">
              Use the "Connect NEAR Wallet" button in the navbar
            </p>
          </div>
        )}

        {/* Filter */}
        {isConnected && wallets.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-4">
              <span className="text-gray-300">Filter by chain:</span>
              {(['all', 'solana', 'near', 'evm'] as const).map(chain => (
                <button
                  key={chain}
                  onClick={() => setFilterChain(chain)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterChain === chain
                      ? 'bg-[#EBF73F] text-black'
                      : 'bg-[#141414] border border-gray-700 text-gray-300 hover:border-[#EBF73F]'
                  }`}
                >
                  {chain === 'all' ? 'All' : getChainName(chain)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Wallets List */}
        {isConnected && filteredWallets.length === 0 && wallets.length > 0 && (
          <div className="bg-[#141414] border border-gray-700 rounded-xl p-8 text-center">
            <p className="text-gray-400">
              No wallets found for the selected chain filter.
            </p>
          </div>
        )}

        {isConnected && wallets.length === 0 && (
          <div className="bg-[#141414] border border-gray-700 rounded-xl p-12 text-center relative group">
            <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-[#EBF73F]"></div>
            <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-[#EBF73F]"></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-[#EBF73F]"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-[#EBF73F]"></div>
            
            <div className="text-6xl mb-6">🔒</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              No Wallets Created Yet
            </h2>
            <p className="text-gray-400 mb-2 max-w-md mx-auto">
              You haven't created any wallets through path derivation yet.
            </p>
            <p className="text-gray-500 text-sm mb-8 max-w-md mx-auto">
              Create your first wallet by entering a unique name (path) to derive an address on Solana, NEAR, or EVM chains.
            </p>
            <Link
              href="/wallet"
              className="inline-block px-8 py-4 bg-[#EBF73F] text-black font-bold rounded-lg hover:bg-[#e8eb9f] transition-colors text-lg"
            >
              Create Your First Wallet
            </Link>
          </div>
        )}

        {/* Wallets Table */}
        {isConnected && filteredWallets.length > 0 && (
          <div className="bg-[#141414] border border-gray-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#1a1a1a] border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#EBF73F]">Chain</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#EBF73F]">Path</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#EBF73F]">Address</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#EBF73F]">Balance</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-[#EBF73F]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWallets.map((wallet, index) => (
                    <tr
                      key={wallet.id}
                      className={`border-b border-gray-800 hover:bg-black transition-colors ${
                        index === filteredWallets.length - 1 ? '' : 'border-b'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{getChainIcon(wallet.chain)}</span>
                          <span className="text-sm text-gray-300">{getChainName(wallet.chain)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-mono text-sm text-[#EBF73F] break-all max-w-xs">
                          {wallet.path}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-xs text-gray-300 break-all max-w-xs">
                            {wallet.address}
                          </p>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(wallet.address);
                              alert('Address copied!');
                            }}
                            className="px-2 py-1 bg-[#EBF73F] text-black text-xs rounded hover:bg-[#e8eb9f] transition-colors flex-shrink-0"
                          >
                            Copy
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {wallet.balance ? (
                          <p className="font-semibold text-white">
                            {wallet.balance} {wallet.chain === 'solana' ? 'SOL' : wallet.chain === 'near' ? 'NEAR' : 'ETH'}
                          </p>
                        ) : (
                          <p className="text-gray-500 text-sm">-</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleSpendClick(wallet)}
                            className="px-4 py-2 bg-[#EBF73F] text-black font-semibold rounded-lg hover:bg-[#e8eb9f] transition-colors"
                          >
                            Spend
                          </button>
                          <button
                            onClick={() => handleDelete(wallet.id)}
                            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stats */}
        {isConnected && wallets.length > 0 && (
          <div className="mt-12 bg-[#141414] border border-gray-700 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 text-[#EBF73F]">Statistics</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-400">Total Wallets</p>
                <p className="text-2xl font-bold">{wallets.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Solana</p>
                <p className="text-2xl font-bold">{wallets.filter(w => w.chain === 'solana').length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">NEAR</p>
                <p className="text-2xl font-bold">{wallets.filter(w => w.chain === 'near').length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">EVM</p>
                <p className="text-2xl font-bold">{wallets.filter(w => w.chain === 'evm').length}</p>
              </div>
            </div>
          </div>
        )}

        {/* Spend Modal */}
        {spendModalOpen && selectedWallet && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-[#141414] border border-gray-700 rounded-xl p-6 max-w-md w-full relative">
              <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-[#EBF73F]"></div>
              <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-[#EBF73F]"></div>
              <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-[#EBF73F]"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-[#EBF73F]"></div>

              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#EBF73F] mb-2">Spend</h2>
                <p className="text-sm text-gray-400">
                  From: <span className="font-mono text-[#EBF73F]">{selectedWallet.address}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Chain: {getChainName(selectedWallet.chain)}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Recipient Address
                  </label>
                  <input
                    type="text"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    placeholder="Enter recipient address"
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#EBF73F] font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Amount
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      step="0.00000001"
                      min="0"
                      className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#EBF73F]"
                    />
                    <span className="text-sm text-gray-400 font-semibold px-3">
                      {selectedWallet.chain === 'solana' ? 'SOL' : selectedWallet.chain === 'near' ? 'NEAR' : 'ETH'}
                    </span>
                  </div>
                  {selectedWallet.balance && (
                    <p className="text-xs text-gray-500 mt-1">
                      Available: {selectedWallet.balance} {selectedWallet.chain === 'solana' ? 'SOL' : selectedWallet.chain === 'near' ? 'NEAR' : 'ETH'}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSpendSubmit}
                  className="flex-1 px-4 py-3 bg-[#EBF73F] text-black font-bold rounded-lg hover:bg-[#e8eb9f] transition-colors"
                >
                  Confirm Spend
                </button>
                <button
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

