import hre from "hardhat";
import { formatEther } from "viem";

async function main() {
  console.log("------------------------------------------");
  console.log("🚀 Starting Smart Wallet Deployment...");
  console.log("------------------------------------------");

  const publicClient = await hre.viem.getPublicClient();
  const [deployer] = await hre.viem.getWalletClients();

  console.log(
    "👤 Deployer Address:",
    deployer.account.address
  );

  const deployerBalance = await publicClient.getBalance({
    address: deployer.account.address,
  });

  console.log(
    "💰 Deployer Balance:",
    formatEther(deployerBalance),
    "ETH"
  );

  console.log("------------------------------------------");

  const wallet = await hre.viem.deployContract("SmartWallet");

  console.log("✅ Smart Wallet Deployed Successfully!");
  console.log("📍 Contract Address:", wallet.address);

  const contractBalance = await publicClient.getBalance({
    address: wallet.address,
  });

  console.log(
    "🏦 Smart Wallet Initial ETH Balance:",
    formatEther(contractBalance),
    "ETH"
  );

  console.log("------------------------------------------");
  console.log("🎉 Deployment Completed!");
  console.log("------------------------------------------");
}

main().catch((error) => {
  console.error("❌ Deployment Failed:", error);
  process.exitCode = 1;
});