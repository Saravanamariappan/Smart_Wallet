import React, { useState, useEffect } from "react";
import { Shield, Server, Globe, Copy, Check, Info, Moon, Sun, Cpu } from "lucide-react";
import { SMART_WALLET_ADDRESS, CHAIN_ID, BACKEND_URL } from "../config/wallet.js";
import { formatAddress } from "../utils/format.js";

function SettingRow({ label, sub, children }) {
    return (
        <div className="settings-row">
            <div>
                <div className="settings-row-label">{label}</div>
                {sub && <div className="settings-row-sub">{sub}</div>}
            </div>
            <div style={{ flexShrink: 0 }}>{children}</div>
        </div>
    );
}

function AddressRow({ label, value, copied, onCopy }) {
    return (
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</span>
                <button
                    onClick={onCopy}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'none', border: 'none', cursor: 'pointer', color: copied ? 'var(--success)' : 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--font-sans)', transition: 'color 0.2s ease', padding: 0 }}
                >
                    {copied ? <Check style={{ width: 13, height: 13 }} /> : <Copy style={{ width: 13, height: 13 }} />}
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <div className="copy-pill" style={{ display: 'block', fontSize: '0.75rem', lineHeight: 1.7 }}>
                {value}
            </div>
        </div>
    );
}

export default function Settings({ connectedAccount, isOwner, chainId, backendConnected, addToast }) {
    const [copiedContract, setCopiedContract] = useState(false);
    const [copiedWallet, setCopiedWallet] = useState(false);
    const [darkMode, setDarkMode] = useState(() => document.body.classList.contains('dark-mode'));

    const handleCopyContract = () => {
        navigator.clipboard.writeText(SMART_WALLET_ADDRESS);
        setCopiedContract(true);
        addToast({ title: "Copied!", message: "Smart Wallet contract address copied.", type: "success", duration: 2000 });
        setTimeout(() => setCopiedContract(false), 2000);
    };

    const handleCopyWallet = () => {
        if (!connectedAccount) return;
        navigator.clipboard.writeText(connectedAccount);
        setCopiedWallet(true);
        addToast({ title: "Copied!", message: "Connected account address copied.", type: "success", duration: 2000 });
        setTimeout(() => setCopiedWallet(false), 2000);
    };

    const handleDarkModeToggle = () => {
        const next = !darkMode;
        setDarkMode(next);
        document.body.classList.toggle('dark-mode', next);
    };

    return (
        <div className="page-enter" style={{ maxWidth: 760, margin: '0 auto' }}>
            <div style={{ marginBottom: '1.75rem' }}>
                <h1 className="m-0">Settings</h1>
                <p className="page-subtitle">Inspect configuration, infrastructure status, and display preferences.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Display Preferences */}
                <div className="settings-section">
                    <div className="settings-section-header">
                        <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-xs)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {darkMode ? <Moon style={{ width: 14, height: 14 }} /> : <Sun style={{ width: 14, height: 14 }} />}
                        </div>
                        <h3 className="settings-section-title">Display Preferences</h3>
                    </div>

                    <SettingRow label="Dark Mode" sub="Toggle between light and dark themes">
                        <label className="theme-switch" htmlFor="dark-toggle" aria-label="Toggle dark mode">
                            <input id="dark-toggle" type="checkbox" checked={darkMode} onChange={handleDarkModeToggle} />
                            <span className="theme-slider" />
                        </label>
                    </SettingRow>
                </div>

                {/* Connection Profile */}
                <div className="settings-section">
                    <div className="settings-section-header">
                        <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-xs)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Shield style={{ width: 14, height: 14 }} />
                        </div>
                        <h3 className="settings-section-title">Connection Profile</h3>
                    </div>

                    <AddressRow
                        label="Smart Wallet Contract"
                        value={SMART_WALLET_ADDRESS}
                        copied={copiedContract}
                        onCopy={handleCopyContract}
                    />
                    <AddressRow
                        label="Connected MetaMask Wallet"
                        value={connectedAccount || "Not Connected"}
                        copied={copiedWallet}
                        onCopy={handleCopyWallet}
                    />
                    <SettingRow label="Authorization Level" sub="Based on connected wallet">
                        <span className={`badge ${isOwner ? 'badge-primary' : 'badge-warning'}`}>
                            {isOwner ? 'Owner' : 'View Only'}
                        </span>
                    </SettingRow>
                </div>

                {/* Infrastructure Status */}
                <div className="settings-section">
                    <div className="settings-section-header">
                        <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-xs)', background: 'var(--info-light)', color: 'var(--info)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Server style={{ width: 14, height: 14 }} />
                        </div>
                        <h3 className="settings-section-title">Infrastructure Status</h3>
                    </div>

                    <SettingRow label="Backend Endpoint" sub={BACKEND_URL}>
                        <span className={`badge ${backendConnected ? 'badge-success' : 'badge-danger'}`}>
                            {backendConnected ? 'Online' : 'Offline'}
                        </span>
                    </SettingRow>
                    <SettingRow label="Network" sub="Ethereum Sepolia Testnet">
                        <span className="badge badge-neutral text-mono" style={{ fontSize: '0.7rem' }}>
                            Chain {CHAIN_ID}
                        </span>
                    </SettingRow>
                    <SettingRow label="MetaMask Provider" sub="Browser extension injection">
                        <span className={`badge ${typeof window !== 'undefined' && window.ethereum ? 'badge-success' : 'badge-danger'}`}>
                            {typeof window !== 'undefined' && window.ethereum ? 'Detected' : 'Not Found'}
                        </span>
                    </SettingRow>
                    <SettingRow label="Connected Chain ID" sub="Active network">
                        <span className="badge badge-neutral text-mono" style={{ fontSize: '0.7rem' }}>
                            {chainId}
                        </span>
                    </SettingRow>
                </div>

                {/* Security Notice */}
                <div className="alert-box alert-info" style={{ alignItems: 'flex-start' }}>
                    <Info style={{ width: 18, height: 18, flexShrink: 0, marginTop: 2 }} />
                    <div>
                        <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--info)', marginBottom: '0.375rem' }}>Security Notice</p>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--info)' }}>
                            All private signing keys remain stored within MetaMask or your verified environment. No private keys are stored on the server or in client session state. Transactions require explicit MetaMask signature approval.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
