import pool from "../config/db.js";
import { getTransaction } from "../services/blockchain.service.js";

export async function saveTransaction(req, res) {
  try {
    const {
      wallet_address,
      tx_hash,
      from_address,
      to_address,
      amount,
      token_address,
      transaction_type,
      status,
    } = req.body;

    await pool.execute(
      `INSERT INTO transactions
      (
        wallet_address,
        tx_hash,
        from_address,
        to_address,
        amount,
        token_address,
        transaction_type,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        wallet_address,
        tx_hash,
        from_address,
        to_address,
        amount,
        token_address || null,
        transaction_type,
        status || "confirmed",
      ]
    );

    res.json({
      success: true,
      message: "Transaction saved successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to save transaction",
    });
  }
}

export async function getTransactions(req, res) {
  try {
    const { address } = req.params;

    const [rows] = await pool.execute(
      `SELECT *
       FROM transactions
       WHERE wallet_address = ?
       ORDER BY created_at DESC`,
      [address]
    );

    res.json({
      success: true,
      transactions: rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch transactions",
    });
  }
}

export async function verifyTransaction(req, res) {
  try {
    const { txHash } = req.params;

    const transaction = await getTransaction(txHash);

    res.json({
      success: true,
      transaction,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Transaction not found",
    });
  }
}

export async function getAllTransactions(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT *
       FROM transactions
       ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      transactions: rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch transactions",
    });
  }
}