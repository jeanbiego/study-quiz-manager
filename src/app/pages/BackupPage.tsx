import { Download, Upload } from 'lucide-react';
import { ChangeEvent } from 'react';
import { Button } from '../../ui/Button';
import { useAppDataContext } from '../AppDataContext';

export function BackupPage() {
  const { data, replaceData } = useAppDataContext();

  function exportJson() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `study-quiz-manager-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function importJson(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const text = await file.text();
    replaceData(JSON.parse(text));
    event.target.value = '';
  }

  return (
    <section className="grid gap-5">
      <div>
        <h2 className="text-2xl font-semibold">バックアップ</h2>
        <p className="text-sm text-slate-500">ローカルデータをJSONとして保存、復元します。</p>
      </div>

      <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-2">
        <div className="grid gap-2 rounded-lg bg-slate-100 p-4">
          <h3 className="font-semibold">エクスポート</h3>
          <p className="text-sm text-slate-500">現在の登録項目、復習状態、小テスト、採点履歴を書き出します。</p>
          <Button onClick={exportJson}>
            <Download size={16} />
            JSONを書き出す
          </Button>
        </div>
        <label className="grid cursor-pointer gap-2 rounded-lg bg-slate-100 p-4">
          <h3 className="font-semibold">インポート</h3>
          <p className="text-sm text-slate-500">JSONファイルから復元します。現在のデータは置き換えられます。</p>
          <span className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium ring-1 ring-slate-300">
            <Upload size={16} />
            JSONを読み込む
          </span>
          <input className="sr-only" type="file" accept="application/json" onChange={importJson} />
        </label>
      </div>
    </section>
  );
}
