import {
    createPublicClient,
    createWalletClient,
    custom,
    http,
    formatEther,
    parseEther,
} from "viem";

import { sepolia } from "viem/chains";

import {
    SMART_WALLET_ADDRESS,
    SMART_WALLET_ABI,
    CHAIN_ID,
} from "../config/wallet.js";

import { getWalletInfo } from "./api.js";


// =====================================================
// PUBLIC CLIENT
// =====================================================

export const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(),
});


// =====================================================
// METAMASK
// =====================================================

export function isMetaMaskAvailable() {
    return (
        typeof window !== "undefined" &&
        typeof window.ethereum !== "undefined"
    );
}


// =====================================================
// CONNECT WALLET
// =====================================================

export async function connectWallet() {
    if (!isMetaMaskAvailable()) {
        throw new Error("MetaMask is not installed.");
    }

    const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
    });

    return accounts[0];
}


// =====================================================
// GET CONNECTED ACCOUNT
// =====================================================

export async function getConnectedAccount() {
    if (!isMetaMaskAvailable()) {
        return null;
    }

    const accounts = await window.ethereum.request({
        method: "eth_accounts",
    });

    return accounts[0] || null;
}


// =====================================================
// CHECK / SWITCH SEPOLIA NETWORK
// =====================================================

export async function checkAndSwitchNetwork() {
    if (!isMetaMaskAvailable()) {
        return false;
    }

    const chainIdHex = await window.ethereum.request({
        method: "eth_chainId",
    });

    const currentChainId = parseInt(chainIdHex, 16);

    if (currentChainId !== CHAIN_ID) {
        try {
            await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [
                    {
                        chainId: `0x${CHAIN_ID.toString(16)}`,
                    },
                ],
            });

            return true;

        } catch (switchError) {

            // Sepolia network not added
            if (switchError.code === 4902) {
                try {

                    await window.ethereum.request({
                        method: "wallet_addEthereumChain",
                        params: [
                            {
                                chainId: `0x${CHAIN_ID.toString(16)}`,
                                chainName: "Sepolia Test Network",

                                nativeCurrency: {
                                    name: "Sepolia Ether",
                                    symbol: "ETH",
                                    decimals: 18,
                                },

                                rpcUrls: [
                                    "https://ethereum-sepolia.publicnode.com",
                                ],

                                blockExplorerUrls: [
                                    "https://sepolia.etherscan.io",
                                ],
                            },
                        ],
                    });

                    return true;

                } catch (addError) {
                    console.error(addError);
                    throw new Error(
                        "Failed to add Sepolia network to MetaMask."
                    );
                }
            }

            throw new Error(
                "Please switch your MetaMask network to Sepolia."
            );
        }
    }

    return true;
}


// =====================================================
// METAMASK ACCOUNT + NETWORK LISTENERS
// =====================================================

export function setupNetworkListeners(
    onAccountsChanged,
    onChainChanged
) {
    if (!isMetaMaskAvailable()) {
        return () => {};
    }

    const accountsHandler = (accounts) => {
        onAccountsChanged(accounts[0] || null);
    };

    const chainHandler = (chainIdHex) => {
        const newChainId = parseInt(chainIdHex, 16);
        onChainChanged(newChainId);
    };

    window.ethereum.on(
        "accountsChanged",
        accountsHandler
    );

    window.ethereum.on(
        "chainChanged",
        chainHandler
    );

    return () => {
        window.ethereum.removeListener(
            "accountsChanged",
            accountsHandler
        );

        window.ethereum.removeListener(
            "chainChanged",
            chainHandler
        );
    };
}


// =====================================================
// SMART WALLET BALANCE
// =====================================================
// IMPORTANT:
// Balance is fetched from BACKEND.
// Backend reads the actual SmartWallet contract.
// MetaMask owner balance is NOT used here.

export async function getSmartWalletBalance() {

    try {

        const data = await getWalletInfo();

        if (!data || !data.success) {
            throw new Error(
                data?.message || "Failed to fetch Smart Wallet balance."
            );
        }

        return {
            wei: data.balance?.wei || "0",
            eth: data.balance?.eth || "0",
        };

    } catch (error) {

        console.error(
            "Failed to fetch Smart Wallet balance:",
            error
        );

        // Fallback: read directly from blockchain
        try {

            const balance = await publicClient.getBalance({
                address: SMART_WALLET_ADDRESS,
            });

            return {
                wei: balance.toString(),
                eth: formatEther(balance),
            };

        } catch (fallbackError) {

            console.error(
                "Blockchain balance fallback failed:",
                fallbackError
            );

            return {
                wei: "0",
                eth: "0",
            };
        }
    }
}


// =====================================================
// ERC-20 TOKEN BALANCE
// =====================================================

export async function getTokenBalance(tokenAddress) {

    if (!tokenAddress) {
        return "0";
    }

    try {

        const balance = await publicClient.readContract({
            address: SMART_WALLET_ADDRESS,
            abi: SMART_WALLET_ABI,
            functionName: "getTokenBalance",
            args: [tokenAddress],
        });

        return balance.toString();

    } catch (error) {

        console.error(
            "Error reading token balance from contract:",
            error
        );

        return "0";
    }
}


// =====================================================
// SEND ETH FROM SMART WALLET
// =====================================================

export async function sendETH(
    receiver,
    amountEth
) {

    if (!isMetaMaskAvailable()) {
        throw new Error("MetaMask not connected");
    }

    const connectedAccount =
        await getConnectedAccount();

    if (!connectedAccount) {
        throw new Error(
            "Please connect your MetaMask wallet first."
        );
    }

    await checkAndSwitchNetwork();

    const amountWei = parseEther(amountEth);

    const walletClient = createWalletClient({
        chain: sepolia,
        transport: custom(window.ethereum),
    });

    const hash = await walletClient.writeContract({

        address: SMART_WALLET_ADDRESS,

        abi: SMART_WALLET_ABI,

        functionName: "sendETH",

        args: [
            receiver,
            amountWei,
        ],

        account: connectedAccount,
    });

    return hash;
}


// =====================================================
// SEND ERC-20 TOKEN
// =====================================================

export async function sendToken(
    tokenAddress,
    receiver,
    amount
) {

    if (!isMetaMaskAvailable()) {
        throw new Error("MetaMask not connected");
    }

    const connectedAccount =
        await getConnectedAccount();

    if (!connectedAccount) {
        throw new Error(
            "Please connect your MetaMask wallet first."
        );
    }

    await checkAndSwitchNetwork();

    const parsedAmount =
        parseEther(amount.toString());

    const walletClient = createWalletClient({
        chain: sepolia,
        transport: custom(window.ethereum),
    });

    const hash =
        await walletClient.writeContract({

            address: SMART_WALLET_ADDRESS,

            abi: SMART_WALLET_ABI,

            functionName: "sendToken",

            args: [
                tokenAddress,
                receiver,
                parsedAmount,
            ],

            account: connectedAccount,
        });

    return hash;
}


// =====================================================
// GENERIC SMART WALLET EXECUTE
// =====================================================

export async function executeTransaction(
    target,
    valueEth,
    dataBytes
) {

    if (!isMetaMaskAvailable()) {
        throw new Error("MetaMask not connected");
    }

    const connectedAccount =
        await getConnectedAccount();

    if (!connectedAccount) {
        throw new Error(
            "Please connect your MetaMask wallet first."
        );
    }

    await checkAndSwitchNetwork();

    const valueWei =
        parseEther(valueEth);

    const walletClient = createWalletClient({
        chain: sepolia,
        transport: custom(window.ethereum),
    });

    const hash =
        await walletClient.writeContract({

            address: SMART_WALLET_ADDRESS,

            abi: SMART_WALLET_ABI,

            functionName: "execute",

            args: [
                target,
                valueWei,
                dataBytes,
            ],

            account: connectedAccount,
        });

    return hash;
}


// =====================================================
// WAIT FOR BLOCKCHAIN TRANSACTION
// =====================================================

export async function waitForTransaction(hash) {

    const receipt =
        await publicClient.waitForTransactionReceipt({
            hash,
        });

    return receipt;
}