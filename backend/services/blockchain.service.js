import dotenv from "dotenv";
import {
  createPublicClient,
  http,
  formatEther,
} from "viem";
import { sepolia } from "viem/chains";

dotenv.config();

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(process.env.SEPOLIA_RPC_URL),
});

const walletAddress = process.env.SMART_WALLET_ADDRESS;

const smartWalletAbi = [
  {
    type: "function",
    name: "owner",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        type: "address",
      },
    ],
  },
];

export async function getWalletBalance() {
  const balance = await publicClient.getBalance({
    address: walletAddress,
  });

  return {
    wei: balance.toString(),
    eth: formatEther(balance),
  };
}

export async function getWalletOwner() {
  const owner = await publicClient.readContract({
    address: walletAddress,
    abi: smartWalletAbi,
    functionName: "owner",
  });

  return owner;
}

export async function getTransaction(txHash) {
  const transaction = await publicClient.getTransaction({
    hash: txHash,
  });

  const receipt = await publicClient.getTransactionReceipt({
    hash: txHash,
  });

  return {
    hash: transaction.hash,
    from: transaction.from,
    to: transaction.to,
    value: transaction.value.toString(),
    status: receipt.status,
    blockNumber: receipt.blockNumber.toString(),
  };
}