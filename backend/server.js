import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import walletRoutes from "./routes/wallet.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Smart Wallet Backend API is running 🚀",
  });
});

app.use("/api/wallet", walletRoutes);
app.use("/api/transactions", transactionRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("------------------------------------------");
  console.log("🚀 Smart Wallet Backend Started");
  console.log("------------------------------------------");
  console.log(`Server running on port ${PORT}`);
  console.log(`Wallet: ${process.env.SMART_WALLET_ADDRESS}`);
  console.log("------------------------------------------");
});