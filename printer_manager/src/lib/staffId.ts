/**
 * 受付・注文・搬入の「名前」欄のきまり。
 *
 * 職員証のバーコードを読ませる欄なので、**数字 6〜10 桁だけ**を受け付ける。
 * 苗字を打ち込まれると同じ人が何通りにも記録されてしまうため。
 *
 * 4 つの画面（持ち出し・廃棄・注文・搬入）で同じ判定を使うので、
 * 各画面に正規表現を書き写さずここから読む。
 */

/** 名前として通す形。前ゼロのある番号を潰さないよう、文字列のまま扱う */
export const STAFF_ID_PATTERN = /^\d{6,10}$/

/** 名前を入れずに処理したときに記録する名前。注文・搬入だけで使う */
export const GUEST = 'ゲスト'

export const STAFF_ID_HINT = '職員証のバーコードを読み取るか、数字 6〜10 桁で入力します'

/** 未入力をゲストとして通す画面の説明。空欄で処理できることを添える */
export const STAFF_ID_HINT_GUEST =
  `${STAFF_ID_HINT}。空欄のままなら「${GUEST}」として記録します`

const FORMAT_ERROR = '名前は数字 6〜10 桁で入力してください'

/**
 * 打ち込みの途中で弾く分。数字以外を落とし、10 桁で止める。
 * 6 桁に満たない状態は入力の途中なので、ここでは通す（送信時に確かめる）
 */
export const filterStaffId = (value: string) => value.replace(/\D/g, '').slice(0, 10)

/**
 * 送ってよい値かを確かめる。通れば null、駄目ならその理由。
 * allowGuest のときは未入力も通す（ゲストとして記録するため）
 */
export function staffIdError(value: string, allowGuest: boolean): string | null {
  if (value === '') return allowGuest ? null : '名前を入力してください'
  return STAFF_ID_PATTERN.test(value) ? null : FORMAT_ERROR
}

/** 実際に送る名前。未入力はゲストに置き換える */
export const staffIdToSend = (value: string) => (value === '' ? GUEST : value)
