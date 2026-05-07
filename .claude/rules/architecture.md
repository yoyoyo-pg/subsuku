---
paths: app/**/*.tsx,app/**/*.ts,components/**/*.tsx,lib/**/*.ts,types/**/*.ts
---

# アーキテクチャと設計制約

## コンポーネント構成

| ファイル | 種別 | 役割 |
|---------|------|------|
| `app/page.tsx` | Server Component | ルート（ミドルウェアでログイン済みは /dashboard へリダイレクト） |
| `app/dashboard/page.tsx` | Server Component | 認証チェック + Supabase から初期データ取得 → DashboardClient へ渡す |
| `app/auth/callback/route.ts` | Route Handler | OAuth コールバック処理 |
| `components/LoginPage.tsx` | Client Component | Google OAuth + メール/パスワード認証フォーム |
| `components/DashboardClient.tsx` | Client Component | CRUD ロジック・状態管理・UI 統合 |
| `components/StatsCards.tsx` | Server/Client | 月額合計・年額・今月更新件数の統計カード（純粋計算） |
| `components/SpendingCharts.tsx` | Client Component | Recharts による円グラフ・バーチャート |
| `components/WasteAlert.tsx` | Server/Client | 無駄遣い候補の自動検出（高額年払い・重複カテゴリ・¥5000超え） |
| `components/SubscriptionCard.tsx` | Server/Client | サブスクカード（ホバーで編集・削除ボタン表示） |
| `components/SubscriptionModal.tsx` | Client Component | サブスク追加・編集モーダル（アイコン選択・バリデーション付き） |
| `lib/supabase/client.ts` | ユーティリティ | ブラウザ用 Supabase クライアント |
| `lib/supabase/server.ts` | ユーティリティ | サーバー用 Supabase クライアント（cookies() 連携） |
| `middleware.ts` | Next.js Middleware | 未認証→/ リダイレクト、認証済み→/dashboard リダイレクト |
| `types/subscription.ts` | 型定義 | Subscription 型・定数・toMonthlyAmount ユーティリティ |

## Supabase スキーマ

`supabase/schema.sql` に定義済み。billing_cycle と category に CHECK 制約あり。

| カラム | 型 | 説明 |
|--------|-----|------|
| `billing_cycle` | TEXT | 'monthly' \| 'yearly' \| 'weekly' |
| `category` | TEXT | 'video' \| 'music' \| 'productivity' \| 'gaming' \| 'cloud' \| 'news' \| 'other' |

Row Level Security: 全操作で `auth.uid() = user_id` を強制。

## 環境変数

| 変数名 | 必須 | 用途 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase プロジェクト URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase 匿名キー |

## 設計制約（必ず守る）

- `NEXT_PUBLIC_*` 環境変数以外を `createBrowserClient` に渡さない（秘密鍵漏洩防止）
- サブスクの CRUD はすべてクライアントサイド（`DashboardClient.tsx` 内の Supabase JS クライアント経由）
- Server Component でのデータ取得は初期レンダリングのみ。ミューテーション後は `setSubscriptions` でローカル更新
- `toMonthlyAmount` は `types/subscription.ts` にのみ定義する（重複実装禁止）
- 新しいカテゴリ・billing_cycle を追加するときは `supabase/schema.sql` の CHECK 制約も同時に更新する
- `recharts` は SSR 非対応のため `SpendingCharts.tsx` に `'use client'` 必須
- `app/page.tsx` と `app/dashboard/page.tsx` には `export const dynamic = 'force-dynamic'` が必須（ビルド時プリレンダリングを防ぐため。Supabase の URL/Key がビルド環境に存在しない場合クラッシュする）
