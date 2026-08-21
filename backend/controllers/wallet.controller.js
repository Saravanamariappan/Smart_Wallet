import {
  getWalletBalance,
  getWalletOwner,
} from "../services/blockchain.service.js";

export async function getWallet(req, res) {
  try {
    const balance = await getWalletBalance();
    const owner = await getWalletOwner();

    res.json({
      success: true,
      wallet: process.env.SMART_WALLET_ADDRESS,
      owner,
      balance,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch wallet information",
    });
  }
}