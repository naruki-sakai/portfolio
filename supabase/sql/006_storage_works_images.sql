-- ============================================
-- 006: Storage ポリシー (works-images)
-- リッチエディタの画像アップロード用
-- ============================================
-- NOTE: バケット `works-images` は Supabase Dashboard > Storage で
--       手動作成してください（Public bucket = ON）。
--       その後、以下のSQLを実行してポリシーを適用します。

-- 誰でも閲覧可（public read）
create policy "public read works images"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'works-images');

-- authenticated のみアップロード可
create policy "authenticated upload works images"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'works-images');

-- authenticated のみ更新可
create policy "authenticated update works images"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'works-images');

-- authenticated のみ削除可
create policy "authenticated delete works images"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'works-images');
