// import hre from "hardhat";
// import { formatEther, parseEther } from "viem";

// async function main() {
//   const publicClient = await hre.viem.getPublicClient();
//   const [account0, account1] = await hre.viem.getWalletClients();

//   console.log("Account 0:", account0.account.address);
//   console.log("Account 1:", account1.account.address);

//   // Deploy SmartWallet
//   const wallet = await hre.viem.deployContract("SmartWallet");

//   console.log("SmartWallet:", wallet.address);

//   // Initial balance
//   let balance = await publicClient.getBalance({
//     address: wallet.address,
//   });

//   console.log("Initial Wallet Balance:", formatEther(balance), "ETH");

//   // Send 1 ETH to SmartWallet
//   const hash = await account0.sendTransaction({
//     to: wallet.address,
//     value: parseEther("1"),
//   });

//   await publicClient.waitForTransactionReceipt({
//     hash,
//   });

//   console.log("1 ETH deposited successfully!");

//   // Check balance again
//   balance = await publicClient.getBalance({
//     address: wallet.address,
//   });

//   console.log("Wallet Balance:", formatEther(balance), "ETH");
// }

// main().catch((error) => {
//   console.error(error);
//   process.exitCode = 1;
// });



import hre from "hardhat";
import { formatEther, parseEther } from "viem";

async function main() {
  const publicClient = await hre.viem.getPublicClient();
  const [account0, account1] = await hre.viem.getWalletClients();

  console.log("Owner:", account0.account.address);
  console.log("Receiver:", account1.account.address);

  // Deploy
  const wallet = await hre.viem.deployContract("SmartWallet");

  console.log("SmartWallet:", wallet.address);

  // Deposit 1 ETH
  const depositHash = await account0.sendTransaction({
    to: wallet.address,
    value: parseEther("1"),
  });

  await publicClient.waitForTransactionReceipt({
    hash: depositHash,
  });

  console.log("✅ 1 ETH deposited");

  // Check wallet balance
  let walletBalance = await publicClient.getBalance({
    address: wallet.address,
  });

  console.log(
    "🏦 Wallet Balance:",
    formatEther(walletBalance),
    "ETH"
  );

  // Send 0.2 ETH to Account #1
  const walletContract = await hre.viem.getContractAt(
    "SmartWallet",
    wallet.address
  );

  const sendHash = await walletContract.write.sendETH([
    account1.account.address,
    parseEther("0.2"),
  ]);

  await publicClient.waitForTransactionReceipt({
    hash: sendHash,
  });

  console.log("✅ 0.2 ETH sent to Account #1");

  // Final wallet balance
  walletBalance = await publicClient.getBalance({
    address: wallet.address,
  });

  console.log(
    "🏦 Final Wallet Balance:",
    formatEther(walletBalance),
    "ETH"
  );
}

main().catch((error) => {
  console.error("❌ Test Failed:", error);
  process.exitCode = 1;
});