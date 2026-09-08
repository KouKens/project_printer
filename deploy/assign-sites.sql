-- 拠点を作り、台帳・在庫・履歴・注文を振り分ける。
--
-- **移行（20260903020000_add_company）の直後に 1 度だけ流す。**
-- 移行で作られる「既定の会社」に全部が入るので、ここで本院と各事業所へ分ける。
--
-- 振り分けの鍵は台帳の部署名。IP では分けない
-- （IP を持たない機器があり、部署名でしか拾えないものがあるため）。
-- **どの条件にも当たらない機器は本院に残る。**
--
-- 何度流しても壊れない（拠点の作成は ON CONFLICT DO NOTHING）。

-- **このファイルは UTF-8。** 日本語の Windows で調べものをするときに
-- PGCLIENTENCODING=SJIS を置いたまま流すと、UTF-8 のバイト列を SJIS だと
-- 名乗って送ることになり、拠点名が文字化けしたまま DB に入る。
-- CASE の文字列も一致しなくなるので、全機器が化けた 1 拠点に寄る。
-- エラーにならず静かに壊れるため、環境変数に頼らずここで宣言する。
\encoding UTF8

BEGIN;

-- 1) 拠点を作る。名称は社会医療法人シマダの事業所名に合わせてある
INSERT INTO companies (name, sort_order, note, updated_at) VALUES
  ('嶋田病院',                   0,  '本院。172.31.x の機器と、IP を持たない院内の機器', CURRENT_TIMESTAMP),
  ('大刀洗診療所',               10, NULL, CURRENT_TIMESTAMP),
  ('シマリス小郡',               20, 'リハビリ特化型デイサービス', CURRENT_TIMESTAMP),
  ('シマリス大刀洗',             21, 'リハビリ特化型デイサービス', CURRENT_TIMESTAMP),
  ('シマリスみくに',             22, 'リハビリ特化型デイサービス', CURRENT_TIMESTAMP),
  ('いきいき介護プラザ',         30, '一日型デイサービス', CURRENT_TIMESTAMP),
  ('エミナス',                   40, '住宅型有料老人ホーム', CURRENT_TIMESTAMP),
  ('シマダナーシングホームおごおり', 41, '住宅型有料老人ホーム', CURRENT_TIMESTAMP),
  -- 訪問看護・訪問介護・ケアプランセンターは分けず 1 拠点にまとめる。
  -- 同じ場所でトナーを共用しているため
  ('シマダ在宅サービス',         50, '訪問看護・訪問介護・ケアプランセンター', CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;

-- 2) 台帳を部署名で振り分ける
UPDATE printer_assets a SET company_id = c.id
FROM companies c
WHERE c.name = CASE
    WHEN a.department LIKE '%大刀洗診療所%'     THEN '大刀洗診療所'
    WHEN a.department LIKE '%シマリス小郡%'     THEN 'シマリス小郡'
    WHEN a.department LIKE '%シマリス大刀洗%'   THEN 'シマリス大刀洗'
    WHEN a.department LIKE '%シマリスみくに%'   THEN 'シマリスみくに'
    WHEN a.department LIKE '%いきいき%'         THEN 'いきいき介護プラザ'
    WHEN a.department LIKE '%エミナス%'         THEN 'エミナス'
    WHEN a.department LIKE '%ナーシングホーム%' THEN 'シマダナーシングホームおごおり'
    -- 在宅系の 3 事業所は同じ拠点へ
    WHEN a.department LIKE '%ケアプラン%'       THEN 'シマダ在宅サービス'
    WHEN a.department LIKE '%訪問看護%'         THEN 'シマダ在宅サービス'
    WHEN a.department LIKE '%訪問介護%'         THEN 'シマダ在宅サービス'
    ELSE '嶋田病院'
  END;

-- 3) 在庫・履歴・注文はすべて本院へ寄せる。
--    移行前は 1 か所で数えていたので、過去の記録の持ち主は本院しかいない。
--    各拠点の在庫は、この先それぞれが搬入した時点から積み上がる
UPDATE toner_stocks  SET company_id = (SELECT id FROM companies WHERE name = '嶋田病院');
UPDATE toner_entries SET company_id = (SELECT id FROM companies WHERE name = '嶋田病院');
UPDATE toner_orders  SET company_id = (SELECT id FROM companies WHERE name = '嶋田病院');

-- 4) 空になった「既定の会社」を片付ける
DELETE FROM companies
WHERE name = '既定の会社'
  AND NOT EXISTS (SELECT 1 FROM printer_assets WHERE company_id = companies.id)
  AND NOT EXISTS (SELECT 1 FROM toner_stocks   WHERE company_id = companies.id)
  AND NOT EXISTS (SELECT 1 FROM toner_entries  WHERE company_id = companies.id)
  AND NOT EXISTS (SELECT 1 FROM toner_orders   WHERE company_id = companies.id);

COMMIT;
