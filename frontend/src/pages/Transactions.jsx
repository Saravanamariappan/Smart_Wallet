import React, { useState, useEffect } from "react";
import {
    ExternalLink,
    Search,
    Filter,
    ArrowUpRight,
    ArrowDownLeft,
    Coins,
    RefreshCw,
    Activity,
} from "lucide-react";
import { getTransactions } from "../services/api.js";
import { formatAddress, formatBalance } from "../utils/format.js";
import { SMART_WALLET_ADDRESS } from "../config/wallet.js";

function getStatusClass(status) {
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
            addToast({ title: "Database Error", message: "Failed to reload transaction logs.", type: "error" });
        } finally { setLoading(false); setRefreshing(false); }
    };

    const applyFiltersAndSearch = (list, type, query) => {
        let result = [...list];
        if (type !== "ALL") result = result.filter(tx => tx.transaction_type === type);
        if (query) {
            const q = query.toLowerCase();
            result = result.filter(tx =>
                tx.tx_hash.toLowerCase().includes(q) ||
                tx.to_address.toLowerCase().includes(q) ||
                tx.from_address.toLowerCase().includes(q)
            );
        }
        setFilteredTransactions(result);
    };

    useEffect(() => { fetchTransactionsList(); }, [backendConnected]);
    useEffect(() => { applyFiltersAndSearch(transactions, filterType, searchQuery); }, [filterType, searchQuery, transactions]);

    const handleRefresh = () => { setRefreshing(true); fetchTransactionsList(true); };

    const FILTER_TABS = [
        { key: "ALL", label: "All" },
        { key: "SEND", label: "Send" },
        { key: "RECEIVE", label: "Receive" },
        { key: "TOKEN_SEND", label: "Tokens" },
    ];

    return (
        <div className="page-enter space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 className="m-0">Transactions</h1>
                    <p className="page-subtitle">On-chain operations recorded in the database.</p>
                </div>
                <button onClick={handleRefresh} disabled={loading || refreshing} className="btn btn-secondary btn-sm" style={{ width: 'auto' }}>
                    <RefreshCw style={{ width: 14, height: 14 }} className={refreshing ? "animate-spin" : ""} />
                    Refresh
                </button>
            </div>

            {/* Search + Filter bar */}
            <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
                <div className="relative flex-1" style={{ minWidth: 200 }}>
                    <Search className="form-input-icon-left" style={{ width: 15, height: 15 }} />
                    <input
                        type="text"
                        placeholder="Search by address or hash..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="form-input form-input-with-icon-left"
                        style={{ padding: '0.625rem 1rem 0.625rem 2.25rem', fontSize: '0.8125rem' }}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter style={{ width: 15, height: 15, color: 'var(--text-muted)', flexShrink: 0 }} />
                    <div className="filter-tabs">
                        {FILTER_TABS.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setFilterType(tab.key)}
                                className={`filter-tab${filterType === tab.key ? ' active' : ''}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Transaction list */}
            {loading ? (
                <div className="flex items-center justify-center" style={{ minHeight: 280 }}>
                    <div className="spinner" />
                </div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    {filteredTransactions.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">
                                <Activity style={{ width: 26, height: 26 }} />
                            </div>
                            <p className="empty-state-title">No transactions found</p>
                            <p className="empty-state-desc">
                                {backendConnected
                                    ? searchQuery ? "Try a different search query." : "No matching transactions."
                                    : "Backend is offline — history unavailable."}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {filteredTransactions.map((tx) => {
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
                                                    ? <ArrowDownLeft style={{ width: 17, height: 17 }} />
                                                    : isToken
                                                        ? <Coins style={{ width: 17, height: 17 }} />
                                                        : <ArrowUpRight style={{ width: 17, height: 17 }} />
                                                }
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.125rem' }}>
                                                    {isToken ? "Send Token (ERC-20)" : isReceive ? "Receive ETH" : "Send ETH"}
                                                </div>
                                                <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)' }}>
                                                        {formatAddress(tx.tx_hash)}
                                                    </span>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>·</span>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                                                        {relativeTime(tx.created_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                            <div style={{ fontSize: '0.875rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: isReceive ? 'var(--success)' : 'var(--text-main)', marginBottom: '0.25rem' }}>
                                                {isReceive ? '+' : '−'}{tx.amount} {tx.token_address ? 'Tokens' : 'ETH'}
                                            </div>
                                            <span className={getStatusClass(tx.status)}>{getStatusLabel(tx.status)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Detail modal */}
            {selectedTx && (
                <div className="modal-overlay" onClick={() => setSelectedTx(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 style={{ margin: 0, fontSize: '0.9375rem' }}>Transaction Details</h3>
                            <button className="modal-close-btn" onClick={() => setSelectedTx(null)}>✕</button>
                        </div>
                        <div className="modal-body">
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
                                <span className={getStatusClass(selectedTx.status)}>{getStatusLabel(selectedTx.status)}</span>
                            </div>
                            <div className="modal-detail-row" style={{ flexDirection: 'column', gap: '0.25rem' }}>
                                <span className="modal-detail-label">Sender</span>
                                <span className="break-all" style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{selectedTx.from_address}</span>
                            </div>
                            <div className="modal-detail-row" style={{ flexDirection: 'column', gap: '0.25rem' }}>
                                <span className="modal-detail-label">Receiver</span>
                                <span className="break-all" style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{selectedTx.to_address}</span>
                            </div>
                            {selectedTx.token_address && (
                                <div className="modal-detail-row" style={{ flexDirection: 'column', gap: '0.25rem' }}>
                                    <span className="modal-detail-label">Token Contract</span>
                                    <span className="break-all" style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{selectedTx.token_address}</span>
                                </div>
                            )}
                            <div className="modal-detail-row" style={{ flexDirection: 'column', gap: '0.25rem' }}>
                                <span className="modal-detail-label">Hash</span>
                                <span className="break-all" style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>{selectedTx.tx_hash}</span>
                            </div>
                            {selectedTx.tx_hash && (
                                <a
                                    href={`https://sepolia.etherscan.io/tx/${selectedTx.tx_hash}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn btn-secondary btn-sm"
                                    style={{ marginTop: '1rem', width: '100%', textDecoration: 'none', justifyContent: 'center' }}
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
