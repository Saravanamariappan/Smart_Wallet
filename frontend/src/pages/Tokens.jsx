import React, { useState, useEffect } from "react";
import { Coins, ShieldAlert, ArrowRight, CheckCircle2, Loader2, AlertCircle, Check } from "lucide-react";
import { TOKENS } from "../config/tokens.js";
import { formatAddress, formatBalance } from "../utils/format.js";
import { getTokenBalance, sendToken, waitForTransaction } from "../services/blockchain.js";
import { saveTransaction } from "../services/api.js";
import { SMART_WALLET_ADDRESS, CHAIN_ID } from "../config/wallet.js";
import { isAddress } from "viem";

const TOKEN_COLORS = [
    "token-icon-primary",
    "token-icon-teal",
    "token-icon-violet",
    "token-icon-amber",
];

export default function Tokens({ connectedAccount, isOwner, chainId, backendConnected, addToast }) {
    const [tokensList] = useState(TOKENS || []);
    const [selectedToken, setSelectedToken] = useState(null);
    const [balances, setBalances] = useState({});
    const [loadingBalances, setLoadingBalances] = useState(true);
    const [receiver, setReceiver] = useState("");
    const [amount, setAmount] = useState("");
    const [step, setStep] = useState(1);
    const [sending, setSending] = useState(false);
    const [txHash, setTxHash] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [statusMessage, setStatusMessage] = useState("");

    const isSepolia = chainId === 11155111;

    const fetchTokenBalances = async () => {
        setLoadingBalances(true);
        const newBalances = {};
        for (const token of tokensList) {
            if (token.address && isAddress(token.address)) {
                try {
                    const bal = await getTokenBalance(token.address);
                    newBalances[token.address] = parseFloat(bal) / 1e18;
                } catch (err) {
                    console.error(`Error fetching balance for ${token.symbol}:`, err);
                    newBalances[token.address] = 0;
                }
            } else { newBalances[token.address] = 0; }
        }
        setBalances(newBalances);
        setLoadingBalances(false);
    };

    useEffect(() => {
        fetchTokenBalances();
        const activeToken = tokensList.find(t => t.address && isAddress(t.address));
        if (activeToken) setSelectedToken(activeToken);
    }, [tokensList]);

    const handleSendToken = async (e) => {
        e.preventDefault();
        if (!selectedToken) return;
        if (!connectedAccount) { setErrorMessage("Please connect your MetaMask wallet."); return; }
        if (!isSepolia) { setErrorMessage("Please switch to Sepolia Testnet."); return; }
        if (!isOwner) { setErrorMessage("Only the owner can carry out this transaction."); return; }
        if (!receiver || !isAddress(receiver)) { setErrorMessage("Please enter a valid Ethereum recipient address."); return; }
        if (receiver.toLowerCase() === SMART_WALLET_ADDRESS.toLowerCase()) { setErrorMessage("Cannot send tokens to the SmartWallet itself."); return; }
        const val = parseFloat(amount);
        if (isNaN(val) || val <= 0) { setErrorMessage("Please enter an amount greater than 0."); return; }
        const tokenBal = balances[selectedToken.address] || 0;
        if (val > tokenBal) { setErrorMessage(`Insufficient balance: ${tokenBal} ${selectedToken.symbol}`); return; }

        setErrorMessage(""); setSending(true); setStep(2);
        setStatusMessage("Awaiting user confirmation in MetaMask...");
        try {
            const hash = await sendToken(selectedToken.address, receiver, amount);
            setTxHash(hash);
            addToast({ title: "Transaction Submitted", message: "ERC-20 token transfer submitted.", type: "success" });
            setStatusMessage("Waiting for receipt on-chain...");
            const receipt = await waitForTransaction(hash);
            if (receipt.status !== "success") throw new Error("Blockchain transaction failed.");
            setStatusMessage("Logging to backend...");
            if (backendConnected) {
                try {
                    await saveTransaction({ wallet_address: SMART_WALLET_ADDRESS, tx_hash: hash, from_address: SMART_WALLET_ADDRESS, to_address: receiver, amount, token_address: selectedToken.address, transaction_type: "TOKEN_SEND", status: "confirmed" });
                } catch (e) { addToast({ title: "DB Log Failed", message: "Transfer succeeded but failed to log.", type: "warning" }); }
            }
            setStep(3);
            addToast({ title: "Token Transferred", message: `Sent ${amount} ${selectedToken.symbol} to ${formatAddress(receiver)}.`, type: "success" });
            fetchTokenBalances();
        } catch (err) {
            const msg = err.message?.includes("User rejected") ? "Transaction cancelled in MetaMask." : err.message || "Token transfer failed.";
            setErrorMessage(msg); setStep(1);
            addToast({ title: "Transfer Failed", message: msg, type: "error" });
        } finally { setSending(false); }
    };

    const handleReset = () => { setReceiver(""); setAmount(""); setStep(1); setTxHash(""); setErrorMessage(""); };

    const hasConfiguredTokens = tokensList.some(t => t.address && isAddress(t.address));

    return (
        <div className="page-enter">
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 className="m-0">Tokens</h1>
                <p className="page-subtitle">ERC-20 asset balances and token transfers.</p>
            </div>

            <div className="grid" style={{ gap: '1.5rem', gridTemplateColumns: 'minmax(0,1fr)', alignItems: 'start' }}
                ref={el => { if (el && window.innerWidth >= 1024) { el.style.gridTemplateColumns = '280px minmax(0,1fr)'; } }}>

                {/* Token list column */}
                <div>
                    <h2 style={{ fontSize: '0.8125rem', marginBottom: '0.75rem' }}>Configured Assets</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {!hasConfiguredTokens ? (
                            <div className="alert-box alert-warning">
                                <ShieldAlert style={{ width: 16, height: 16, flexShrink: 0 }} />
                                <p style={{ fontSize: '0.8125rem' }}>No token contracts configured yet. Edit <code>src/config/tokens.js</code>.</p>
                            </div>
                        ) : tokensList.map((token, index) => {
                            const hasAddress = token.address && isAddress(token.address);
                            const isSelected = selectedToken?.address === token.address;
                            const balance = balances[token.address] || 0;
                            const colorClass = TOKEN_COLORS[index % TOKEN_COLORS.length];

                            return (
                                <button
                                    key={index}
                                    disabled={!hasAddress}
                                    onClick={() => { setSelectedToken(token); handleReset(); }}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '0.875rem 1rem', borderRadius: 'var(--radius-md)', border: '1.5px solid',
                                        borderColor: isSelected ? 'var(--primary-border)' : 'var(--border-color)',
                                        background: isSelected ? 'var(--primary-light)' : 'var(--bg-card)',
                                        cursor: hasAddress ? 'pointer' : 'not-allowed', opacity: hasAddress ? 1 : 0.55,
                                        transition: 'all 0.2s ease', textAlign: 'left', fontFamily: 'var(--font-sans)',
                                        boxShadow: isSelected ? 'var(--shadow-primary)' : 'var(--shadow-xs)',
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`token-icon ${colorClass}`} style={{ fontSize: '0.625rem' }}>
                                            {token.symbol?.slice(0, 3).toUpperCase()}
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: isSelected ? 'var(--primary)' : 'var(--text-main)' }}>
                                                {token.name}
                                            </div>
                                            <div style={{ fontSize: '0.6875rem', color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)', marginTop: '0.125rem' }}>
                                                {hasAddress ? formatAddress(token.address) : "Not Configured"}
                                            </div>
                                        </div>
                                    </div>
                                    {hasAddress && (
                                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                            {loadingBalances ? (
                                                <div className="spinner spinner-sm" style={{ marginLeft: 'auto' }} />
                                            ) : (
                                                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.875rem', color: isSelected ? 'var(--primary)' : 'var(--text-main)' }}>
                                                    {formatBalance(balance, 4)}
                                                </div>
                                            )}
                                            <div style={{ fontSize: '0.6875rem', color: 'var(--text-subtle)', fontWeight: 600 }}>{token.symbol}</div>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Send Token panel */}
                <div>
                    <h2 style={{ fontSize: '0.8125rem', marginBottom: '0.75rem' }}>Send Token</h2>

                    {!hasConfiguredTokens ? (
                        <div className="card flex flex-col items-center justify-center" style={{ padding: '3rem', textAlign: 'center', gap: '0.875rem' }}>
                            <div className="empty-state-icon"><Coins style={{ width: 26, height: 26 }} /></div>
                            <p className="empty-state-title">No Token Contracts</p>
                            <p className="empty-state-desc">Add deployed ERC-20 addresses in <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>src/config/tokens.js</code>.</p>
                        </div>
                    ) : selectedToken ? (
                        <div className="card" style={{ padding: '2rem' }}>
                            {step === 1 && (
                                <form onSubmit={handleSendToken}>
                                    {/* Selected token info */}
                                    <div className="flex items-center gap-3" style={{ padding: '0.875rem 1rem', background: 'var(--primary-light)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', border: '1px solid var(--primary-border)' }}>
                                        <div className={`token-icon ${TOKEN_COLORS[tokensList.findIndex(t => t.address === selectedToken.address) % TOKEN_COLORS.length]}`} style={{ width: 32, height: 32, fontSize: '0.5625rem' }}>
                                            {selectedToken.symbol?.slice(0, 3).toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)' }}>{selectedToken.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--primary)', opacity: 0.75, fontFamily: 'var(--font-mono)' }}>
                                                Balance: {loadingBalances ? '...' : formatBalance(balances[selectedToken.address] || 0, 4)} {selectedToken.symbol}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="tk-receiver" className="form-label">Recipient Address</label>
                                        <input id="tk-receiver" type="text" value={receiver} onChange={e => setReceiver(e.target.value)} placeholder="0x..." disabled={!isOwner || !isSepolia} className="form-input text-mono" />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="tk-amount" className="form-label">Amount ({selectedToken.symbol})</label>
                                        <div className="form-input-addon-wrapper">
                                            <input id="tk-amount" type="number" step="any" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" disabled={!isOwner || !isSepolia} className="form-input" style={{ paddingRight: '4rem' }} />
                                            <span className="form-input-addon">{selectedToken.symbol}</span>
                                        </div>
                                    </div>

                                    {errorMessage && (
                                        <div className="alert-box alert-danger" style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem' }}>
                                            <AlertCircle style={{ width: 15, height: 15, flexShrink: 0 }} />
                                            <span style={{ fontSize: '0.8125rem' }}>{errorMessage}</span>
                                        </div>
                                    )}

                                    <button type="submit" disabled={!isOwner || !isSepolia} className="btn btn-primary">
                                        Submit via MetaMask
                                        <ArrowRight style={{ width: 16, height: 16 }} />
                                    </button>
                                </form>
                            )}

                            {step === 2 && (
                                <div className="flex flex-col items-center justify-center" style={{ padding: '3rem 0', gap: '1rem', textAlign: 'center' }}>
                                    <Loader2 style={{ width: 40, height: 40, color: 'var(--primary)', animation: 'spin 0.7s linear infinite' }} />
                                    <h3>Executing Token Transfer</h3>
                                    <p style={{ fontSize: '0.8125rem', maxWidth: '28ch' }}>{statusMessage}</p>
                                    {txHash && <span className="badge badge-primary text-mono" style={{ fontSize: '0.7rem' }}>{formatAddress(txHash)}</span>}
                                </div>
                            )}

                            {step === 3 && (
                                <div className="flex flex-col items-center justify-center" style={{ padding: '2rem 0', gap: '1.25rem', textAlign: 'center' }}>
                                    <div style={{ width: 56, height: 56, background: 'var(--success-light)', border: '2px solid var(--success-border)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <CheckCircle2 style={{ width: 28, height: 28, color: 'var(--success)' }} />
                                    </div>
                                    <div>
                                        <h3 style={{ color: 'var(--success)' }}>Transfer Succeeded</h3>
                                        <p style={{ fontSize: '0.8125rem', marginTop: '0.375rem' }}>
                                            Sent {amount} {selectedToken.symbol} from the Smart Wallet.
                                        </p>
                                    </div>
                                    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', width: '100%', textAlign: 'left' }}>
                                        <div className="modal-detail-row" style={{ padding: '0.375rem 0', borderTop: 'none' }}>
                                            <span className="modal-detail-label" style={{ fontSize: '0.75rem' }}>Recipient</span>
                                            <span className="modal-detail-value" style={{ fontSize: '0.75rem' }}>{formatAddress(receiver)}</span>
                                        </div>
                                        <div className="modal-detail-row" style={{ padding: '0.375rem 0' }}>
                                            <span className="modal-detail-label" style={{ fontSize: '0.75rem' }}>Tx Hash</span>
                                            <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noreferrer" className="modal-detail-value" style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>{formatAddress(txHash)}</a>
                                        </div>
                                    </div>
                                    <button onClick={handleReset} className="btn btn-secondary btn-sm" style={{ width: 'auto', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>Send Another</button>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
