import React, { useState, useEffect } from "react";
import { isAddress } from "viem";
import { ShieldAlert, ArrowRight, CheckCircle2, Loader2, AlertCircle, Check } from "lucide-react";
import { formatAddress, formatBalance } from "../utils/format.js";
import { sendETH, waitForTransaction, getSmartWalletBalance } from "../services/blockchain.js";
import { saveTransaction, verifyTransaction } from "../services/api.js";
import { SMART_WALLET_ADDRESS, CHAIN_ID } from "../config/wallet.js";

function StepIndicator({ step }) {
    const steps = [
        { n: 1, label: "Details" },
        { n: 2, label: "Review" },
        { n: 3, label: "Processing" },
        { n: 4, label: "Done" },
    ];
    return (
        <div style={{ marginBottom: '2rem' }}>
            <div className="step-indicator">
                {steps.map((s, i) => (
                    <React.Fragment key={s.n}>
                        <div className={`step-dot ${step === s.n ? 'active' : step > s.n ? 'done' : ''}`}>
                            {step > s.n ? <Check style={{ width: 12, height: 12 }} /> : s.n}
                        </div>
                        {i < steps.length - 1 && (
                            <div className={`step-line ${step > s.n ? 'done' : ''}`} />
                        )}
                    </React.Fragment>
                ))}
            </div>
            <div className="flex" style={{ justifyContent: 'space-between', marginTop: '0.375rem' }}>
                {steps.map(s => (
                    <span key={s.n} style={{ fontSize: '0.625rem', fontWeight: 600, color: step === s.n ? 'var(--primary)' : 'var(--text-subtle)', textAlign: 'center', flex: 1, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        {s.label}
                    </span>
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
        if (!isOwner) { setErrorMessage("Only the SmartWallet owner can carry out this transaction."); return false; }
        if (!receiver || !isAddress(receiver)) { setErrorMessage("Please enter a valid Ethereum recipient address."); return false; }
        if (receiver.toLowerCase() === SMART_WALLET_ADDRESS.toLowerCase()) { setErrorMessage("Cannot send ETH back to the SmartWallet itself."); return false; }
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
        <div className="page-enter" style={{ maxWidth: 640, margin: '0 auto' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 className="m-0">Send ETH</h1>
                <p className="page-subtitle">Transfer Sepolia Ether from the Smart Wallet to any address.</p>
            </div>

            {/* Owner warning */}
            {!isOwner && connectedAccount && (
                <div className="alert-box alert-danger" style={{ marginBottom: '1.5rem' }}>
                    <ShieldAlert style={{ width: 18, height: 18, flexShrink: 0, marginTop: 1 }} />
                    <div>
                        <p style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.25rem' }}>Sending Disabled</p>
                        <p style={{ fontSize: '0.8125rem', opacity: 0.85 }}>
                            Only the owner (<span className="text-mono font-bold">{formatAddress("0x8Be9a794b20fd7E858dEA502d5d8EAd12613496E")}</span>) can sign transactions.
                        </p>
                    </div>
                </div>
            )}

            {/* Main Card */}
            <div className="card" style={{ padding: '2rem' }}>
                <StepIndicator step={step} />

                {step === 1 && (
                    <form onSubmit={handleReview}>
                        {/* Balance row */}
                        <div className="flex items-center justify-between" style={{ padding: '0.875rem 1rem', background: 'var(--primary-light)', border: '1px solid var(--primary-border)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Available Balance</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>{formatBalance(smartWalletBalance, 6)} ETH</span>
                        </div>

                        <div className="form-group">
                            <label htmlFor="receiver" className="form-label">Recipient Address</label>
                            <input
                                id="receiver"
                                type="text"
                                value={receiver}
                                onChange={e => setReceiver(e.target.value)}
                                placeholder="0x..."
                                disabled={!isOwner || !isSepolia}
                                className={`form-input text-mono ${errorMessage && !isAddress(receiver || '') && receiver ? 'form-input-error' : ''}`}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="amount" className="form-label">Transfer Amount</label>
                            <div className="form-input-addon-wrapper">
                                <input
                                    id="amount"
                                    type="number"
                                    step="any"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    disabled={!isOwner || !isSepolia}
                                    className="form-input"
                                    style={{ paddingRight: '3.5rem' }}
                                />
                                <span className="form-input-addon">ETH</span>
                            </div>
                        </div>

                        {errorMessage && (
                            <div className="alert-box alert-danger" style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem' }}>
                                <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
                                <span style={{ fontSize: '0.8125rem' }}>{errorMessage}</span>
                            </div>
                        )}

                        <button type="submit" disabled={!isOwner || !isSepolia} className="btn btn-primary">
                            Review Transaction
                            <ArrowRight style={{ width: 16, height: 16 }} />
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <div>
                        <h2 style={{ marginBottom: '1.25rem', fontSize: '0.9375rem' }}>Review Transaction</h2>
                        <div className="divide-y" style={{ marginBottom: '1.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                            <div className="modal-detail-row" style={{ padding: '0.875rem 1rem' }}>
                                <span className="modal-detail-label">Recipient</span>
                                <span className="modal-detail-value" style={{ fontSize: '0.75rem' }}>{receiver}</span>
                            </div>
                            <div className="modal-detail-row" style={{ padding: '0.875rem 1rem' }}>
                                <span className="modal-detail-label">Amount</span>
                                <span className="modal-detail-value text-primary font-bold">{amount} ETH</span>
                            </div>
                            <div className="modal-detail-row" style={{ padding: '0.875rem 1rem' }}>
                                <span className="modal-detail-label">Network</span>
                                <span className="badge badge-success">Sepolia Testnet</span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setStep(1)} className="btn btn-secondary" style={{ flex: 1 }}>Back</button>
                            <button onClick={handleSend} className="btn btn-primary" style={{ flex: 1 }}>
                                Confirm & Send via MetaMask
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="flex flex-col items-center justify-center" style={{ padding: '3rem 0', gap: '1rem', textAlign: 'center' }}>
                        <Loader2 style={{ width: 40, height: 40, color: 'var(--primary)', animation: 'spin 0.7s linear infinite' }} />
                        <h3>Executing Smart Contract Call</h3>
                        <p style={{ fontSize: '0.8125rem', maxWidth: '28ch' }}>{statusMessage}</p>
                        {txHash && (
                            <span className="badge badge-primary text-mono" style={{ fontSize: '0.7rem' }}>
                                {formatAddress(txHash)}
                            </span>
                        )}
                    </div>
                )}

                {step === 4 && (
                    <div className="flex flex-col items-center justify-center" style={{ padding: '2rem 0', gap: '1.25rem', textAlign: 'center' }}>
                        <div style={{ width: 56, height: 56, background: 'var(--success-light)', border: '2px solid var(--success-border)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckCircle2 style={{ width: 28, height: 28, color: 'var(--success)' }} />
                        </div>
                        <div>
                            <h3 style={{ color: 'var(--success)' }}>Transaction Successful</h3>
                            <p style={{ fontSize: '0.8125rem', marginTop: '0.375rem', maxWidth: '32ch' }}>
                                Successfully sent {amount} ETH from the Smart Wallet.
                            </p>
                        </div>
                        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', width: '100%', maxWidth: 380, textAlign: 'left' }}>
                            <div className="modal-detail-row" style={{ padding: '0.375rem 0', borderTop: 'none' }}>
                                <span className="modal-detail-label" style={{ fontSize: '0.75rem' }}>Recipient</span>
                                <span className="modal-detail-value" style={{ fontSize: '0.75rem' }}>{formatAddress(receiver)}</span>
                            </div>
                            <div className="modal-detail-row" style={{ padding: '0.375rem 0' }}>
                                <span className="modal-detail-label" style={{ fontSize: '0.75rem' }}>Tx Hash</span>
                                <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noreferrer" className="modal-detail-value" style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>
                                    {formatAddress(txHash)}
                                </a>
                            </div>
                        </div>
                        <button onClick={handleReset} className="btn btn-secondary btn-sm" style={{ width: 'auto', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
                            Send Another
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
