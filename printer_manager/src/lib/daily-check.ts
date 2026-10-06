/**
 * 毎日チェックの印を付ける／外す（POST /printer-assets/:id/daily-check）。
 *
 * プリンター状況とプリンター登録の一覧の ★ から呼ぶ。**押した時点で保存する。**
 * 台帳の他の列は送らず、更新日も動かない（API 側で読んだ値を書き戻している）
 */
import { request } from './request';

export const saveDailyCheck = (id: number, dailyCheck: boolean) =>
  request<{ id: number; dailyCheck: boolean }>(`/printer-assets/${id}/daily-check`, {
    method: 'POST',
    body: JSON.stringify({ dailyCheck }),
  });
