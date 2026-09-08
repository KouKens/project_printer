/**
 * テストからだけ使う小物。**ビルドには入らない**
 * （`tsconfig.build.json` の exclude に入れてある）。
 *
 * `*.spec.ts` にすると jest がテスト本体として拾ってしまうので、
 * 名前は普通のままにして exclude 側で外している。
 */

/**
 * モックに渡された引数を、読みたい形で取り出す。
 *
 * `mock.calls[0][0]` は any なので、そのまま `.data` を辿ると
 * `no-unsafe-member-access` で lint が落ちる。呼ぶ側が「この形で読む」と
 * 宣言する場所をここ 1 か所にまとめる。
 *
 * @param mock 見たいモック
 * @param call 何回目の呼び出しか（既定は 1 回目）
 */
export function callArg<T>(mock: jest.Mock, call = 0): T {
  const args = mock.mock.calls[call] as unknown[];
  return args[0] as T;
}

/** Prisma の create / update に渡された data */
export function dataArg(mock: jest.Mock, call = 0): Record<string, unknown> {
  return callArg<{ data: Record<string, unknown> }>(mock, call).data;
}

/** Prisma の findMany に渡された where */
export function whereArg(mock: jest.Mock, call = 0): Record<string, unknown> {
  return callArg<{ where: Record<string, unknown> }>(mock, call).where;
}
