import hre from "hardhat";
import { parseEther, formatEther } from "viem";

async function main() {
  const publicClient = await hre.viem.getPublicClient();
  const [owner, receiver] = await hre.viem.getWalletClients();

  console.log("------------------------------------------");
  console.log("⚡ Testing SmartWallet execute()");
  console.log("------------------------------------------");

  console.log("Owner:", owner.account.address);
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

  // Get SmartWallet contract
  const walletContract = await hre.viem.getContractAt(
    "SmartWallet",
    wallet.address
  );

  // Execute a normal ETH transfer using execute()
  console.log("\n⚡ Executing transaction...");

  const executeHash = await walletContract.write.execute([
    receiver.account.address,
    parseEther("0.3"),
    "0x",
  ]);

  await publicClient.waitForTransactionReceipt({
    hash: executeHash,
  });

  console.log("✅ execute() transaction successful");

  // Check final balance
  const finalBalance = await publicClient.getBalance({
    address: wallet.address,
  });

  console.log(
    "🏦 Final Wallet Balance:",
    formatEther(finalBalance),
    "ETH"
  );

  console.log("------------------------------------------");
  console.log("⚡ execute() Test Completed");
  console.log("------------------------------------------");
}

main().catch((error) => {
  console.error("❌ Test Failed:", error);
  process.exitCode = 1;
});