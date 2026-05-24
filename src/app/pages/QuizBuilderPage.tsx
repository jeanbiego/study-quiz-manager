import { Printer } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { selectQuizItems } from '../../domain/quizSelection';
import { QUESTION_TYPE_LABELS, SUBJECT_LABELS } from '../../domain/types';
import type { Subject } from '../../domain/types';
import { createId } from '../../infra/id';
import { Button } from '../../ui/Button';
import { Field, SelectInput } from '../../ui/FormField';
import { useAppDataContext } from '../AppDataContext';

export function QuizBuilderPage() {
  const navigate = useNavigate();
  const { data, setData } = useAppDataContext();
  const [subject, setSubject] = useState<Subject | ''>('');
  const [category, setCategory] = useState('');
  const [count, setCount] = useState(10);
  const [dueOnly, setDueOnly] = useState(false);

  const categories = useMemo(() => [...new Set(data.studyItems.map((item) => item.category).filter(Boolean))].sort(), [data.studyItems]);
  const subjects = subject ? [subject] : undefined;
  const categoriesFilter = category ? [category] : undefined;
  const selectedItems = selectQuizItems(data.studyItems, data.reviewStates, {
    subjects,
    categories: categoriesFilter,
    count,
    dueOnly,
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
      <div>
        <h2 className="text-2xl font-semibold">小テスト作成</h2>
        <p className="text-sm text-slate-500">未復習・ミス優先で出題候補を自動選出します。</p>
      </div>

      <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-4">
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
        <label className="flex items-center gap-2 self-end rounded-md border border-slate-200 px-3 py-2 text-sm">
          <input type="checkbox" checked={dueOnly} onChange={(event) => setDueOnly(event.target.checked)} />
          期限到来のみ
        </label>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <div>
            <h3 className="font-semibold">出題候補</h3>
            <p className="text-sm text-slate-500">{selectedItems.length}件選出</p>
          </div>
          <Button disabled={!selectedItems.length}>
            <Printer size={16} />
            印刷用ページを作る
          </Button>
        </div>
        <ol className="divide-y divide-slate-200">
          {selectedItems.map(({ item, questionType, priorityScore }, index) => (
            <li key={item.id} className="grid gap-1 p-4 md:grid-cols-[40px_1fr_160px_100px] md:items-center">
              <span className="text-sm text-slate-500">{index + 1}</span>
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-slate-500">
                  {SUBJECT_LABELS[item.subject]} / {item.category}
                </p>
              </div>
              <span className="text-sm">{QUESTION_TYPE_LABELS[questionType]}</span>
              <span className="text-sm text-slate-500">優先度 {priorityScore}</span>
            </li>
          ))}
        </ol>
        {!selectedItems.length ? <p className="p-6 text-sm text-slate-500">出題できる知識項目がありません。</p> : null}
      </section>
    </form>
  );
}
