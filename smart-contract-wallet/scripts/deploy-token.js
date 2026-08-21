import hre from "hardhat";

async function main() {
    console.log("------------------------------------------");
    console.log("🪙 Deploying Smart Wallet Test Token");
    console.log("------------------------------------------");

    const { viem } = hre;

    const [walletClient] = await viem.getWalletClients();

    console.log("👤 Deployer:", walletClient.account.address);

    const token = await viem.deployContract("MockToken");

    console.log("✅ MockToken deployed successfully!");
    console.log("📍 Token Address:", token.address);

    console.log("------------------------------------------");
    console.log("🎉 Token Deployment Completed!");
    console.log("------------------------------------------");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});