import React from "react";
import { BrandLogo, PetalIcon } from "./DecorativePetal.jsx";
import { SMART_WALLET_ADDRESS } from "../config/wallet.js";
import { formatAddress } from "../utils/format.js";
import { ExternalLink } from "lucide-react";

export default function Footer({ setCurrentPage }) {
  const handleNav = (page) => {
    if (setCurrentPage) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="verdara-footer">
      <div className="verdara-footer-inner">
        {/* Top brand & quote lockup */}
        <div className="verdara-footer-hero">
          <div className="verdara-footer-brand">
            <div className="verdara-footer-logo-lockup">
              <BrandLogo height={36} alt="S Wallet" />
              <span className="verdara-footer-logo-text">
                <span className="s-brand-accent">S</span> Wallet
              </span>
            </div>
            <p className="verdara-footer-tagline font-rakkas">
              Autonomous smart contract treasury on Ethereum Sepolia. Crafted for precision, security, and digital sovereign finance.
            </p>
            <div className="verdara-footer-badge">
              <span className="verdara-footer-edition-dot" />
              <span className="font-script" style={{ fontSize: "1.05rem" }}>S Wallet Sepolia Treasury Edition</span>
            </div>
          </div>

          {/* Multi-column links */}
          <div className="verdara-footer-columns">
            {/* Col 1: VAULT */}
            <div className="verdara-footer-col">
              <span className="verdara-footer-col-title">VAULT PAGES</span>
              <ul className="verdara-footer-links">
                <li>
                  <button onClick={() => handleNav("dashboard")} className="verdara-footer-link-btn font-rakkas">
                    Dashboard Overview
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNav("send")} className="verdara-footer-link-btn font-rakkas">
                    Send Sepolia ETH
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNav("receive")} className="verdara-footer-link-btn font-rakkas">
                    Receive Assets
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNav("transactions")} className="verdara-footer-link-btn font-rakkas">
                    Transaction Ledger
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNav("tokens")} className="verdara-footer-link-btn font-rakkas">
                    Asset Tokens
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 2: NETWORK */}
            <div className="verdara-footer-col">
              <span className="verdara-footer-col-title">NETWORK & SPECS</span>
              <ul className="verdara-footer-links">
                <li>
                  <span className="verdara-footer-spec-item font-rakkas">
                    <span>Chain:</span>
                    <strong>Ethereum Sepolia</strong>
                  </span>
                </li>
                <li>
                  <span className="verdara-footer-spec-item font-rakkas">
                    <span>Chain ID:</span>
                    <strong>11155111</strong>
                  </span>
                </li>
                <li>
                  <span className="verdara-footer-spec-item font-rakkas">
                    <span>Solidity:</span>
                    <strong>^0.8.20</strong>
                  </span>
                </li>
                <li>
                  <span className="verdara-footer-spec-item font-rakkas">
                    <span>Type:</span>
                    <strong>Single-Owner Treasury</strong>
                  </span>
                </li>
              </ul>
            </div>

            {/* Col 3: CONTRACT */}
            <div className="verdara-footer-col">
              <span className="verdara-footer-col-title">SMART CONTRACT</span>
              <div className="verdara-footer-contract-pill">
                <span className="verdara-footer-contract-lbl">Address</span>
                <span className="verdara-footer-contract-val font-script" style={{ fontSize: "1.1rem" }}>
                  {formatAddress(SMART_WALLET_ADDRESS)}
                </span>
              </div>
              <a
                href={`https://sepolia.etherscan.io/address/${SMART_WALLET_ADDRESS}`}
                target="_blank"
                rel="noreferrer"
                className="verdara-footer-explorer-btn"
              >
                <span>View on Sepolia Etherscan</span>
                <ExternalLink style={{ width: 12, height: 12 }} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="verdara-footer-bottom">
          <div className="verdara-footer-bottom-left">
            <PetalIcon size={14} color="var(--accent-sage)" />
            <span>S Wallet · Sepolia Smart Vault Edition</span>
          </div>
          <div className="verdara-footer-bottom-right">
            <span>Non-custodial smart contract wallet • Immutable on-chain state</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
