# Startup Automation

`study-quiz-manager` は `study-task-manager` の起動ポート `4173` と衝突しないよう、配布用ローカルサーバーの既定ポートを `4174` にします。

## Ports

| 用途 | 既定ポート | 備考 |
|---|---:|---|
| 開発サーバー | 5174 | `npm run dev`。Viteが使用中ポートを検出した場合は次の空きポートへ移動します。 |
| 配布用ローカルサーバー | 4174 | `npm run serve`。`4173` は予約済みとして使いません。 |
| study-task-manager | 4173 | 既存アプリ用として空けておきます。 |

## Commands

```powershell
npm run build
npm run serve
```

ビルドから起動までまとめて行う場合:

```powershell
npm run serve:build
```

起動後、通常は次のURLを開きます。

```text
http://127.0.0.1:4174
```

`4174` が使用中の場合、サーバーは `4175` 以降の空きポートを順に試します。ログに表示されたURLを使ってください。

## Custom Port

明示的にポートを指定する場合:

```powershell
$env:STUDY_QUIZ_MANAGER_PORT=4180
npm run serve
```

または:

```powershell
node scripts/start-server.js 4180
```

`4173` を指定した場合でも、スクリプトは予約ポートとして扱い、次の候補へ移動します。

## Windows Startup

Windowsログイン時に自動起動する場合は、タスクスケジューラで次を実行します。

Program:

```text
npm.cmd
```

Arguments:

```text
run serve
```

Start in:

```text
C:\Users\catpe\OneDrive\pyhome\study-quiz-manager
```

事前に一度だけ配布用ビルドを作成してください。

```powershell
npm run build
```

アプリ更新後は再度 `npm run build` を実行します。
