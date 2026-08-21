import hre from "hardhat";

async function main() {
    console.log("------------------------------------------");
    console.log("🪙 Sending SWT to SmartWallet");
    console.log("------------------------------------------");

    const { viem } = hre;

    const [walletClient] = await viem.getWalletClients();

    const tokenAddress =
        "0x355851df95eefa975f7a45bc952b174e11d2275e";

    const smartWalletAddress =
        "0x94cf05f23c1426675db81d63c2b3476c77562f56";

    const amount = 100n * 10n ** 18n;

    console.log("👤 Sender:", walletClient.account.address);
    console.log("🪙 Token:", tokenAddress);
    console.log("🏦 SmartWallet:", smartWalletAddress);
    console.log("💰 Amount: 100 SWT");

    const token = await viem.getContractAt(
        "MockToken",
        tokenAddress
    );

    const hash = await token.write.transfer([
        smartWalletAddress,
        amount,
    ]);

    console.log("⏳ Transaction Hash:", hash);

    const publicClient = await viem.getPublicClient();

    const receipt = await publicClient.waitForTransactionReceipt({
        hash,
    });

    console.log("✅ Transaction confirmed!");
    console.log("📦 Block:", receipt.blockNumber);

    console.log("------------------------------------------");
    console.log("🎉 100 SWT sent to SmartWallet!");
    console.log("------------------------------------------");
}

main().catch((error) => {
    console.error("❌ Transfer failed:");
    console.error(error);
    process.exitCode = 1;
});