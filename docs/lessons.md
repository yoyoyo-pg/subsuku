# 教訓・判断記録

ハマりどころ・非自明な判断・次への教訓を蓄積するファイル。
「何をしたか」ではなく「なぜそうしたか・次回どうすべきか」を書く。

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

### DashboardClient のデータ更新戦略

Server Component で初期データを fetch し、Client Component に props で渡している。
ミューテーション後は `router.refresh()` ではなく `setSubscriptions` でローカル更新している理由:
`router.refresh()` はページ全体の再レンダリングを引き起こし UX が悪いため。
**→ 楽観的 UI 更新（ローカル state 更新）を優先する。エラー時は state をロールバックする実装も検討。**
