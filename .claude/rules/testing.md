---
paths: app/**/*.tsx,app/**/*.ts,components/**/*.tsx
---

# テスト方針

## 現状

Vitest によるユニットテストが `tests/` に導入済み。

| ファイル | テスト対象 |
|---------|-----------|
| `tests/subscription.test.ts` | `toMonthlyAmount` などの計算ロジック |
| `tests/wasteAlert.test.ts` | `detectWaste` の検出ロジック |
| `tests/csv.test.ts` | `buildCsvContent` の CSV 生成ロジック |

型チェック（`npm run typecheck`）・lint（`npm run lint`）・テスト（`npm test`）が品質ゲートとして機能している。
PostToolUse フックが .ts/.tsx 編集後に `tsc --noEmit` と ESLint を自動実行する。

## テストを追加するタイミング

純粋計算ロジックを追加・変更するときはテストも同時に書く。具体的には:

- `types/subscription.ts` の計算ユーティリティ
- `lib/waste.ts` の検出ロジック
- `lib/csv.ts` の CSV 生成ロジック

## 今後の拡張候補

- **Component**: React Testing Library（UI コンポーネントの振る舞い検証）
- **E2E**: Playwright（Vercel Preview URLs に対しても実行可能）

## 追加時の注意

- Supabase クライアントはモックを使う（`vi.mock('@/lib/supabase/client')`）
- 実際の Supabase プロジェクトへのリクエストをテスト内で発生させない
- `jsdom` 環境では Recharts のレンダリングが失敗することがある → `vi.mock` で回避
