import express from "express";

import {
  saveTransaction,
  getTransactions,
  getAllTransactions,
  verifyTransaction,
} from "../controllers/transaction.controller.js";

const router = express.Router();

// Get ALL transactions
router.get("/", getAllTransactions);

// Save transaction
router.post("/", saveTransaction);

// Get transactions for a specific wallet
router.get("/:address", getTransactions);

// Verify blockchain transaction
router.get("/verify/:txHash", verifyTransaction);

export default router;