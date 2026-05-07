# Subsuku — サブスク管理アプリ

サブスクリプションの一覧管理・月々の支出を可視化して無駄を発見する Web アプリです。

## 機能

- **ダッシュボード** — 月額合計・年額換算・今月の更新件数をひと目で把握
- **支出の可視化** — カテゴリ別円グラフ・月額ランキングバーチャート
- **無駄遣い発見** — 高額年払い・同カテゴリ重複・¥5,000 超えを自動検出
- **サブスク管理** — 追加・編集・削除、アイコン・カテゴリ・次回請求日を管理
- **認証** — Google OAuth またはメール/パスワードでログイン（Supabase Auth）

## 技術スタック

| 項目 | 内容 |
|------|------|
| フレームワーク | Next.js 15（App Router）|
| 言語 | TypeScript |
| データベース / 認証 | Supabase（PostgreSQL + Auth）|
| スタイリング | Tailwind CSS（ダークモード）|
| グラフ | Recharts |
| ホスティング | Vercel |

## セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/yoyoyo-pg/subsuku.git
cd subsuku
npm install
```

### 2. Supabase プロジェクトの作成

1. [supabase.com](https://supabase.com) でプロジェクトを作成
2. **SQL Editor** で [`supabase/schema.sql`](./supabase/schema.sql) を実行
3. **Authentication > Providers > Google** を有効化し、OAuth クライアントを設定
4. **Authentication > URL Configuration** のリダイレクト先に以下を追加
   - `http://localhost:3000/auth/callback`
   - `https://<your-app>.vercel.app/auth/callback`

### 3. 環境変数の設定

```bash
cp .env.local.example .env.local
```

`.env.local` を編集し、Supabase の **Project Settings > API** から値を取得して入力します。

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

`http://localhost:3000` でアクセスできます。

## 開発コマンド

```bash
npm run dev        # 開発サーバー起動
npm run build      # 本番ビルド
npm run lint       # ESLint チェック
npm run typecheck  # TypeScript 型チェック
```

## Vercel へのデプロイ

```bash
npx vercel
```

Vercel Dashboard の **Environment Variables** に `.env.local` と同じ変数を設定してください。

## ディレクトリ構成

```
subsuku/
├── app/
│   ├── auth/callback/     # OAuth コールバック
│   ├── dashboard/         # ダッシュボードページ
│   └── page.tsx           # ログインページ
├── components/
│   ├── DashboardClient.tsx    # メイン UI（CRUD・状態管理）
│   ├── SpendingCharts.tsx     # グラフ
│   ├── WasteAlert.tsx         # 無駄遣い検出
│   ├── SubscriptionModal.tsx  # 追加・編集モーダル
│   └── ...
├── lib/supabase/          # Supabase クライアント
├── types/subscription.ts  # 共通型定義
├── supabase/schema.sql    # DB スキーマ
└── docs/
    ├── lessons.md         # 教訓・判断記録
    └── ideas.md           # アイデアメモ
```

## ライセンス

MIT
