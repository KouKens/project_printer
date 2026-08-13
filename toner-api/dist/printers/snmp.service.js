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
exports.SnmpService = exports.SnmpUnreachableError = void 0;
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
};
const TABLE = {
    ifPhysAddress: '1.3.6.1.2.1.2.2.1.6',
    supplyDescription: '1.3.6.1.2.1.43.11.1.1.6',
    supplyColorantIndex: '1.3.6.1.2.1.43.11.1.1.3',
    supplyMaxCapacity: '1.3.6.1.2.1.43.11.1.1.8',
    supplyLevel: '1.3.6.1.2.1.43.11.1.1.9',
    colorantValue: '1.3.6.1.2.1.43.12.1.1.4',
};
class SnmpUnreachableError extends Error {
}
exports.SnmpUnreachableError = SnmpUnreachableError;
function readText(value) {
    let text;
    if (Buffer.isBuffer(value)) {
        text = value.toString('utf8');
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
            const [sysDescr, hrDeviceDescr, serialNumber, pageCount] = await Promise.all([
                this.get(session, SCALAR.sysDescr),
                this.get(session, SCALAR.hrDeviceDescr),
                this.get(session, SCALAR.serialNumber),
                this.get(session, SCALAR.pageCount),
            ]);
            const [macs, supplies] = await Promise.all([
                this.walk(session, TABLE.ifPhysAddress),
                this.readSupplies(session),
            ]);
            const macAddress = Array.from(macs.values())
                .map((varbind) => readMac(varbind.value))
                .find((mac) => mac !== null) ?? null;
            return {
                version,
                hostName: sysName ? readText(sysName.value) : null,
                model: (hrDeviceDescr ? readText(hrDeviceDescr.value) : null) ??
                    (sysDescr ? readText(sysDescr.value)?.split(/[\r\n;]/)[0] : null) ??
                    null,
                serialNumber: serialNumber ? readText(serialNumber.value) : null,
                macAddress,
                pageCount: pageCount ? readNumber(pageCount.value) : null,
                supplies,
            };
        }
        finally {
            session.close();
        }
    }
    async readSupplies(session) {
        const [descriptions, levels, capacities, colorantIndexes, colorantValues] = await Promise.all([
            this.walk(session, TABLE.supplyDescription),
            this.walk(session, TABLE.supplyLevel),
            this.walk(session, TABLE.supplyMaxCapacity),
            this.walk(session, TABLE.supplyColorantIndex),
            this.walk(session, TABLE.colorantValue),
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
function lastIndexOf(suffix) {
    const last = suffix.split('.').pop();
    if (last === undefined)
        return null;
    const parsed = Number(last);
    return Number.isInteger(parsed) ? parsed : null;
}
//# sourceMappingURL=snmp.service.js.map