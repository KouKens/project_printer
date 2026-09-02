import { AssetKeys, indexPrinters, matchPrinter } from './printer-match';

/**
 * 台帳 → 実機の突き合わせ。
 *
 * シリアルが食い違っていても IP で拾うが、他の台帳がシリアルで名指しした実機は
 * 渡さない、という 2 つの規則が同時に効いていることを確かめる。
 * この判定は台帳の一覧・機種別の一覧・運用コストの 3 画面が共有している。
 */

const printer = (ipAddress: string, serialNumber: string | null) => ({
  ipAddress,
  serialNumber,
});

const asset = (ipAddress: string | null, serialNumber: string | null) => ({
  ipAddress,
  serialNumber,
});

/** 台帳 1 件だけの索引。名指しの有無を確かめない試験で使う */
const indexFor = (
  printers: ReturnType<typeof printer>[],
  assets: AssetKeys[],
) => indexPrinters(printers, assets);

describe('matchPrinter', () => {
  it('シリアルが一致すれば、IP が違っても実機を返す', () => {
    const target = printer('172.31.1.1', 'ABC123');
    const a = asset('172.31.9.9', 'abc123');

    expect(matchPrinter(a, indexFor([target], [a]))).toBe(target);
  });

  it('台帳にシリアルが無ければ IP で引く', () => {
    const target = printer('172.31.1.1', 'ABC123');
    const a = asset('172.31.1.1', null);

    expect(matchPrinter(a, indexFor([target], [a]))).toBe(target);
  });

  it('シリアルが実機と食い違っていても、IP が合っていれば拾う', () => {
    // 台帳の書き写し間違い。実機は応答しているのに空欄になっていた
    const target = printer('172.31.99.201', '47W7-176867');
    const a = asset('172.31.99.201', '47W7-167575');

    expect(matchPrinter(a, indexFor([target], [a]))).toBe(target);
  });

  it('他の台帳がシリアルで名指ししている実機は IP では渡さない', () => {
    // 同じ IP に 2 台ぶら下がっている台帳（No.041 と No.051）
    const target = printer('172.31.10.211', '2GQ04148');
    const named = asset('172.31.10.211', '2GQ04148');
    const other = asset('172.31.10.211', '2FV35322');
    const index = indexFor([target], [named, other]);

    expect(matchPrinter(named, index)).toBe(target);
    expect(matchPrinter(other, index)).toBeNull();
  });

  it('名指しの有無は台帳の並び順で変わらない', () => {
    const target = printer('172.31.10.211', '2GQ04148');
    const named = asset('172.31.10.211', '2GQ04148');
    const other = asset('172.31.10.211', '2FV35322');

    // 名指ししている台帳を後ろに置いても、引き下がるのは other のまま
    const index = indexFor([target], [other, named]);

    expect(matchPrinter(other, index)).toBeNull();
    expect(matchPrinter(named, index)).toBe(target);
  });

  it('シリアルの無い台帳も、名指しされている実機には割り込まない', () => {
    const target = printer('172.31.10.211', '2GQ04148');
    const named = asset('172.31.20.1', '2GQ04148');
    const blank = asset('172.31.10.211', null);

    expect(matchPrinter(blank, indexFor([target], [named, blank]))).toBeNull();
  });

  it('IP もシリアルも当たらなければ null', () => {
    const target = printer('172.31.1.1', 'ABC123');
    const a = asset('172.31.2.2', 'ZZZ999');

    expect(matchPrinter(a, indexFor([target], [a]))).toBeNull();
  });

  it('IP が未入力で、シリアルも当たらなければ null', () => {
    const target = printer('172.31.1.1', 'ABC123');
    const a = asset(null, 'ZZZ999');

    expect(matchPrinter(a, indexFor([target], [a]))).toBeNull();
  });
});
