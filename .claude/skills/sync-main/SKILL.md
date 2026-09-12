---
name: sync-main
description: |
  複数のClaudeセッションが並列で作業している環境で、新しい実装タスクに着手する前・
  新規ブランチを作成する前に、リモートmainの最新状態を取得して現在の作業との差分を
  確認するスキル。他セッションの変更が先にmainへマージされていても見落とさないため
  のもの。「実装を始めて」「次のタスクに取り掛かって」等、新規の実装に着手する直前、
  および新規ブランチ作成の直前に必ず使用する。
---

# sync-main — リモートmain最新の取得と確認

## 背景

複数の Claude セッションが並列で同一リポジトリに対して作業する場合、
あるセッション（claude1）の変更が先に `main` へマージされることがある。
別のセッション（claude2）が自分のタスクを終えて次の実装に取り掛かる際、
`origin/main` を fetch せずに作業を始めると、claude1 のマージ結果を
知らないまま重複した変更や矛盾した変更を積み重ねてしまう。

これを防ぐため、新しい実装に着手する前は必ずこの Skill でリモート
`main` の最新状態を取得・確認する。

## 使用方法

```
/sync-main
```

新規の実装タスクに着手する直前、および新規ブランチを作成する直前に必ず実行する。

## ワークフロー

### Step 1: リモート最新の取得

```bash
git fetch origin
```

### Step 2: 現在の状態を確認

```bash
git branch --show-current
git status -sb
```

### Step 3: origin/main との差分を確認

```bash
git log HEAD..origin/main --oneline   # 自分の作業に未反映の、mainの新しいコミット
git log origin/main..HEAD --oneline   # 自分の作業が origin/main より進んでいる分
```

### Step 4: 状況に応じた対応

**ケースA: これから新規ブランチを作成して新しい実装を始める場合**

常に `origin/main` を起点にブランチを作成する。これにより他セッションが
先にマージした変更が自動的に取り込まれる。

```bash
git checkout -b <branch-name> origin/main
```

作業ツリーに未コミットの変更が残っている場合は、ブランチ作成前に
CLAUDE.md のスタッシュ運用ルールに従って退避する。

```bash
git stash push -u -m "claude-temp-<一意なID>"
```

**ケースB: 既存の作業ブランチで継続作業する場合**

Step 3 で `origin/main` に自分の未取り込みのコミットが見つかった場合、
確認なしに `origin/main` を起点とした rebase を実行してよい。

```bash
git rebase origin/main
```

コンフリクトが発生し自動で解決できない場合のみ、rebase を中断した
まま状況を提示してユーザーに対応を仰ぐ。

```bash
git status               # コンフリクトファイルを確認
# ユーザーが解決 → git add <file> → git rebase --continue
# 解決できない場合 → git rebase --abort
```

自動で解決できた場合（コンフリクトが発生しなかった場合）はユーザーに
確認せずそのまま作業を継続してよい。

## 注意事項

- `main` ブランチへの直接コミットは禁止されているため、新規ブランチは
  必ず `origin/main` を起点に作成する。
- ローカルの `main` ブランチ自体を fast-forward させる等の書き換えは、
  ユーザーの指示がある場合のみ行う。
- `origin/main` 起点の rebase は自動実行してよいが、コンフリクトが
  自動で解決できない場合は rebase を中断してユーザーの対応を待つ。
