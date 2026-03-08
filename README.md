# Portfolio Site

制作実績ポートフォリオサイト（公開サイト + 管理画面）

## 技術スタック

- Next.js 15 (App Router) / TypeScript
- Supabase (DB + Auth + Storage)
- Tailwind CSS
- pnpm + Turborepo (monorepo)

## リポジトリ構成

```
apps/web       公開サイト（トップ / 詳細 / アバウト）  → localhost:3000
apps/admin     管理画面（ログイン / 実績一覧 / 編集）  → localhost:3001
packages/ui    共通UIコンポーネント（Button, Card, Tabs）
packages/lib   共通ロジック（Supabase client, 型, カテゴリ定義）
supabase/sql   SQL ファイル（テーブル / RLS / Storage）
```

## 前提

- Node.js v20+
- pnpm v10+

## セットアップ

```bash
pnpm install
```

## 環境変数

`apps/web/.env.local` と `apps/admin/.env.local` を作成し、以下を設定:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

各アプリの `.env.example` をコピーして使用できます:

```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/admin/.env.example apps/admin/.env.local
```

## 開発サーバー起動

```bash
pnpm dev
```

- 公開サイト: http://localhost:3000
- 管理画面: http://localhost:3001

## その他コマンド

```bash
pnpm build       # ビルド
pnpm lint        # ESLint
pnpm typecheck   # 型チェック
```

## Supabase 準備手順

### 1. プロジェクト作成

[Supabase Dashboard](https://supabase.com/dashboard) で新規プロジェクトを作成します。

### 2. SQL 実行（SQL Editor で順に実行）

以下の順番で SQL Editor にペーストして実行してください:

1. **`supabase/sql/001_projects.sql`** — テーブル + updated_at トリガー + インデックス
2. **`supabase/sql/002_projects_rls.sql`** — RLS 有効化 + ポリシー設定
3. **`supabase/sql/003_storage_policies.sql`** — Storage ポリシー設定

### 3. Storage バケット作成

1. Supabase Dashboard → **Storage** を開く
2. **New bucket** をクリック
3. Bucket name: `project-thumbnails`
4. **Public bucket** を **ON** にする
5. **Create bucket** をクリック

### 4. 管理者ユーザー作成

1. Supabase Dashboard → **Authentication** → **Users** を開く
2. **Add user** → **Create new user** をクリック
3. Email と Password を入力
4. **Auto Confirm User** にチェックを入れる（Email confirmed 状態にする）
5. **Create user** をクリック

### 5. 環境変数の設定

Supabase Dashboard → **Settings** → **API** から以下を取得:

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

`apps/web/.env.local` と `apps/admin/.env.local` に設定します。

### 6. 動作確認

1. `pnpm dev` でサーバー起動
2. http://localhost:3001 で管理画面にログイン
3. 実績を新規作成（サムネイル画像もアップロード）
4. http://localhost:3000 で公開サイトに実績が表示されることを確認
5. 管理画面で `is_published` を OFF にし、公開サイトから非表示になることを確認（RLS 確認）

## RLS 設計

| ロール | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| anon | `is_published = true` のみ | - | - | - |
| authenticated | 全件 | 可 | 可 | 可 |

## デプロイ（Vercel 想定）

将来的には Vercel にデプロイし、`/admin` で管理画面にアクセスする構成（rewrite）を想定しています。
