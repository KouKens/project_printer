/**
 * 台帳の 1 台を実機に問い合わせ直す（POST /printer-assets/:id/refresh）。
 *
 * 端末情報の画面と機器一覧の両方から押せる。結果の形を写し取ると、
 * API 側に項目が増えたとき片方だけ古くなるのでここに置く
 * （実際、シリアルの書き戻し serial は後から足した）。
 */
import { request } from './request';

/**
 * 実機から読んだシリアルを台帳へ書き戻した結果。
 * 書くことが無かった（台帳に既にある / 実機が返さない）ときは null。
 * taken は同じシリアルの台帳が他にあって書けなかった、の意味
 */
export type SerialFill =
  | { status: 'filled'; serialNumber: string }
  | {
      status: 'taken';
      serialNumber: string;
      assetId: number;
      department: string | null;
      no: string | null;
    }
  | null;

export type RefreshResult = {
  id: number;
  ipAddress: string | null;
  /** ok = 取得できた / unreachable = 応答なし / no-ip = 台帳に IP が無い */
  status: 'ok' | 'unreachable' | 'no-ip';
  message: string | null;
  printer: {
    model: string | null;
    serialNumber: string | null;
    readings: unknown[];
  } | null;
  serial: SerialFill;
};

export const refreshAsset = (id: number) =>
  request<RefreshResult>(`/printer-assets/${id}/refresh`, { method: 'POST' });
