import { useCallback, useEffect, useState } from 'react';
import './PrinterScreen.css';

// 既定は相対パス。他の画面と同じく vite の proxy 経由で API に届く
const API = import.meta.env.VITE_API_BASE ?? '/api';

type SupplyReading = {
  id: number;
  supplyIndex: number;
  name: string;
  colorant: string | null;
  level: number;
  maxCapacity: number;
  percent: number | null;
};

type Printer = {
  id: number;
  ipAddress: string;
  hostName: string | null;
  model: string | null;
  serialNumber: string | null;
  macAddress: string | null;
  location: string | null;
  pageCount: number | null;
  reachable: boolean;
  lastPolledAt: string | null;
  readings: SupplyReading[];
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const message = Array.isArray(body?.message) ? body.message.join(' / ') : body?.message;
    throw new Error(message ?? `通信に失敗しました (HTTP ${res.status})`);
  }
  return body as T;
}

export default function PrinterScreen() {
  const [ipAddress, setIpAddress] = useState('');
  const [community, setCommunity] = useState('public');
  const [location, setLocation] = useState('');
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setPrinters(await request<Printer[]>('/printers'));
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const submit = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const saved = await request<Printer>('/printers', {
        method: 'POST',
        body: JSON.stringify({
          ipAddress: ipAddress.trim(),
          community: community.trim() || undefined,
          location: location.trim() || undefined,
        }),
      });
      setNotice(`${saved.ipAddress}（${saved.model ?? '機種名なし'}）を登録しました`);
      setIpAddress('');
      setLocation('');
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const repoll = async (id: number) => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await request<Printer>(`/printers/${id}/poll`, { method: 'POST' });
      setNotice('最新の情報を取得しました');
      await load();
    } catch (err) {
      setError((err as Error).message);
      // 応答なしも DB には記録されるので、カードを最新の状態に合わせる
      await load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pr">
      <header className="pr-head">
        <h1>プリンター登録</h1>
        <p>IP アドレスを入力すると SNMP で機器情報とトナー残量を取得し、DB に保存します。</p>
      </header>

      <section className="pr-form">
        <label>
          <span>IP アドレス</span>
          <input
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !busy && ipAddress && void submit()}
            placeholder="192.168.10.21"
            inputMode="decimal"
            autoFocus
          />
        </label>

        <label>
          <span>コミュニティ名</span>
          <input value={community} onChange={(e) => setCommunity(e.target.value)} />
        </label>

        <label>
          <span>設置場所（任意）</span>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="3F 外来受付"
          />
        </label>

        <button onClick={() => void submit()} disabled={busy || !ipAddress.trim()}>
          {busy ? '取得中…' : '取得して登録'}
        </button>
      </section>

      {error && <p className="pr-msg pr-msg-error">{error}</p>}
      {notice && <p className="pr-msg pr-msg-ok">{notice}</p>}

      <section className="pr-list">
        {printers.length === 0 && (
          <p className="pr-empty">まだ登録がありません。上の欄に IP アドレスを入力してください。</p>
        )}

        {printers.map((p) => (
          <article key={p.id} className={p.reachable ? 'pr-card' : 'pr-card pr-card-down'}>
            <div className="pr-card-head">
              <span className="pr-ip">{p.ipAddress}</span>
              <span className="pr-model">{p.model ?? p.hostName ?? '機種名を取得できませんでした'}</span>
              <button className="pr-repoll" onClick={() => void repoll(p.id)} disabled={busy}>
                再取得
              </button>
            </div>

            <dl className="pr-meta">
              <div><dt>シリアル</dt><dd>{p.serialNumber ?? '—'}</dd></div>
              <div><dt>MAC</dt><dd>{p.macAddress ?? '—'}</dd></div>
              <div><dt>設置場所</dt><dd>{p.location ?? '—'}</dd></div>
              <div><dt>累計印刷</dt><dd>{p.pageCount?.toLocaleString() ?? '—'} 枚</dd></div>
              <div>
                <dt>最終取得</dt>
                <dd>{p.lastPolledAt ? new Date(p.lastPolledAt).toLocaleString('ja-JP') : '—'}</dd>
              </div>
            </dl>

            {p.readings.length > 0 && (
              <ul className="pr-supplies">
                {p.readings.map((s) => (
                  <li key={s.id}>
                    <span className="pr-supply-name">{s.name}</span>
                    <span className="pr-bar" aria-hidden>
                      <span className="pr-bar-fill" style={{ width: `${s.percent ?? 0}%` }} />
                    </span>
                    <span className="pr-supply-pct">
                      {s.percent !== null ? `${s.percent}%` : s.level === -3 ? '残量あり' : '不明'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </section>
    </div>
  );
}
