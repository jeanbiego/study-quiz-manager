# Startup Automation

`study-quiz-manager` はブラウザの `localStorage` に学習データを保存します。`localStorage` は
origin (`scheme`、`host`、`port`) ごとに別領域になるため、通常利用の URL は次に固定します。

```text
http://127.0.0.1:4174
```

`http://127.0.0.1:4175` や `http://localhost:4174` で開くと、同じブラウザでも別の保存データに
なります。日常の登録、採点、復習は必ず上記 URL で行ってください。

## Ports

| 用途 | ポート | 注意 |
|---|---:|---|
| 配布用ローカルサーバー | 4174 | 通常利用専用。`npm.cmd run serve` で起動します。 |
| 開発サーバー | 5174 | 実装確認専用。日常の学習データを入力しません。 |
| study-task-manager | 4173 | 既存アプリ用として空けておきます。 |

## Commands

```powershell
npm.cmd run build
npm.cmd run serve
```

ビルドから起動までまとめて行う場合:

```powershell
npm.cmd run serve:build
```

`4174` が既に使用中の場合、`npm.cmd run serve` は別ポートへ移動せず終了します。この場合は、既に
起動している `http://127.0.0.1:4174` のアプリを使用するか、そのプロセスを終了してから再起動
してください。

ポートや host を変更して通常利用する運用はサポートしません。別 origin のデータを復旧する必要が
ある場合は、その origin で JSON エクスポートを行い、`http://127.0.0.1:4174` 側へインポート
します。

## Windows Startup

Windows ログイン時に自動起動する場合は、タスクスケジューラで次を実行します。

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

事前に一度、配布用ビルドを作成してください。

```powershell
npm.cmd run build
```

アプリ更新後は再度 `npm.cmd run build` を実行します。
