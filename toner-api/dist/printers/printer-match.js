"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.indexPrinters = indexPrinters;
exports.matchPrinter = matchPrinter;
function indexPrinters(printers, assets) {
    const bySerial = new Map();
    const byIp = new Map();
    for (const printer of printers) {
        if (printer.serialNumber) {
            bySerial.set(printer.serialNumber.toLowerCase(), printer);
        }
        byIp.set(printer.ipAddress, printer);
    }
    const claimedIps = new Set();
    for (const asset of assets) {
        if (!asset.serialNumber)
            continue;
        const claimed = bySerial.get(asset.serialNumber.toLowerCase());
        if (claimed)
            claimedIps.add(claimed.ipAddress);
    }
    return { bySerial, byIp, claimedIps };
}
function matchPrinter(asset, index) {
    if (asset.serialNumber) {
        const bySerial = index.bySerial.get(asset.serialNumber.toLowerCase());
        if (bySerial)
            return bySerial;
    }
    if (!asset.ipAddress)
        return null;
    if (index.claimedIps.has(asset.ipAddress))
        return null;
    return index.byIp.get(asset.ipAddress) ?? null;
}
//# sourceMappingURL=printer-match.js.map