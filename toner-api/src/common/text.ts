/** 空文字・空白だけの入力は未入力として扱う。画面から '' が来ても null で揃える */
export function toText(value: string | null | undefined): string | null {
  const text = value?.trim() ?? '';
  return text.length > 0 ? text : null;
}
