import { useEffect, useState } from 'react'
import { request } from '../lib/request'
import { useCompany, type Company } from '../lib/company'
import './CompanyScreen.css'

/**
 * 拠点の登録。**在庫と受け払いを分ける単位。**
 *
 * ここで足した拠点が、画面右上のセレクタに並ぶ。
 * 持ち出し・廃棄・注文・搬入・棚卸と、トナー個数状況・トナー入出状況が
 * 選んだ拠点の分だけを扱う。プリンター状況・印刷状況・修理・請求書・
 * 運用コストは拠点で分けず、全拠点まとめて出す。
 *
 * **見せない仕組みではない。** 認証が無いので、セレクタを切り替えれば
 * 誰でも他の拠点を見られる。閲覧を本当に制限するならログインが要る。
 */

type Form = {
  name: string
  sortOrder: string
  note: string
}

const EMPTY: Form = { name: '', sortOrder: '', note: '' }

export default function CompanyScreen() {
  const { reload } = useCompany()
  const [rows, setRows] = useState<Company[]>([])
  const [form, setForm] = useState<Form>(EMPTY)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const load = async () => {
    try {
      // 登録の画面だけは無効にした拠点も出す（元に戻せるようにするため）
      setRows(await request<Company[]>('/companies?includeDisabled=1'))
      setError(null)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const set = (key: keyof Form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  /** 送る形。並び順の空欄は 0（同値なら名前順で並ぶ） */
  const payload = () => ({
    name: form.name.trim(),
    sortOrder: form.sortOrder.trim() === '' ? 0 : Number(form.sortOrder),
    note: form.note.trim() === '' ? null : form.note.trim(),
  })

  /** 登録・更新のあとはセレクタも取り直す。名前を直したら見出しも変わるため */
  const after = async (message: string) => {
    setNotice(message)
    setForm(EMPTY)
    setEditingId(null)
    await load()
    await reload()
  }

  const run = async (task: () => Promise<void>) => {
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      await task()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const save = () =>
    run(async () => {
      if (editingId === null) {
        const saved = await request<Company>('/companies', {
          method: 'POST',
          body: JSON.stringify(payload()),
        })
        await after(`${saved.name} を登録しました`)
      } else {
        const saved = await request<Company>(`/companies/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload()),
        })
        await after(`${saved.name} を更新しました`)
      }
    })

  const edit = (row: Company) => {
    setForm({
      name: row.name,
      sortOrder: String(row.sortOrder),
      note: row.note ?? '',
    })
    setEditingId(row.id)
    setError(null)
    setNotice(null)
  }

  const setDisabled = (row: Company, disable: boolean) =>
    run(async () => {
      if (disable) {
        const has = [
          row.counts.assets > 0 ? `機器 ${row.counts.assets} 台` : null,
          row.counts.entries > 0 ? `受付の履歴 ${row.counts.entries} 件` : null,
          row.counts.orders > 0 ? `注文 ${row.counts.orders} 件` : null,
        ].filter(Boolean)

        if (
          !window.confirm(
            `${row.name} を無効にします。\n\n` +
              '画面右上のセレクタから外れます。\n' +
              (has.length > 0 ? `ぶら下がっている記録: ${has.join('・')}\n` : '') +
              '記録は消えません。いつでも元に戻せます。',
          )
        ) {
          return
        }
      }

      await request(`/companies/${row.id}/${disable ? 'disable' : 'enable'}`, {
        method: 'POST',
      })
      await after(`${row.name} を${disable ? '無効にしました' : '元に戻しました'}`)
    })

  const remove = (row: Company) =>
    run(async () => {
      if (
        !window.confirm(
          `${row.name} を完全に削除します。\n\n` +
            'この操作は元に戻せません。\n' +
            '機器・在庫・受付の履歴・注文がぶら下がっている拠点は削除できません。\n' +
            'セレクタから外しておきたいだけなら、無効のままにしておいてください。',
        )
      ) {
        return
      }

      await request(`/companies/${row.id}`, { method: 'DELETE' })
      await after(`${row.name} を削除しました`)
    })

  const active = rows.filter((row) => row.disabledAt === null)
  const disabled = rows.filter((row) => row.disabledAt !== null)

  return (
    <div className="cp">
      <section className="cp-form">
        <h2>{editingId === null ? '拠点を登録' : '拠点を編集'}</h2>
        <p className="cp-hint">
          <strong>在庫と受け払いを分ける単位です。</strong>
          持ち出し・廃棄・注文・搬入・棚卸と、トナー個数状況・トナー入出状況が
          画面右上で選んだ拠点の分だけになります。
          プリンター状況・印刷状況・修理・請求書・運用コストは全拠点まとめて出します。
          <br />
          同じ品番を各拠点が使えます（品番マスタは全拠点共通で、在庫だけ拠点ごとに数えます）。
          <strong>ログインは無いので、セレクタを切り替えれば誰でも他の拠点を見られます。</strong>
        </p>

        <label>
          <span>拠点名</span>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set('name')(e.target.value)}
            placeholder="シマリス小郡"
          />
        </label>

        <label>
          <span>並び順</span>
          <input
            type="number"
            value={form.sortOrder}
            onChange={(e) => set('sortOrder')(e.target.value)}
            placeholder="空欄なら 0"
            title="小さいほど上に出ます。同じ値なら名前順です"
          />
        </label>

        <label>
          <span>覚え書き</span>
          <input
            type="text"
            value={form.note}
            onChange={(e) => set('note')(e.target.value)}
            placeholder="略称や管理上のメモ"
          />
        </label>

        <div className="cp-actions">
          <button onClick={() => void save()} disabled={busy || form.name.trim() === ''}>
            {editingId === null ? '登録' : '更新'}
          </button>
          <button
            className="cp-sub"
            type="button"
            onClick={() => {
              setForm(EMPTY)
              setEditingId(null)
            }}
            disabled={busy}
          >
            クリア
          </button>
          {editingId !== null && <span className="cp-editing">編集中</span>}
        </div>
      </section>

      {error && <p className="cp-msg cp-msg-error">{error}</p>}
      {notice && <p className="cp-msg cp-msg-ok">{notice}</p>}

      <section className="cp-list">
        <h2>登録した拠点（{active.length} 拠点）</h2>
        <div className="cp-table-wrap">
          <table className="cp-table">
            <thead>
              <tr>
                <th>拠点名</th>
                <th className="cp-num">並び順</th>
                <th className="cp-num">機器</th>
                <th className="cp-num">在庫の記録</th>
                <th className="cp-num">受付の履歴</th>
                <th className="cp-num">注文</th>
                <th>覚え書き</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {active.map((row) => (
                <tr key={row.id}>
                  <td>{row.name}</td>
                  <td className="cp-num">{row.sortOrder}</td>
                  <td className="cp-num">{row.counts.assets}</td>
                  <td className="cp-num">{row.counts.stocks}</td>
                  <td className="cp-num">{row.counts.entries}</td>
                  <td className="cp-num">{row.counts.orders}</td>
                  <td>{row.note ?? '—'}</td>
                  <td className="cp-ops">
                    <button type="button" onClick={() => edit(row)} disabled={busy}>
                      編集
                    </button>
                    <button
                      type="button"
                      onClick={() => void setDisabled(row, true)}
                      disabled={busy}
                      title="セレクタから外します。記録は消えません"
                    >
                      無効にする
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {disabled.length > 0 && (
        <section className="cp-list cp-disabled">
          <h2>無効にした拠点（{disabled.length} 拠点）</h2>
          <p className="cp-hint">
            セレクタから外れています。<strong>記録は消えていません。</strong>
            登録し間違えた拠点は「削除」で完全に消せますが、
            <strong>機器・在庫・履歴・注文がぶら下がっていると削除できません。</strong>
          </p>
          <div className="cp-table-wrap">
            <table className="cp-table">
              <thead>
                <tr>
                  <th>拠点名</th>
                  <th className="cp-num">機器</th>
                  <th className="cp-num">受付の履歴</th>
                  <th>無効にした日時</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {disabled.map((row) => (
                  <tr key={row.id}>
                    <td>{row.name}</td>
                    <td className="cp-num">{row.counts.assets}</td>
                    <td className="cp-num">{row.counts.entries}</td>
                    <td>
                      {row.disabledAt
                        ? new Date(row.disabledAt).toLocaleString('ja-JP')
                        : '—'}
                    </td>
                    <td className="cp-ops">
                      <button
                        type="button"
                        onClick={() => void setDisabled(row, false)}
                        disabled={busy}
                      >
                        元に戻す
                      </button>
                      <button
                        type="button"
                        className="cp-danger"
                        onClick={() => void remove(row)}
                        disabled={busy}
                        title="完全に削除します。元に戻せません"
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
