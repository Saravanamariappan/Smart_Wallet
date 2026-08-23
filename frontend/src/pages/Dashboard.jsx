import React, { useState, useEffect } from "react";
import {
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
    Lock,
    X,
} from "lucide-react";
import { formatAddress, formatBalance } from "../utils/format.js";
import { getTransactions, getWalletInfo } from "../services/api.js";
import { getSmartWalletBalance } from "../services/blockchain.js";
import { SMART_WALLET_ADDRESS } from "../config/wallet.js";
import { SunburstShape, PetalIcon } from "../components/DecorativePetal.jsx";
import StyledButton from "../components/StyledButton.jsx";

function getStatusBadgeClass(status) {
    const isSuccess = status === "confirmed" || status === "success" || status === 1;
    const isError = status === "failed" || status === 0;
    if (isSuccess) return "status-chip-confirmed";
    if (isError) return "status-chip-failed";
    return "status-chip-pending";
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
        addToast({ title: "Address Copied", message: "S Wallet contract address copied to clipboard.", type: "success", duration: 2500 });
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRefresh = () => { setRefreshing(true); fetchDashboardData(true); };

    const usdValue = usdPrice && balance.eth ? parseFloat(balance.eth) * usdPrice : null;
    const usdString = usdValue !== null ? `$${formatBalance(usdValue, 2)}` : null;

    return (
        <div className="page-enter verdara-dashboard-page">
            {/* Page Header */}
            <div className="verdara-page-header">
                <div>
                    <div className="verdara-page-tag font-rakkas">
                        <PetalIcon size={14} color="var(--primary-dark)" />
                        <span>S WALLET TREASURY</span>
                    </div>
                    <h1 className="verdara-page-title font-merriweather">
                        Dashboard
                    </h1>
                    <p className="verdara-page-subtitle font-rakkas">
                        Monitor balance, transaction logs, and manage configured ERC-20 assets.
                    </p>
                </div>
                <div className="verdara-header-actions-bar">
                    <StyledButton
                        onClick={handleRefresh}
                        disabled={loading || refreshing}
                        title="Reload balances and logs"
                    >
                        <RefreshCw style={{ width: 14, height: 14, marginRight: "6px" }} className={refreshing ? "animate-spin text-forest" : ""} />
                        Refresh Dashboard
                    </StyledButton>
                </div>
            </div>

            {loading ? (
                <div className="verdara-loading-container">
                    <div className="verdara-spinner-seal">
                        <PetalIcon size={44} color="var(--primary-dark)" className="animate-spin-slow" />
                    </div>
                    <p className="verdara-loading-text font-rakkas">Synchronizing S Wallet blockchain state...</p>
                </div>
            ) : (
                <>
                    {/* Hero Card: Total ETH Balance */}
                    <div className="verdara-hero-card">
                        <div className="verdara-hero-watermark">
                            <SunburstShape size={320} color="#C8D6B4" opacity={0.08} />
                        </div>

                        <div className="verdara-hero-content">
                            <div className="verdara-hero-top">
                                <div className="verdara-hero-tag font-rakkas">
                                    <span className="verdara-hero-tag-bullet">❋</span>
                                    <span>VAULT LIQUIDITY</span>
                                </div>
                                <div className="verdara-hero-live-pill font-rakkas">
                                    <span className="verdara-live-dot" />
                                    <span>Sepolia Mainline</span>
                                </div>
                            </div>

                            <div className="verdara-hero-balance-wrap">
                                <span className="verdara-hero-balance-label font-rakkas">Total S Wallet Balance</span>
                                <div className="verdara-hero-balance-row">
                                    <span className="verdara-hero-balance-val font-merriweather">
                                        {formatBalance(balance.eth, 6)}
                                    </span>
                                    <span className="verdara-hero-balance-currency font-merriweather">ETH</span>
                                    {usdString && (
                                        <div className="verdara-hero-usd-badge font-rakkas">
                                            <span>≈ {usdString} USD</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="verdara-hero-buttons">
                                <StyledButton
                                    onClick={() => setCurrentPage("send")}
                                >
                                    Send ETH <ArrowUpRight style={{ width: 16, height: 16, marginLeft: "4px" }} />
                                </StyledButton>
                                <StyledButton
                                    onClick={() => setCurrentPage("receive")}
                                >
                                    Receive Assets <ArrowDownLeft style={{ width: 16, height: 16, marginLeft: "4px" }} />
                                </StyledButton>
                                <StyledButton
                                    onClick={handleCopy}
                                >
                                    {copied ? <Check style={{ width: 14, height: 14, marginRight: "6px" }} /> : <Copy style={{ width: 14, height: 14, marginRight: "6px" }} />}
                                    {copied ? "Address Copied" : "Copy Wallet Address"}
                                </StyledButton>
                            </div>
                        </div>
                    </div>

                    {/* Bento Stat Card Grid (Palette: Ochre, Coral, Sky Blue, Sage) */}
                    <div className="verdara-bento-grid">
                        {/* 1. Wallet Owner (Warm Ochre #F2B233) */}
                        <div className="bento-card bento-card-ochre">
                            <div className="bento-card-watermark">
                                <ShieldCheck size={96} style={{ opacity: 0.12 }} />
                            </div>
                            <div className="bento-card-header">
                                <div className="bento-card-icon-wrap">
                                    <ShieldCheck style={{ width: 18, height: 18 }} />
                                </div>
                                <span className="bento-card-title font-merriweather">Wallet Owner</span>
                            </div>
                            <div className="bento-card-value font-script" style={{ fontSize: "1.2rem" }}>
                                {contractOwner ? formatAddress(contractOwner) : "0x8Be9...496E"}
                            </div>
                            <div className="bento-card-sub font-rakkas">
                                {isOwner ? "✓ Authorized Signer (You)" : "Observer Mode — Read Only"}
                            </div>
                        </div>

                        {/* 2. Network Card (Coral #EC6A47) */}
                        <div className="bento-card bento-card-coral">
                            <div className="bento-card-watermark">
                                <Globe size={96} style={{ opacity: 0.14 }} />
                            </div>
                            <div className="bento-card-header">
                                <div className="bento-card-icon-wrap">
                                    <Globe style={{ width: 18, height: 18 }} />
                                </div>
                                <span className="bento-card-title font-merriweather">Network</span>
                            </div>
                            <div className="bento-card-value font-merriweather" style={{ fontSize: "1.2rem" }}>Ethereum Sepolia</div>
                            <div className="bento-card-sub font-rakkas">Chain ID: 11155111 • Testnet</div>
                        </div>

                        {/* 3. Contract Status (Sky Blue #9DC0E5) */}
                        <div className="bento-card bento-card-sky">
                            <div className="bento-card-watermark">
                                <Activity size={96} style={{ opacity: 0.14 }} />
                            </div>
                            <div className="bento-card-header">
                                <div className="bento-card-icon-wrap">
                                    <Activity style={{ width: 18, height: 18 }} />
                                </div>
                                <span className="bento-card-title font-merriweather">Contract Status</span>
                            </div>
                            <div className="bento-card-value flex items-center gap-2 font-merriweather" style={{ fontSize: "1.1rem" }}>
                                <span className="bento-active-indicator" />
                                <span>Active</span>
                            </div>
                            <div className="bento-card-sub font-script" style={{ fontSize: "1.1rem" }}>
                                {formatAddress(SMART_WALLET_ADDRESS)}
                            </div>
                        </div>

                        {/* 4. Token Assets (Sage Green #C8D6B4) */}
                        <div className="bento-card bento-card-sage">
                            <div className="bento-card-watermark">
                                <Coins size={96} style={{ opacity: 0.15 }} />
                            </div>
                            <div className="bento-card-header">
                                <div className="bento-card-icon-wrap">
                                    <Coins style={{ width: 18, height: 18 }} />
                                </div>
                                <span className="bento-card-title font-merriweather">Asset Tokens</span>
                            </div>
                            <div className="bento-card-value">
                                <StyledButton
                                    onClick={() => setCurrentPage("tokens")}
                                    style={{ minWidth: "7.5em", height: "2.4em", fontSize: "13px" }}
                                >
                                    View Tokens <ArrowUpRight style={{ width: 14, height: 14, marginLeft: "4px" }} />
                                </StyledButton>
                            </div>
                            <div className="bento-card-sub font-rakkas">ERC-20 Holdings & Transfer</div>
                        </div>
                    </div>

                    {/* View-only notification */}
                    {connectedAccount && !isOwner && (
                        <div className="verdara-alert-viewonly">
                            <div className="verdara-alert-icon">
                                <Lock style={{ width: 18, height: 18 }} />
                            </div>
                            <div className="verdara-alert-body">
                                <p className="verdara-alert-title font-merriweather">Observer Mode Active</p>
                                <p className="verdara-alert-desc font-rakkas">
                                    Connected account is not the S Wallet owner. Send and withdraw actions are locked.
                                    Switch to <strong className="font-script" style={{ fontSize: "1.05rem" }}>{formatAddress(contractOwner || "0x8Be9a794b20fd7E858dEA502d5d8EAd12613496E")}</strong> in MetaMask.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Recent Activity: Ledger Section */}
                    <div className="verdara-ledger-container">
                        <div className="verdara-ledger-header">
                            <div>
                                <h2 className="verdara-ledger-title font-merriweather">
                                    Recent Activity
                                </h2>
                                <p className="verdara-ledger-sub font-rakkas">Latest database transaction records.</p>
                            </div>
                            <StyledButton
                                onClick={() => setCurrentPage("transactions")}
                                style={{ minWidth: "7.5em", height: "2.4em", fontSize: "13px" }}
                            >
                                View all →
                            </StyledButton>
                        </div>

                        {transactions.length === 0 ? (
                            <div className="verdara-empty-ledger">
                                <div className="verdara-empty-icon-wrap">
                                    <SunburstShape size={72} color="#143A28" opacity={0.2} />
                                </div>
                                <p className="verdara-empty-title font-merriweather">No activity yet</p>
                                <p className="verdara-empty-desc font-rakkas">
                                    {backendConnected ? "No transactions found in the database." : "Backend is offline — transaction history unavailable."}
                                </p>
                            </div>
                        ) : (
                            <div className="verdara-tx-cards-stack">
                                {transactions.map((tx) => {
                                    const isReceive = tx.transaction_type === "RECEIVE" || tx.transaction_type === "DEPOSIT";
                                    const isToken = tx.transaction_type === "TOKEN_SEND";
                                    const typeClass = isReceive ? "tx-type-receive" : isToken ? "tx-type-token" : "tx-type-send";

                                    return (
                                        <div
                                            key={tx.id || tx.tx_hash}
                                            onClick={() => setSelectedTx(tx)}
                                            className={`verdara-tx-card ${typeClass}`}
                                        >
                                            <div className="verdara-tx-card-left">
                                                <div className="verdara-tx-card-icon-box">
                                                    {isReceive ? (
                                                        <ArrowDownLeft style={{ width: 16, height: 16 }} />
                                                    ) : isToken ? (
                                                        <Coins style={{ width: 16, height: 16 }} />
                                                    ) : (
                                                        <ArrowUpRight style={{ width: 16, height: 16 }} />
                                                    )}
                                                </div>
                                                <div className="verdara-tx-card-meta">
                                                    <div className="verdara-tx-card-title font-merriweather">
                                                        {isToken ? "Token Send" : isReceive ? "Receive ETH" : "Send ETH"}
                                                    </div>
                                                    <div className="verdara-tx-card-hash font-script" style={{ fontSize: "1.05rem" }}>
                                                        {formatAddress(tx.tx_hash)}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="verdara-tx-card-right">
                                                <div className="verdara-tx-card-amount font-merriweather">
                                                    <span className="verdara-tx-sign">{isReceive ? "+" : "−"}</span>
                                                    <span className="verdara-tx-val">{tx.amount}</span>
                                                    <span className="verdara-tx-unit">{tx.token_address ? "Tokens" : "ETH"}</span>
                                                </div>
                                                <div className="verdara-tx-card-chip-row">
                                                    <span className={`status-chip ${getStatusBadgeClass(tx.status)}`}>
                                                        {getStatusLabel(tx.status)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Transaction Detail Modal */}
            {selectedTx && (
                <div className="verdara-modal-overlay" onClick={() => setSelectedTx(null)}>
                    <div className="verdara-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="verdara-modal-header">
                            <div>
                                <h3 className="verdara-modal-title font-merriweather">Transaction Details</h3>
                            </div>
                            <button
                                className="verdara-modal-close-btn"
                                onClick={() => setSelectedTx(null)}
                                aria-label="Close modal"
                            >
                                <X style={{ width: 18, height: 18 }} />
                            </button>
                        </div>

                        <div className="verdara-modal-body">
                            <div className="verdara-modal-row">
                                <span className="verdara-modal-label font-rakkas">Type</span>
                                <span className="verdara-modal-value font-merriweather font-bold">
                                    {selectedTx.transaction_type}
                                </span>
                            </div>

                            <div className="verdara-modal-row">
                                <span className="verdara-modal-label font-rakkas">Amount</span>
                                <span className="verdara-modal-value font-merriweather text-lg font-bold">
                                    {selectedTx.amount} {selectedTx.token_address ? "ERC-20" : "ETH"}
                                </span>
                            </div>

                            <div className="verdara-modal-row">
                                <span className="verdara-modal-label font-rakkas">Status</span>
                                <span className={`status-chip ${getStatusBadgeClass(selectedTx.status)}`}>
                                    {getStatusLabel(selectedTx.status)}
                                </span>
                            </div>

                            <div className="verdara-modal-block">
                                <span className="verdara-modal-label font-rakkas">Sender (From)</span>
                                <div className="verdara-modal-mono-badge font-script" style={{ fontSize: "1.05rem" }}>
                                    {selectedTx.from_address}
                                </div>
                            </div>

                            <div className="verdara-modal-block">
                                <span className="verdara-modal-label font-rakkas">Receiver (To)</span>
                                <div className="verdara-modal-mono-badge font-script" style={{ fontSize: "1.05rem" }}>
                                    {selectedTx.to_address}
                                </div>
                            </div>

                            <div className="verdara-modal-block">
                                <span className="verdara-modal-label font-rakkas">Transaction Hash</span>
                                <div className="verdara-modal-mono-badge font-script text-forest" style={{ fontSize: "1.05rem" }}>
                                    {selectedTx.tx_hash}
                                </div>
                            </div>

                            {selectedTx.tx_hash && (
                                <a
                                    href={`https://sepolia.etherscan.io/tx/${selectedTx.tx_hash}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="verdara-modal-explorer-btn"
                                >
                                    <span>View on Sepolia Explorer</span>
                                    <ExternalLink style={{ width: 14, height: 14 }} />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
