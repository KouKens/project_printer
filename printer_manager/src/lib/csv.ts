/**
 * 一覧を CSV に書き出す道具。**形にするのはここだけの仕事。**
 *
 * 画面ごとに書き出しを作り直すと、囲み方・改行・BOM の有無が食い違って
 * 「この画面の CSV だけ Excel で化ける」「カンマの入った部署名で列がずれる」
 * といったことが画面ごとに起きる。**何を出すか（列と行）は画面が決め、
 * どう並べるかはここに寄せる。**
 */
import { todayIso } from './date';

/** CSV の 1 セルに入る値。取れていない値は null で渡し、空欄にする */
export type CsvValue = string | number | null | undefined;

/**
 * カンマ・引用符・改行を含む値だけ引用符で囲む。
 * 部署名にカンマが入っても列がずれない
 */
function escapeCsv(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/**
 * セル 1 つを文字にする。**数値に桁区切りは入れない。**
 * 入れると Excel が文字列として読み、足し算も並べ替えもできなくなる。
 * 未取得（null）は空欄にして 0 と区別する
 */
function cellText(value: CsvValue): string {
  if (value === null || value === undefined) return '';
  return typeof value === 'number' ? String(value) : value;
}

/**
 * 見出し付きで組み立てる。**改行は CRLF**（Excel がそのまま読む形）。
 * 見出しを必ず付けるのは、後から開いたときに何の列か分かるようにするため
 */
export function toCsv(header: string[], rows: CsvValue[][]): string {
  return [header, ...rows.map((row) => row.map(cellText))]
    .map((cells) => cells.map(escapeCsv).join(','))
    .join('\r\n');
}

/**
 * ファイルの先頭に置く印。**これが無いと Excel が Shift-JIS として開き、
 * 部署名やトナー名が化ける。** 目に見えない文字なので名前を付けておく
 */
const BOM = '﻿';

/** いつの分か分かるよう、名前の後ろに保存した日を付ける */
export function csvFileName(name: string): string {
  return `${name}_${todayIso().replace(/-/g, '')}.csv`;
}

/**
 * 押すたびに作る Blob の URL。**画面を離れるときにまとめて捨てる。**
 *
 * **時間で捨ててはいけない。** ブラウザが「保存場所を毎回確認する」設定だと、
 * ダイアログで保存先が決まるまで読み出しが始まらない。先に URL を捨てると
 * 元が消え、**ダウンロードが「進行中」のまま永久に終わらない**
 * （本番の Edge で実際に起きた。閉じようとすると「まだダウンロード中です」と出る）。
 * CSV は数十 KB なので、画面を開いている間持っていても問題にならない
 */
const blobUrls = new Set<string>();

window.addEventListener('pagehide', () => {
  for (const url of blobUrls) URL.revokeObjectURL(url);
  blobUrls.clear();
});

/** 組み立て済みの CSV を保存する */
export function downloadCsv(fileName: string, text: string): void {
  const url = URL.createObjectURL(
    new Blob([BOM, text], { type: 'text/csv;charset=utf-8' }),
  );
  blobUrls.add(url);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 見出しと行を渡して保存する。画面から使うのはこれ。
 * 押した時点で持っている行をそのまま書き出すので、実機や API には問い合わせない
 */
export function saveCsv(name: string, header: string[], rows: CsvValue[][]): void {
  downloadCsv(csvFileName(name), toCsv(header, rows));
}
