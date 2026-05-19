---
description: PR作成前チェックを自動実行し、チェックリストを確認する
---

PR 作成前の準備チェックを行います。以下の手順を順番に実施してください。

## ステップ 1: main との同期

```bash
git fetch origin main
git rebase origin/main
```

rebase でコンフリクトが発生した場合は解消してから続けてください。

## ステップ 2: 品質チェック

次のコマンドを順番に実行し、すべてパスすることを確認してください。

```bash
npm run typecheck
npm run lint
npm run build
```

エラーがあれば修正してから次に進んでください。

## ステップ 3: チェックリスト確認

以下を目視で確認してください。

- [ ] `git rebase origin/main` 済み（コンフリクトなし）
- [ ] `npm run typecheck` がエラーなし
- [ ] `npm run lint` がエラーなし
- [ ] `npm run build` が成功
- [ ] 新コンポーネントを追加した場合は `'use client'` / Server Component の区別が正しい
- [ ] `CLAUDE.md` のディレクトリ構造が実装と合っている
- [ ] 環境変数を追加した場合は `.env.local.example` と `architecture.md` の環境変数テーブルも更新した
- [ ] Supabase スキーマを変更した場合は `supabase/schema.sql` に反映済み
- [ ] 教訓があれば `docs/lessons.md` に追記した（`/add-lesson` を使う）

## ステップ 4: PR 作成

すべてチェックが通ったら PR を作成してください。

```bash
git push -u origin HEAD
gh pr create
```
