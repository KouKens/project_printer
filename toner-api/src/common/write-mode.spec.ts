import { toText } from './text';
import { asIs, field } from './write-mode';

/**
 * 新規登録と部分更新で「未指定」の意味を分ける道具。
 *
 * ここが崩れると、画面に入力欄の無い列が保存のたび既定値に戻る
 * （端末台帳の countLayout、修理履歴の status で実際に起きた）
 */
describe('field', () => {
  describe('create', () => {
    it('未指定は既定値に潰す', () => {
      expect(field('create', undefined, asIs, 'TOTAL')).toBe('TOTAL');
    });

    it('値が来ていれば変換して通す', () => {
      expect(field('create', '  A4  ', toText, null)).toBe('A4');
    });

    it('null は既定値ではなく null のまま', () => {
      // 「空で登録した」を「既定値で登録した」に読み替えない
      expect(field('create', null, toText, null)).toBeNull();
    });
  });

  describe('update', () => {
    it('未指定は undefined。Prisma が「この列は変更しない」と読む', () => {
      expect(field('update', undefined, asIs, 'TOTAL')).toBeUndefined();
    });

    it('値が来ていれば変換して通す', () => {
      expect(field('update', '  A4  ', toText, null)).toBe('A4');
    });

    it('明示的な null は「消す」なので null を返す', () => {
      // 未指定と null を区別できることが、この道具の要
      expect(field('update', null, toText, null)).toBeNull();
    });

    it('空白だけの入力も「消す」として null になる', () => {
      expect(field('update', '   ', toText, null)).toBeNull();
    });

    it('0 は未指定と混同しない', () => {
      // falsy で判定していると 0 が消えるので、undefined だけを見ていることの確認
      expect(field('update', 0, asIs, null)).toBe(0);
    });
  });
});
