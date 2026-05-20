# 教訓・判断記録

ハマりどころ・非自明な判断・ユーザーからの指摘を蓄積するファイル。
セッション開始時に自動で読み込まれるため、**同じミスを繰り返さないための自分向けルール**を書く。

## 記録の種類

### 判断記録（技術的なハマりどころ・非自明な選択）

```
## YYYY-MM-DD <テーマ>

### <タイトル>
<背景・何が起きたか（1〜3文）>
**→ <次回どうすべきか（1文の結論）>**
```

### ミス記録（ユーザーから修正・指摘を受けた場合）

```
## YYYY-MM-DD ミス: <テーマ>

### ミスのパターン
<何をどう間違えたか>

### 再発防止ルール
- <具体的なルール>
```

**ルール: ユーザーから指摘を受けたら必ずその場で追記する。記録しない選択肢はない。**

---

## 2026-05-07 初期実装

### Supabase SSR と Vercel の Cookie 管理

`@supabase/ssr` を使う場合、`middleware.ts` での Cookie の書き換えが必須。
Server Component 内の `createClient()` だけでは Cookie の更新ができず、セッションが切れる。
**→ middleware.ts のボイラープレートを省略しない。**

### Recharts と Next.js App Router

Recharts は SSR 非対応のため、`SpendingCharts.tsx` に `'use client'` が必須。
`dynamic(() => import(...), { ssr: false })` も使えるが、`'use client'` の方がシンプル。
**→ チャート系ライブラリは必ず SSR 対応状況を確認してから採用する。**

### Google OAuth は Supabase より先に Google Cloud Console で設定が必要

Supabase の **Authentication → Providers → Google** に入力する Client ID は
`xxxxx.apps.googleusercontent.com` 形式の値（Google Cloud Console で発行したもの）。
Supabase の画面には入力例が書かれていないため、アプリ名などを誤って入力しがち。

手順:
1. Google Cloud Console → OAuth同意画面 → 認証情報 → OAuth クライアント ID（ウェブアプリ）を作成
2. 承認済みリダイレクト URI に `https://<ref>.supabase.co/auth/v1/callback` を登録
3. 発行された Client ID / Secret を Supabase に貼り付ける

**→ Supabase の Google OAuth 設定は必ず Google Cloud Console の作業が先。**

### Vercel ビルドで「URL and API key are required」が出たら force-dynamic

`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` が Vercel に未設定の状態でビルドすると、
Next.js がページをプリレンダリングする際に Supabase クライアントの初期化が走りクラッシュする。

対処: 認証ページとデータ取得ページに `export const dynamic = 'force-dynamic'` を追加してプリレンダリングを無効化。
環境変数は Vercel Dashboard の Environment Variables に必ず設定すること。

**→ Supabase を使うページは `force-dynamic` 必須。Vercel の環境変数設定はデプロイ前に完了させる。**

### autoprefixer は package.json に明示的に追加する

Next.js + Tailwind CSS の構成では `autoprefixer` が必要だが、`tailwindcss` の依存として暗黙的にインストールされるため `package.json` に書き忘れやすい。
`npm ci`（クリーンインストール）時に `Cannot find module 'autoprefixer'` で落ちる。

**→ `devDependencies` に `"autoprefixer": "^10"` を必ず明示する。**

### DashboardClient のデータ更新戦略

Server Component で初期データを fetch し、Client Component に props で渡している。
ミューテーション後は `router.refresh()` ではなく `setSubscriptions` でローカル更新している理由:
`router.refresh()` はページ全体の再レンダリングを引き起こし UX が悪いため。
**→ 楽観的 UI 更新（ローカル state 更新）を優先する。エラー時は state をロールバックする実装も検討。**

---

## 2026-05-10 為替対応を見送り

### 為替対応は影響範囲が広すぎる

為替対応（外貨 → JPY 換算）を試みたが、以下の理由で見送り:

- 変更が必要なファイルが 10 本以上（型定義・全表示コンポーネント・モーダル・Route Handler）
- 外部 API（frankfurter.app 等）への依存が増える
- 為替レートのキャッシュ・フォールバック・エラーハンドリングが複雑
- 現状ユーザーはほぼ JPY のサブスクのみ登録するため、対費用効果が低い

**→ 機能の影響範囲が広い場合は、着手前にスコープを明示して合意を取る。「やってみたら複雑だった」は避ける。**
