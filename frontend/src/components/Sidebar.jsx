import React from "react";
import {
    LayoutDashboard,
    Send,
    Download,
    History,
    Coins,
    Settings,
    X,
} from "lucide-react";
import { BrandLogo, PetalIcon } from "./DecorativePetal.jsx";

export default function Sidebar({ currentPage, setCurrentPage, sidebarOpen, setSidebarOpen }) {
    const menuItems = [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "send", label: "Send ETH", icon: Send },
        { id: "receive", label: "Receive Assets", icon: Download },
        { id: "transactions", label: "Transactions", icon: History },
        { id: "tokens", label: "Asset Tokens", icon: Coins },
        { id: "settings", label: "Settings", icon: Settings },
    ];

    return (
        <>
            {/* Mobile overlay backdrop */}
            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside className={`verdara-sidebar ${sidebarOpen ? "open" : ""}`}>
                {/* Sidebar header / brand with clean custom logo image */}
                <div className="sidebar-header">
                    <div className="sidebar-brand-lockup">
                        <BrandLogo
                            src="/assets/new.jpg"
                            height={44}
                            alt="S Wallet"
                        />
                        <div className="sidebar-brand-text-wrap">
                            <span className="sidebar-brand-title">
                                <span className="s-brand-accent">S</span> Wallet
                            </span>
                            <span className="sidebar-brand-subtitle">Smart Treasury</span>
                        </div>
                    </div>

                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="sidebar-close-btn mobile-only"
                        aria-label="Close sidebar"
                    >
                        <X style={{ width: 18, height: 18 }} />
                    </button>
                </div>

                {/* Issue badge */}
                <div className="sidebar-edition-pill">
                    <span className="sidebar-edition-bullet">❋</span>
                    <span>SEPOLIA EDITION</span>
                </div>

                {/* Navigation items */}
                <nav className="sidebar-menu" aria-label="Main navigation">
                    <span className="sidebar-section-label">TREASURY NAVIGATION</span>

                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPage === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setCurrentPage(item.id);
                                    setSidebarOpen(false);
                                }}
                                className={`verdara-menu-item ${isActive ? "active" : ""}`}
                                aria-current={isActive ? "page" : undefined}
                            >
                                <span className="menu-item-icon-box">
                                    <Icon style={{ width: 17, height: 17 }} />
                                </span>
                                <span className="menu-item-text">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Sidebar footer badge */}
                <div className="sidebar-footer-box">
                    <div className="sidebar-footer-seal">
                        <PetalIcon size={16} color="var(--accent-sage)" />
                        <span className="sidebar-footer-seal-text">VERIFIED VAULT</span>
                    </div>
                    <p className="sidebar-footer-script-text">
                        Sepolia S Wallet v1.0.0
                    </p>
                </div>
            </aside>
        </>
    );
}
