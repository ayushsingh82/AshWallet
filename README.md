# Privacy Wallet - Cross-Chain Privacy Track

Generate anonymous wallets using chain signatures. Derive addresses on Solana, NEAR, and EVM chains from a single NEAR account. Swap ZCash to any supported tokn on any chain via NEAR intents.

![Flow Diagram](/flow.png)

## 🔒 How Privacy Wallets Work

Simple flow using chain signatures and NEAR intents:

1. **Connect NEAR Wallet** - Connect your NEAR wallet to get started
2. **Enter Wallet Name** - Provide a unique name (path) for your wallet
3. **Derive Address** - Chain signature derives a unique address on your chosen chain (Solana, NEAR, or EVM)
4. **Swap ZEC to SOL** - Swap your ZEC on NEAR to SOL on Solana via NEAR intents
5. **Use Anonymously** - Use the derived address for private DeFi interactions

## 🚀 Features

- **Chain Signatures**: Derive addresses on multiple chains from single NEAR account
- **Multi-Chain Support**: Solana, NEAR, and EVM chains (Ethereum, Polygon, etc.)
- **NEAR Intents Integration**: Seamless cross-chain swaps via NEAR intents
- **Privacy by Design**: Each wallet name (path) generates a unique address
- **No KYC Required**: Fully anonymous, no identity verification needed
- **Unlimited Addresses**: Generate as many addresses as you need with different names

## 🛠 Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Key Pages

- `/` - Landing page explaining Privacy Wallets
- `/wallet` - Privacy Wallet Generator (main interface - enter name, derive address, swap)

## 🔗 Supported Chains

- **Solana**: Derive Solana addresses using chain signatures
- **NEAR**: Native NEAR addresses from your connected wallet
- **EVM Chains**: Ethereum, Polygon, and other EVM-compatible chains

## 💡 How It Works

1. Connect your NEAR wallet
2. Enter a unique wallet name (this becomes the derivation path)
3. System derives a unique address on your chosen chain using chain signatures
4. Swap ZEC on NEAR to SOL (or other tokens) on destination chain via NEAR intents
5. Use the derived address for anonymous DeFi interactions

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
