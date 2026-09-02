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
var SatoStatusService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SatoStatusService = exports.SatoUnreachableError = exports.SATO_STATUS_PORT = void 0;
exports.parseSatoStatus = parseSatoStatus;
const common_1 = require("@nestjs/common");
const net = __importStar(require("node:net"));
const ENQ = 0x05;
const STX = 0x02;
const ETX = 0x03;
exports.SATO_STATUS_PORT = 9100;
const TIMEOUT_MS = 5000;
const STATUS = {
    A: { label: 'エラーなし（印字停止中）', kind: 'ok' },
    B: { label: 'リボン／ラベルニアエンド', kind: 'warn', nearEnd: true },
    C: { label: '受信バッファニアフル', kind: 'warn' },
    D: {
        label: 'リボン／ラベルニアエンド＆バッファニアフル',
        kind: 'warn',
        nearEnd: true,
    },
    E: { label: '受信待ち', kind: 'ok' },
    G: { label: 'エラーなし（印字中）', kind: 'ok' },
    H: {
        label: 'リボン／ラベルニアエンド（印字中）',
        kind: 'warn',
        nearEnd: true,
    },
    I: { label: '受信バッファニアフル（印字中）', kind: 'warn' },
    J: {
        label: 'リボン／ラベルニアエンド＆バッファニアフル（印字中）',
        kind: 'warn',
        nearEnd: true,
    },
    K: { label: '印字中', kind: 'ok' },
    Q: { label: '待機中（ハクリ・カット待ち）', kind: 'ok' },
    V: {
        label: 'リボン／ラベルニアエンド＆バッファニアフル',
        kind: 'warn',
        nearEnd: true,
    },
    W: { label: '解析・編集中', kind: 'ok' },
    a: { label: '受信バッファフル', kind: 'error' },
    b: { label: 'ヘッドオープン', kind: 'error' },
    c: { label: 'ペーパーエンド（用紙切れ）', kind: 'error' },
    d: { label: 'リボンエンド（リボン切れ）', kind: 'error' },
    e: { label: 'メディアエラー（印字エラー）', kind: 'error' },
    f: { label: 'センサエラー・紙詰まり', kind: 'error' },
    g: { label: 'ヘッド異常', kind: 'error' },
    h: { label: 'カバーオープン・カッターオープン', kind: 'error' },
    i: { label: 'カードエラー', kind: 'error' },
    j: { label: 'カッターエラー', kind: 'error' },
    k: { label: 'その他のエラー', kind: 'error' },
    m: { label: 'スタッカー／リワインダフル', kind: 'error' },
    o: { label: 'RFID タグエラー', kind: 'error' },
    p: { label: 'RFID プロテクトエラー', kind: 'error' },
};
class SatoUnreachableError extends Error {
}
exports.SatoUnreachableError = SatoUnreachableError;
function parseSatoStatus(buffer) {
    const start = buffer.indexOf(STX);
    const end = buffer.indexOf(ETX, start + 1);
    if (start < 0 || end < 0 || end - start < 10) {
        throw new SatoUnreachableError(`ステータスの形式が仕様と違います（受信: ${buffer.toString('hex')}）`);
    }
    const body = buffer.subarray(start + 1, end);
    const jobId = body.subarray(0, 2).toString('latin1');
    const code = body.subarray(2, 3).toString('latin1');
    const remaining = Number.parseInt(body.subarray(3, 9).toString('latin1'), 10);
    const info = STATUS[code] ?? {
        label: `不明なステータス（コード ${code}）`,
        kind: 'error',
    };
    return {
        code,
        label: info.label,
        kind: info.kind,
        nearEnd: info.nearEnd === true,
        jobId: jobId.trim(),
        remaining: Number.isNaN(remaining) ? 0 : remaining,
        raw: buffer.toString('hex'),
    };
}
let SatoStatusService = SatoStatusService_1 = class SatoStatusService {
    logger = new common_1.Logger(SatoStatusService_1.name);
    async poll(ipAddress, port = exports.SATO_STATUS_PORT) {
        const buffer = await this.request(ipAddress, port);
        return parseSatoStatus(buffer);
    }
    request(ipAddress, port) {
        return new Promise((resolve, reject) => {
            const socket = new net.Socket();
            const chunks = [];
            let settled = false;
            const finish = (error, data) => {
                if (settled)
                    return;
                settled = true;
                socket.destroy();
                if (error)
                    reject(error);
                else
                    resolve(data);
            };
            socket.setTimeout(TIMEOUT_MS);
            socket.on('timeout', () => finish(new SatoUnreachableError(`${ipAddress}:${port} から応答がありません。電源・LAN・通信プロトコルの設定（ステータス返送）を確認してください`)));
            socket.on('error', (error) => finish(new SatoUnreachableError(`${ipAddress}:${port} へ接続できません（${error.message}）`)));
            socket.on('data', (chunk) => {
                chunks.push(chunk);
                const all = Buffer.concat(chunks);
                if (all.includes(ETX))
                    finish(null, all);
            });
            socket.on('close', () => {
                const all = Buffer.concat(chunks);
                finish(all.length > 0
                    ? null
                    : new SatoUnreachableError(`${ipAddress}:${port} が応答を返さずに切断しました`), all);
            });
            socket.connect(port, ipAddress, () => {
                this.logger.debug(`${ipAddress}:${port} へ ENQ を送信`);
                socket.write(Buffer.from([ENQ]));
            });
        });
    }
};
exports.SatoStatusService = SatoStatusService;
exports.SatoStatusService = SatoStatusService = SatoStatusService_1 = __decorate([
    (0, common_1.Injectable)()
], SatoStatusService);
//# sourceMappingURL=sato-status.service.js.map