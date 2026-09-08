-- 在庫の数が筋の通らない値にならないよう DB 側で止める。
--
-- サービス側でも持ち出し前に在庫を、廃棄前に「搬入累計 − 廃棄累計」を見ているが、
-- **検査と更新が別の操作**なので、既定の Read Committed では 2 人が同時に
-- 最後の 1 本を持ち出すと両方が検査を通り、在庫が −1 になりうる。
-- 行ロックのかかる CHECK なら、後から来たほうが確実に落ちる。
--
-- サービス側の検査は残す。日本語の文面を出すのはあちらの仕事で、
-- ここは最後の歯止め（画面には英語のエラーが出るが、そもそも通らない）。
--
-- Prisma のスキーマは CHECK 制約を書けないので、この SQL が唯一の定義。
-- migrate reset でも再生されるが、schema.prisma からは見えないので
-- toner_stocks を触るときはここを確認すること。
--
-- 既存のデータが引っかかって ALTER が落ちた場合は、次で該当行を探す:
--   SELECT * FROM toner_stocks
--   WHERE quantity < 0 OR received < 0 OR disposed < 0 OR disposed > received;

ALTER TABLE "toner_stocks"
  ADD CONSTRAINT "toner_stocks_quantity_non_negative" CHECK ("quantity" >= 0);

ALTER TABLE "toner_stocks"
  ADD CONSTRAINT "toner_stocks_received_non_negative" CHECK ("received" >= 0);

ALTER TABLE "toner_stocks"
  ADD CONSTRAINT "toner_stocks_disposed_non_negative" CHECK ("disposed" >= 0);

-- 搬入していない本数は廃棄できない。廃棄の上限計算（received − disposed）が
-- 負にならないことを保証する
ALTER TABLE "toner_stocks"
  ADD CONSTRAINT "toner_stocks_disposed_within_received" CHECK ("disposed" <= "received");
