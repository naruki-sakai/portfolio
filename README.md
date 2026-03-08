# Portfolio Site

制作実績を掲載するポートフォリオサイトです。

## Tech Stack

- **Framework:** Next.js 15 (App Router) / TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Supabase (Database / Auth / Storage)
- **Monorepo:** pnpm + Turborepo

## Structure

```
apps/web        公開サイト（トップ / 実績詳細 / アバウト）
apps/admin      管理画面（実績の作成・編集）
packages/ui     共通UIコンポーネント
packages/lib    共通ロジック・型定義
```

## License

All rights reserved.
