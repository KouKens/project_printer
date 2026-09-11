import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import './Modal.css';

/**
 * 登録済みの行を直すための小窓。**登録画面の入力欄は新規専用にし、編集はここで行う。**
 *
 * 入力欄を編集にも使い回すと、書きかけの新規登録が「編集」を押したとたんに
 * 上書きされて消える。小窓は自分の下書きを持つので、上の欄には触らない。
 *
 * 作りはブラウザの `<dialog>`（`showModal`）に任せる。後ろの画面を押せなくする・
 * Esc で閉じる・フォーカスを中に閉じ込める、を自前で書かずに済む。
 * 開いているかどうかは親の state で持ち、**閉じる = 親がこの部品を描かなくなること。**
 *
 * **外側（暗い部分）を押しても閉じない。** 欄が多い画面で、書きかけの修正が
 * 押し間違い 1 回で消えるため。閉じるのは × ・キャンセル・Esc だけ。
 */
type Props = {
  title: ReactNode;
  /** 閉じる。親が開いている state を落とす */
  onClose: () => void;
  /** 下端に並べるボタン。主の操作をいちばん右に置く */
  footer: ReactNode;
  children: ReactNode;
  /**
   * 送っている最中。Esc と × を効かなくする
   * （閉じてしまうと、失敗したときの文面を出す場所が無くなる）
   */
  busy?: boolean;
  /** 失敗の文面。**小窓の中に出す**（後ろの画面の知らせ欄は覆われて見えない） */
  error?: string | null;
  /** 小窓を閉じずに済む操作（価格の改定など）の結果 */
  notice?: string | null;
  /** 最大の幅（px）。欄の数に合わせて画面ごとに決める。狭い窓では窓幅に収める */
  width?: number;
};

export default function Modal({
  title,
  onClose,
  footer,
  children,
  busy = false,
  error = null,
  notice = null,
  width = 640,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  /** 開く前にフォーカスがあった場所（押した「編集」ボタン）。閉じたらそこへ戻す */
  const returnTo = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    // 開発時の StrictMode は effect を 2 度走らせる。開いたものを開き直さない
    if (!dialog.open) {
      returnTo.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.showModal();
      // 何もしなければ先頭の × に当たる。開いてすぐ直し始められるよう最初の欄に置く
      dialog
        .querySelector<HTMLElement>('.md-body :is(input, select, textarea):not(:disabled)')
        ?.focus();
    }

    /*
     * 閉じたら元の場所へフォーカスを戻す。**ブラウザは戻してくれない。**
     * 戻すのは close() で閉じたときだけで、この部品は <dialog> を DOM から外して閉じるため、
     * 放っておくとフォーカスがページの先頭（body）に落ち、キーボードでは一覧のどこに
     * いたか分からなくなる。
     *
     * **保存した直後は、戻す先のボタンがまだ押せない。** 保存中は一覧のボタンが
     * disabled になっており、小窓はその最中に外れる。disabled のボタンへの focus() は
     * 黙って失敗するので、disabled が外れた時点で戻す（MutationObserver で見張る。
     * タイマーで待つと、裏に回った画面ではブラウザに間引かれて何十秒も遅れる）。
     *
     * 他の場所にフォーカスがあるときは横取りしない（待つあいだに何かを押した場合）。
     * StrictMode が途中で走らせる後始末もこれで素通りする（小窓がまだ開いていて、
     * フォーカスは中の欄にある）
     */
    return () => {
      const target = returnTo.current;
      if (!target) return;

      /** 戻せた、または戻さないと決まったら true。まだ押せないなら false */
      const restore = () => {
        const active = document.activeElement;
        if (!target.isConnected || (active && active !== document.body)) return true;
        if (target.matches(':disabled')) return false;
        target.focus();
        return true;
      };
      if (restore()) return;

      const observer = new MutationObserver(() => {
        if (restore()) observer.disconnect();
      });
      observer.observe(target, { attributes: true, attributeFilter: ['disabled'] });
      // 2 秒たっても押せるようにならなければ諦める（見張りを外すだけで、他には何もしない）
      window.setTimeout(() => observer.disconnect(), 2000);
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className="md"
      style={{ width: `min(${width}px, calc(100vw - 32px))` }}
      aria-labelledby={titleId}
      onCancel={(e) => {
        // Esc。ブラウザに閉じさせず、親の state を落として閉じる
        e.preventDefault();
        if (!busy) onClose();
      }}
      // ブラウザが cancel を飛ばして閉じることがある（Chrome は操作の無い Esc の連打で）。
      // そのときも親に知らせ、閉じた <dialog> が描かれたまま残らないようにする
      onClose={onClose}
    >
      <header className="md-head">
        <h2 className="md-title" id={titleId}>
          {title}
        </h2>
        <button
          className="md-close"
          type="button"
          onClick={onClose}
          disabled={busy}
          aria-label="閉じる"
          title="閉じる（Esc）。保存していない修正は捨てます"
        >
          ×
        </button>
      </header>

      <div className="md-body">{children}</div>

      {(error || notice) && (
        <div className="md-msgs">
          {error && (
            <p className="md-msg md-msg-error" role="alert">
              {error}
            </p>
          )}
          {notice && <p className="md-msg md-msg-ok">{notice}</p>}
        </div>
      )}

      <footer className="md-foot">{footer}</footer>
    </dialog>
  );
}
