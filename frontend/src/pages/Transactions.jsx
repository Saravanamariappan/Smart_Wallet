import React, { useState, useEffect } from "react";
import {
    ExternalLink,
    Search,
    ArrowUpRight,
    ArrowDownLeft,
    Coins,
    RefreshCw,
    X,
    Clock,
} from "lucide-react";
import { getTransactions } from "../services/api.js";
import { formatAddress } from "../utils/format.js";
import { SMART_WALLET_ADDRESS } from "../config/wallet.js";
import { PetalIcon, SunburstShape } from "../components/DecorativePetal.jsx";
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

function relativeTime(dateStr) {
    if (!dateStr) return "Recently";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export default function Transactions({ backendConnected, addToast }) {
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTx, setSelectedTx] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchTransactionsList = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            if (backendConnected) {
                const txRes = await getTransactions(SMART_WALLET_ADDRESS);
                if (txRes.success) {
                    setTransactions(txRes.transactions);
                    applyFiltersAndSearch(txRes.transactions, filterType, searchQuery);
                }
            } else {
                setTransactions([]);
                setFilteredTransactions([]);
            }
        } catch (error) {
            console.error("Error loading transactions:", error);
            addToast({ title: "Database Error", message: "Failed to reload transaction logs from backend.", type: "error" });
        } finally { setLoading(false); setRefreshing(false); }
    };

    const applyFiltersAndSearch = (list, type, query) => {
        let result = [...list];
        if (type !== "ALL") result = result.filter(tx => tx.transaction_type === type);
        if (query) {
            const q = query.toLowerCase();
            result = result.filter(tx =>
                (tx.tx_hash && tx.tx_hash.toLowerCase().includes(q)) ||
                (tx.to_address && tx.to_address.toLowerCase().includes(q)) ||
                (tx.from_address && tx.from_address.toLowerCase().includes(q))
            );
        }
        setFilteredTransactions(result);
    };

    useEffect(() => { fetchTransactionsList(); }, [backendConnected]);
    useEffect(() => { applyFiltersAndSearch(transactions, filterType, searchQuery); }, [filterType, searchQuery, transactions]);

    const handleRefresh = () => { setRefreshing(true); fetchTransactionsList(true); };

    const FILTER_TABS = [
        { key: "ALL", label: "All Records" },
        { key: "SEND", label: "Sent" },
        { key: "RECEIVE", label: "Received" },
        { key: "TOKEN_SEND", label: "ERC-20 Tokens" },
    ];

    return (
        <div className="page-enter verdara-transactions-page">
            {/* Header */}
            <div className="verdara-page-header">
                <div>
                    <div className="verdara-page-tag font-rakkas">
                        <PetalIcon size={13} color="var(--primary-dark)" />
                        <span>AUDIT LEDGER</span>
                    </div>
                    <h1 className="verdara-page-title font-merriweather">
                        Transactions
                    </h1>
                    <p className="verdara-page-subtitle font-rakkas">
                        On-chain operations recorded in the database.
                    </p>
                </div>
                <StyledButton
                    onClick={handleRefresh}
                    disabled={loading || refreshing}
                >
                    <RefreshCw style={{ width: 14, height: 14, marginRight: "6px" }} className={refreshing ? "animate-spin text-forest" : ""} />
                    Refresh List
                </StyledButton>
            </div>

            {/* Filter & Search Bar */}
            <div className="verdara-filter-bar">
                <div className="verdara-search-wrap">
                    <Search className="verdara-search-icon" style={{ width: 16, height: 16 }} />
                    <input
                        type="text"
                        placeholder="Search by address or transaction hash..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="verdara-search-input font-script"
                        style={{ fontSize: "1.05rem" }}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="verdara-search-clear font-sans"
                            aria-label="Clear search"
                        >
                            ✕
                        </button>
                    )}
                </div>

                <div className="verdara-tab-group">
                    {FILTER_TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setFilterType(tab.key)}
                            className={`verdara-tab-btn font-sans ${filterType === tab.key ? 'active' : ''}`}
                        >
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content List */}
            {loading ? (
                <div className="verdara-loading-container">
                    <div className="verdara-spinner-seal">
                        <PetalIcon size={36} color="var(--primary-dark)" className="animate-spin-slow" />
                    </div>
                    <p className="verdara-loading-text font-rakkas">Loading transaction records...</p>
                </div>
            ) : filteredTransactions.length === 0 ? (
                <div className="verdara-empty-ledger">
                    <div className="verdara-empty-icon-wrap">
                        <SunburstShape size={80} color="#143A28" opacity={0.15} />
                    </div>
                    <p className="verdara-empty-title font-merriweather">No activity yet</p>
                    <p className="verdara-empty-desc font-rakkas">
                        {backendConnected
                            ? (searchQuery || filterType !== "ALL"
                                ? "No transaction records matched your search query or filter."
                                : "The vault transaction ledger is currently empty.")
                            : "Backend is offline — transaction history unavailable."}
                    </p>
                </div>
            ) : (
                <div className="verdara-tx-cards-stack">
                    {filteredTransactions.map((tx) => {
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
                                            <ArrowDownLeft style={{ width: 17, height: 17 }} />
                                        ) : isToken ? (
                                            <Coins style={{ width: 17, height: 17 }} />
                                        ) : (
                                            <ArrowUpRight style={{ width: 17, height: 17 }} />
                                        )}
                                    </div>
                                    <div className="verdara-tx-card-meta">
                                        <div className="flex items-center gap-2">
                                            <span className="verdara-tx-card-title font-merriweather">
                                                {isToken ? "Token Send" : isReceive ? "Receive ETH" : "Send ETH"}
                                            </span>
                                            {tx.created_at && (
                                                <span className="verdara-tx-time-badge font-rakkas">
                                                    <Clock style={{ width: 10, height: 10 }} />
                                                    {relativeTime(tx.created_at)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="verdara-tx-card-hash font-script" style={{ fontSize: "1.05rem" }}>
                                            <span>Hash:</span> {formatAddress(tx.tx_hash)}
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

            {/* Modal Detail */}
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
                                    className="verdara-modal-explorer-btn font-sans"
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
