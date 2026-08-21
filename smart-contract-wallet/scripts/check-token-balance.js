import hre from "hardhat";

async function main() {
    const { viem } = hre;

    const tokenAddress =
        "0x355851df95eefa975f7a45bc952b174e11d2275e";

    const smartWalletAddress =
        "0x94cf05f23c1426675db81d63c2b3476c77562f56";

    const token = await viem.getContractAt(
        "MockToken",
        tokenAddress
    );

    const balance = await token.read.balanceOf([
        smartWalletAddress,
    ]);

    console.log("------------------------------------------");
    console.log("🪙 SmartWallet SWT Balance");
    console.log("------------------------------------------");
    console.log(
        "🏦 SmartWallet:",
        smartWalletAddress
    );
    console.log(
        "💰 Balance:",
        Number(balance) / 10 ** 18,
        "SWT"
    );
    console.log("------------------------------------------");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});