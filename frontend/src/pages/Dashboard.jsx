import React, { useState, useEffect } from "react";
import {
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    Coins,
    ShieldCheck,
    Globe,
    ExternalLink,
    Copy,
    Check,
    RefreshCw,
    Activity,
} from "lucide-react";
import { formatAddress, formatBalance } from "../utils/format.js";
import { getTransactions, getWalletInfo } from "../services/api.js";
import { getSmartWalletBalance } from "../services/blockchain.js";
import { SMART_WALLET_ADDRESS } from "../config/wallet.js";

function getStatusBadgeClass(status) {
    const isSuccess = status === "confirmed" || status === "success" || status === 1;
    const isError = status === "failed" || status === 0;
    if (isSuccess) return "badge badge-success";
    if (isError) return "badge badge-danger";
    return "badge badge-warning";
}

function getStatusLabel(status) {
    if (status === 1 || status === "success" || status === "confirmed") return "Confirmed";
    if (status === 0 || status === "failed") return "Failed";
    return "Pending";
}

export default function Dashboard({
    connectedAccount,
    isOwner,
    backendConnected,
    addToast,
    setCurrentPage,
}) {
    const [balance, setBalance] = useState({ wei: "0", eth: "0.00" });
    const [contractOwner, setContractOwner] = useState("");
    const [usdPrice, setUsdPrice] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedTx, setSelectedTx] = useState(null);

    const fetchDashboardData = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            let ethBal = "0.00";
            let ethWei = "0";
            try {
                const bal = await getSmartWalletBalance();
                ethBal = bal.eth;
                ethWei = bal.wei;
            } catch (err) {
                console.error("Blockchain balance error:", err);
            }
            setBalance({ wei: ethWei, eth: ethBal });

            if (backendConnected) {
                try {
                    const walletInfo = await getWalletInfo();
                    if (walletInfo.success) {
                        setContractOwner(walletInfo.owner);
                        if (!ethBal || ethBal === "0.00") {
                            setBalance({ wei: walletInfo.balance.wei, eth: walletInfo.balance.eth });
                        }
                    }
                } catch (err) { console.error("Backend getWallet error:", err); }

                try {
                    const txRes = await getTransactions(SMART_WALLET_ADDRESS);
                    if (txRes.success) setTransactions(txRes.transactions.slice(0, 5));
                } catch (err) { console.error("Backend transactions error:", err); }
            } else {
                setContractOwner("0x8Be9a794b20fd7E858dEA502d5d8EAd12613496E");
                setTransactions([]);
            }

            try {
                const priceRes = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
                const data = await priceRes.json();
                if (data?.ethereum?.usd) setUsdPrice(data.ethereum.usd);
            } catch (err) { console.warn("ETH price fetch failed:", err); }

        } catch (error) {
            console.error("Dashboard loading error:", error);
            addToast({ title: "Error refreshing data", message: "Failed to query the blockchain or backend APIs.", type: "error" });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchDashboardData(); }, [backendConnected]);

    const handleCopy = () => {
        navigator.clipboard.writeText(SMART_WALLET_ADDRESS);
        setCopied(true);
        addToast({ title: "Copied!", message: "Contract address copied to clipboard.", type: "success", duration: 2000 });
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRefresh = () => { setRefreshing(true); fetchDashboardData(true); };

    const usdValue = usdPrice && balance.eth ? parseFloat(balance.eth) * usdPrice : null;
    const usdString = usdValue !== null ? `$${formatBalance(usdValue, 2)}` : null;

    return (
        <div className="page-enter space-y-6">
            {/* Page header */}
            <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 className="m-0">Dashboard</h1>
                    <p className="page-subtitle">Monitor balance, transactions, and ERC-20 assets.</p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={loading || refreshing}
                    className="btn btn-secondary btn-sm"
                    style={{ width: 'auto' }}
                >
                    <RefreshCw style={{ width: 14, height: 14 }} className={refreshing ? "animate-spin text-primary" : ""} />
                    Refresh
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center" style={{ minHeight: 320 }}>
                    <div className="spinner" />
                </div>
            ) : (
                <>
                    {/* Hero ETH balance card */}
                    <div className="hero-card">
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
                                <span className="hero-card-label">Smart Wallet Balance</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#86efac', display: 'inline-block', animation: 'pulse-dot 2s infinite' }} />
                                    <span style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>Live</span>
                                </div>
                            </div>
                            <div>
                                <span className="hero-card-balance">{formatBalance(balance.eth, 6)}</span>
                                <span className="hero-card-unit">ETH</span>
                            </div>
                            {usdString && <div className="hero-card-usd">≈ {usdString} USD</div>}

                            <div className="flex items-center gap-3" style={{ marginTop: '1.5rem', flexWrap: 'wrap' }}>
                                <button
                                    onClick={() => setCurrentPage("send")}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 'var(--radius-sm)', color: '#fff', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', backdropFilter: 'blur(4px)', fontFamily: 'var(--font-sans)', transition: 'all 0.2s ease' }}
                                >
                                    <ArrowUpRight style={{ width: 15, height: 15 }} />Send
                                </button>
                                <button
                                    onClick={() => setCurrentPage("receive")}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 'var(--radius-sm)', color: '#fff', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', backdropFilter: 'blur(4px)', fontFamily: 'var(--font-sans)', transition: 'all 0.2s ease' }}
                                >
                                    <ArrowDownLeft style={{ width: 15, height: 15 }} />Receive
                                </button>
                                <button
                                    onClick={handleCopy}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 'var(--radius-sm)', color: 'rgba(255,255,255,0.8)', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'var(--font-sans)', transition: 'all 0.2s ease' }}
                                >
                                    {copied ? <Check style={{ width: 14, height: 14 }} /> : <Copy style={{ width: 14, height: 14 }} />}
                                    {copied ? 'Copied!' : 'Copy Address'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stat cards */}
                    <div className="card-grid">
                        {/* Owner */}
                        <div className="stat-card">
                            <div className="stat-card-header">
                                <span className="stat-card-label">Wallet Owner</span>
                                <div className="stat-card-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                                    <ShieldCheck style={{ width: 18, height: 18 }} />
                                </div>
                            </div>
                            <div className="stat-card-value" style={{ fontSize: '0.9375rem', fontFamily: 'var(--font-mono)' }}>
                                {contractOwner ? formatAddress(contractOwner) : "Unknown"}
                            </div>
                            <div className="stat-card-sub">Only owner can send funds</div>
                        </div>

                        {/* Network */}
                        <div className="stat-card">
                            <div className="stat-card-header">
                                <span className="stat-card-label">Network</span>
                                <div className="stat-card-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
                                    <Globe style={{ width: 18, height: 18 }} />
                                </div>
                            </div>
                            <div className="stat-card-value" style={{ fontSize: '1rem', fontFamily: 'var(--font-sans)' }}>Ethereum Sepolia</div>
                            <div className="stat-card-sub" style={{ color: 'var(--success)' }}>Chain ID: 11155111</div>
                        </div>

                        {/* Contract status */}
                        <div className="stat-card">
                            <div className="stat-card-header">
                                <span className="stat-card-label">Contract Status</span>
                                <div className="stat-card-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
                                    <Activity style={{ width: 18, height: 18 }} />
                                </div>
                            </div>
                            <div className="stat-card-value" style={{ fontSize: '1rem', fontFamily: 'var(--font-sans)' }}>Active</div>
                            <div className="stat-card-sub text-mono">{formatAddress(SMART_WALLET_ADDRESS)}</div>
                        </div>

                        {/* Token assets */}
                        <div className="stat-card">
                            <div className="stat-card-header">
                                <span className="stat-card-label">Token Assets</span>
                                <div className="stat-card-icon" style={{ background: 'var(--accent-teal-light)', color: 'var(--accent-teal)' }}>
                                    <Coins style={{ width: 18, height: 18 }} />
                                </div>
                            </div>
                            <div className="stat-card-value" style={{ fontSize: '1rem', fontFamily: 'var(--font-sans)' }}>
                                <button
                                    onClick={() => setCurrentPage("tokens")}
                                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'var(--font-sans)', padding: 0 }}
                                >
                                    View Tokens →
                                </button>
                            </div>
                            <div className="stat-card-sub">ERC-20 balances</div>
                        </div>
                    </div>

                    {/* View-only warning */}
                    {connectedAccount && !isOwner && (
                        <div className="alert-box alert-warning">
                            <ShieldCheck style={{ width: 18, height: 18, flexShrink: 0, marginTop: 1 }} />
                            <div>
                                <p style={{ fontWeight: 700, color: 'var(--warning)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                                    View Only Mode
                                </p>
                                <p style={{ color: 'var(--warning)', fontSize: '0.8125rem', opacity: 0.85 }}>
                                    Connected wallet is not the SmartWallet owner. Send and withdraw actions are locked.
                                    Switch to <span className="text-mono font-bold">{formatAddress(contractOwner)}</span> in MetaMask.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Recent activity */}
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div className="flex items-center justify-between" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                            <div>
                                <h2 className="m-0" style={{ fontSize: '0.9375rem' }}>Recent Activity</h2>
                                <p style={{ fontSize: '0.75rem', marginTop: '0.125rem' }}>Latest 5 database transaction records.</p>
                            </div>
                            <button
                                onClick={() => setCurrentPage("transactions")}
                                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap' }}
                            >
                                View all →
                            </button>
                        </div>

                        {transactions.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">
                                    <Activity style={{ width: 26, height: 26 }} />
                                </div>
                                <p className="empty-state-title">No activity yet</p>
                                <p className="empty-state-desc">
                                    {backendConnected ? "No transactions found in the database." : "Backend is offline — transaction history unavailable."}
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {transactions.map((tx) => {
                                    const isReceive = tx.transaction_type === "RECEIVE" || tx.transaction_type === "DEPOSIT";
                                    const isToken = tx.transaction_type === "TOKEN_SEND";
                                    return (
                                        <div
                                            key={tx.id || tx.tx_hash}
                                            onClick={() => setSelectedTx(tx)}
                                            className="flex items-center justify-between"
                                            style={{ padding: '0.875rem 1.5rem', cursor: 'pointer', transition: 'background-color 0.15s ease' }}
                                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'}
                                            onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`tx-icon-badge ${isReceive ? 'tx-icon-badge-receive' : isToken ? 'tx-icon-badge-token' : 'tx-icon-badge-send'}`}>
                                                    {isReceive
                                                        ? <ArrowDownLeft style={{ width: 16, height: 16 }} />
                                                        : isToken
                                                            ? <Coins style={{ width: 16, height: 16 }} />
                                                            : <ArrowUpRight style={{ width: 16, height: 16 }} />
                                                    }
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                                        {isToken ? "Token Send" : isReceive ? "Receive ETH" : "Send ETH"}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)' }}>
                                                        {formatAddress(tx.tx_hash)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '0.875rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: isReceive ? 'var(--success)' : 'var(--text-main)' }}>
                                                    {isReceive ? '+' : '−'}{tx.amount} {tx.token_address ? 'Tokens' : 'ETH'}
                                                </div>
                                                <span className={getStatusBadgeClass(tx.status)} style={{ marginTop: '0.25rem', display: 'inline-flex' }}>
                                                    {getStatusLabel(tx.status)}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Transaction detail modal */}
            {selectedTx && (
                <div className="modal-overlay" onClick={() => setSelectedTx(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 style={{ margin: 0 }}>Transaction Details</h3>
                            <button className="modal-close-btn" onClick={() => setSelectedTx(null)}>✕</button>
                        </div>
                        <div className="modal-body space-y-4">
                            <div className="modal-detail-row">
                                <span className="modal-detail-label">Type</span>
                                <span className="modal-detail-value" style={{ fontFamily: 'var(--font-sans)' }}>{selectedTx.transaction_type}</span>
                            </div>
                            <div className="modal-detail-row">
                                <span className="modal-detail-label">Amount</span>
                                <span className="modal-detail-value">{selectedTx.amount} {selectedTx.token_address ? "ERC-20" : "ETH"}</span>
                            </div>
                            <div className="modal-detail-row">
                                <span className="modal-detail-label">Status</span>
                                <span className={getStatusBadgeClass(selectedTx.status)}>{getStatusLabel(selectedTx.status)}</span>
                            </div>
                            <div className="modal-detail-row" style={{ flexDirection: 'column', gap: '0.25rem' }}>
                                <span className="modal-detail-label">Sender</span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>{selectedTx.from_address}</span>
                            </div>
                            <div className="modal-detail-row" style={{ flexDirection: 'column', gap: '0.25rem' }}>
                                <span className="modal-detail-label">Receiver</span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>{selectedTx.to_address}</span>
                            </div>
                            <div className="modal-detail-row" style={{ flexDirection: 'column', gap: '0.25rem' }}>
                                <span className="modal-detail-label">Hash</span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--primary)', wordBreak: 'break-all' }}>{selectedTx.tx_hash}</span>
                            </div>
                            {selectedTx.tx_hash && (
                                <a
                                    href={`https://sepolia.etherscan.io/tx/${selectedTx.tx_hash}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn btn-secondary btn-sm"
                                    style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center', textDecoration: 'none' }}
                                >
                                    View on Sepolia Explorer <ExternalLink style={{ width: 13, height: 13 }} />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
