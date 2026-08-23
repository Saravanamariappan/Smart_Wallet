import React, { useState, useEffect } from "react";
import { Coins, ShieldAlert, ArrowRight, CheckCircle2, Loader2, AlertCircle, Check, ArrowUpRight } from "lucide-react";
import { TOKENS } from "../config/tokens.js";
import { formatAddress, formatBalance } from "../utils/format.js";
import { getTokenBalance, sendToken, waitForTransaction } from "../services/blockchain.js";
import { saveTransaction } from "../services/api.js";
import { SMART_WALLET_ADDRESS } from "../config/wallet.js";
import { isAddress } from "viem";
import { PetalIcon, SunburstShape } from "../components/DecorativePetal.jsx";
import StyledButton from "../components/StyledButton.jsx";

const PALETTE_CLASSES = [
    "bento-card-ochre",
    "bento-card-sky",
    "bento-card-coral",
    "bento-card-sage",
];

export default function Tokens({ connectedAccount, isOwner, chainId, backendConnected, addToast }) {
    const [tokensList] = useState(TOKENS || []);
    const [selectedToken, setSelectedToken] = useState(null);
    const [balances, setBalances] = useState({});
    const [loadingBalances, setLoadingBalances] = useState(true);
    const [receiver, setReceiver] = useState("");
    const [amount, setAmount] = useState("");
    const [step, setStep] = useState(1);
    const [sending, setSending] = useState(false);
    const [txHash, setTxHash] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [statusMessage, setStatusMessage] = useState("");

    const isSepolia = chainId === 11155111;

    const fetchTokenBalances = async () => {
        setLoadingBalances(true);
        const newBalances = {};
        for (const token of tokensList) {
            if (token.address && isAddress(token.address)) {
                try {
                    const bal = await getTokenBalance(token.address);
                    newBalances[token.address] = parseFloat(bal) / 1e18;
                } catch (err) {
                    console.error(`Error fetching balance for ${token.symbol}:`, err);
                    newBalances[token.address] = 0;
                }
            } else { newBalances[token.address] = 0; }
        }
        setBalances(newBalances);
        setLoadingBalances(false);
    };

    useEffect(() => {
        fetchTokenBalances();
        const activeToken = tokensList.find(t => t.address && isAddress(t.address));
        if (activeToken) setSelectedToken(activeToken);
    }, [tokensList]);

    const handleSendToken = async (e) => {
        e.preventDefault();
        if (!selectedToken) return;
        if (!connectedAccount) { setErrorMessage("Please connect your MetaMask wallet."); return; }
        if (!isSepolia) { setErrorMessage("Please switch to Sepolia Testnet."); return; }
        if (!isOwner) { setErrorMessage("Only the S Wallet owner can authorize token transfers."); return; }
        if (!receiver || !isAddress(receiver)) { setErrorMessage("Please enter a valid recipient address (0x...)."); return; }
        if (receiver.toLowerCase() === SMART_WALLET_ADDRESS.toLowerCase()) { setErrorMessage("Cannot send tokens to the S Wallet itself."); return; }
        const val = parseFloat(amount);
        if (isNaN(val) || val <= 0) { setErrorMessage("Please enter an amount greater than 0."); return; }
        const tokenBal = balances[selectedToken.address] || 0;
        if (val > tokenBal) { setErrorMessage(`Insufficient balance: ${tokenBal} ${selectedToken.symbol}`); return; }

        setErrorMessage(""); setSending(true); setStep(2);
        setStatusMessage("Awaiting user confirmation in MetaMask...");
        try {
            const hash = await sendToken(selectedToken.address, receiver, amount);
            setTxHash(hash);
            addToast({ title: "Transaction Submitted", message: "ERC-20 token transfer submitted.", type: "success" });
            setStatusMessage("Waiting for confirmation on-chain...");
            const receipt = await waitForTransaction(hash);
            if (receipt.status !== "success") throw new Error("Blockchain transaction failed.");
            setStatusMessage("Logging transaction to backend database...");
            if (backendConnected) {
                try {
                    await saveTransaction({
                        wallet_address: SMART_WALLET_ADDRESS,
                        tx_hash: hash,
                        from_address: SMART_WALLET_ADDRESS,
                        to_address: receiver,
                        amount,
                        token_address: selectedToken.address,
                        transaction_type: "TOKEN_SEND",
                        status: "confirmed"
                    });
                } catch (e) {
                    addToast({ title: "Database Warning", message: "Transfer succeeded but failed to log to database.", type: "warning" });
                }
            }
            setStep(3);
            addToast({ title: "Token Transferred", message: `Sent ${amount} ${selectedToken.symbol} to ${formatAddress(receiver)}.`, type: "success" });
            fetchTokenBalances();
        } catch (err) {
            const msg = err.message?.includes("User rejected") ? "Transaction cancelled in MetaMask." : err.message || "Token transfer failed.";
            setErrorMessage(msg); setStep(1);
            addToast({ title: "Transfer Failed", message: msg, type: "error" });
        } finally { setSending(false); }
    };

    const handleReset = () => { setReceiver(""); setAmount(""); setStep(1); setTxHash(""); setErrorMessage(""); };

    return (
        <div className="page-enter verdara-tokens-page">
            {/* Header */}
            <div className="verdara-page-header">
                <div>
                    <div className="verdara-page-tag font-rakkas">
                        <PetalIcon size={13} color="var(--primary-dark)" />
                        <span>ERC-20 ASSETS</span>
                    </div>
                    <h1 className="verdara-page-title font-merriweather">
                        Asset Tokens
                    </h1>
                    <p className="verdara-page-subtitle font-rakkas">
                        Inspect ERC-20 smart asset balances and initiate outbound token disbursements.
                    </p>
                </div>
            </div>

            {/* Token Bento Grid */}
            <div className="verdara-bento-grid" style={{ marginBottom: "2rem" }}>
                {tokensList.map((token, index) => {
                    const isSelected = selectedToken?.address === token.address;
                    const bal = balances[token.address] || 0;
                    const paletteClass = PALETTE_CLASSES[index % PALETTE_CLASSES.length];

                    return (
                        <div
                            key={token.symbol}
                            onClick={() => {
                                if (token.address && isAddress(token.address)) setSelectedToken(token);
                            }}
                            className={`bento-card ${paletteClass} ${isSelected ? 'bento-card-selected' : ''}`}
                            style={{ cursor: token.address ? "pointer" : "default" }}
                        >
                            <div className="bento-card-watermark">
                                <Coins size={96} style={{ opacity: 0.12 }} />
                            </div>

                            <div className="flex items-center gap-3" style={{ marginBottom: "0.75rem" }}>
                                <div className="verdara-token-initial-badge font-merriweather">
                                    {token.symbol.substring(0, 2)}
                                </div>
                                <div>
                                    <div className="bento-card-title font-merriweather">{token.name}</div>
                                    <div className="text-xs font-rakkas opacity-80">Decimals: {token.decimals}</div>
                                </div>
                            </div>

                            <div className="bento-card-value font-merriweather text-2xl">
                                {loadingBalances ? "..." : formatBalance(bal, 4)} {token.symbol}
                            </div>

                            <div className="bento-card-sub font-script" style={{ fontSize: "1.05rem" }}>
                                {token.address ? formatAddress(token.address) : "Not Configured"}
                            </div>

                            {isSelected && (
                                <div className="verdara-token-selected-pill font-sans">
                                    <span>Selected for Transfer</span>
                                    <Check style={{ width: 12, height: 12 }} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Transfer Token Form - Newsletter styled card */}
            <div className="verdara-newsletter-card" style={{ maxWidth: 680, margin: "0 auto" }}>
                <div className="verdara-newsletter-watermark">
                    <SunburstShape size={320} color="#C8D6B4" opacity={0.05} />
                </div>

                <div className="verdara-newsletter-inner">
                    <div className="verdara-form-header">
                        <div className="verdara-form-tag font-rakkas">
                            <PetalIcon size={13} color="var(--accent-sage)" />
                            <span>DISBURSEMENT ENGINE</span>
                        </div>
                        <h3 className="verdara-newsletter-title font-merriweather">
                            Transfer {selectedToken ? selectedToken.symbol : "Tokens"}
                        </h3>
                        <p className="verdara-newsletter-sub font-rakkas">
                            Send ERC-20 smart assets securely from the S Wallet treasury vault.
                        </p>
                    </div>

                    {!isOwner && connectedAccount && (
                        <div className="verdara-alert-viewonly" style={{ marginBottom: "1.5rem" }}>
                            <div className="verdara-alert-icon">
                                <ShieldAlert style={{ width: 18, height: 18 }} />
                            </div>
                            <div className="verdara-alert-body">
                                <p className="verdara-alert-title font-merriweather">Transfers Disabled</p>
                                <p className="verdara-alert-desc font-rakkas">
                                    Connected wallet is not the contract owner.
                                </p>
                            </div>
                        </div>
                    )}

                    {step === 1 && (
                        <form onSubmit={handleSendToken} className="verdara-form-body">
                            {selectedToken && (
                                <div className="verdara-balance-banner">
                                    <div className="verdara-balance-banner-left font-rakkas">
                                        <PetalIcon size={14} color="var(--accent-sage)" />
                                        <span>AVAILABLE {selectedToken.symbol} BALANCE</span>
                                    </div>
                                    <span className="verdara-balance-banner-val font-merriweather">
                                        {formatBalance(balances[selectedToken.address] || 0, 4)} {selectedToken.symbol}
                                    </span>
                                </div>
                            )}

                            {/* Recipient */}
                            <div className="verdara-field-group">
                                <label htmlFor="tokenReceiver" className="verdara-field-label font-rakkas">
                                    Recipient Address
                                </label>
                                <div className="verdara-input-wrap">
                                    <input
                                        id="tokenReceiver"
                                        type="text"
                                        value={receiver}
                                        onChange={(e) => setReceiver(e.target.value)}
                                        placeholder="0x..."
                                        disabled={!isOwner || !isSepolia}
                                        className="verdara-pill-input font-script"
                                        style={{ fontSize: "1.1rem" }}
                                    />
                                </div>
                            </div>

                            {/* Amount */}
                            <div className="verdara-field-group">
                                <div className="flex justify-between items-center mb-1">
                                    <label htmlFor="tokenAmount" className="verdara-field-label font-rakkas">
                                        Token Amount
                                    </label>
                                    {selectedToken && (
                                        <button
                                            type="button"
                                            onClick={() => setAmount(balances[selectedToken.address] || 0)}
                                            className="verdara-max-btn font-sans"
                                            disabled={!isOwner || !isSepolia}
                                        >
                                            Use Max
                                        </button>
                                    )}
                                </div>
                                <div className="verdara-input-wrap-addon">
                                    <input
                                        id="tokenAmount"
                                        type="number"
                                        step="any"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        disabled={!isOwner || !isSepolia}
                                        className="verdara-pill-input font-merriweather"
                                    />
                                    <span className="verdara-input-addon font-sans font-bold">
                                        {selectedToken?.symbol || "Tokens"}
                                    </span>
                                </div>
                            </div>

                            {errorMessage && (
                                <div className="verdara-form-error font-rakkas">
                                    <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
                                    <span>{errorMessage}</span>
                                </div>
                            )}

                            <StyledButton
                                type="submit"
                                disabled={!isOwner || !isSepolia || sending || !selectedToken}
                                style={{ width: "100%" }}
                            >
                                Execute Token Disbursement <ArrowRight style={{ width: 17, height: 17, marginLeft: "6px" }} />
                            </StyledButton>
                        </form>
                    )}

                    {step === 2 && (
                        <div className="verdara-processing-container">
                            <div className="verdara-spin-seal">
                                <Loader2 style={{ width: 44, height: 44, color: "var(--accent-sage)", animation: "spin 0.8s linear infinite" }} />
                            </div>
                            <h3 className="verdara-processing-title font-merriweather">Transferring ERC-20 Tokens</h3>
                            <p className="verdara-processing-desc font-rakkas">{statusMessage}</p>
                            {txHash && (
                                <div className="verdara-tx-hash-pill font-script" style={{ fontSize: "1.05rem" }}>
                                    <span>Tx:</span> {formatAddress(txHash)}
                                </div>
                            )}
                        </div>
                    )}

                    {step === 3 && (
                        <div className="verdara-success-container">
                            <div className="verdara-success-seal">
                                <CheckCircle2 style={{ width: 36, height: 36, color: "var(--primary-dark)" }} />
                            </div>
                            <div className="text-center">
                                <h3 className="verdara-success-title font-merriweather">Token Transfer Successful</h3>
                                <p className="verdara-success-desc font-rakkas">
                                    Disbursed <strong>{amount} {selectedToken?.symbol}</strong> to {formatAddress(receiver)}.
                                </p>
                            </div>

                            <div className="verdara-receipt-box">
                                <div className="verdara-receipt-row">
                                    <span className="verdara-receipt-label font-rakkas">Beneficiary</span>
                                    <span className="verdara-receipt-val font-script" style={{ fontSize: "1.05rem" }}>{formatAddress(receiver)}</span>
                                </div>
                                <div className="verdara-receipt-row">
                                    <span className="verdara-receipt-label font-rakkas">Tx Hash</span>
                                    <a
                                        href={`https://sepolia.etherscan.io/tx/${txHash}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="verdara-receipt-link font-script"
                                        style={{ fontSize: "1.05rem" }}
                                    >
                                        <span>{formatAddress(txHash)}</span>
                                        <ArrowUpRight style={{ width: 12, height: 12 }} />
                                    </a>
                                </div>
                            </div>

                            <StyledButton
                                onClick={handleReset}
                                style={{ marginTop: "1rem" }}
                            >
                                Send Another Asset →
                            </StyledButton>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
