import React, { useState, useEffect } from "react";
import Header from "./components/Header.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Send from "./pages/Send.jsx";
import Receive from "./pages/Receive.jsx";
import Transactions from "./pages/Transactions.jsx";
import Tokens from "./pages/Tokens.jsx";
import Settings from "./pages/Settings.jsx";
import { ToastContainer } from "./components/Toast.jsx";

import {
  connectWallet,
  getConnectedAccount,
  checkAndSwitchNetwork,
  setupNetworkListeners,
} from "./services/blockchain.js";
import { getBackendStatus } from "./services/api.js";

const EXPECTED_OWNER = "0x8Be9a794b20fd7E858dEA502d5d8EAd12613496E";

export default function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [chainId, setChainId] = useState(11155111);
  const [backendConnected, setBackendConnected] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addToast = ({ title, message, type = "info", duration = 5000 }) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 7);
    setToasts((prev) => [...prev, { id, title, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const pingBackend = async () => {
    const status = await getBackendStatus();
    setBackendConnected(status);
  };

  useEffect(() => {
    pingBackend();
    const interval = setInterval(pingBackend, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleWalletConnected = (acct) => {
    setConnectedAccount(acct);
    if (acct) {
      const isOwnerCheck = acct.toLowerCase() === EXPECTED_OWNER.toLowerCase();
      setIsOwner(isOwnerCheck);

      if (window.ethereum) {
        window.ethereum.request({ method: "eth_chainId" }).then((hex) => {
          setChainId(parseInt(hex, 16));
        });
      }

      addToast({
        title: "Wallet Connected",
        message: `Successfully connected account ${acct.substring(0, 6)}...${acct.substring(acct.length - 4)}`,
        type: "success",
        duration: 3000,
      });
    } else {
      setIsOwner(false);
      addToast({
        title: "Wallet Disconnected",
        message: "Your Ethereum wallet connection has been terminated.",
        type: "info",
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    const initWallet = async () => {
      try {
        const acct = await getConnectedAccount();
        if (acct) {
          handleWalletConnected(acct);
        }
      } catch (err) {
        console.error("Failed to fetch initial wallet state:", err);
      }
    };
    initWallet();

    const cleanup = setupNetworkListeners(
      (acct) => {
        handleWalletConnected(acct);
      },
      (newChain) => {
        setChainId(newChain);
        if (newChain !== 11155111) {
          addToast({
            title: "Wrong Network Detected",
            message: "Please switch back to Ethereum Sepolia Testnet inside MetaMask.",
            type: "warning",
          });
        } else {
          addToast({
            title: "Network Restored",
            message: "Successfully re-established connection on Sepolia Testnet.",
            type: "success",
          });
        }
      }
    );

    return cleanup;
  }, []);

  const handleConnect = async () => {
    try {
      const acct = await connectWallet();
      handleWalletConnected(acct);
      await checkAndSwitchNetwork();
    } catch (err) {
      console.error(err);
      addToast({
        title: "Connection Failed",
        message: err.message || "Failed to initialize MetaMask provider.",
        type: "error",
      });
    }
  };

  const handleSwitchNetwork = async () => {
    try {
      await checkAndSwitchNetwork();
    } catch (err) {
      addToast({
        title: "Network Switch Failed",
        message: err.message,
        type: "error",
      });
    }
  };

  const renderActivePage = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <Dashboard
            connectedAccount={connectedAccount}
            isOwner={isOwner}
            backendConnected={backendConnected}
            addToast={addToast}
            setCurrentPage={setCurrentPage}
          />
        );
      case "send":
        return (
          <Send
            connectedAccount={connectedAccount}
            isOwner={isOwner}
            chainId={chainId}
            backendConnected={backendConnected}
            addToast={addToast}
          />
        );
      case "receive":
        return <Receive addToast={addToast} />;
      case "transactions":
        return (
          <Transactions
            backendConnected={backendConnected}
            addToast={addToast}
          />
        );
      case "tokens":
        return (
          <Tokens
            connectedAccount={connectedAccount}
            isOwner={isOwner}
            chainId={chainId}
            backendConnected={backendConnected}
            addToast={addToast}
          />
        );
      case "settings":
        return (
          <Settings
            connectedAccount={connectedAccount}
            isOwner={isOwner}
            chainId={chainId}
            backendConnected={backendConnected}
            addToast={addToast}
          />
        );
      default:
        return (
          <div className="text-center p-8 font-sans">
            Page not found.
          </div>
        );
    }
  };

  return (
    <div className="app-container">
      <Header
        connectedAccount={connectedAccount}
        isOwner={isOwner}
        chainId={chainId}
        backendConnected={backendConnected}
        onConnect={handleConnect}
        onSwitchNetwork={handleSwitchNetwork}
        setSidebarOpen={setSidebarOpen}
      />

      <div className={`main-layout ${sidebarOpen ? "aside-open" : ""}`}>
        <Sidebar
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <main className="content-area">
          {renderActivePage()}
        </main>
      </div>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
