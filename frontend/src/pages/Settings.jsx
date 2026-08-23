import React, { useState } from "react";
import { Shield, Globe, Copy, Check, ExternalLink, User, Mail } from "lucide-react";
import { SMART_WALLET_ADDRESS, BACKEND_URL } from "../config/wallet.js";
import { formatAddress } from "../utils/format.js";
import { PetalIcon } from "../components/DecorativePetal.jsx";
import StyledButton from "../components/StyledButton.jsx";

function SettingRow({ label, sub, children }) {
    return (
        <div className="verdara-settings-row">
            <div>
                <div className="verdara-settings-row-label font-merriweather">{label}</div>
                {sub && <div className="verdara-settings-row-sub font-rakkas">{sub}</div>}
            </div>
            <div style={{ flexShrink: 0 }}>{children}</div>
        </div>
    );
}

function AddressRow({ label, value, copied, onCopy }) {
    return (
        <div className="verdara-settings-addr-block">
            <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
                <span className="verdara-settings-addr-label font-rakkas">{label}</span>
                <button
                    onClick={onCopy}
                    className="verdara-btn-copy-subtle font-sans"
                >
                    {copied ? <Check style={{ width: 13, height: 13, color: "var(--primary-dark)" }} /> : <Copy style={{ width: 13, height: 13 }} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
            </div>
            <div className="verdara-settings-addr-pill font-script" style={{ fontSize: "1.15rem", lineHeight: 1.6 }}>
                {value}
            </div>
        </div>
    );
}

export default function Settings({ connectedAccount, isOwner, chainId, backendConnected, addToast }) {
    const [copiedContract, setCopiedContract] = useState(false);
    const [copiedWallet, setCopiedWallet] = useState(false);
    const [copiedEmail, setCopiedEmail] = useState(false);

    const handleCopyContract = () => {
        navigator.clipboard.writeText(SMART_WALLET_ADDRESS);
        setCopiedContract(true);
        addToast({ title: "Address Copied", message: "S Wallet contract address copied to clipboard.", type: "success", duration: 2000 });
        setTimeout(() => setCopiedContract(false), 2000);
    };

    const handleCopyWallet = () => {
        if (!connectedAccount) return;
        navigator.clipboard.writeText(connectedAccount);
        setCopiedWallet(true);
        addToast({ title: "Account Copied", message: "Connected account address copied to clipboard.", type: "success", duration: 2000 });
        setTimeout(() => setCopiedWallet(false), 2000);
    };

    const handleCopyEmail = () => {
        navigator.clipboard.writeText("saravanamariappan2006@gmail.com");
        setCopiedEmail(true);
        addToast({ title: "Email Copied", message: "Contact email copied to clipboard.", type: "success", duration: 2000 });
        setTimeout(() => setCopiedEmail(false), 2000);
    };

    return (
        <div className="page-enter verdara-settings-page">
            {/* Header */}
            <div className="verdara-page-header">
                <div>
                    <div className="verdara-page-tag font-rakkas">
                        <PetalIcon size={13} color="var(--primary-dark)" />
                        <span>PREFERENCES & SPECS</span>
                    </div>
                    <h1 className="verdara-page-title font-merriweather">
                        Settings
                    </h1>
                    <p className="verdara-page-subtitle font-rakkas">
                        Inspect infrastructure endpoints, cryptographic signer profile, developer info, and system specs.
                    </p>
                </div>
            </div>

            <div className="verdara-settings-stack">
                {/* 1. Connection & Cryptographic Profile */}
                <div className="verdara-settings-card">
                    <div className="verdara-settings-card-header">
                        <div className="verdara-settings-header-icon-box">
                            <Shield style={{ width: 16, height: 16 }} />
                        </div>
                        <div>
                            <h3 className="verdara-settings-card-title font-merriweather">Cryptographic Profile</h3>
                            <p className="verdara-settings-card-subtitle font-rakkas">On-chain contract and signer binding</p>
                        </div>
                    </div>

                    <AddressRow
                        label="S Wallet Contract Address"
                        value={SMART_WALLET_ADDRESS}
                        copied={copiedContract}
                        onCopy={handleCopyContract}
                    />

                    {connectedAccount && (
                        <AddressRow
                            label="Connected MetaMask Signer"
                            value={connectedAccount}
                            copied={copiedWallet}
                            onCopy={handleCopyWallet}
                        />
                    )}

                    <SettingRow
                        label="Signer Authorization Level"
                        sub={isOwner ? "Full administrative control and signing privileges" : "Observer mode only (transfers locked)"}
                    >
                        <span className={`status-chip font-sans ${isOwner ? 'status-chip-confirmed' : 'status-chip-pending'}`}>
                            {isOwner ? "Authorized Signer" : "Read-Only Observer"}
                        </span>
                    </SettingRow>
                </div>

                {/* 2. Network & Infrastructure */}
                <div className="verdara-settings-card">
                    <div className="verdara-settings-card-header">
                        <div className="verdara-settings-header-icon-box">
                            <Globe style={{ width: 16, height: 16 }} />
                        </div>
                        <div>
                            <h3 className="verdara-settings-card-title font-merriweather">Network Infrastructure</h3>
                            <p className="verdara-settings-card-subtitle font-rakkas">Consensus chain and backend server bindings</p>
                        </div>
                    </div>

                    <SettingRow
                        label="Target Blockchain"
                        sub="Ethereum testnet for smart contract transactions"
                    >
                        <div className="font-merriweather font-bold text-forest">Ethereum Sepolia (11155111)</div>
                    </SettingRow>

                    <SettingRow
                        label="Backend API Gateway"
                        sub="Express.js REST API service for transaction indexing"
                    >
                        <div className="flex items-center gap-2">
                            <span className={`backend-dot${backendConnected ? '' : ' backend-dot-offline'}`} />
                            <span className="font-script text-base font-semibold" style={{ fontSize: "1.1rem" }}>{BACKEND_URL}</span>
                        </div>
                    </SettingRow>

                    <SettingRow
                        label="Solidity Smart Contract Compiler"
                        sub="Version used for deployment and EVM byte verification"
                    >
                        <span className="font-sans text-sm font-bold text-forest">v0.8.20+commit.a1b79de6</span>
                    </SettingRow>
                </div>

                {/* 3. Project Owner / Developer Info Section */}
                <div className="verdara-settings-card">
                    <div className="verdara-settings-card-header">
                        <div className="verdara-settings-header-icon-box">
                            <User style={{ width: 16, height: 16 }} />
                        </div>
                        <div>
                            <h3 className="verdara-settings-card-title font-merriweather">Project Owner</h3>
                            <p className="verdara-settings-card-subtitle font-rakkas">Developer credentials and direct contact details</p>
                        </div>
                    </div>

                    {/* Developer Name row with small person icon */}
                    <div className="verdara-settings-row">
                        <div>
                            <div className="verdara-settings-row-label font-merriweather">Owner Name</div>
                            <div className="verdara-settings-row-sub font-rakkas">Lead Smart Contract & dApp Architect</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="verdara-owner-field-badge">
                                <User style={{ width: 15, height: 15, color: "var(--primary-dark)" }} />
                                <span className="font-rakkas font-bold text-forest text-base" style={{ fontSize: "1.1rem" }}>
                                    Saravanamariappan M
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Developer Email row with small mail icon */}
                    <div className="verdara-settings-row">
                        <div>
                            <div className="verdara-settings-row-label font-merriweather">Contact Email</div>
                            <div className="verdara-settings-row-sub font-rakkas">Primary communications and developer inquiries</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="verdara-owner-field-badge">
                                <Mail style={{ width: 15, height: 15, color: "var(--primary-dark)" }} />
                                <a
                                    href="mailto:saravanamariappan2006@gmail.com"
                                    className="font-rakkas text-forest"
                                    style={{ fontSize: "1.05rem", textDecoration: "none", fontWeight: 700 }}
                                >
                                    saravanamariappan2006@gmail.com
                                </a>
                            </div>
                            <button
                                onClick={handleCopyEmail}
                                className="verdara-btn-copy-subtle font-sans"
                                title="Copy email address"
                            >
                                {copiedEmail ? <Check style={{ width: 13, height: 13, color: "var(--primary-dark)" }} /> : <Copy style={{ width: 13, height: 13 }} />}
                                <span>{copiedEmail ? "Copied" : "Copy"}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* 4. Architecture Specifications */}
                <div className="verdara-settings-card verdara-editorial-specs-card">
                    <div className="verdara-specs-header">
                        <PetalIcon size={18} color="var(--accent-sage)" />
                        <span className="verdara-specs-title font-sans font-bold">S WALLET · SYSTEM ARCHITECTURE SPECIFICATIONS</span>
                    </div>

                    <div className="verdara-specs-grid">
                        <div className="verdara-specs-column">
                            <span className="verdara-specs-col-header font-sans">PROTOCOL</span>
                            <ul className="verdara-specs-list font-rakkas">
                                <li><strong>Architecture:</strong> Single-Owner Smart Vault</li>
                                <li><strong>Standards:</strong> ERC-20, ERC-4337 Ready</li>
                                <li><strong>Consensus:</strong> Proof of Stake (Sepolia)</li>
                                <li><strong>Chain ID:</strong> 11155111</li>
                            </ul>
                        </div>

                        <div className="verdara-specs-column">
                            <span className="verdara-specs-col-header font-sans">SECURITY</span>
                            <ul className="verdara-specs-list font-rakkas">
                                <li><strong>Custody:</strong> 100% Non-Custodial</li>
                                <li><strong>Access Control:</strong> Ownable2Step</li>
                                <li><strong>Signature:</strong> ECDSA secp256k1</li>
                                <li><strong>Reentrancy:</strong> Guard Protected</li>
                            </ul>
                        </div>

                        <div className="verdara-specs-column">
                            <span className="verdara-specs-col-header font-sans">EXPLORER</span>
                            <ul className="verdara-specs-list font-rakkas">
                                <li>
                                    <a
                                        href={`https://sepolia.etherscan.io/address/${SMART_WALLET_ADDRESS}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="verdara-specs-link font-sans"
                                    >
                                        <span>Sepolia Etherscan</span>
                                        <ExternalLink style={{ width: 12, height: 12 }} />
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="https://sepoliafaucet.com"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="verdara-specs-link font-sans"
                                    >
                                        <span>Sepolia Faucet</span>
                                        <ExternalLink style={{ width: 12, height: 12 }} />
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
