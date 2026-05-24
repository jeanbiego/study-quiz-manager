# AGENTS.md

このファイルは、Codex が `jeanbiego/study-quiz-manager` で作業するときのリポジトリ内ルールです。

## Project Scope

- `study-quiz-manager` は、小学生・中学受験生向けの暗記学習を支援するローカル動作のWebアプリです。
- MVPは「知識項目登録」「小テスト作成」「ブラウザ印刷」「採点入力」「復習状態更新」「ローカル保存」「エクスポート・インポート」を対象にします。
- アプリ本体は外部通信を前提にしません。クラウド同期、認証、メール通知、プッシュ通知、LLM API、外部OCR API、外部DBはMVPに入れません。
- GitHub操作、依存パッケージ取得、CI確認などの開発作業でのネットワーク利用は許可します。

## Recommended Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Vitest
- Testing Library

既存実装がある場合は、上記よりも既存パターンを優先してください。

## Architecture

推奨構成:

```text
src/
  app/        # routes, pages, app composition
  domain/     # models, review logic, quiz selection logic
  infra/      # localStorage / IndexedDB persistence
  ui/         # reusable UI components
  test/       # shared test setup
```

守ること:

- ドメインロジックを画面コンポーネントへ直接書かない。
- 優先度計算、次回出題日更新、出題形式決定、採点結果反映、小テスト候補選出は `src/domain/` に置く。
- 保存処理は `src/infra/` に閉じ込める。
- ローカル保存はRepository越しに扱い、将来 `localStorage` から IndexedDB へ差し替えられる形にする。
- データのエクスポート形式には `schemaVersion` を含める。

## Domain Rules

- 対象科目は `japanese`、`science`、`social`。
- 出題形式は `short_answer`、`fill_blank`、`contextual_writing`。
- 採点結果は `correct`、`partial`、`incorrect`。
- `partial` のミス種別は `wrong_character` とし、次回は文中書き取りを優先する。
- `incorrect` のミス種別は `wrong_term` とし、次回は一問一答または穴埋めを優先する。
- `mastered` と `paused` の項目は通常の小テスト候補から除外する。
- 優先度計算では、期限超過、`max(0, mistakeCount - correctCount)`、直近ミス、重要度を考慮する。

## Testing Expectations

ドメインロジックにはユニットテストを書くこと。特に以下は優先して検証します。

- 正解時に次回出題日が延びる。
- 連続正解で出題間隔が `7日 -> 14日 -> 30日` と伸び、安定後に `mastered` 扱いになる。
- `wrong_character` で次回の出題形式が `contextual_writing` になる。
- `wrong_term` で次回の出題形式が `short_answer` または `fill_blank` になる。
- `max(0, mistakeCount - correctCount)` が苦手度として優先度に反映される。
- `nextReviewDate` が今日以前の項目が優先される。
- `mastered` と `paused` が通常出題から除外される。

## Local Development

作業前:

```powershell
git status -sb
```

依存関係やスクリプトは `package.json` が存在する場合に確認してください。存在するスクリプトを優先して使います。

推奨チェック:

```powershell
npm run lint
npm run test
npm run build
```

スクリプトが存在しない場合は、実行できなかった理由を最終報告に明記してください。

## GitHub Repository

- Canonical repository: `https://github.com/jeanbiego/study-quiz-manager`
- Expected remote name: `origin`
- Branch prefix for Codex work: `codex/`
- Default PR mode: draft PR
- Default merge method: squash merge
- Default expectation for implementation work: work on an appropriate branch, open a PR, wait for CI, check reviews, address actionable feedback, and merge when the stated merge conditions are satisfied.

現在のリポジトリが空、または remote default branch が未設定の場合があります。その場合は初回コミットで `main` を作り、以後のPR baseとして `main` を使います。

## Branch Selection

作業開始時は、必ず現在のブランチとリモート状態を確認します。

```powershell
git status -sb
git branch --show-current
git remote -v
```

- `main`、`master`、remote default branch 上で実装を始めない。作業内容に合わせて `codex/<short-description>` を作る。
- 既に `codex/` ブランチ上にいて、そのブランチのPRが今回の作業範囲と一致する場合は、そのブランチを継続してよい。
- 既に `codex/` ブランチ上でも、既存PRと無関係な作業なら新しい `codex/<short-description>` ブランチを作る。
- ユーザー作業や未追跡ファイルが混在する場合は、作業対象だけを明示的にstageする。
- base branch は原則として remote default branch を使う。remote default branch が未設定の空リポジトリでは、最初に `main` を初期化してpushする。

## PR-To-Merge Workflow

実装作業では、特に指定がない限り、この手順でPR、CI、レビュー確認、マージまで通すことを目標にします。ユーザーが「マージまで」「自走して」と依頼した場合は、マージ条件を満たした時点でマージまで進めます。

1. 作業範囲を確認する。
   - `git status -sb` と差分を確認する。
   - 無関係な変更が混在している場合は、勝手にまとめてstageしない。
   - stage対象は原則として明示的なファイルパスにする。
2. ブランチを決める。
   - `main`、`master`、remote default branch 上なら `codex/<short-description>` を作る。
   - 既に作業ブランチ上なら、ユーザー意図に反しない限りそのブランチを使う。
   - 作業内容が現在のブランチ名や既存PRの目的とずれている場合は、新しいブランチを作る。
3. ローカル検証を実行する。
   - 既存スクリプトがあれば `lint`、`test`、`build` を優先する。
   - 失敗した場合は原因を調べ、作業範囲内で修正して再実行する。
4. コミットする。
   - コミットメッセージは短く具体的にする。
   - 無関係なファイルを含めない。
5. pushする。
   - `git push -u origin <branch>`
6. draft PRを作る。
   - タイトルは `[codex] <summary>` 形式にする。
   - 本文には `Summary`、`Validation`、`Notes` を含める。
   - CLIを使う場合は `gh pr create --draft` を基本にする。
7. CIを確認する。
   - `gh pr checks <pr>` で状態を確認する。
   - GitHub Actions の失敗は `gh run view <run-id> --log` でログを確認する。
   - 外部CIがある場合はURLと状態を報告し、ログ取得できない前提で扱う。
8. CI失敗を修正する。
   - ログに基づいて最小限の修正を行う。
   - ローカル検証を再実行する。
   - 追加コミットをpushし、CIを再確認する。
9. レビューを確認する。
   - `gh pr view <pr> --json reviewDecision,reviews,comments,statusCheckRollup,mergeStateStatus` を確認する。
   - インラインレビューや未解決スレッドが関係する場合は GraphQL API で `reviewThreads`、`isResolved`、`isOutdated` を確認する。
   - 未解決でactionableなレビュー指摘は実装で対応し、ローカル検証後にpushする。
   - 対応したレビュー指摘は、修正pushと検証完了後に解決済みとしてマーキングする。
   - コメント返信やレビュー送信は、ユーザーが明示的に許可した場合だけ行う。
10. マージ条件を確認する。
    - 必須CIが成功している。
    - blocking review、requested changes、未解決のactionable threadがない。
    - PRが最新のbaseに対してmergeableである。
    - ユーザーの依頼がマージまで含んでいる、または明示的なマージ許可がある。
11. マージする。
    - 通常は `gh pr merge <pr> --squash --delete-branch` を使う。
    - 必須チェック待ちでauto-mergeが適切な場合のみ、ユーザー許可の範囲で `--auto` を使う。
    - マージ後にローカル `main` を更新し、作業ブランチが不要なら削除する。
12. マージ後レビューを確認する。
    - レビューやコメントはマージ後につくことがあるため、直近のmerged PRだけでなく、過去PRも適切にさかのぼって確認する。
    - 目安として、現在作業に関連するPR、直近10件のmerged PR、未解決レビューが残っているPRを確認対象にする。
    - マージ後にactionableな指摘が見つかった場合は、新しい `codex/<short-description>` ブランチで対応PRを作る。
    - 対応後はCIとレビュー確認を再度通し、対応したレビュー指摘を解決済みにする。

## CI Debugging Notes

- GitHub Actions のログ取得は GitHub CLI を使う。
- `gh auth status` が失敗した場合は、ユーザーに `gh auth login` を依頼して止まる。
- CIが失敗している間はマージしない。
- flakyの疑いがある場合でも、根拠なく再実行だけで済ませない。失敗ログ、再現性、再実行結果を短く記録する。

## Review Handling Notes

- レビューコメントは、actionable、informational、duplicate、outdated、resolved に分けて扱う。
- requested changes がある場合は、該当スレッドを確認してから修正する。
- レビューはマージ後につく場合がある。作業開始時と作業完了前に、現在のPRだけでなく関連する過去PRと直近merged PRも確認する。
- 未解決スレッドの確認には、必要に応じて GitHub GraphQL API の `reviewThreads`、`isResolved`、`isOutdated` を使う。
- 対応済みのactionable threadは、修正内容がpushされCIが通った後に解決済みとしてマーキングする。
- レビュー指摘同士が矛盾する場合は、実装前にユーザーへ判断を求める。
- 説明で済むコメントに対して、不要なコード変更をしない。

## Merge Safety

- required checks が失敗またはpendingのまま通常マージしない。
- requested changes が残ったままマージしない。
- merge conflict がある場合は、競合内容を確認して最小限に解消し、検証をやり直す。
- ユーザーの明示許可がない場合、ready PR化、コメント返信、レビュー送信、マージは行わない。
- ユーザーがレビュー対応の自走を依頼している場合、対応済みスレッドの解決済みマーキングは行ってよい。
- ユーザーが「自走してマージまで」と明示した場合は、上記条件を満たした時点でマージまで進めてよい。

## Final Report

作業完了時は、以下を簡潔に報告します。

- 変更内容
- 実行した検証
- PR URL
- CI結果
- レビュー確認結果
- マージした場合はマージ方法とブランチ削除の有無
- 未完了またはユーザー判断が必要な事項
