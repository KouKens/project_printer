import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = Number(process.env.PORT ?? 3000);

  // 本番は nginx が前段に立つので HOST=127.0.0.1 で外から直接叩けなくする。
  // 未指定なら従来どおり全インターフェースで待つ（開発時の挙動を変えない）
  const host = process.env.HOST;
  await (host ? app.listen(port, host) : app.listen(port));
}
bootstrap();
