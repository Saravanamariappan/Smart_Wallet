export function formatAddress(address) {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

export function formatBalance(balance, decimals = 4) {
    if (balance === undefined || balance === null) return "0.00";
    const num = parseFloat(balance);
    if (isNaN(num)) return "0.00";
    return num.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: decimals,
    });
}
