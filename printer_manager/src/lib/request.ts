/**
 * 画面から API を叩くときの共通処理。
 * 各画面に同じものが 7 つ並んでいたのでここにまとめた。
 */

/**
 * API の基点。既定は相対パスで、vite の proxy が 3000 番へ渡す。
 * 絶対 URL に変えると API 側に CORS の設定が要る
 */
export const API = import.meta.env.VITE_API_BASE ?? '/api';

/**
 * JSON を取り、失敗したら本文のメッセージで Error にする。
 * NestJS の ValidationPipe は message を配列で返すので、つなげて 1 行にする
 */
export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    // 1 つの欄に検査が 2 つ付いていると、同じ文面が 2 回届く
    // （拠点の「拠点を選んでください / 拠点を選んでください」）。重なった分は 1 回にする
    const message = Array.isArray(body?.message)
      ? [...new Set(body.message)].join(' / ')
      : body?.message;
    throw new Error(message ?? `通信に失敗しました (HTTP ${res.status})`);
  }
  return body as T;
}
