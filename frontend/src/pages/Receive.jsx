import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, AlertCircle } from "lucide-react";
import { SMART_WALLET_ADDRESS } from "../config/wallet.js";

export default function Receive({ addToast }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(SMART_WALLET_ADDRESS);
        setCopied(true);
        addToast({ title: "Copied!", message: "Smart Wallet contract address copied to clipboard.", type: "success", duration: 2000 });
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="page-enter" style={{ maxWidth: 440, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <h1 className="m-0">Receive Assets</h1>
                <p className="page-subtitle">Share this address to receive Sepolia ETH or ERC-20 tokens.</p>
            </div>

            <div className="card" style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                {/* Network status pill */}
                <span className="network-badge">
                    <span className="network-badge-dot" />
                    Ethereum Sepolia
                </span>

                {/* QR Code */}
                <div className="qr-container">
                    <QRCodeSVG
                        value={SMART_WALLET_ADDRESS}
                        size={192}
                        level="H"
                        includeMargin={true}
                    />
                </div>

                {/* Address display */}
                <div style={{ width: '100%' }}>
                    <p style={{ fontSize: '0.625rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-subtle)', marginBottom: '0.5rem' }}>
                        Smart Wallet Address
                    </p>
                    <div className="copy-pill" style={{ justifyContent: 'center', textAlign: 'center', fontSize: '0.75rem', lineHeight: 1.6 }}>
                        {SMART_WALLET_ADDRESS}
                    </div>
                </div>

                {/* Copy button */}
                <button
                    onClick={handleCopy}
                    className={`btn ${copied ? 'btn-secondary' : 'btn-primary'}`}
                    style={{ transition: 'all 0.2s ease' }}
                >
                    {copied ? <Check style={{ width: 16, height: 16 }} /> : <Copy style={{ width: 16, height: 16 }} />}
                    {copied ? 'Address Copied!' : 'Copy Wallet Address'}
                </button>

                {/* Info notice */}
                <div className="alert-box alert-info" style={{ textAlign: 'left', width: '100%' }}>
                    <AlertCircle style={{ width: 16, height: 16, flexShrink: 0, marginTop: 2 }} />
                    <p style={{ fontSize: '0.8125rem', color: 'var(--info)' }}>
                        Send <strong>Sepolia ETH</strong> or supported ERC-20 tokens to this address. Funds credit to the smart contract wallet automatically.
                    </p>
                </div>
            </div>
        </div>
    );
}
