import { Filter, Printer, Shuffle } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { selectQuizItems } from '../../domain/quizSelection';
import type { QuizOrder, QuizTarget } from '../../domain/quizSelection';
import { QUESTION_TYPE_LABELS, SUBJECT_LABELS } from '../../domain/types';
import type { Subject } from '../../domain/types';
import { createId } from '../../infra/id';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Field, SelectInput } from '../../ui/FormField';
import { useAppDataContext } from '../AppDataContext';

export function QuizBuilderPage() {
  const navigate = useNavigate();
  const { data, setData } = useAppDataContext();
  const [subject, setSubject] = useState<Subject | ''>('');
  const [category, setCategory] = useState('');
  const [count, setCount] = useState(10);
  const [target, setTarget] = useState<QuizTarget>('all_active');
  const [order, setOrder] = useState<QuizOrder>('priority');

  const categories = useMemo(() => [...new Set(data.studyItems.map((item) => item.category).filter(Boolean))].sort(), [data.studyItems]);
  const subjects = subject ? [subject] : undefined;
  const categoriesFilter = category ? [category] : undefined;
  const selectedItems = selectQuizItems(data.studyItems, data.reviewStates, {
    subjects,
    categories: categoriesFilter,
    count,
    target,
    order,
  });

  function createQuiz(event: FormEvent) {
    event.preventDefault();
    if (!selectedItems.length) {
      return;
    }

    const now = new Date().toISOString();
    const quizId = createId('quiz');
    setData((current) => ({
      ...current,
      quizzes: [
        {
          id: quizId,
          createdAt: now,
          title: `${new Date().toLocaleDateString('ja-JP')} 小テスト`,
          subjectFilter: subjects,
          categoryFilter: categoriesFilter,
          itemIds: selectedItems.map(({ item }) => item.id),
          questionTypesByItemId: Object.fromEntries(selectedItems.map(({ item, questionType }) => [item.id, questionType])),
        },
        ...current.quizzes,
      ],
    }));
    navigate(`/quizzes/${quizId}/print`);
  }

  return (
    <form className="grid gap-5" onSubmit={createQuiz}>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Quiz Builder</p>
          <h2 className="text-3xl font-semibold tracking-tight">小テスト作成</h2>
          <p className="mt-1 text-sm text-slate-500">復習状態に応じて候補を選び、印刷用ページを作成します。</p>
        </div>
        <Badge tone="amber" className="self-start">{selectedItems.length}件選出</Badge>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Filter size={16} />
          出題条件
        </div>
        <div className="grid gap-4 md:grid-cols-5">
        <Field label="科目">
          <SelectInput value={subject} onChange={(event) => setSubject(event.target.value as Subject | '')}>
            <option value="">全科目</option>
            {Object.entries(SUBJECT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="カテゴリ">
          <SelectInput value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">全カテゴリ</option>
            {categories.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="問題数">
          <SelectInput value={count} onChange={(event) => setCount(Number(event.target.value))}>
            {[5, 10, 15, 20, 30].map((value) => (
              <option key={value} value={value}>
                {value}問
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="出題対象">
          <SelectInput value={target} onChange={(event) => setTarget(event.target.value as QuizTarget)}>
            <option value="all_active">有効な項目すべて</option>
            <option value="due">期限到来のみ</option>
            <option value="unreviewed">未復習のみ</option>
            <option value="mistakes">ミスありのみ</option>
          </SelectInput>
        </Field>
        <Field label="出題順">
          <SelectInput value={order} onChange={(event) => setOrder(event.target.value as QuizOrder)}>
            <option value="priority">優先度順</option>
            <option value="oldest_updated">古い更新順</option>
            <option value="random">ランダム</option>
          </SelectInput>
        </Field>
        </div>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <div>
            <h3 className="flex items-center gap-2 font-semibold">
              <Shuffle size={16} />
              出題候補
            </h3>
            <p className="text-sm text-slate-500">上から順に印刷用テストへ入ります。</p>
          </div>
          <Button disabled={!selectedItems.length}>
            <Printer size={16} />
            印刷用ページを作る
          </Button>
        </div>
        <ol className="divide-y divide-slate-100">
          {selectedItems.map(({ item, questionType, priorityScore }, index) => (
            <li key={item.id} className="grid gap-2 p-4 hover:bg-slate-50/70 md:grid-cols-[40px_1fr_160px_110px] md:items-center">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">{index + 1}</span>
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-slate-500">
                  {SUBJECT_LABELS[item.subject]} / {item.category}
                </p>
              </div>
              <Badge tone={questionType === 'contextual_writing' ? 'amber' : 'slate'}>{QUESTION_TYPE_LABELS[questionType]}</Badge>
              <span className="text-sm font-medium text-slate-500">優先度 {priorityScore}</span>
            </li>
          ))}
        </ol>
        {!selectedItems.length ? <p className="p-6 text-sm text-slate-500">出題できる知識項目がありません。</p> : null}
      </section>
    </form>
  );
}
