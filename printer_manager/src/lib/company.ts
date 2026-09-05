/**
 * いま選んでいる拠点。
 *
 * **在庫と受け払いを分ける単位。** 持ち出し・廃棄・注文・搬入・棚卸と、
 * トナー個数状況・トナー入出状況はこの拠点の分だけを扱う。
 * プリンター状況・印刷状況・修理・請求書・運用コストは全拠点まとめて出す。
 *
 * **これは「見せない」仕組みではない。** 認証を持たないシステムなので、
 * セレクタを切り替えれば誰でも他の拠点を見られる。
 * 閲覧を本当に制限するならログインが要る。
 *
 * 選択は端末に覚えさせる（同じ端末は同じ拠点で使い続けることがほとんどで、
 * 画面を移るたびに選び直させたくないため）。
 */

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { request } from './request'

export type Company = {
  id: number
  name: string
  sortOrder: number
  note: string | null
  /** 無効にした日時。null なら有効 */
  disabledAt: string | null
  /** ぶら下がっている件数。無効・削除の可否を出すために使う */
  counts: { assets: number; stocks: number; entries: number; orders: number }
}

const STORAGE_KEY = 'printer-manager.companyId'

/** 端末が覚えている拠点。未選択・壊れた値は null */
function readStored(): number | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === null) return null
    const id = Number(raw)
    return Number.isInteger(id) && id > 0 ? id : null
  } catch {
    // プライベートウィンドウなどで読めないことがある。既定に任せる
    return null
  }
}

function writeStored(id: number) {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(id))
  } catch {
    // 覚えられなくても画面は動く。次に開いたとき既定に戻るだけ
  }
}

/**
 * クエリに拠点を足す。**拠点ごとの画面はこれを通して API を呼ぶ。**
 * 既にクエリがある URL にも足せるよう、区切りを見て付ける
 */
export function withCompany(path: string, companyId: number | null): string {
  if (companyId === null) return path
  return `${path}${path.includes('?') ? '&' : '?'}companyId=${companyId}`
}

/**
 * 拠点の一覧と、いま選んでいる拠点。
 *
 * **選択が決まるまで companyId は null。** 拠点ごとの画面は null のあいだ
 * 読み込みを待つ（拠点を指定せずに叩くと、API 側で必須の口が 400 になる）
 */
export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [companyId, setCompanyId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  const load = useCallback(async () => {
    try {
      const rows = await request<Company[]>('/companies')
      setCompanies(rows)
      setCompanyId((current) => {
        // 覚えている拠点がまだ有効ならそれ。無ければ並び順の先頭
        const stored = current ?? readStored()
        const found = rows.find((row) => row.id === stored)
        return found?.id ?? rows[0]?.id ?? null
      })
      setError(null)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoaded(true)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const select = useCallback((id: number) => {
    setCompanyId(id)
    writeStored(id)
  }, [])

  const company = companies.find((row) => row.id === companyId) ?? null

  return { companies, companyId, company, select, reload: load, error, loaded }
}

export type CompanyContextValue = {
  companies: Company[]
  /** 選択が決まるまでは null。拠点ごとの画面はそのあいだ読み込みを待つ */
  companyId: number | null
  company: Company | null
  select: (id: number) => void
  /** 拠点を足したり直したりしたあと、セレクタを取り直す */
  reload: () => Promise<void>
}

const CompanyContext = createContext<CompanyContextValue | null>(null)

export const CompanyProvider = CompanyContext.Provider

/**
 * いま選んでいる拠点を読む。**画面はここから拠点を受け取る。**
 * 各画面が自分で一覧を取りに行くと、切り替えが揃わなくなる
 */
export function useCompany(): CompanyContextValue {
  const value = useContext(CompanyContext)
  if (!value) {
    throw new Error('CompanyProvider の外で useCompany を呼んでいます')
  }
  return value
}
