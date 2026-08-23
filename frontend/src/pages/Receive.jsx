import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, AlertCircle } from "lucide-react";
import { SMART_WALLET_ADDRESS } from "../config/wallet.js";
import { PetalIcon, SunburstShape } from "../components/DecorativePetal.jsx";
import StyledButton from "../components/StyledButton.jsx";

export default function Receive({ addToast }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(SMART_WALLET_ADDRESS);
        setCopied(true);
        addToast({
            title: "Address Copied!",
            message: "S Wallet contract address copied to clipboard.",
            type: "success",
            duration: 2500,
        });
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="page-enter verdara-receive-container">
            {/* Header */}
            <div className="verdara-page-header text-center">
                <div className="verdara-page-tag justify-center font-rakkas">
                    <PetalIcon size={13} color="var(--primary-dark)" />
                    <span>INBOUND TREASURY</span>
                </div>
                <h1 className="verdara-page-title font-merriweather">
                    Receive Assets
                </h1>
                <p className="verdara-page-subtitle font-rakkas">
                    Share this address to receive Sepolia ETH or ERC-20 tokens.
                </p>
            </div>

            {/* Main Reception Card */}
            <div className="verdara-card verdara-receive-card">
                <div className="verdara-receive-watermark-top">
                    <SunburstShape size={140} color="#143A28" opacity={0.05} />
                </div>

                {/* Network pill */}
                <div className="verdara-network-pill-tag font-sans">
                    <span className="verdara-network-tag-dot" />
                    <span>Ethereum Sepolia</span>
                </div>

                {/* QR Code Artplate Frame */}
                <div className="verdara-qr-artplate">
                    <div className="verdara-qr-inner">
                        <QRCodeSVG
                            value={SMART_WALLET_ADDRESS}
                            size={200}
                            level="H"
                            includeMargin={false}
                            fgColor="#143A28"
                            bgColor="#FFFFFF"
                        />
                    </div>
                    <div className="verdara-qr-caption font-rakkas">
                        <PetalIcon size={11} color="var(--primary-dark)" />
                        <span>SCAN VIA METAMASK / WEB3 WALLET</span>
                    </div>
                </div>

                {/* Address Pill Display */}
                <div className="verdara-address-box">
                    <span className="verdara-address-tag font-rakkas">S WALLET CONTRACT ADDRESS</span>
                    <div className="verdara-address-pill font-script" style={{ fontSize: "1.15rem", lineHeight: 1.6 }}>
                        {SMART_WALLET_ADDRESS}
                    </div>
                </div>

                {/* Copy Button with neumorphic StyledButton */}
                <StyledButton
                    onClick={handleCopy}
                    style={{ width: "100%" }}
                >
                    {copied ? <Check style={{ width: 16, height: 16, marginRight: "6px" }} /> : <Copy style={{ width: 16, height: 16, marginRight: "6px" }} />}
                    {copied ? "Address Copied!" : "Copy Wallet Address"}
                </StyledButton>

                {/* Information Callout */}
                <div className="verdara-callout-box">
                    <AlertCircle style={{ width: 18, height: 18, color: "var(--primary-dark)", flexShrink: 0, marginTop: 2 }} />
                    <p className="verdara-callout-text font-rakkas">
                        Send <strong>Sepolia ETH</strong> or supported ERC-20 tokens to this address. Funds credit to the smart contract wallet automatically.
                    </p>
                </div>
            </div>
        </div>
    );
}
