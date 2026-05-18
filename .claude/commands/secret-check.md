# シークレット露出チェッカー

このコマンドはリポジトリ内のシークレット露出リスクを包括的にスキャンします。

## 実行手順

以下の手順を順番に実行し、最後に日本語でレポートを出力してください。

---

### 1. .gitignore の確認

`.gitignore` を読み込み、以下のファイルが除外されているか確認する:
- `.env`、`.env.local`、`.env.*.local`
- `*.pem`、`*.key`、`*.p12`、`*.pfx`
- `*secret*`、`*credential*`

除外されていないものは **警告** として記録する。

---

### 2. 追跡されている機密ファイルの検出

```bash
git ls-files | grep -iE '\.(env|pem|key|p12|pfx|secret|credential|token)$'
git ls-files | grep -iE '(secret|credential|private|password)' | grep -v node_modules
```

git 管理下に入っている機密ファイルがあれば **高リスク** として記録する。

---

### 3. ソースコード内のハードコードされたシークレットのスキャン

Grep ツールを使い、以下のパターンをソースファイル（`*.ts`、`*.tsx`、`*.js`、`*.jsx`、`*.json`、`*.yaml`、`*.yml`）から検索する。
`node_modules/`、`.next/`、`*.test.*`、`*.spec.*` は除外する。

検索パターン:
- `(?i)(api[_-]?key|apikey)\s*[:=]\s*["'][^"']{8,}["']`
- `(?i)(secret|token|password|passwd|pwd)\s*[:=]\s*["'][^"']{8,}["']`
- `(?i)(authorization|bearer)\s*[:=]\s*["'][^"']{8,}["']`
- `NEXT_PUBLIC_[A-Z_]+=.{8,}` （環境変数のハードコード）
- `sk-[a-zA-Z0-9]{20,}` （OpenAI API キー）
- `eyJ[a-zA-Z0-9_-]{10,}` （JWT トークン）
- `ghp_[a-zA-Z0-9]{36}` （GitHub Personal Access Token）
- `AIza[0-9A-Za-z_-]{35}` （Google API キー）
- `AAAA[0-9A-Za-z_-]{135,140}` （Firebase Server Key）
- `supabase.*[a-f0-9-]{36}` （Supabase キー、ただし `.env.example` は除く）

ヒットした箇所はファイルパスと行番号を記録する。

---

### 4. コミット履歴のシークレットスキャン（直近 50 コミット）

```bash
git log --oneline -50 --all
```

直近 50 コミットのコミットメッセージに `password`、`secret`、`token`、`key` などが含まれていないか確認する。
（履歴に含まれている可能性を **注意** として記録する程度でよい）

---

### 5. .env 系ファイルの存在確認

```bash
git ls-files --others --exclude-standard | grep -iE '\.env'
```

`.env.local` など未追跡の `.env` ファイルが存在するか確認し、`.gitignore` で除外されているかを検証する。

---

### 6. レポート出力

以下のフォーマットで日本語レポートを出力する:

```
## シークレット露出チェック結果

### 🔴 高リスク（即時対応が必要）
- ...（git 管理下の機密ファイル、ソースへのハードコードなど）

### 🟡 中リスク（確認推奨）
- ...（.gitignore の漏れ、疑わしいパターンなど）

### 🟢 低リスク（情報）
- ...（コミット履歴の注意事項など）

### ✅ 問題なし
- ...（チェック済みで問題なかった項目）

### 推奨アクション
1. ...
```

問題が何もない場合は「問題は検出されませんでした」と明示する。
