# Subsuku

サブスクリプションの一覧管理・月々の支出を可視化して無駄を発見する Web アプリ。Vercel でホスト、Supabase を DB/認証に使用。

## 技術スタック

- Next.js 15（App Router）+ TypeScript
- Supabase（PostgreSQL + Auth: Google OAuth / メール/パスワード）
- Tailwind CSS（ダークモード固定、violet アクセント）
- Recharts（円グラフ・バーチャート）
- Lucide React（アイコン）

## コマンド

| コマンド | 用途 |
|---------|------|
| `npm install` | 依存インストール |
| `npm run dev` | 開発サーバー起動（localhost:3000） |
| `npm run build` | 本番ビルド（Vercel デプロイ前に必ず確認） |
| `npm run lint` | ESLint チェック |
| `npm run typecheck` | TypeScript 型チェック |

## ディレクトリ構造

| パス | 役割 |
|-----|------|
| `app/page.tsx` | ログインページ（未認証ユーザー向け） |
| `app/dashboard/page.tsx` | ダッシュボード（認証済みユーザー向け） |
| `app/auth/callback/route.ts` | OAuth コールバック処理 |
| `components/DashboardClient.tsx` | メイン UI（CRUD・状態管理） |
| `components/SpendingCharts.tsx` | Recharts グラフ（'use client' 必須） |
| `components/WasteAlert.tsx` | 無駄遣い自動検出 |
| `lib/supabase/` | Supabase クライアント（client.ts / server.ts） |
| `types/subscription.ts` | 共通型定義・定数・計算ユーティリティ |
| `supabase/schema.sql` | DB スキーマのスナップショット（参照用・編集禁止） |
| `supabase/migrations/` | DB マイグレーションファイル（スキーマ変更の唯一の正） |
| `supabase/config.toml` | Supabase CLI 設定 |
| `.github/workflows/migrate.yml` | DB マイグレーション自動適用 CI |
| `.claude/rules/` | 詳細ルール（コンテキスト自動注入） |
| `docs/` | 教訓・アイデアメモ |

## セットアップ

```bash
# 1. 依存インストール
npm install

# 2. 環境変数設定
cp .env.local.example .env.local
# .env.local に Supabase URL・anon key を記入

# 3. Supabase スキーマ適用
# Supabase Dashboard > SQL Editor で supabase/migrations/20260509000000_init.sql を実行
# （以降の変更は supabase/migrations/ に追加し、CI が自動適用する）

# 4. Supabase Google OAuth 設定
# Authentication > Providers > Google を有効化
# Redirect URL: http://localhost:3000/auth/callback

# 5. 開発サーバー起動
npm run dev
```

## スキーマ変更手順

1. `supabase/migrations/` に新しいファイルを追加（命名: `YYYYMMDDHHmmss_<説明>.sql`）
2. `schema.sql` は編集しない（スナップショットとして残すのみ）
3. main にマージすると GitHub Actions が自動で `supabase db push` を実行

## GitHub Actions シークレット（DB マイグレーション用）

| シークレット名 | 取得場所 |
|--------------|---------|
| `SUPABASE_ACCESS_TOKEN` | Supabase Dashboard > Account > Access Tokens |
| `SUPABASE_PROJECT_REF` | Supabase Dashboard > Project Settings > General（Reference ID） |
| `SUPABASE_DB_PASSWORD` | Supabase Dashboard > Project Settings > Database（Database password） |

## 行動原則

- 3ステップ以上のタスクは必ずPlanモードで開始する
- 動作を証明できるまでタスクを完了とマークしない（`npm run typecheck` と `npm run build` を通す）
- コードを読まずに書かない。必ず既存コードを確認してから変更する
- 作業は必ず新規ブランチで行う（main への直接コミット禁止、ブランチ名: `claude/<作業内容>`）
- 実装完了後は CLAUDE.md のディレクトリ構造を必ず更新する
- 'use client' を安易に増やさない。Server Component で済むものはサーバーで処理する
- コンテキストが逼迫したら正直に伝え、セッション分割を提案する
