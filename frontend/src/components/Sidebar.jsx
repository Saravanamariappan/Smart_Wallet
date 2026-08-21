import React from "react";
import {
    LayoutDashboard,
    Send,
    Download,
    History,
    Coins,
    Settings,
    Wallet,
    X,
} from "lucide-react";

export default function Sidebar({ currentPage, setCurrentPage, sidebarOpen, setSidebarOpen }) {
    const menuItems = [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "send", label: "Send ETH", icon: Send },
        { id: "receive", label: "Receive", icon: Download },
        { id: "transactions", label: "Transactions", icon: History },
        { id: "tokens", label: "Tokens", icon: Coins },
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

            <aside className={sidebarOpen ? "open" : ""}>
                {/* Sidebar header / brand */}
                <div className="sidebar-header">
                    <div className="sidebar-brand">
                        <div className="sidebar-brand-icon">
                            <Wallet style={{ width: 17, height: 17 }} />
                        </div>
                        <span className="sidebar-brand-text">Smart Wallet</span>
                    </div>

                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="sidebar-close-btn mobile-only"
                        aria-label="Close sidebar"
                    >
                        <X style={{ width: 18, height: 18 }} />
                    </button>
                </div>

                {/* Navigation items */}
                <nav className="sidebar-menu" aria-label="Main navigation">
                    <span className="sidebar-section-label">Navigation</span>

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
                                className={`menu-item${isActive ? " active" : ""}`}
                                aria-current={isActive ? "page" : undefined}
                            >
                                <span className="menu-item-icon">
                                    <Icon style={{ width: 18, height: 18 }} />
                                </span>
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Sidebar footer */}
                <div className="sidebar-footer">
                    <span className="sidebar-footer-dot" />
                    <span className="sidebar-footer-text">Sepolia Smart Wallet v1.0.0</span>
                </div>
            </aside>
        </>
    );
}
