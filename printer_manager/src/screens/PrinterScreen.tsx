import { useCallback, useEffect, useState } from 'react';
import { request } from '../lib/request';
import './PrinterScreen.css';

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

/** 一括登録の 1 行分の結果 */
type BulkResult = {
  ipAddress: string;
  status: 'registered' | 'failed';
  model: string | null;
  location: string | null;
  message?: string;
};

/**
 * 貼り付けた文字列を 1 行 1 台として読む。
 * 「IP」だけの行と「IP,設置場所」の行の両方を受ける。
 * 区切りはカンマ・タブ・全角カンマのいずれでもよい。
 * IP に見えない行（見出しの「IP」や「USB接続」など）は落とす。
 */
function parseBulkInput(text: string): { entries: { ipAddress: string; location?: string }[]; skipped: string[] } {
  const entries: { ipAddress: string; location?: string }[] = [];
  const skipped: string[] = [];
  const seen = new Set<string>();

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed === '') continue;

    const [rawIp, ...rest] = trimmed.split(/[,\t，]/);
    const ip = rawIp.trim();

    if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) {
      skipped.push(trimmed);
      continue;
    }
    // 同じ IP を 2 回投げても意味がない
    if (seen.has(ip)) continue;
    seen.add(ip);

    const place = rest.join(',').trim();
    entries.push(place ? { ipAddress: ip, location: place } : { ipAddress: ip });
  }

  return { entries, skipped };
}

export default function PrinterScreen() {
  const [ipAddress, setIpAddress] = useState('');
  const [community, setCommunity] = useState('public');
  const [location, setLocation] = useState('');
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [bulkText, setBulkText] = useState('');
  const [useLedger, setUseLedger] = useState(true);
  const [bulkResults, setBulkResults] = useState<BulkResult[] | null>(null);

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

  /** 貼り付けた IP をまとめて登録する。応答しない機器があっても他は続く */
  const submitBulk = async () => {
    const { entries, skipped } = parseBulkInput(bulkText);

    if (entries.length === 0) {
      setError('IP アドレスとして読める行がありません');
      return;
    }

    setBusy(true);
    setError(null);
    setNotice(null);
    setBulkResults(null);

    try {
      const results = await request<BulkResult[]>('/printers/bulk', {
        method: 'POST',
        body: JSON.stringify({
          printers: entries,
          community: community.trim() || undefined,
          fillLocationFromLedger: useLedger,
        }),
      });

      setBulkResults(results);
      const ok = results.filter((r) => r.status === 'registered').length;
      setNotice(
        `${ok} 台を登録しました（応答なし ${results.length - ok} 台` +
          `${skipped.length > 0 ? ` / IP として読めず除外 ${skipped.length} 行` : ''}）`,
      );
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

      <section className="pr-bulk">
        <h2>まとめて登録</h2>
        <p>
          1 行に 1 台。「IP アドレス」だけ、または「IP アドレス,設置場所」の形で貼り付けます。
          IP として読めない行は読み飛ばします。
        </p>

        <textarea
          value={bulkText}
          onChange={(e) => setBulkText(e.target.value)}
          rows={7}
          placeholder={'172.31.13.211,予約外来（１診）\n172.31.32.201\n172.31.10.208'}
          spellCheck={false}
        />

        <label className="pr-check">
          <input
            type="checkbox"
            checked={useLedger}
            onChange={(e) => setUseLedger(e.target.checked)}
          />
          <span>
            設置場所が空の機器は、端末台帳の部署を入れる（シリアルで突き合わせ）
          </span>
        </label>

        <button onClick={() => void submitBulk()} disabled={busy || bulkText.trim() === ''}>
          {busy ? '登録中…' : 'まとめて登録'}
        </button>
      </section>

      {error && <p className="pr-msg pr-msg-error">{error}</p>}
      {notice && <p className="pr-msg pr-msg-ok">{notice}</p>}

      {bulkResults && (
        <div className="pr-bulk-result">
          <table>
            <thead>
              <tr>
                <th>IP アドレス</th>
                <th>結果</th>
                <th>機種 / 理由</th>
                <th>設置場所</th>
              </tr>
            </thead>
            <tbody>
              {bulkResults.map((row) => (
                <tr key={row.ipAddress} className={row.status === 'failed' ? 'pr-ng' : undefined}>
                  <td className="pr-ip-cell">{row.ipAddress}</td>
                  <td>{row.status === 'registered' ? '登録' : '応答なし'}</td>
                  <td>{row.status === 'registered' ? (row.model ?? '—') : (row.message ?? '—')}</td>
                  <td>{row.location ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
