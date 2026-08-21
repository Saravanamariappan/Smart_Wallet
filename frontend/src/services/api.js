import axios from "axios";
import { BACKEND_URL } from "../config/wallet.js";

const api = axios.create({
    baseURL: BACKEND_URL,
});

export async function getWalletInfo() {
    const response = await api.get("/api/wallet");
    return response.data;
}

export async function getTransactions(address) {
    const response = await api.get(`/api/transactions/${address}`);
    return response.data;
}

export async function saveTransaction(data) {
    const response = await api.post("/api/transactions", data);
    return response.data;
}

export async function verifyTransaction(txHash) {
    const response = await api.get(`/api/transactions/verify/${txHash}`);
    return response.data;
}

export async function getBackendStatus() {
    try {
        const response = await api.get("/api/wallet");
        return response.status === 200;
    } catch (error) {
        return false;
    }
}
