import hre from "hardhat";
import { formatUnits, parseUnits } from "viem";

async function main() {
  const publicClient = await hre.viem.getPublicClient();
  const [owner, receiver] = await hre.viem.getWalletClients();

  console.log("------------------------------------------");
  console.log("🪙 Testing ERC-20 Token Transfer");
  console.log("------------------------------------------");

  console.log("Owner:", owner.account.address);
  console.log("Receiver:", receiver.account.address);

  // 1. Deploy SmartWallet
  const wallet = await hre.viem.deployContract("SmartWallet");

  console.log("SmartWallet:", wallet.address);

  // 2. Deploy Mock Token
  const token = await hre.viem.deployContract("MockToken");

  console.log("MockToken:", token.address);

  // 3. Get token contract
  const tokenContract = await hre.viem.getContractAt(
    "MockToken",
    token.address
  );

  // 4. Check owner's token balance
  let ownerBalance = await tokenContract.read.balanceOf([
    owner.account.address,
  ]);

  console.log(
    "Owner Token Balance:",
    formatUnits(ownerBalance, 18),
    "SWT"
  );

  // 5. Transfer 100 SWT to SmartWallet
  const transferHash = await tokenContract.write.transfer([
    wallet.address,
    parseUnits("100", 18),
  ]);

  await publicClient.waitForTransactionReceipt({
    hash: transferHash,
  });

  console.log("✅ 100 SWT transferred to SmartWallet");

  // 6. Check SmartWallet token balance
  let walletTokenBalance = await tokenContract.read.balanceOf([
    wallet.address,
  ]);

  console.log(
    "🏦 SmartWallet Token Balance:",
    formatUnits(walletTokenBalance, 18),
    "SWT"
  );

  // 7. Get SmartWallet contract
  const walletContract = await hre.viem.getContractAt(
    "SmartWallet",
    wallet.address
  );

  // 8. SmartWallet sends 40 SWT to receiver
  console.log("\n🪙 Sending 40 SWT from SmartWallet...");

  const sendHash = await walletContract.write.sendToken([
    token.address,
    receiver.account.address,
    parseUnits("40", 18),
  ]);

  await publicClient.waitForTransactionReceipt({
    hash: sendHash,
  });

  console.log("✅ 40 SWT sent successfully");

  // 9. Final balances
  walletTokenBalance = await tokenContract.read.balanceOf([
    wallet.address,
  ]);

  const receiverBalance = await tokenContract.read.balanceOf([
    receiver.account.address,
  ]);

  console.log(
    "🏦 Final SmartWallet Balance:",
    formatUnits(walletTokenBalance, 18),
    "SWT"
  );

  console.log(
    "👤 Receiver Token Balance:",
    formatUnits(receiverBalance, 18),
    "SWT"
  );

  console.log("------------------------------------------");
  console.log("🪙 ERC-20 Token Test Completed");
  console.log("------------------------------------------");
}

main().catch((error) => {
  console.error("❌ Test Failed:", error);
  process.exitCode = 1;
});