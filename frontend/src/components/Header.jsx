import React, { useState } from "react";
import { ShieldAlert, ShieldCheck, Menu, Power, Copy, Check } from "lucide-react";
import { formatAddress } from "../utils/format.js";
import { SWalletBrand } from "./DecorativePetal.jsx";
import StyledButton from "./StyledButton.jsx";

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
        <header className="verdara-header">
            {/* Left: hamburger + brand lockup */}
            <div className="header-left">
                <button
                    onClick={() => setSidebarOpen((prev) => !prev)}
                    className="hamburger-btn mobile-only"
                    aria-label="Open sidebar"
                >
                    <Menu style={{ width: 18, height: 18 }} />
                </button>

                <div className="header-brand mobile-only">
                    <SWalletBrand size="sm" />
                </div>

                <div className="header-tagline-desktop lg-visible">
                    <SWalletBrand size="md" />
                    <span className="header-divider">/</span>
                    <span className="header-edition-sub">SEPOLIA TREASURY</span>
                </div>
            </div>

            {/* Right: status indicators + wallet */}
            <div className="header-actions">
                {/* Backend status */}
                <div className="backend-status-pill sm-hidden">
                    <span className={`backend-dot${backendConnected ? '' : ' backend-dot-offline'}`} />
                    <span className="backend-text">
                        {backendConnected ? 'Node Synced' : 'Backend Offline'}
                    </span>
                </div>

                {connectedAccount ? (
                    <div className="header-wallet-group">
                        {/* Network badge */}
                        {isSepolia ? (
                            <span className="network-badge-verdara md-hidden">
                                <span className="network-dot-verdara" />
                                <span>Sepolia</span>
                            </span>
                        ) : (
                            <StyledButton
                                onClick={onSwitchNetwork}
                                style={{ minWidth: "10em", height: "2.4em", fontSize: "13px" }}
                                title="Click to switch to Sepolia network"
                            >
                                <ShieldAlert style={{ width: 13, height: 13, marginRight: "4px" }} />
                                Switch to Sepolia
                            </StyledButton>
                        )}

                        {/* Owner badge */}
                        <span className={`owner-badge-verdara ${isOwner ? 'owner-badge-owner' : 'owner-badge-view'} sm-hidden`}>
                            {isOwner
                                ? <ShieldCheck style={{ width: 12, height: 12 }} />
                                : <ShieldAlert style={{ width: 12, height: 12 }} />
                            }
                            <span>{isOwner ? 'Signer' : 'Observer'}</span>
                        </span>

                        {/* Account address pill */}
                        <button
                            onClick={handleCopyAddress}
                            className="account-pill-verdara"
                            title={copiedAddress ? 'Copied to clipboard!' : 'Click to copy account address'}
                        >
                            <span className="account-pill-dot" />
                            <span className="account-pill-addr">{formatAddress(connectedAccount)}</span>
                            {copiedAddress
                                ? <Check style={{ width: 13, height: 13, color: 'var(--primary-dark)', flexShrink: 0 }} />
                                : <Copy style={{ width: 13, height: 13, opacity: 0.6, flexShrink: 0 }} />
                            }
                        </button>
                    </div>
                ) : (
                    <StyledButton
                        onClick={onConnect}
                        style={{ minWidth: "10em", height: "2.6em", fontSize: "14px" }}
                    >
                        <Power style={{ width: 15, height: 15, marginRight: "5px" }} />
                        Connect Wallet →
                    </StyledButton>
                )}
            </div>
        </header>
    );
}
