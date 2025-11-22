import { Wallet } from "./types";

export const calculateTotalBalance = (wallets: Wallet[]): number => {
  return wallets.reduce((total, wallet) => {
    return (
      total +
      wallet.addresses.reduce((walletTotal, addr) => {
        return walletTotal + addr.balance;
      }, 0)
    );
  }, 0);
};

export const copyAddress = (address: string) => {
  navigator.clipboard.writeText(address);
  alert("Address copied to clipboard!");
};

