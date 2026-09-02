import type { KeyboardEvent } from 'react';
import { useMemo, useRef } from 'react';
import type { TonerCatalogRow } from '../api';

/**
 * トナーを選ぶ 1 行。受付（持ち出し・廃棄）と注文（注文・搬入）で共通に使う。
 *
 * **バーコードの読み取りと検索を 1 つの欄で兼ねる。**
 * 品番をそのまま読み取れば一致した 1 件が選ばれ、部署名や色で探すこともできる。
 * トナーID を直接入れる欄を別に置かないのは、同じ値を 2 か所に持つことになり、
 * どちらが正なのか分からなくなるため。
 */

/** 検索に当てる文字列。品番・名称・色に、設置場所（部署・No.・IP・型番）を足す */
function haystack(row: TonerCatalogRow): string {
  const printers = row.printers
    .map((p) =>
      [p.no ? `No.${p.no}` : '', p.department, p.ipAddress, p.model]
        .filter(Boolean)
        .join(' '),
    )
    .join(' ');
  return `${row.id} ${row.name ?? ''} ${row.color ?? ''} ${printers}`.toLowerCase();
}

/**
 * 空白区切りの語がすべて含まれる行を返す。
 * 「予約外来 シアン」のように場所と色を並べて絞れるようにするため。
 */
function matchToners(
  rows: TonerCatalogRow[],
  query: string,
): TonerCatalogRow[] {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  return rows.filter((row) => {
    const text = haystack(row);
    return words.every((word) => text.includes(word));
  });
}

/** 候補に出す設置場所。台帳の No. と部署で示し、多いときは件数でまとめる */
function placeOf(row: TonerCatalogRow): string {
  if (row.printers.length === 0) return '設置場所の登録なし';
  const heads = row.printers
    .slice(0, 2)
    .map((p) => [p.no ? `No.${p.no}` : null, p.department].filter(Boolean).join(' '))
    .join('、');
  return row.printers.length > 2
    ? `${heads} ほか ${row.printers.length - 2} 台`
    : heads;
}

type Props = {
  /** 行の連番。01 などの見出しに出す */
  no: string;
  /** 画面ごとの id の接頭辞。rx = 受付 / od = 注文 */
  idPrefix: string;
  catalog: TonerCatalogRow[];
  /** 入力中の検索語。クリアは呼び出し側が行う */
  search: string;
  onSearch: (value: string) => void;
  /** 選ばれている品番。空なら未選択 */
  value: string;
  onPick: (row: TonerCatalogRow) => void;
  error?: string;
  disabled?: boolean;
  active: boolean;
  onFocus: () => void;
  /** Enter で次の欄へ送る。候補を選んでから呼ぶ */
  onEnter: (event: KeyboardEvent<HTMLInputElement>) => void;
  inputRef: (el: HTMLInputElement | null) => void;
  rowRef: (el: HTMLDivElement | null) => void;
};

export default function TonerPickerRow({
  no,
  idPrefix,
  catalog,
  search,
  onSearch,
  value,
  onPick,
  error,
  disabled,
  active,
  onFocus,
  onEnter,
  inputRef,
  rowRef,
}: Props) {
  /** 自動で決まったときに外すために持つ。呼び出し側の inputRef にも同じものを渡す */
  const inputEl = useRef<HTMLInputElement | null>(null);

  const candidates = useMemo(() => matchToners(catalog, search), [catalog, search]);
  const picked = useMemo(
    () => catalog.find((row) => row.id === value) ?? null,
    [catalog, value],
  );

  /**
   * 自動で決まったときに欄から離れる。
   *
   * 品番が確定した後もカーソルが残っていると、続けて打った文字が
   * 検索語を書き換えて選び直しになってしまう。決まった時点で手を離す。
   * 選び直したいときは欄を押せば戻れる
   */
  const releaseFocus = () => {
    // onPick による再描画の前に外すと戻ってくることがあるので、描画の後に回す
    window.setTimeout(() => inputEl.current?.blur(), 0);
  };

  const handleChange = (text: string) => {
    onSearch(text);

    const trimmed = text.trim();
    if (trimmed === '') return;

    // 品番そのものを読み取ったときは、他に候補があってもそれを選ぶ
    const exact = catalog.find(
      (row) => row.id.toLowerCase() === trimmed.toLowerCase(),
    );
    if (exact) {
      onPick(exact);
      releaseFocus();
      return;
    }

    const hits = matchToners(catalog, text);
    if (hits.length === 1) {
      onPick(hits[0]);
      releaseFocus();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    // 候補が残っていれば先頭を選んでから次の欄へ送る
    if (candidates.length > 0 && candidates[0].id !== value) {
      onPick(candidates[0]);
    }
    onEnter(event);
  };

  const filled = value.trim().length > 0;

  return (
    <div
      className={[
        'row',
        active ? 'row--active' : '',
        filled ? 'row--filled' : '',
        error ? 'row--error' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      ref={rowRef}
    >
      <span aria-hidden="true" className="row__no">
        {filled ? '✓' : no}
      </span>

      <div className="row__body">
        <label className="row__label" htmlFor={`${idPrefix}-finder`}>
          トナー
        </label>

        <input
          aria-describedby={
            error ? `${idPrefix}-finder-error` : `${idPrefix}-finder-hint`
          }
          aria-invalid={Boolean(error)}
          autoComplete="off"
          className="row__input"
          disabled={disabled}
          id={`${idPrefix}-finder`}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={onFocus}
          onKeyDown={handleKeyDown}
          ref={(el) => {
            inputEl.current = el;
            inputRef(el);
          }}
          placeholder="バーコードを読み取る / 部署・型番・トナー名で探す"
          spellCheck={false}
          type="text"
          value={search}
        />

        {picked ? (
          <p className="finder__picked">
            <span className="finder__id">{picked.id}</span>
            <span className="finder__name">
              {picked.name ?? ''}
              {picked.color ? `／${picked.color}` : ''}
            </span>
            <span className="finder__stock">在庫 {picked.stock}</span>
          </p>
        ) : null}

        {error ? (
          <p className="row__error" id={`${idPrefix}-finder-error`}>
            {error}
          </p>
        ) : (
          <p className="row__hint" id={`${idPrefix}-finder-hint`}>
            トナー箱のラベルを読み取ると、その品番が入ります。部署名（予約外来 など）・
            No.・IP・型番・トナー名でも探せます。空白で区切ると絞り込めます
            （例: 予約外来 シアン）。
          </p>
        )}

        {search.trim().length > 0 &&
          (candidates.length === 0 ? (
            <p className="finder__empty">該当するトナーがありません</p>
          ) : (
            <ul className="finder__list">
              {candidates.slice(0, 8).map((item) => (
                <li key={item.id}>
                  <button
                    className={`finder__item${
                      value === item.id ? ' finder__item--on' : ''
                    }`}
                    disabled={disabled}
                    onClick={() => onPick(item)}
                    type="button"
                  >
                    <span className="finder__id">{item.id}</span>
                    <span className="finder__name">
                      {item.name ?? ''}
                      {item.color ? `／${item.color}` : ''}
                    </span>
                    <span className="finder__place">{placeOf(item)}</span>
                    <span className="finder__stock">在庫 {item.stock}</span>
                  </button>
                </li>
              ))}
              {candidates.length > 8 && (
                <li className="finder__more">
                  ほか {candidates.length - 8} 件。語を足すと絞れます
                </li>
              )}
            </ul>
          ))}
      </div>
    </div>
  );
}
