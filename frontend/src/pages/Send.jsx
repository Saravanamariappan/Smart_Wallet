import React, { useState, useEffect } from "react";
import { isAddress } from "viem";
import { ShieldAlert, ArrowRight, CheckCircle2, Loader2, AlertCircle, Check, ArrowUpRight } from "lucide-react";
import { formatAddress, formatBalance } from "../utils/format.js";
import { sendETH, waitForTransaction, getSmartWalletBalance } from "../services/blockchain.js";
import { saveTransaction, verifyTransaction } from "../services/api.js";
import { SMART_WALLET_ADDRESS } from "../config/wallet.js";
import { PetalIcon, SunburstShape } from "../components/DecorativePetal.jsx";
import StyledButton from "../components/StyledButton.jsx";

function StepIndicator({ step }) {
    const steps = [
        { n: 1, label: "Details" },
        { n: 2, label: "Review" },
        { n: 3, label: "Processing" },
        { n: 4, label: "Done" },
    ];
    return (
        <div className="verdara-steps-container">
            <div className="verdara-steps-track">
                {steps.map((s, i) => (
                    <React.Fragment key={s.n}>
                        <div className={`verdara-step-node ${step === s.n ? 'active' : step > s.n ? 'done' : ''}`}>
                            <div className="verdara-step-circle">
                                {step > s.n ? <Check style={{ width: 12, height: 12 }} /> : s.n}
                            </div>
                            <span className="verdara-step-label font-rakkas">{s.label}</span>
                        </div>
                        {i < steps.length - 1 && (
                            <div className={`verdara-step-line ${step > s.n ? 'done' : ''}`} />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}

export default function Send({ connectedAccount, isOwner, chainId, backendConnected, addToast }) {
    const [receiver, setReceiver] = useState("");
    const [amount, setAmount] = useState("");
    const [smartWalletBalance, setSmartWalletBalance] = useState("0.00");
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [txHash, setTxHash] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [statusMessage, setStatusMessage] = useState("");

    const isSepolia = chainId === 11155111;

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const bal = await getSmartWalletBalance();
                setSmartWalletBalance(bal.eth);
            } catch (err) { console.error("Error fetching balance:", err); }
        };
        fetchBalance();
    }, []);

    const validateForm = () => {
        if (!connectedAccount) { setErrorMessage("Please connect your MetaMask wallet."); return false; }
        if (!isSepolia) { setErrorMessage("Please switch to Sepolia Testnet."); return false; }
        if (!isOwner) { setErrorMessage("Only the S Wallet owner can carry out this transaction."); return false; }
        if (!receiver || !isAddress(receiver)) { setErrorMessage("Please enter a valid Ethereum recipient address."); return false; }
        if (receiver.toLowerCase() === SMART_WALLET_ADDRESS.toLowerCase()) { setErrorMessage("Cannot send ETH back to the S Wallet itself."); return false; }
        const val = parseFloat(amount);
        if (isNaN(val) || val <= 0) { setErrorMessage("Please enter an amount greater than 0 ETH."); return false; }
        if (val > parseFloat(smartWalletBalance)) { setErrorMessage(`Insufficient balance. Current: ${smartWalletBalance} ETH.`); return false; }
        setErrorMessage(""); return true;
    };

    const handleReview = (e) => { e.preventDefault(); if (validateForm()) setStep(2); };

    const handleSend = async () => {
        setLoading(true); setStep(3); setErrorMessage("");
        setStatusMessage("Awaiting user confirmation in MetaMask...");
        try {
            const hash = await sendETH(receiver, amount);
            setTxHash(hash);
            addToast({ title: "Transaction Submitted", message: "Waiting for on-chain confirmation.", type: "success" });
            setStatusMessage("Waiting for transaction receipt on-chain...");
            const receipt = await waitForTransaction(hash);
            if (receipt.status !== "success") throw new Error("Blockchain transaction failed.");
            setStatusMessage("Verifying with backend...");
            if (backendConnected) {
                try { await verifyTransaction(hash); } catch (e) { console.warn("Backend verify warning:", e); }
                try {
                    await saveTransaction({ wallet_address: SMART_WALLET_ADDRESS, tx_hash: hash, from_address: SMART_WALLET_ADDRESS, to_address: receiver, amount, transaction_type: "SEND", status: "confirmed" });
                } catch (e) {
                    addToast({ title: "Database Log Failed", message: "Transaction succeeded but failed to log to database.", type: "warning" });
                }
            }
            setStep(4);
            addToast({ title: "Transaction Successful", message: `Sent ${amount} ETH to ${formatAddress(receiver)}.`, type: "success" });
            const newBal = await getSmartWalletBalance();
            setSmartWalletBalance(newBal.eth);
        } catch (err) {
            console.error(err);
            const errMsg = err.message?.includes("User rejected") ? "Transaction cancelled in MetaMask." : err.message || "Blockchain transaction failed.";
            setErrorMessage(errMsg); setStep(1);
            addToast({ title: "Transaction Failed", message: errMsg, type: "error" });
        } finally { setLoading(false); }
    };

    const handleReset = () => { setReceiver(""); setAmount(""); setStep(1); setTxHash(""); setErrorMessage(""); };

    return (
        <div className="page-enter verdara-form-page-container">
            {/* Header */}
            <div className="verdara-page-header text-center-mobile">
                <div>
                    <div className="verdara-page-tag font-rakkas">
                        <PetalIcon size={13} color="var(--primary-dark)" />
                        <span>OUTBOUND DISBURSEMENT</span>
                    </div>
                    <h1 className="verdara-page-title font-merriweather">
                        Send ETH
                    </h1>
                    <p className="verdara-page-subtitle font-rakkas">
                        Transfer Sepolia Ether from the S Wallet to any address.
                    </p>
                </div>
            </div>

            {/* Owner warning */}
            {!isOwner && connectedAccount && (
                <div className="verdara-alert-viewonly" style={{ marginBottom: "1.5rem" }}>
                    <div className="verdara-alert-icon">
                        <ShieldAlert style={{ width: 18, height: 18 }} />
                    </div>
                    <div className="verdara-alert-body">
                        <p className="verdara-alert-title font-merriweather">Sending Disabled</p>
                        <p className="verdara-alert-desc font-rakkas">
                            Only the owner (<strong className="font-script" style={{ fontSize: "1.05rem" }}>{formatAddress("0x8Be9a794b20fd7E858dEA502d5d8EAd12613496E")}</strong>) can sign transactions.
                        </p>
                    </div>
                </div>
            )}

            {/* Newsletter-styled Dark Forest Green Form Container */}
            <div className="verdara-newsletter-card">
                <div className="verdara-newsletter-watermark">
                    <SunburstShape size={360} color="#C8D6B4" opacity={0.05} />
                </div>

                <div className="verdara-newsletter-inner">
                    <StepIndicator step={step} />

                    {step === 1 && (
                        <form onSubmit={handleReview} className="verdara-form-body">
                            {/* Available Balance Pill Banner */}
                            <div className="verdara-balance-banner">
                                <div className="verdara-balance-banner-left font-rakkas">
                                    <PetalIcon size={14} color="var(--accent-sage)" />
                                    <span>AVAILABLE BALANCE</span>
                                </div>
                                <span className="verdara-balance-banner-val font-merriweather">
                                    {formatBalance(smartWalletBalance, 6)} ETH
                                </span>
                            </div>

                            {/* Recipient Input */}
                            <div className="verdara-field-group">
                                <label htmlFor="receiver" className="verdara-field-label font-rakkas">
                                    Recipient Address
                                </label>
                                <div className="verdara-input-wrap">
                                    <input
                                        id="receiver"
                                        type="text"
                                        value={receiver}
                                        onChange={(e) => setReceiver(e.target.value)}
                                        placeholder="0x..."
                                        disabled={!isOwner || !isSepolia}
                                        className="verdara-pill-input font-script"
                                        style={{ fontSize: "1.1rem" }}
                                    />
                                </div>
                                <span className="verdara-field-help font-rakkas">
                                    Enter a valid 42-character hexadecimal Ethereum address.
                                </span>
                            </div>

                            {/* Amount Input */}
                            <div className="verdara-field-group">
                                <div className="flex justify-between items-center mb-1">
                                    <label htmlFor="amount" className="verdara-field-label font-rakkas">
                                        Transfer Amount
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setAmount(smartWalletBalance)}
                                        className="verdara-max-btn font-sans"
                                        disabled={!isOwner || !isSepolia}
                                    >
                                        Use Max
                                    </button>
                                </div>
                                <div className="verdara-input-wrap-addon">
                                    <input
                                        id="amount"
                                        type="number"
                                        step="any"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        disabled={!isOwner || !isSepolia}
                                        className="verdara-pill-input font-merriweather"
                                    />
                                    <span className="verdara-input-addon font-sans font-bold">ETH</span>
                                </div>
                            </div>

                            {errorMessage && (
                                <div className="verdara-form-error font-rakkas">
                                    <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
                                    <span>{errorMessage}</span>
                                </div>
                            )}

                            <StyledButton
                                type="submit"
                                disabled={!isOwner || !isSepolia}
                                style={{ width: "100%" }}
                            >
                                Review Transaction <ArrowRight style={{ width: 17, height: 17, marginLeft: "6px" }} />
                            </StyledButton>

                            <p className="verdara-form-footer-note font-rakkas">
                                ❋ Transactions are irreversible once executed on Ethereum Sepolia.
                            </p>
                        </form>
                    )}

                    {step === 2 && (
                        <div className="verdara-review-container">
                            <div className="verdara-review-header">
                                <h3 className="verdara-review-title font-merriweather">Review Transaction</h3>
                                <p className="verdara-review-sub font-rakkas">Please check the transaction details before signing in MetaMask.</p>
                            </div>

                            <div className="verdara-review-manifest">
                                <div className="verdara-manifest-row">
                                    <span className="verdara-manifest-lbl font-rakkas">Recipient</span>
                                    <span className="verdara-manifest-val font-script" style={{ fontSize: "1.1rem" }}>{receiver}</span>
                                </div>
                                <div className="verdara-manifest-row">
                                    <span className="verdara-manifest-lbl font-rakkas">Amount</span>
                                    <span className="verdara-manifest-val-highlight font-merriweather">
                                        {amount} ETH
                                    </span>
                                </div>
                                <div className="verdara-manifest-row">
                                    <span className="verdara-manifest-lbl font-rakkas">Network</span>
                                    <span className="verdara-manifest-tag font-sans">Sepolia Testnet</span>
                                </div>
                                <div className="verdara-manifest-row">
                                    <span className="verdara-manifest-lbl font-rakkas">S Wallet Vault</span>
                                    <span className="verdara-manifest-val font-script" style={{ fontSize: "1.1rem" }}>{formatAddress(SMART_WALLET_ADDRESS)}</span>
                                </div>
                            </div>

                            <div className="verdara-review-actions" style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                                <StyledButton
                                    onClick={() => setStep(1)}
                                    style={{ flex: 1 }}
                                >
                                    ← Back
                                </StyledButton>
                                <StyledButton
                                    onClick={handleSend}
                                    style={{ flex: 2 }}
                                >
                                    Submit MetaMask Signature →
                                </StyledButton>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="verdara-processing-container">
                            <div className="verdara-spin-seal">
                                <Loader2 style={{ width: 44, height: 44, color: "var(--accent-sage)", animation: "spin 0.8s linear infinite" }} />
                            </div>
                            <h3 className="verdara-processing-title font-merriweather">Executing Smart Contract Call</h3>
                            <p className="verdara-processing-desc font-rakkas">{statusMessage}</p>
                            {txHash && (
                                <div className="verdara-tx-hash-pill font-script" style={{ fontSize: "1.05rem" }}>
                                    <span>Tx:</span> {formatAddress(txHash)}
                                </div>
                            )}
                        </div>
                    )}

                    {step === 4 && (
                        <div className="verdara-success-container">
                            <div className="verdara-success-seal">
                                <CheckCircle2 style={{ width: 36, height: 36, color: "var(--primary-dark)" }} />
                            </div>
                            <div className="text-center">
                                <h3 className="verdara-success-title font-merriweather">Transaction Successful</h3>
                                <p className="verdara-success-desc font-rakkas">
                                    Successfully sent <strong>{amount} ETH</strong> from the S Wallet.
                                </p>
                            </div>

                            <div className="verdara-receipt-box">
                                <div className="verdara-receipt-row">
                                    <span className="verdara-receipt-label font-rakkas">Recipient</span>
                                    <span className="verdara-receipt-val font-script" style={{ fontSize: "1.05rem" }}>{formatAddress(receiver)}</span>
                                </div>
                                <div className="verdara-receipt-row">
                                    <span className="verdara-receipt-label font-rakkas">Tx Hash</span>
                                    <a
                                        href={`https://sepolia.etherscan.io/tx/${txHash}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="verdara-receipt-link font-script"
                                        style={{ fontSize: "1.05rem" }}
                                    >
                                        <span>{formatAddress(txHash)}</span>
                                        <ArrowUpRight style={{ width: 12, height: 12 }} />
                                    </a>
                                </div>
                            </div>

                            <StyledButton
                                onClick={handleReset}
                                style={{ marginTop: "1rem" }}
                            >
                                Send Another →
                            </StyledButton>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
