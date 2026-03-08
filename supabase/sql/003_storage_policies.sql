-- ============================================
-- 003: Storage ポリシー (project-thumbnails)
-- ============================================
-- NOTE: バケット `project-thumbnails` は Supabase Dashboard > Storage で
--       手動作成してください（Public bucket = ON）。
--       その後、以下のSQLを実行してポリシーを適用します。

-- 誰でも閲覧可（public read）
create policy "public read thumbnails"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'project-thumbnails');

-- authenticated のみアップロード可
create policy "authenticated upload thumbnails"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'project-thumbnails');

-- authenticated のみ更新可
create policy "authenticated update thumbnails"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'project-thumbnails');

-- authenticated のみ削除可
create policy "authenticated delete thumbnails"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'project-thumbnails');
