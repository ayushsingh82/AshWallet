/**
 * Privacy Bridge Example
 * 
 * This example demonstrates how to use the privacy bridge functionality
 * to anonymously bridge ZCash to other chains via NEAR intents.
 */

import { executePrivacyBridge, validatePrivacyBridgeOptions } from "../components/privacy-bridge";
import { NEAR } from "@near-js/tokens";

// Example: Bridge 0.1 ZCash to Solana with high privacy
async function examplePrivacyBridge() {
  console.log("🔒 Privacy Bridge Example");
  console.log("========================");

  const options = {
    zcashAmount: BigInt("10000000"), // 0.1 ZEC (8 decimals)
    tempWalletAddress: "privacy_temp_wallet_example.testnet",
    destinationChain: 'solana' as const,
    privacyLevel: 'high' as const,
    slippageTolerance: 10
  };

  // Validate options
  const validationErrors = validatePrivacyBridgeOptions(options);
  if (validationErrors.length > 0) {
    console.error("❌ Validation errors:");
    validationErrors.forEach(error => console.error(`  - ${error}`));
    return;
  }

  console.log("✅ Options validated successfully");
  console.log(`📊 Bridging ${options.zcashAmount} ZCash to ${options.destinationChain}`);
  console.log(`🔒 Privacy Level: ${options.privacyLevel}`);
  console.log(`⏰ Estimated completion: ~90 seconds`);

  try {
    // Execute privacy bridge with monitoring
    const result = await executePrivacyBridge(options);

    console.log("\n🎉 Privacy Bridge Completed!");
    console.log("============================");
    console.log(`💰 Estimated ${options.destinationChain} received: ${result.estimatedDestinationAmount}`);
    console.log(`🏦 Temporary wallet: ${result.tempWalletAddress}`);
    
    console.log("\n📋 Bridge Steps:");
    result.bridgeSteps.forEach((step, index) => {
      const statusIcon = step.status === 'completed' ? '✅' : 
                        step.status === 'failed' ? '❌' : 
                        step.status === 'in_progress' ? '⏳' : '⏸️';
      console.log(`  ${index + 1}. ${statusIcon} ${step.name}`);
      if (step.txHash) {
        console.log(`     📝 Tx: ${step.txHash}`);
      }
    });

    console.log("\n🚀 Your temporary wallet is ready for DeFi interaction!");
    console.log("⚠️  Remember: This wallet will auto-expire based on your privacy level");

  } catch (error) {
    console.error("❌ Privacy bridge failed:", error);
  }
}

// Example: Monitor privacy bridge progress
async function exampleWithProgressMonitoring() {
  console.log("🔍 Privacy Bridge with Progress Monitoring");
  console.log("=========================================");

  const options = {
    zcashAmount: BigInt("5000000"), // 0.05 ZEC
    tempWalletAddress: "privacy_monitor_example.testnet",
    destinationChain: 'ethereum' as const,
    privacyLevel: 'medium' as const,
    slippageTolerance: 15
  };

  try {
    const { executePrivacyBridgeWithMonitoring } = await import("../components/privacy-bridge");
    
    const result = await executePrivacyBridgeWithMonitoring(
      options,
      (step) => {
        console.log(`📊 Step Update: ${step.name} - ${step.status}`);
        if (step.estimatedTime) {
          console.log(`   ⏱️  Estimated time: ${step.estimatedTime}s`);
        }
      }
    );

    console.log("✅ Bridge completed with monitoring!");

  } catch (error) {
    console.error("❌ Monitored bridge failed:", error);
  }
}

// Run examples
async function runExamples() {
  console.log("🚀 Starting Privacy Bridge Examples\n");

  // Note: These are mock examples for demonstration
  // In a real environment, you would need:
  // 1. Actual ZCash tokens
  // 2. Valid NEAR account with funds
  // 3. Proper environment variables set
  
  console.log("📝 Example 1: Basic Privacy Bridge");
  await examplePrivacyBridge();

  console.log("\n" + "=".repeat(50) + "\n");

  console.log("📝 Example 2: Bridge with Progress Monitoring");
  await exampleWithProgressMonitoring();

  console.log("\n🎯 Examples completed!");
  console.log("💡 To run with real transactions, set up your .env file with:");
  console.log("   - ACCOUNT_PRIVATE_KEY=your_near_private_key");
  console.log("   - ACCOUNT_ID=your_near_account.testnet");
}

// Export for use in other scripts
export {
  examplePrivacyBridge,
  exampleWithProgressMonitoring,
  runExamples
};

// Run if called directly
if (require.main === module) {
  runExamples().catch(console.error);
}
