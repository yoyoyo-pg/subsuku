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
| `npm test` | ユニットテスト実行（CI用） |
| `npm run test:watch` | ウォッチモードでテスト実行 |

## ディレクトリ構造

| パス | 役割 |
|-----|------|
| `app/page.tsx` | ログインページ（未認証ユーザー向け） |
| `app/dashboard/page.tsx` | ダッシュボード（認証済みユーザー向け） |
| `app/trial/page.tsx` | お試しページ（認証不要・モックデータ） |
| `app/auth/callback/route.ts` | OAuth コールバック処理 |
| `components/DashboardClient.tsx` | メイン UI（CRUD・状態管理） |
| `components/TrialDashboardClient.tsx` | お試しページ UI（モックデータ・読み取り専用） |
| `components/SpendingCharts.tsx` | Recharts グラフ（'use client' 必須） |
| `components/WasteAlert.tsx` | 無駄遣い自動検出 |
| `lib/supabase/` | Supabase クライアント（client.ts / server.ts） |
| `types/subscription.ts` | 共通型定義・定数・計算ユーティリティ |
| `lib/waste.ts` | 無駄遣い検出ロジック（`detectWaste`） |
| `lib/csv.ts` | CSV エクスポートロジック（`buildCsvContent` / `downloadCsv`） |
| `tests/` | ユニットテスト（Vitest） |
| `supabase/schema.sql` | DB スキーマ（Supabase SQL Editor で実行） |
| `.claude/rules/` | 詳細ルール（コンテキスト自動注入） |
| `.claude/commands/secret-check.md` | `/secret-check` スラッシュコマンド（シークレット露出チェッカー） |
| `docs/` | 教訓・アイデアメモ |

## セットアップ

```bash
# 1. 依存インストール
npm install

# 2. 環境変数設定
cp .env.local.example .env.local
# .env.local に Supabase URL・anon key を記入

# 3. Supabase スキーマ実行
# Supabase Dashboard > SQL Editor で supabase/schema.sql を実行

# 4. Supabase Google OAuth 設定
# Authentication > Providers > Google を有効化
# Redirect URL: http://localhost:3000/auth/callback

# 5. 開発サーバー起動
npm run dev
```

## 行動原則

- 3ステップ以上のタスクは必ずPlanモードで開始する
- 動作を証明できるまでタスクを完了とマークしない（`npm run typecheck` と `npm run build` を通す）
- コードを読まずに書かない。必ず既存コードを確認してから変更する
- 作業は必ず新規ブランチで行う（main への直接コミット禁止、ブランチ名: `claude/<作業内容>`）
- 実装完了後は CLAUDE.md のディレクトリ構造を必ず更新する
- 'use client' を安易に増やさない。Server Component で済むものはサーバーで処理する
- コンテキストが逼迫したら正直に伝え、セッション分割を提案する
