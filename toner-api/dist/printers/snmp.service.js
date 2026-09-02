"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var SnmpService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnmpService = exports.SnmpUnreachableError = exports.COUNTER_UNIT = void 0;
exports.isSheetUnit = isSheetUnit;
const common_1 = require("@nestjs/common");
const snmp = __importStar(require("net-snmp"));
const TIMEOUT_MS = 2500;
const RETRIES = 1;
const MAX_REPETITIONS = 20;
const SCALAR = {
    sysDescr: '1.3.6.1.2.1.1.1.0',
    sysName: '1.3.6.1.2.1.1.5.0',
    hrDeviceDescr: '1.3.6.1.2.1.25.3.2.1.3.1',
    serialNumber: '1.3.6.1.2.1.43.5.1.1.17.1',
    pageCount: '1.3.6.1.2.1.43.10.2.1.4.1.1',
    counterUnit: '1.3.6.1.2.1.43.10.2.1.3.1.1',
};
exports.COUNTER_UNIT = {
    IMPRESSIONS: 7,
    SHEETS: 8,
    METERS: 17,
};
function isSheetUnit(unit) {
    if (unit === null)
        return true;
    return unit === exports.COUNTER_UNIT.IMPRESSIONS || unit === exports.COUNTER_UNIT.SHEETS;
}
const TABLE = {
    ifPhysAddress: '1.3.6.1.2.1.2.2.1.6',
    supplyDescription: '1.3.6.1.2.1.43.11.1.1.6',
    supplyColorantIndex: '1.3.6.1.2.1.43.11.1.1.3',
    supplyClass: '1.3.6.1.2.1.43.11.1.1.4',
    supplyType: '1.3.6.1.2.1.43.11.1.1.5',
    supplyMaxCapacity: '1.3.6.1.2.1.43.11.1.1.8',
    supplyLevel: '1.3.6.1.2.1.43.11.1.1.9',
    colorantValue: '1.3.6.1.2.1.43.12.1.1.4',
    alertSeverity: '1.3.6.1.2.1.43.18.1.1.2',
    alertGroup: '1.3.6.1.2.1.43.18.1.1.4',
    alertGroupIndex: '1.3.6.1.2.1.43.18.1.1.5',
    alertCode: '1.3.6.1.2.1.43.18.1.1.7',
    alertDescription: '1.3.6.1.2.1.43.18.1.1.8',
    consoleText: '1.3.6.1.2.1.43.16.5.1.2',
};
const COUNTER = {
    ricohId: '1.3.6.1.4.1.367.3.2.1.2.19.5.1.2',
    ricohValue: '1.3.6.1.4.1.367.3.2.1.2.19.5.1.9',
    canonId: '1.3.6.1.4.1.1602.1.11.1.3.1.2',
    canonValue: '1.3.6.1.4.1.1602.1.11.1.3.1.4',
};
const RICOH_COUNTER = {
    total: 400,
    mono: 401,
    single: 402,
    full: 403,
    print: 1806,
    copy: 701,
};
const CANON_COUNTER = { total: 101, mono: 108 };
const COLOR_NAMES = ['cyan', 'magenta', 'yellow'];
class SnmpUnreachableError extends Error {
}
exports.SnmpUnreachableError = SnmpUnreachableError;
const UTF8_STRICT = new TextDecoder('utf-8', { fatal: true });
const SHIFT_JIS = new TextDecoder('shift_jis', { fatal: true });
const UTF8_LOOSE = new TextDecoder('utf-8');
function decodeOctets(value) {
    try {
        return UTF8_STRICT.decode(value);
    }
    catch {
    }
    try {
        return SHIFT_JIS.decode(value);
    }
    catch {
        return UTF8_LOOSE.decode(value);
    }
}
function readText(value) {
    let text;
    if (Buffer.isBuffer(value)) {
        text = decodeOctets(value);
    }
    else if (typeof value === 'string') {
        text = value;
    }
    else {
        return null;
    }
    const cleaned = text.replace(/\p{Cc}/gu, ' ').trim();
    return cleaned.length > 0 ? cleaned : null;
}
function readNumber(value) {
    if (typeof value === 'number')
        return value;
    if (typeof value === 'bigint')
        return Number(value);
    return null;
}
function readMac(value) {
    if (!Buffer.isBuffer(value) || value.length !== 6)
        return null;
    if (value.every((byte) => byte === 0))
        return null;
    return Array.from(value)
        .map((byte) => byte.toString(16).padStart(2, '0').toUpperCase())
        .join(':');
}
function toPercent(level, maxCapacity) {
    if (level < 0)
        return null;
    if (maxCapacity > 0) {
        return Math.max(0, Math.min(100, Math.round((level / maxCapacity) * 100)));
    }
    if (maxCapacity < 0 && level <= 100)
        return level;
    return null;
}
let SnmpService = SnmpService_1 = class SnmpService {
    logger = new common_1.Logger(SnmpService_1.name);
    async poll(ipAddress, community, preferred = 'V1') {
        const order = preferred === 'V1' ? ['V1', 'V2C'] : ['V2C', 'V1'];
        for (const version of order) {
            try {
                return await this.pollWith(ipAddress, community, version);
            }
            catch (error) {
                if (!(error instanceof SnmpUnreachableError))
                    throw error;
                this.logger.debug(`${ipAddress}: SNMP ${version} は応答なし`);
            }
        }
        throw new SnmpUnreachableError(`${ipAddress} から SNMP の応答がありません。IP アドレス・コミュニティ名・機器側の SNMP 設定を確認してください`);
    }
    async dumpCounters(ipAddress, community, preferred = 'V1') {
        const order = preferred === 'V1' ? ['V1', 'V2C'] : ['V2C', 'V1'];
        for (const version of order) {
            try {
                return await this.dumpCountersWith(ipAddress, community, version);
            }
            catch (error) {
                if (!(error instanceof SnmpUnreachableError))
                    throw error;
                this.logger.debug(`${ipAddress}: SNMP ${version} は応答なし`);
            }
        }
        throw new SnmpUnreachableError(`${ipAddress} から SNMP の応答がありません。IP アドレス・コミュニティ名・機器側の SNMP 設定を確認してください`);
    }
    async dumpCountersWith(ipAddress, community, version) {
        const session = snmp.createSession(ipAddress, community, {
            version: version === 'V1' ? snmp.Version1 : snmp.Version2c,
            timeout: TIMEOUT_MS,
            retries: RETRIES,
        });
        session.on('error', (error) => {
            this.logger.debug(`${ipAddress}: セッションエラー ${error.message}`);
        });
        try {
            await this.get(session, SCALAR.sysName);
            const sysDescrRaw = await this.get(session, SCALAR.sysDescr);
            const sysDescr = sysDescrRaw ? readText(sysDescrRaw.value) : null;
            const descr = sysDescr ?? '';
            const vendor = /ricoh|ipsio/i.test(descr)
                ? 'ricoh'
                : /canon/i.test(descr)
                    ? 'canon'
                    : null;
            const table = vendor === 'ricoh'
                ? await this.readCounterTable(session, COUNTER.ricohId, COUNTER.ricohValue)
                : vendor === 'canon'
                    ? await this.readCounterTable(session, COUNTER.canonId, COUNTER.canonValue)
                    : new Map();
            return {
                version,
                vendor,
                sysDescr,
                counters: [...table.entries()]
                    .map(([id, value]) => ({ id, value }))
                    .sort((a, b) => a.id - b.id),
            };
        }
        finally {
            session.close();
        }
    }
    async pollWith(ipAddress, community, version) {
        const session = snmp.createSession(ipAddress, community, {
            version: version === 'V1' ? snmp.Version1 : snmp.Version2c,
            timeout: TIMEOUT_MS,
            retries: RETRIES,
        });
        session.on('error', (error) => {
            this.logger.debug(`${ipAddress}: セッションエラー ${error.message}`);
        });
        try {
            const sysName = await this.get(session, SCALAR.sysName);
            const [sysDescr, hrDeviceDescr, serialNumber, pageCount, counterUnit] = await Promise.all([
                this.get(session, SCALAR.sysDescr),
                this.get(session, SCALAR.hrDeviceDescr),
                this.get(session, SCALAR.serialNumber),
                this.get(session, SCALAR.pageCount),
                this.get(session, SCALAR.counterUnit),
            ]);
            const [macs, supplies, alerts, consoleText] = await Promise.all([
                this.walk(session, TABLE.ifPhysAddress),
                this.readSupplies(session),
                this.readAlerts(session),
                this.readConsoleText(session),
            ]);
            const macAddress = Array.from(macs.values())
                .map((varbind) => readMac(varbind.value))
                .find((mac) => mac !== null) ?? null;
            const total = pageCount ? readNumber(pageCount.value) : null;
            const descr = sysDescr ? readText(sysDescr.value) : null;
            const counts = await this.readCounts(session, descr, total, supplies);
            return {
                version,
                hostName: sysName ? readText(sysName.value) : null,
                model: (hrDeviceDescr ? readText(hrDeviceDescr.value) : null) ??
                    descr?.split(/[\r\n;]/)[0] ??
                    null,
                serialNumber: serialNumber ? readText(serialNumber.value) : null,
                macAddress,
                pageCount: total,
                counterUnit: counterUnit ? readNumber(counterUnit.value) : null,
                ...counts,
                supplies,
                alerts,
                consoleText,
            };
        }
        finally {
            session.close();
        }
    }
    async readAlerts(session) {
        const [severities, groups, groupIndexes, codes, descriptions] = await Promise.all([
            this.walk(session, TABLE.alertSeverity),
            this.walk(session, TABLE.alertGroup),
            this.walk(session, TABLE.alertGroupIndex),
            this.walk(session, TABLE.alertCode),
            this.walk(session, TABLE.alertDescription),
        ]);
        const alerts = [];
        for (const [suffix, varbind] of descriptions) {
            const alertIndex = lastIndexOf(suffix);
            if (alertIndex === null)
                continue;
            const rawGroupIndex = readNumber(groupIndexes.get(suffix)?.value ?? null);
            alerts.push({
                alertIndex,
                severity: readNumber(severities.get(suffix)?.value ?? null),
                alertGroup: readNumber(groups.get(suffix)?.value ?? null),
                groupIndex: rawGroupIndex !== null && rawGroupIndex > 0 ? rawGroupIndex : null,
                code: readNumber(codes.get(suffix)?.value ?? null),
                description: readText(varbind.value),
            });
        }
        return alerts
            .filter((alert) => alert.description !== null)
            .sort((a, b) => a.alertIndex - b.alertIndex);
    }
    async readConsoleText(session) {
        const rows = await this.walk(session, TABLE.consoleText);
        const lines = [...rows.entries()]
            .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
            .map(([, varbind]) => readText(varbind.value))
            .filter((line) => line !== null);
        return lines.length > 0 ? lines.join(' / ') : null;
    }
    async readSupplies(session) {
        const [descriptions, levels, capacities, colorantIndexes, colorantValues, types, classes,] = await Promise.all([
            this.walk(session, TABLE.supplyDescription),
            this.walk(session, TABLE.supplyLevel),
            this.walk(session, TABLE.supplyMaxCapacity),
            this.walk(session, TABLE.supplyColorantIndex),
            this.walk(session, TABLE.colorantValue),
            this.walk(session, TABLE.supplyType),
            this.walk(session, TABLE.supplyClass),
        ]);
        const colorants = new Map();
        for (const [suffix, varbind] of colorantValues) {
            const index = lastIndexOf(suffix);
            const name = readText(varbind.value);
            if (index !== null && name)
                colorants.set(index, name);
        }
        const supplies = [];
        for (const [suffix, varbind] of descriptions) {
            const supplyIndex = lastIndexOf(suffix);
            if (supplyIndex === null)
                continue;
            const name = readText(varbind.value) ?? `消耗品 ${supplyIndex}`;
            const level = readNumber(levels.get(suffix)?.value ?? null) ?? -1;
            const maxCapacity = readNumber(capacities.get(suffix)?.value ?? null) ?? -1;
            const colorantIndex = readNumber(colorantIndexes.get(suffix)?.value ?? null);
            supplies.push({
                supplyIndex,
                name,
                supplyType: readNumber(types.get(suffix)?.value ?? null),
                supplyClass: readNumber(classes.get(suffix)?.value ?? null),
                colorant: colorantIndex !== null
                    ? (colorants.get(colorantIndex) ?? null)
                    : null,
                level,
                maxCapacity,
                percent: toPercent(level, maxCapacity),
            });
        }
        supplies.sort((a, b) => a.supplyIndex - b.supplyIndex);
        const unique = new Set(supplies.map((supply) => supply.supplyIndex));
        if (unique.size !== supplies.length) {
            supplies.forEach((supply, position) => {
                supply.supplyIndex = position + 1;
            });
        }
        return supplies;
    }
    async readCounts(session, sysDescr, total, supplies) {
        const descr = sysDescr ?? '';
        if (/ricoh|ipsio/i.test(descr)) {
            const counters = await this.readCounterTable(session, COUNTER.ricohId, COUNTER.ricohValue);
            const mono = counters.get(RICOH_COUNTER.mono);
            if (mono !== undefined) {
                const color = (counters.get(RICOH_COUNTER.single) ?? 0) +
                    (counters.get(RICOH_COUNTER.full) ?? 0);
                return {
                    monoCount: mono,
                    colorCount: color,
                    printCount: counters.get(RICOH_COUNTER.print) ?? null,
                    copyCount: counters.get(RICOH_COUNTER.copy) ?? null,
                    scanCount: null,
                    countSource: 'vendor',
                };
            }
        }
        else if (/canon/i.test(descr)) {
            const counters = await this.readCounterTable(session, COUNTER.canonId, COUNTER.canonValue);
            const mono = counters.get(CANON_COUNTER.mono);
            const sum = counters.get(CANON_COUNTER.total);
            if (mono !== undefined && sum !== undefined) {
                return {
                    monoCount: mono,
                    colorCount: sum - mono,
                    printCount: null,
                    copyCount: null,
                    scanCount: null,
                    countSource: 'vendor',
                };
            }
        }
        const hasColor = supplies.some((supply) => supply.colorant !== null &&
            COLOR_NAMES.includes(supply.colorant.toLowerCase()));
        const noFunctions = {
            printCount: null,
            copyCount: null,
            scanCount: null,
        };
        if (!hasColor && supplies.length > 0 && total !== null) {
            return {
                monoCount: total,
                colorCount: 0,
                ...noFunctions,
                countSource: 'mono-only',
            };
        }
        return {
            monoCount: null,
            colorCount: null,
            ...noFunctions,
            countSource: 'none',
        };
    }
    async readCounterTable(session, idBase, valueBase) {
        const [ids, values] = await Promise.all([
            this.walk(session, idBase),
            this.walk(session, valueBase),
        ]);
        const counters = new Map();
        for (const [row, varbind] of ids) {
            const id = readCounterId(varbind.value);
            const value = readNumber(values.get(row)?.value ?? null);
            if (id !== null && value !== null)
                counters.set(id, value);
        }
        return counters;
    }
    get(session, oid) {
        return new Promise((resolve, reject) => {
            session.get([oid], (error, varbinds) => {
                if (error) {
                    if (error instanceof snmp.RequestTimedOutError) {
                        reject(new SnmpUnreachableError(error.message));
                        return;
                    }
                    resolve(null);
                    return;
                }
                const varbind = varbinds[0];
                if (!varbind || snmp.isVarbindError(varbind)) {
                    resolve(null);
                    return;
                }
                resolve(varbind);
            });
        });
    }
    walk(session, base) {
        return new Promise((resolve) => {
            const rows = new Map();
            session.subtree(base, MAX_REPETITIONS, (varbinds) => {
                for (const varbind of varbinds) {
                    if (snmp.isVarbindError(varbind))
                        continue;
                    if (!varbind.oid.startsWith(`${base}.`))
                        continue;
                    rows.set(varbind.oid.slice(base.length + 1), varbind);
                }
            }, () => resolve(rows));
        });
    }
};
exports.SnmpService = SnmpService;
exports.SnmpService = SnmpService = SnmpService_1 = __decorate([
    (0, common_1.Injectable)()
], SnmpService);
function readCounterId(value) {
    const direct = readNumber(value);
    if (direct !== null)
        return Number.isInteger(direct) ? direct : null;
    const text = readText(value);
    if (text === null)
        return null;
    const parsed = Number(text);
    return Number.isInteger(parsed) ? parsed : null;
}
function lastIndexOf(suffix) {
    const last = suffix.split('.').pop();
    if (last === undefined)
        return null;
    const parsed = Number(last);
    return Number.isInteger(parsed) ? parsed : null;
}
//# sourceMappingURL=snmp.service.js.map