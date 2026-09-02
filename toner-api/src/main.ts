import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  serveWeb(app);

  const port = Number(process.env.PORT ?? 3000);

  // 前段に nginx を置く構成では HOST=127.0.0.1 で外から直接叩けなくする。
  // 未指定なら従来どおり全インターフェースで待つ（開発時の挙動を変えない）
  const host = process.env.HOST;
  await (host ? app.listen(port, host) : app.listen(port));
}

/**
 * ビルド済みのフロントを API と同じプロセスから配る。
 *
 * **WEB_ROOT を指定したときだけ有効。** 開発では vite が配信して `/api` を
 * proxy するので、指定しなければ従来どおり何もしない。
 *
 * nginx や IIS を入れられない環境（オフラインの単独機）で、
 * 追加のソフトを増やさずに 1 プロセスで完結させるための口。
 * API は setGlobalPrefix('api') で `/api` の下に居るので、
 * 残りの URL を静的ファイルに回してもぶつからない。
 */
function serveWeb(app: NestExpressApplication) {
  const configured = process.env.WEB_ROOT;
  if (!configured) return;

  const root = resolve(configured);
  const index = join(root, 'index.html');
  if (!existsSync(index)) {
    // 置き場所の指定間違いは起動時に気づけるようにする
    throw new Error(
      `WEB_ROOT に index.html がありません: ${index}。フロントの dist を指してください`,
    );
  }

  app.useStaticAssets(root, { index: false });

  /*
   * 画面はすべて 1 枚の index.html で動く（画面の切り替えは中で行う）。
   * `/api` 以外で静的ファイルに当たらなかった URL は index.html を返す。
   * 直接 URL を叩かれても 404 にしないため
   */
  app.use(
    (
      req: { path: string },
      res: { sendFile: (p: string) => void },
      next: () => void,
    ) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(index);
    },
  );
}

bootstrap();
