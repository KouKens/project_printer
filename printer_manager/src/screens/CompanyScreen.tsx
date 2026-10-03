import { useEffect, useState } from 'react'
import CsvButton from '../components/CsvButton'
import Modal from '../components/Modal'
import type { CsvValue } from '../lib/csv'
import { request } from '../lib/request'
import { useCompany, type Company } from '../lib/company'
import './CompanyScreen.css'

/**
 * 拠点の登録。**在庫と受け払いを分ける単位。**
 *
 * ここで足した拠点が、拠点ごとに数える 4 画面（持出/廃棄・注文/搬入・棚卸・
 * トナー個数状況）の拠点欄に並び、その画面は選んだ拠点の分だけを扱う。
 * それ以外の画面（トナー入出状況・プリンター状況・印刷状況・修理・請求書・
 * 運用コストなど）は拠点で分けず、全拠点まとめて出す。
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

/** 送る形。並び順の空欄は 0（同値なら名前順で並ぶ） */
const toPayload = (form: Form) => ({
  name: form.name.trim(),
  sortOrder: form.sortOrder.trim() === '' ? 0 : Number(form.sortOrder),
  note: form.note.trim() === '' ? null : form.note.trim(),
})

/** 入力欄。新規登録の欄と、編集の小窓で同じものを使う */
function CompanyFields({
  form,
  onChange,
}: {
  form: Form
  onChange: (key: keyof Form, value: string) => void
}) {
  return (
    <div className="cp-fields">
      <label>
        <span>拠点名</span>
        <input
          type="text"
          value={form.name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="シマリス小郡"
        />
      </label>

      <label>
        <span>並び順</span>
        <input
          type="number"
          value={form.sortOrder}
          onChange={(e) => onChange('sortOrder', e.target.value)}
          placeholder="空欄なら 0"
          title="小さいほど上に出ます。同じ値なら名前順です"
        />
      </label>

      <label>
        <span>覚え書き</span>
        <input
          type="text"
          value={form.note}
          onChange={(e) => onChange('note', e.target.value)}
          placeholder="略称や管理上のメモ"
        />
      </label>
    </div>
  )
}

/**
 * CSV に出す列。**無効にした拠点も同じ列で出す。**
 * 画面の別枠は列を減らしてあるが、ファイルにすると 2 つを並べて見ることが多いので
 * 揃えておき、無効かどうかは最後の列で示す
 */
const CSV_COLUMNS: { label: string; value: (row: Company) => CsvValue }[] = [
  { label: '拠点名', value: (row) => row.name },
  { label: '並び順', value: (row) => row.sortOrder },
  { label: '機器', value: (row) => row.counts.assets },
  { label: '在庫の記録', value: (row) => row.counts.stocks },
  { label: '受付の履歴', value: (row) => row.counts.entries },
  { label: '注文', value: (row) => row.counts.orders },
  { label: '覚え書き', value: (row) => row.note },
  {
    label: '無効にした日時',
    value: (row) =>
      row.disabledAt ? new Date(row.disabledAt).toLocaleString('ja-JP') : null,
  },
]

const csvHeader = CSV_COLUMNS.map((col) => col.label)
const csvRows = (rows: Company[]) =>
  rows.map((row) => CSV_COLUMNS.map((col) => col.value(row)))

export default function CompanyScreen() {
  const { reload } = useCompany()
  const [rows, setRows] = useState<Company[]>([])
  /** 新規登録の欄。**新規専用。** 既存の拠点を直すのは下の小窓 */
  const [form, setForm] = useState<Form>(EMPTY)
  /** 編集の小窓。null なら閉じている。新規の欄とは別に下書きを持つ */
  const [editing, setEditing] = useState<{ id: number; name: string; form: Form } | null>(
    null,
  )
  const [editError, setEditError] = useState<string | null>(null)
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

  const set = (key: keyof Form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const setDraft = (key: keyof Form, value: string) =>
    setEditing((prev) => prev && { ...prev, form: { ...prev.form, [key]: value } })

  /**
   * 登録・更新のあとはセレクタも取り直す。名前を直したら見出しも変わるため。
   * **新規の欄はここでは空にしない**（無効にした・戻したで、書きかけの登録を消さない）
   */
  const after = async (message: string) => {
    setNotice(message)
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

  /** 新規登録。上の欄は新規専用なので、登録したら空に戻す（続けて押しても二重にならない） */
  const create = () =>
    run(async () => {
      const saved = await request<Company>('/companies', {
        method: 'POST',
        body: JSON.stringify(toPayload(form)),
      })
      setForm(EMPTY)
      await after(`${saved.name} を登録しました`)
    })

  /** 一覧の「編集」。小窓を開くだけで、上の新規の欄には触らない */
  const edit = (row: Company) => {
    setEditing({
      id: row.id,
      name: row.name,
      form: {
        name: row.name,
        sortOrder: String(row.sortOrder),
        note: row.note ?? '',
      },
    })
    setEditError(null)
    setNotice(null)
  }

  /**
   * 小窓の保存。**失敗したら小窓を開いたまま、中に文面を出す**
   * （閉じると直した値が消え、後ろの知らせ欄は覆われて見えない）
   */
  const update = async () => {
    if (editing === null) return
    setBusy(true)
    setEditError(null)
    try {
      const saved = await request<Company>(`/companies/${editing.id}`, {
        method: 'PATCH',
        body: JSON.stringify(toPayload(editing.form)),
      })
      setEditing(null)
      setError(null)
      await after(`${saved.name} を更新しました`)
    } catch (err) {
      setEditError((err as Error).message)
    } finally {
      setBusy(false)
    }
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
              '持出/廃棄・注文/搬入・棚卸・トナー個数状況の拠点欄から外れます。\n' +
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
        <h2>拠点を登録</h2>
        <p className="cp-hint">
          <strong>在庫と受け払いを分ける単位です。</strong>
          持出/廃棄・注文/搬入・棚卸・トナー個数状況は、画面の中の「拠点」で選んだ拠点の分だけになります。
          それ以外の画面（トナー入出状況・プリンター状況・印刷状況・修理・請求書・運用コストなど）は
          全拠点まとめて出します。
          <br />
          同じ品番を各拠点が使えます（品番マスタは全拠点共通で、在庫だけ拠点ごとに数えます）。
          <strong>ログインは無いので、セレクタを切り替えれば誰でも他の拠点を見られます。</strong>
        </p>

        <CompanyFields form={form} onChange={set} />

        <div className="cp-actions">
          <button onClick={() => void create()} disabled={busy || form.name.trim() === ''}>
            登録
          </button>
          <button
            className="cp-sub"
            type="button"
            onClick={() => setForm(EMPTY)}
            disabled={busy}
          >
            クリア
          </button>
        </div>
      </section>

      {error && <p className="cp-msg cp-msg-error">{error}</p>}
      {notice && <p className="cp-msg cp-msg-ok">{notice}</p>}

      <section className="cp-list">
        <h2>
          登録した拠点（{active.length} 拠点）
          <CsvButton
            name="拠点登録"
            header={csvHeader}
            rows={() => csvRows(active)}
            count={active.length}
          />
        </h2>
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
          <h2>
            無効にした拠点（{disabled.length} 拠点）
            <CsvButton
              name="拠点登録_無効"
              header={csvHeader}
              rows={() => csvRows(disabled)}
              count={disabled.length}
            />
          </h2>
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

      {editing && (
        <Modal
          title={`${editing.name} を編集`}
          onClose={() => setEditing(null)}
          busy={busy}
          error={editError}
          width={560}
          footer={
            <>
              <button
                className="md-sub"
                type="button"
                onClick={() => setEditing(null)}
                disabled={busy}
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={() => void update()}
                disabled={busy || editing.form.name.trim() === ''}
              >
                {busy ? '保存中…' : '更新'}
              </button>
            </>
          }
        >
          <CompanyFields form={editing.form} onChange={setDraft} />
        </Modal>
      )}
    </div>
  )
}
