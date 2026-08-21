import React, { useState } from "react";
import { Wallet, ShieldAlert, ShieldCheck, Menu, Power, Copy, Check } from "lucide-react";
import { formatAddress } from "../utils/format.js";

export default function Header({
    connectedAccount,
    isOwner,
    chainId,
    backendConnected,
    onConnect,
    onSwitchNetwork,
    setSidebarOpen,
}) {
    const isSepolia = chainId === 11155111;
    const [copiedAddress, setCopiedAddress] = useState(false);

    const handleCopyAddress = () => {
        if (!connectedAccount) return;
        navigator.clipboard.writeText(connectedAccount);
        setCopiedAddress(true);
        setTimeout(() => setCopiedAddress(false), 2000);
    };

    return (
        <header>
            {/* Left: hamburger + brand */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => setSidebarOpen((prev) => !prev)}
                    className="hamburger-btn mobile-only"
                    aria-label="Open sidebar"
                >
                    <Menu style={{ width: 18, height: 18 }} />
                </button>

                <div className="header-brand lg-hidden" style={{ display: 'none' }}>
                    {/* Brand shown in sidebar on desktop; shown in header on mobile */}
                </div>

                {/* Show brand in header only on mobile (sidebar is hidden) */}
                <div className="header-brand mobile-only" style={{ display: 'none' }}>
                    <div className="header-brand-icon">
                        <Wallet style={{ width: 16, height: 16 }} />
                    </div>
                    <span className="gradient-text">Smart Wallet</span>
                </div>
            </div>

            {/* Right: status indicators + wallet */}
            <div className="header-actions">
                {/* Backend status */}
                <div className="backend-status sm-hidden" style={{ display: 'flex' }}>
                    <span className={`backend-dot${backendConnected ? '' : ' backend-dot-offline'}`} />
                    <span>
                        {backendConnected ? 'Connected' : 'Offline'}
                    </span>
                </div>

                {connectedAccount ? (
                    <div className="flex items-center gap-2">
                        {/* Network badge */}
                        {isSepolia ? (
                            <span className="network-badge md-hidden" style={{ display: 'flex' }}>
                                <span className="network-badge-dot" />
                                Sepolia
                            </span>
                        ) : (
                            <button
                                onClick={onSwitchNetwork}
                                className="network-badge network-badge-wrong md-hidden"
                                style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.75rem', fontWeight: 600, display: 'flex' }}
                            >
                                <ShieldAlert style={{ width: 13, height: 13 }} />
                                Switch Network
                            </button>
                        )}

                        {/* Owner badge */}
                        <span className={`owner-badge ${isOwner ? 'owner-badge-owner' : 'owner-badge-view'} sm-hidden`} style={{ display: 'flex' }}>
                            {isOwner
                                ? <ShieldCheck style={{ width: 11, height: 11 }} />
                                : <ShieldAlert style={{ width: 11, height: 11 }} />
                            }
                            {isOwner ? 'Owner' : 'View Only'}
                        </span>

                        {/* Account address pill */}
                        <button
                            onClick={handleCopyAddress}
                            className="account-pill"
                            title={copiedAddress ? 'Copied!' : 'Click to copy address'}
                            style={{ border: 'none', fontFamily: 'var(--font-mono)' }}
                        >
                            <span className="account-pill-dot" />
                            {formatAddress(connectedAccount)}
                            {copiedAddress
                                ? <Check style={{ width: 13, height: 13, color: 'var(--success)', flexShrink: 0 }} />
                                : <Copy style={{ width: 13, height: 13, flexShrink: 0, opacity: 0.5 }} />
                            }
                        </button>
                    </div>
                ) : (
                    <button onClick={onConnect} className="btn-connect">
                        <Power style={{ width: 16, height: 16 }} />
                        Connect Wallet
                    </button>
                )}
            </div>
        </header>
    );
}
