import hre from "hardhat";
import { parseEther, formatEther } from "viem";

async function main() {
  const publicClient = await hre.viem.getPublicClient();
  const [owner, attacker, receiver] = await hre.viem.getWalletClients();

  console.log("------------------------------------------");
  console.log("🔐 Testing SmartWallet Owner Security");
  console.log("------------------------------------------");

  console.log("Owner:", owner.account.address);
  console.log("Attacker:", attacker.account.address);
  console.log("Receiver:", receiver.account.address);

  // Deploy SmartWallet
  const wallet = await hre.viem.deployContract("SmartWallet");

  console.log("SmartWallet:", wallet.address);

  // Deposit 1 ETH
  const depositHash = await owner.sendTransaction({
    to: wallet.address,
    value: parseEther("1"),
  });

  await publicClient.waitForTransactionReceipt({
    hash: depositHash,
  });

  console.log("✅ 1 ETH deposited");

  // Get contract instance
  const walletContract = await hre.viem.getContractAt(
    "SmartWallet",
    wallet.address
  );

  // Attacker tries to send ETH
  console.log("\n🚨 Attacker trying to send ETH...");

  try {
    await walletContract.write.sendETH(
      [receiver.account.address, parseEther("0.5")],
      {
        account: attacker.account,
      }
    );

    console.log("❌ SECURITY FAILURE: Attacker was able to send ETH!");
  } catch (error) {
    console.log("✅ SECURITY PASSED!");
    console.log("❌ Attacker transaction rejected.");
  }

  // Check final balance
  const balance = await publicClient.getBalance({
    address: wallet.address,
  });

  console.log(
    "\n🏦 Final Wallet Balance:",
    formatEther(balance),
    "ETH"
  );

  console.log("------------------------------------------");
  console.log("🔐 Owner Security Test Completed");
  console.log("------------------------------------------");
}

main().catch((error) => {
  console.error("❌ Test Failed:", error);
  process.exitCode = 1;
});