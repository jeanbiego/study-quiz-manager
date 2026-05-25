import { AlertTriangle, CalendarClock, Edit3, Layers3, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toDateOnly } from '../../domain/date';
import { getStudyItemSummary, getStudyItemUnit } from '../../domain/studyItemDisplay';
import { SUBJECT_UNITS } from '../../domain/subjectUnits';
import { SUBJECT_LABELS, QUESTION_TYPE_LABELS } from '../../domain/types';
import type { Result, Subject } from '../../domain/types';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { SelectInput, TextInput } from '../../ui/FormField';
import { getSubjectBadgeClass } from '../../ui/subjectColors';
import { useAppDataContext } from '../AppDataContext';

export function ItemsPage() {
  const { data, setData } = useAppDataContext();
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState<Subject | ''>('');
  const [unit, setUnit] = useState('');

  const stateByItemId = useMemo(() => new Map(data.reviewStates.map((state) => [state.studyItemId, state])), [data.reviewStates]);
  const units = useMemo(() => {
    const registeredUnits = [
      ...new Set(
        data.studyItems
          .filter((item) => !subject || item.subject === subject)
          .map((item) => getStudyItemUnit(item))
          .filter(Boolean),
      ),
    ];

    if (!subject) {
      return registeredUnits.sort();
    }

    const standardUnits = SUBJECT_UNITS[subject];
    const additionalUnits = registeredUnits.filter((value) => !standardUnits.includes(value)).sort();
    return [...standardUnits, ...additionalUnits];
  }, [data.studyItems, subject]);
  const today = toDateOnly(new Date());
  const registeredCount = data.studyItems.length;
  const dueCount = data.studyItems.filter((item) => {
    const reviewState = stateByItemId.get(item.id);
    return item.status === 'active' && (!reviewState?.nextReviewDate || reviewState.nextReviewDate <= today);
  }).length;
  const mistakeCount = data.reviewStates.filter((state) => state.mistakeCount > 0 || state.lastResult === 'partial' || state.lastResult === 'incorrect').length;

  const filteredItems = data.studyItems.filter((item) => {
    const itemUnit = getStudyItemUnit(item);
    const queryTarget = `${item.questionText} ${item.answer} ${item.title} ${itemUnit}`.toLowerCase();
    return (
      (!query || queryTarget.includes(query.toLowerCase())) &&
      (!subject || item.subject === subject) &&
      (!unit || itemUnit === unit)
    );
  });

  function updateSubject(nextSubject: Subject | '') {
    setSubject(nextSubject);
    setUnit('');
  }

  function deleteItem(itemId: string) {
    if (!confirm('このクイズを削除しますか。関連する復習状態と履歴も削除されます。')) {
      return;
    }

    setData((current) => ({
      ...current,
      studyItems: current.studyItems.filter((item) => item.id !== itemId),
      reviewStates: current.reviewStates.filter((state) => state.studyItemId !== itemId),
      answerRecords: current.answerRecords.filter((record) => record.studyItemId !== itemId),
      quizzes: current.quizzes.map((quiz) => ({
        ...quiz,
        itemIds: quiz.itemIds.filter((id) => id !== itemId),
      })),
    }));
  }

  return (
    <section className="grid gap-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Quizzes</p>
          <h2 className="text-3xl font-semibold tracking-tight">クイズ</h2>
          <p className="mt-1 text-sm text-slate-500">{data.studyItems.length}件登録済み。復習候補のクイズを検索・整理します。</p>
        </div>
        <Link to="/items/new">
          <Button>
            <Plus size={16} />
            新規登録
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <StatCard icon={Layers3} label="登録済み" value={registeredCount} tone="emerald" />
        <StatCard icon={CalendarClock} label="出題対象" value={dueCount} tone="amber" />
        <StatCard icon={AlertTriangle} label="ミス履歴あり" value={mistakeCount} tone="rose" />
      </div>

      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_160px_180px]">
        <TextInput placeholder="問題文、正解、単元で検索" value={query} onChange={(event) => setQuery(event.target.value)} />
        <SelectInput value={subject} onChange={(event) => updateSubject(event.target.value as Subject | '')}>
          <option value="">全科目</option>
          {Object.entries(SUBJECT_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </SelectInput>
        <SelectInput value={unit} onChange={(event) => setUnit(event.target.value)}>
          <option value="">全単元</option>
          {units.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </SelectInput>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[860px] border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">科目</th>
              <th className="px-4 py-3">単元</th>
              <th className="px-4 py-3">問題</th>
              <th className="px-4 py-3">正解</th>
              <th className="px-4 py-3">形式</th>
              <th className="px-4 py-3">次回</th>
              <th className="px-4 py-3">最終結果</th>
              <th className="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => {
              const reviewState = stateByItemId.get(item.id);
              return (
                <tr key={item.id} className="border-t border-slate-100 hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <Badge className={getSubjectBadgeClass(item.subject)}>{SUBJECT_LABELS[item.subject]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{getStudyItemUnit(item)}</td>
                  <td className="max-w-[360px] px-4 py-3 font-medium">{getStudyItemSummary(item)}</td>
                  <td className="px-4 py-3">{item.answer}</td>
                  <td className="px-4 py-3 text-slate-600">{QUESTION_TYPE_LABELS[item.defaultQuestionType]}</td>
                  <td className="px-4 py-3">{reviewState?.nextReviewDate ?? '未復習'}</td>
                  <td className="px-4 py-3">{reviewState?.lastResult ? <ResultBadge result={reviewState.lastResult} /> : '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link to={`/items/${item.id}/edit`}>
                        <Button variant="secondary" size="icon" title="編集">
                          <Edit3 size={15} />
                        </Button>
                      </Link>
                      <Button variant="danger" size="icon" title="削除" onClick={() => deleteItem(item.id)}>
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!filteredItems.length ? <p className="p-6 text-sm text-slate-500">条件に一致するクイズはありません。</p> : null}
      </div>
    </section>
  );
}

type StatCardProps = {
  icon: typeof Layers3;
  label: string;
  value: number;
  tone: 'emerald' | 'amber' | 'rose' | 'sky';
};

const statToneClasses: Record<StatCardProps['tone'], string> = {
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  amber: 'bg-amber-50 text-amber-700 ring-amber-100',
  rose: 'bg-rose-50 text-rose-700 ring-rose-100',
  sky: 'bg-sky-50 text-sky-700 ring-sky-100',
};

function StatCard({ icon: Icon, label, value, tone }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className={`mb-3 grid h-9 w-9 place-items-center rounded-lg ring-1 ${statToneClasses[tone]}`}>
        <Icon size={18} />
      </div>
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

function ResultBadge({ result }: { result: Result }) {
  if (result === 'correct') {
    return <Badge tone="emerald">正解</Badge>;
  }

  if (result === 'partial') {
    return <Badge tone="amber">字が違う</Badge>;
  }

  return <Badge tone="rose">違う言葉</Badge>;
}

