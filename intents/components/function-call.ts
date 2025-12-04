#!/usr/bin/env ts-node

import { QuoteRequest } from "@defuse-protocol/one-click-sdk-typescript";
import {
  getAccount,
  getAccountBalanceOfToken,
  getAccountBalanceOfSolana,
  transferMultiTokenForQuote,
} from "./near";
import { getQuote, waitUntilQuoteExecutionCompletes } from "./intents";
import { ZEC_NEAR_DEFUSE_ASSET_ID, SOL_DEFUSE_ASSET_ID, INTENTS_CONTRACT_ID } from "./constants";
import { Account } from "@near-js/accounts";
import { actionCreators } from "@near-js/transactions";

// Loading environment variables
require("dotenv").config({ path: ".env" });

const TGas = BigInt(1_000_000_000_000);

/**
 * Deposit ZEC to NEAR intents
 * This function transfers ZEC tokens (already on NEAR) to the intents contract
 */
interface DepositZecOptions {
  inputAmount: bigint;
}

async function depositZec({ inputAmount }: DepositZecOptions): Promise<void> {
  console.log(`You are about to deposit ZEC as cross-chain asset on Near`);
  
  const account = getAccount();
  
  console.log(
    `Checking the balance of ZEC for the account ${account.accountId}`
  );
  
  // Check ZEC balance in the intents contract (as multi-token)
  const intentsBalance = await getAccountBalanceOfToken(account, ZEC_NEAR_DEFUSE_ASSET_ID);
  console.log(`ZEC balance in intents contract: ${intentsBalance}`);
  
  // Check balance in the FT contract (zec.omft.near)
  let ftBalance = BigInt(0);
  try {
    const ftContractId = "zec.omft.near";
    const result = await account.provider.callFunction(
      ftContractId,
      "ft_balance_of",
      {
        account_id: account.accountId,
      }
    );
    ftBalance = BigInt(result as string);
    console.log(`ZEC balance in FT contract (${ftContractId}): ${ftBalance}`);
  } catch (error) {
    console.log("Could not check FT contract balance:", error);
    console.log("Assuming 0 for FT contract balance");
  }
  
  const totalBalance = intentsBalance + ftBalance;
  
  if (totalBalance < inputAmount) {
    throw new Error(
      `Insufficient balance of ZEC for depositing (required: ${inputAmount}, available: ${totalBalance}, intents: ${intentsBalance}, FT: ${ftBalance})`
    );
  }
  
  // If ZEC is already in intents contract, no need to transfer
  if (intentsBalance >= inputAmount) {
    console.log(`ZEC already in intents contract (${intentsBalance}), no transfer needed`);
    return;
  }
  
  // Calculate how much we need to transfer from FT contract
  const amountToTransfer = inputAmount - intentsBalance;
  
  if (ftBalance < amountToTransfer) {
    throw new Error(
      `Insufficient ZEC in FT contract. Need ${amountToTransfer}, have ${ftBalance}`
    );
  }
  
  // Transfer ZEC from FT contract to intents
  console.log(`Transferring ${amountToTransfer} ZEC from FT contract to intents contract...`);
  await transferZecToIntents(account, amountToTransfer);
  
  console.log(`Successfully deposited ZEC to intents`);
}

/**
 * Transfer ZEC from FT contract to intents contract
 */
async function transferZecToIntents(
  account: Account,
  amount: bigint
): Promise<void> {
  console.log(
    `Creating and sending a transaction to transfer ZEC to intents contract`
  );
  
  const { transaction } = await account.signAndSendTransaction({
    receiverId: "zec.omft.near",
    actions: [
      actionCreators.functionCall(
        "ft_transfer_call",
        {
          receiver_id: INTENTS_CONTRACT_ID,
          amount: amount.toString(),
          msg: account.accountId,
        },
        50n * TGas,
        1n
      ),
    ],
    waitUntil: "EXECUTED_OPTIMISTIC",
  });
  
  console.log(`Tx: https://nearblocks.io/txns/${transaction.hash}`);
  
  // wait until the transaction is included into finalized block
  await account.provider.viewTransactionStatus(
    transaction.hash,
    account.accountId,
    "INCLUDED_FINAL"
  );
  
  console.log(`Successfully transferred ZEC to intents contract`);
}

/**
 * Swap ZEC on NEAR to SOL on Solana
 */
interface SwapZecToSolOptions {
  inputAmount: bigint;
  slippageTolerance: number;
}

async function swapZecToSol({
  inputAmount,
  slippageTolerance,
}: SwapZecToSolOptions): Promise<void> {
  console.log(
    `You are about to exchange ZEC tokens for SOL on Solana`
  );

  const account = getAccount();

  console.log(
    `Checking the balance of ZEC in intents contract for the account ${account.accountId}`
  );
  
  // Only check intents contract balance (where ZEC is after deposit)
  let balance = BigInt(0);
  try {
    balance = await getAccountBalanceOfToken(account, ZEC_NEAR_DEFUSE_ASSET_ID);
    console.log(`ZEC balance in intents contract: ${balance}`);
  } catch (error) {
    console.error("Error checking ZEC balance:", error);
    throw new Error(
      `Failed to check ZEC balance in intents contract. Make sure you have deposited ZEC first.`
    );
  }

  if (balance < inputAmount) {
    throw new Error(
      `Insufficient balance of ZEC in intents contract for swapping (required: ${inputAmount}, available: ${balance}). Please deposit ZEC first using 'npm run zec:deposit'`
    );
  }

  const deadline = new Date();
  deadline.setMinutes(deadline.getMinutes() + 5);

  const quote = await getQuote({
    dry: false,
    swapType: QuoteRequest.swapType.EXACT_INPUT,
    slippageTolerance: slippageTolerance,
    depositType: QuoteRequest.depositType.INTENTS,
    originAsset: ZEC_NEAR_DEFUSE_ASSET_ID,
    destinationAsset: SOL_DEFUSE_ASSET_ID,
    amount: inputAmount.toString(),
    refundTo: account.accountId,
    refundType: QuoteRequest.refundType.INTENTS,
    recipient: account.accountId,
    recipientType: QuoteRequest.recipientType.INTENTS,
    deadline: deadline.toISOString(),
  });

  await transferMultiTokenForQuote(account, quote, ZEC_NEAR_DEFUSE_ASSET_ID);

  await waitUntilQuoteExecutionCompletes(quote);

  console.log(`Swap was settled successfully!`);
}

/**
 * Withdraw SOL to an address on Solana
 */
interface WithdrawSolOptions {
  inputAmount: bigint;
  receiverAddress: string;
  slippageTolerance: number;
}

async function withdrawSol({
  inputAmount,
  slippageTolerance,
  receiverAddress,
}: WithdrawSolOptions): Promise<void> {
  console.log(
    `You are about to withdraw SOL tokens to Solana chain`
  );

  const account = getAccount();

  console.log(
    `Checking the balance of SOL for the account ${account.accountId}`
  );
  const balance = await getAccountBalanceOfSolana(account, SOL_DEFUSE_ASSET_ID);

  if (balance < inputAmount) {
    throw new Error(
      `Insufficient balance of SOL for withdrawing (required: ${inputAmount}, your: ${balance})`
    );
  }

  const deadline = new Date();
  deadline.setMinutes(deadline.getMinutes() + 5);

  // SOL on Solana native token address
  const solanaSolAddress = "solana:So11111111111111111111111111111111111111112";

  const quote = await getQuote({
    dry: false,
    swapType: QuoteRequest.swapType.EXACT_INPUT,
    slippageTolerance: slippageTolerance,
    depositType: QuoteRequest.depositType.INTENTS,
    originAsset: SOL_DEFUSE_ASSET_ID,
    destinationAsset: solanaSolAddress,
    amount: inputAmount.toString(),
    refundTo: account.accountId,
    refundType: QuoteRequest.refundType.INTENTS,
    recipient: receiverAddress,
    recipientType: QuoteRequest.recipientType.DESTINATION_CHAIN,
    deadline: deadline.toISOString(),
  });

  await transferMultiTokenForQuote(account, quote, SOL_DEFUSE_ASSET_ID);

  await waitUntilQuoteExecutionCompletes(quote);

  console.log(`Withdraw of SOL to Solana chain was settled successfully!`);
}

/**
 * Complete flow: Deposit ZEC → Swap to SOL → Withdraw SOL
 */
interface CompleteFlowOptions {
  zecAmount: bigint;
  solAmount: bigint; // Amount of SOL to withdraw (can be less than swapped amount)
  receiverAddress: string;
  slippageTolerance?: number;
}

async function completeFlow({
  zecAmount,
  solAmount,
  receiverAddress,
  slippageTolerance = 10,
}: CompleteFlowOptions): Promise<void> {
  console.log("\n🎯 Running Complete Flow: Deposit ZEC → Swap to SOL → Withdraw SOL");
  console.log("=".repeat(60));

  try {
    // Step 1: Deposit ZEC to NEAR intents
    console.log("\n1️⃣ Depositing ZEC to NEAR intents...");
    await depositZec({ inputAmount: zecAmount });
    console.log("✅ ZEC deposited to intents");

    // Step 2: Swap ZEC to SOL
    console.log("\n2️⃣ Swapping ZEC to SOL on Solana...");
    await swapZecToSol({
      inputAmount: zecAmount,
      slippageTolerance: slippageTolerance,
    });
    console.log("✅ ZEC swapped to SOL");

    // Step 3: Withdraw SOL to Solana address
    console.log("\n3️⃣ Withdrawing SOL to Solana chain...");
    await withdrawSol({
      inputAmount: solAmount,
      slippageTolerance: slippageTolerance,
      receiverAddress: receiverAddress,
    });
    console.log("✅ SOL withdrawn to Solana chain");

    console.log("\n🎉 Complete flow finished successfully!");
  } catch (error) {
    console.error("❌ Error in complete flow:", error);
    throw error;
  }
}

// Export functions for use in other files
export {
  depositZec,
  swapZecToSol,
  withdrawSol,
  completeFlow,
};

// Export types separately
export type {
  DepositZecOptions,
  SwapZecToSolOptions,
  WithdrawSolOptions,
  CompleteFlowOptions,
};

// Main execution - run if called directly
if (require.main === module) {
  const command = process.argv[2];

  switch (command) {
    case "deposit-zec":
      depositZec({
        inputAmount: BigInt(30000), // 0.0003 ZEC (8 decimals)
      }).catch((error: unknown) => {
        const { styleText } = require("node:util");
        if (error instanceof Error) {
          console.error(styleText("red", error.message));
        } else {
          console.error(styleText("red", JSON.stringify(error)));
        }
      });
      break;

    case "swap":
      swapZecToSol({
        inputAmount: BigInt(30000), // 0.0003 ZEC (8 decimals)
        slippageTolerance: 10, // 0.1%
      }).catch((error: unknown) => {
        const { styleText } = require("node:util");
        if (error instanceof Error) {
          console.error(styleText("red", error.message));
        } else {
          console.error(styleText("red", JSON.stringify(error)));
        }
      });
      break;

    case "withdraw":
      withdrawSol({
        inputAmount: BigInt(100000000), // 0.1 SOL (9 decimals)
        slippageTolerance: 10, // 0.1%
        receiverAddress: "5qKow5dTuF22WbTJwxHTJD3iGuqEfc65TyV7ctBF9Cwg", // Example Solana address
      }).catch((error: unknown) => {
        const { styleText } = require("node:util");
        if (error instanceof Error) {
          console.error(styleText("red", error.message));
        } else {
          console.error(styleText("red", JSON.stringify(error)));
        }
      });
      break;

    case "complete":
      completeFlow({
        zecAmount: BigInt(10000000), // 0.1 ZEC (8 decimals)
        solAmount: BigInt(100000000), // 0.1 SOL (9 decimals) - adjust based on swap output
        receiverAddress: "5qKow5dTuF22WbTJwxHTJD3iGuqEfc65TyV7ctBF9Cwg", // Example Solana address
        slippageTolerance: 10, // 0.1%
      }).catch((error: unknown) => {
        const { styleText } = require("node:util");
        if (error instanceof Error) {
          console.error(styleText("red", error.message));
        } else {
          console.error(styleText("red", JSON.stringify(error)));
        }
      });
      break;

    default:
      console.log(`
🔧 ZEC to SOL Function Call Examples

Available commands:

  ts-node components/function-call.ts deposit-zec  - Deposit ZEC to NEAR intents
  ts-node components/function-call.ts swap        - Swap ZEC to SOL
  ts-node components/function-call.ts withdraw    - Withdraw SOL to Solana address
  ts-node components/function-call.ts complete    - Run complete flow (deposit → swap → withdraw)

Example usage:
  npm run zec:deposit   - Deposit ZEC
  npm run zec:swap      - Swap ZEC to SOL
  npm run zec:withdraw  - Withdraw SOL
  npm run zec:complete  - Complete flow
      `);
      break;
  }
}

