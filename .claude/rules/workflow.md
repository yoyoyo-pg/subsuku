---
paths: app/**/*.tsx,app/**/*.ts,components/**/*.tsx,lib/**/*.ts,types/**/*.ts
---

# 開発ワークフロー

## ブランチ・PR

- 作業は必ず新規ブランチ（`claude/<作業内容>`）を切って行う（main への直接コミット禁止）
- PreToolUse フックが main ブランチへの編集をブロックする
- PR を作成すると GitHub Actions が自動で型チェック・lint を実行する
- 既存ブランチで作業を続ける前に PR の状態を確認する（マージ済みなら新ブランチを切る）

## PR作成前チェックリスト

```
[ ] npm run typecheck がエラーなし
[ ] npm run lint がエラーなし
[ ] npm run build が成功する（Vercel デプロイ前に必ず確認）
[ ] 新コンポーネントを追加した場合は 'use client' / Server Component の区別が正しい
[ ] CLAUDE.md のディレクトリ構造が実装と合っている
[ ] 環境変数を追加した場合は .env.local.example と architecture.md の環境変数テーブルも更新した
[ ] Supabase スキーマを変更した場合は supabase/schema.sql に反映済み
```

## マルチエージェント方針

新しいファイル作成・複数ファイルにまたがる実装では役割を分けて進める。

| 役割 | subagent_type | 担当 |
|------|---------------|------|
| 調査役 | Explore | コードベース読み取りのみ。コードは書かない |
| 実装役 | general-purpose + `isolation: worktree` | 調査結果を受けて実装 |
| レビュー役 | Explore | 制約違反・セキュリティ・型安全性の検証。修正はしない |
| 整理役 | general-purpose | PR 作成・ドキュメント更新 |

**使う条件**（いずれかに該当）: 新ファイル作成、複数ファイル変更、外部情報の調査が必要

**使わない条件**（すべて該当）: 既存ファイル 1〜2 件の軽微な修正 かつ ロジック変更なし

## Vercel デプロイ

- `main` マージ → Vercel が自動ビルド・デプロイ
- デプロイ前に `npm run build` をローカルで通しておくこと
- 環境変数は Vercel Dashboard の Environment Variables に設定する（コードにハードコード禁止）
