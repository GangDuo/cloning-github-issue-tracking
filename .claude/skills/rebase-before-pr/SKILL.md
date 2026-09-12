---
name: rebase-before-pr
description: |
  Pull Requestを作成する直前に、作業中ブランチの分岐元を origin/main の
  最新状態に rebase するスキル。ブランチ作成後からPR作成までの間に他の
  変更が先に main へマージされていた場合でも、それを見落とさずPRに
  取り込んでおくためのもの。「PRを作成して」「プルリク作成して」等、
  PR作成を指示された直後、gh pr create を実行する前に必ず使用する。
---

# rebase-before-pr — PR作成前のorigin/main rebase

## 背景

作業ブランチを作成してからPRを作成するまでの間に、他のセッションや
他の開発者の変更が先に `main` へマージされることがある。分岐元が
古いままPRを作成すると、レビュー時の差分に無関係な変更が混ざったり、
マージ時に想定外のコンフリクトが発生したりする。

これを防ぐため、PRを作成する直前は必ずこの Skill で `origin/main` の
最新を取得し、必要であれば作業ブランチを rebase してから push・PR
作成を行う。

[[sync-main]] が「新規実装着手前・新規ブランチ作成前」に使うのに対し、
本 Skill は「既存の作業ブランチでPRを作成する直前」に使う点が異なる。

## 使用方法

```
/rebase-before-pr
```

`gh pr create` を実行する前に必ず実行する。

## ワークフロー

### Step 1: リモート最新の取得

```bash
git fetch origin main
```

### Step 2: 分岐元がmainより古くないか確認

```bash
git branch --show-current
git log HEAD..origin/main --oneline   # 分岐後にmainへ積まれた未取り込みコミット
```

出力が空であれば分岐元は最新なので、Step 3・4 は行わずそのまま
PR作成に進んでよい。

### Step 3: rebase実行（確認不要）

Step 2 で未取り込みコミットが見つかった場合、確認なしで
`origin/main` を起点とした rebase を実行してよい。

```bash
git rebase origin/main
```

作業ツリーに未コミットの変更が残っている場合は、rebase前に
CLAUDE.md のスタッシュ運用ルールに従って退避する。

```bash
git stash push -u -m "claude-temp-<一意なID>"
```

### Step 4: コンフリクト時の対応

コンフリクトが発生し自動で解決できない場合のみ、rebase を中断した
まま状況を提示してユーザーに対応を仰ぐ。

```bash
git status               # コンフリクトファイルを確認
# ユーザーが解決 → git add <file> → git rebase --continue
# 解決できない場合 → git rebase --abort
```

自動で解決できた場合（コンフリクトが発生しなかった場合）はユーザーに
確認せずそのまま作業を継続してよい。

### Step 5: push

rebase によって履歴が書き換わるため、push方法はブランチの状態に
よって異なる。

```bash
# まだ一度もpushしていないブランチ
git push -u origin <branch-name>

# 既にリモートへpush済みのブランチ（履歴がリモートと分岐する）
git push --force-with-lease origin <branch-name>
```

`--force-with-lease` を含む push は履歴を書き換える操作のため、
実行前に必ずユーザーに確認する。無条件の `--force` は使用しない
（リモート側に想定外の変更が積まれていた場合に上書きしてしまうため）。

## 注意事項

- rebase対象は必ず `origin/main`（ローカルの `main` ではない）。
- コンフリクトの自動解決は行わない。解決できない場合は
  `git rebase --abort` で元の状態に戻す。
- `main` ブランチへの直接コミットは禁止されているため、この Skill は
  `main` 以外の作業ブランチに対してのみ実行する。
