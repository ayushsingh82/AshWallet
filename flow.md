# Privacy Wallet Flow - Cross-Chain Privacy Track

## Overview
This document describes the complete flow for generating privacy-preserving wallets using NEAR chain signatures and cross-chain swaps via NEAR intents.

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User connects NEAR wallet (via Navbar)                      │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. User has ZEC in NEAR wallet                                 │
│    - Option A: Already has ZEC in NEAR wallet                    │
│    - Option B: Deposits ZEC from Zcash wallet to NEAR wallet    │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. User provides "Path" (name/purpose)                          │
│    - Path is a string identifier for the purpose                │
│    - Examples: "defi-swap-1", "nft-purchase", "yield-farming"   │
│    - Each path generates a unique Solana address                │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. Derive Solana address using Chain Signature                  │
│    - Uses NEAR account + path to derive Solana address         │
│    - Implementation: signature/components/Solana.tsx           │
│    - Chain signature contract: v1.signer (mainnet)             │
│    - Each path = unique Solana address                          │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. Swap ZEC (NEAR) → SOL (Solana) via NEAR Intents             │
│    - Uses 1Click API for quotes                                  │
│    - Route: ZEC on NEAR → NEAR → SOL on Solana                  │
│    - Implementation: intents/components/privacy-bridge.ts       │
│    - Assets:                                                    │
│      * ZEC: nep141:zec.omft.near (on NEAR)                     │
│      * NEAR: nep141:wrap.near                                   │
│      * SOL: nep141:sol.omft.near (bridged to Solana)            │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. SOL arrives at derived Solana address                         │
│    - User can now use the Solana address for DeFi               │
│    - Address is derived from NEAR account + path                │
│    - No connection to user's main wallet                         │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7. User can create new addresses anytime                        │
│    - Just provide a new path                                    │
│    - Each path = new unique Solana address                      │
│    - Unlimited addresses from single NEAR account              │
└─────────────────────────────────────────────────────────────────┘
```

## Technical Details

### Supported Tokens & Chains

**Tokens:**
- ZEC (Zcash) - Available on Zcash, NEAR, Solana
- NEAR - Available on NEAR
- SOL (Solana) - Available on Solana, NEAR

**Chains:**
- Zcash (native ZEC)
- NEAR (ZEC, NEAR, SOL)
- Solana (ZEC, SOL)

### Chain Signature Implementation

**Location:** `signature/components/Solana.tsx`

**Key Functions:**
```typescript
// Derive Solana address from NEAR account + path
const { publicKey } = await Solana.deriveAddressAndPublicKey(
  accountId,        // NEAR account ID
  derivationPath    // User-provided path (e.g., "defi-swap-1")
);
```

**Chain Signature Contract:**
- Network: mainnet
- Contract: v1.signer
- Key Type: Eddsa (for Solana)

### NEAR Intents Implementation

**Location:** `intents/components/privacy-bridge.ts`

**Swap Flow:**
1. ZEC on NEAR → NEAR (via intents)
2. NEAR → SOL on Solana (via intents)

**Asset Identifiers:**
- ZEC on NEAR: `nep141:zec.omft.near`
- Wrapped NEAR: `nep141:wrap.near`
- SOL on NEAR: `nep141:sol.omft.near`

**1Click API:**
- Quote endpoint for getting swap quotes
- Execution via NEAR intents
- Automatic routing to destination chain

### User Interface Flow

1. **Navbar** - NEAR wallet connection
2. **Wallet Page** - Main interface:
   - Step 1: Connect NEAR wallet (if not connected)
   - Step 2: Enter path (name/purpose for Solana address)
   - Step 3: View derived Solana address
   - Step 4: Enter ZEC amount to swap
   - Step 5: Execute swap via NEAR intents
   - Step 6: SOL arrives at derived address

### Privacy Features

1. **Path-based Address Derivation**
   - Each path generates unique address
   - No link between addresses
   - User controls path naming

2. **Temporary Wallets**
   - Can use different paths for different purposes
   - No permanent wallet linking
   - Privacy by design

3. **Cross-Chain Privacy**
   - ZEC → SOL swap via NEAR intents
   - No direct link between Zcash and Solana
   - NEAR acts as privacy layer

## Implementation Files

### Core Files:
- `signature/components/Solana.tsx` - Chain signature for Solana
- `intents/components/privacy-bridge.ts` - Cross-chain swap logic
- `intents/components/constants.ts` - Token/chain configurations
- `app/components/Navbar.tsx` - NEAR wallet connection
- `app/wallet/page.tsx` - Main wallet interface
- `src/provider/wallet.tsx` - NEAR wallet provider

### Configuration:
- `signature/config.ts` - Chain signature contract config
- `intents/components/near.ts` - NEAR account utilities
- `intents/components/intents.ts` - 1Click API integration

## Usage Example

```typescript
// 1. User connects NEAR wallet (via Navbar)

// 2. User provides path
const path = "defi-swap-1";

// 3. Derive Solana address
const { publicKey } = await Solana.deriveAddressAndPublicKey(
  nearAccountId,
  path
);
// Result: Unique Solana address for this path

// 4. Swap ZEC to SOL
await executePrivacyBridge({
  zcashAmount: BigInt("100000000"), // 1 ZEC (8 decimals)
  tempWalletAddress: publicKey,     // Derived Solana address
  destinationChain: 'solana',
  privacyLevel: 'high',
  slippageTolerance: 10
});

// 5. SOL arrives at derived Solana address
// User can now use this address for DeFi without linking to main wallet
```

## Benefits

1. **Privacy**: Each path = unique address, no linking
2. **Flexibility**: Unlimited addresses from single NEAR account
3. **Simplicity**: User-friendly path naming (not complex derivation paths)
4. **Cross-Chain**: Seamless ZEC → SOL conversion via NEAR intents
5. **No KYC**: Fully anonymous, no identity required

