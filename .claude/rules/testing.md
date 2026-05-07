---
paths: app/**/*.tsx,app/**/*.ts,components/**/*.tsx
---

# テスト方針

## 現状

テストは未設定。型チェック（`npm run typecheck`）と lint（`npm run lint`）が品質ゲートとして機能している。

PostToolUse フックが .ts/.tsx 編集後に `tsc --noEmit` を自動実行するため、型エラーは即時フィードバックされる。

## テストを追加するタイミング

以下の機能を追加するときはテストも同時に書く:

- `toMonthlyAmount` などの純粋計算ロジック（`types/subscription.ts`）
- WasteAlert の検出ロジック（`components/WasteAlert.tsx`）
- Supabase の RLS ポリシーの正しさ（統合テスト）

## 推奨スタック（導入時）

- **Unit**: Vitest（Next.js との相性が良い）
- **Component**: React Testing Library
- **E2E**: Playwright（Vercel Preview URLs に対しても実行可能）

## 追加時の注意

- Supabase クライアントはモックを使う（`vi.mock('@/lib/supabase/client')`）
- 実際の Supabase プロジェクトへのリクエストをテスト内で発生させない
- `jsdom` 環境では Recharts のレンダリングが失敗することがある → `vi.mock` で回避
