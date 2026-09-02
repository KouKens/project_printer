import { parseSatoStatus, SatoUnreachableError } from './sato-status.service';

/**
 * ステータス返送の読み取り。
 *
 * 1 件目は**実機（レスプリ R408v-exSTD / 172.31.10.202）から実際に返ってきた
 * バイト列**をそのまま置いてある。仕様書どおりに読めているかの基準にする。
 * 残りは仕様の表から組み立てたもの。
 */

/** 実機の応答を組み立てる。Size(4) + ENQ + STX + ID + 状態 + 残数 + ジョブ名 + ETX */
function frame(id: string, code: string, remaining: string): Buffer {
  const body = Buffer.concat([
    Buffer.from([0x02]),
    Buffer.from(id, 'latin1'),
    Buffer.from(code, 'latin1'),
    Buffer.from(remaining, 'latin1'),
    Buffer.from(' '.repeat(16), 'latin1'),
    Buffer.from([0x03]),
  ]);
  const head = Buffer.alloc(5);
  head.writeUInt32BE(body.length, 0);
  head[4] = 0x05;
  return Buffer.concat([head, body]);
}

describe('parseSatoStatus', () => {
  it('実機の応答をそのまま読める', () => {
    // 2026-08-25 に 172.31.10.202 から返ってきた 32 バイト
    const raw = Buffer.from(
      '0000001c05022020413030303030302020202020202020202020202020202003',
      'hex',
    );

    const status = parseSatoStatus(raw);

    expect(status.code).toBe('A');
    expect(status.label).toBe('エラーなし（印字停止中）');
    expect(status.kind).toBe('ok');
    expect(status.nearEnd).toBe(false);
    // <ID> の指定が無いときは空白が返る、と仕様にある
    expect(status.jobId).toBe('');
    // 印刷していないときは 0 で埋まる
    expect(status.remaining).toBe(0);
  });

  it('リボン切れをエラーとして読む', () => {
    const status = parseSatoStatus(frame('  ', 'd', '000000'));

    expect(status.label).toContain('リボンエンド');
    expect(status.kind).toBe('error');
  });

  it('用紙切れをエラーとして読む', () => {
    expect(parseSatoStatus(frame('  ', 'c', '000000')).kind).toBe('error');
  });

  it('ニアエンドは警告として読み、補充の合図として印を付ける', () => {
    const status = parseSatoStatus(frame('  ', 'B', '000000'));

    expect(status.kind).toBe('warn');
    expect(status.nearEnd).toBe(true);
  });

  it('印刷中はジョブ ID と残り枚数を読む', () => {
    const status = parseSatoStatus(frame('07', 'G', '000123'));

    expect(status.jobId).toBe('07');
    expect(status.remaining).toBe(123);
    expect(status.kind).toBe('ok');
  });

  it('表に無いコードは、隠さずエラーとして出す', () => {
    const status = parseSatoStatus(frame('  ', 'z', '000000'));

    expect(status.label).toContain('z');
    expect(status.kind).toBe('error');
  });

  it('仕様と違う応答は取得の失敗として扱う', () => {
    expect(() => parseSatoStatus(Buffer.from('ffff', 'hex'))).toThrow(
      SatoUnreachableError,
    );
  });
});
