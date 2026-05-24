import { Eye, Save } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { renderQuestionText } from '../../domain/question';
import { createInitialReviewState } from '../../domain/review';
import { QUESTION_TYPE_LABELS, SUBJECT_LABELS } from '../../domain/types';
import type { QuestionType, StudyItem, StudyItemStatus, Subject } from '../../domain/types';
import { createId } from '../../infra/id';
import { Button } from '../../ui/Button';
import { Field, SelectInput, TextArea, TextInput } from '../../ui/FormField';
import { useAppDataContext } from '../AppDataContext';

type FormState = {
  subject: Subject;
  category: string;
  unit: string;
  title: string;
  questionText: string;
  answer: string;
  reading: string;
  note: string;
  defaultQuestionType: QuestionType;
  importance: 1 | 2 | 3;
  status: StudyItemStatus;
};

const emptyForm: FormState = {
  subject: 'social',
  category: '',
  unit: '',
  title: '',
  questionText: '',
  answer: '',
  reading: '',
  note: '',
  defaultQuestionType: 'short_answer',
  importance: 2,
  status: 'active',
};

export function ItemFormPage() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { data, setData } = useAppDataContext();
  const existingItem = data.studyItems.find((item) => item.id === itemId);
  const [form, setForm] = useState<FormState>(() => (existingItem ? toFormState(existingItem) : emptyForm));

  const previewItem = useMemo<StudyItem>(
    () => ({
      id: existingItem?.id ?? 'preview',
      createdAt: existingItem?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subject: form.subject,
      category: form.category,
      unit: form.unit || undefined,
      title: form.title || 'プレビュー',
      questionText: form.questionText,
      answer: form.answer,
      reading: form.reading || undefined,
      note: form.note || undefined,
      defaultQuestionType: form.defaultQuestionType,
      importance: form.importance,
      status: form.status,
    }),
    [existingItem?.createdAt, existingItem?.id, form],
  );

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const now = new Date().toISOString();
    const item: StudyItem = {
      id: existingItem?.id ?? createId('item'),
      createdAt: existingItem?.createdAt ?? now,
      updatedAt: now,
      subject: form.subject,
      category: form.category.trim(),
      unit: form.unit.trim() || undefined,
      title: form.title.trim(),
      questionText: form.questionText.trim(),
      answer: form.answer.trim(),
      reading: form.reading.trim() || undefined,
      note: form.note.trim() || undefined,
      defaultQuestionType: form.defaultQuestionType,
      importance: form.importance,
      status: form.status,
    };

    setData((current) => ({
      ...current,
      studyItems: existingItem ? current.studyItems.map((candidate) => (candidate.id === item.id ? item : candidate)) : [item, ...current.studyItems],
      reviewStates: existingItem ? current.reviewStates : [createInitialReviewState(item.id), ...current.reviewStates],
    }));
    navigate('/');
  }

  return (
    <form className="grid gap-5" onSubmit={submit}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Item Editor</p>
          <h2 className="text-3xl font-semibold tracking-tight">{existingItem ? '知識項目を編集' : '知識項目を登録'}</h2>
          <p className="mt-1 text-sm text-slate-500">復習したい知識と代表問題を登録します。</p>
        </div>
        <div className="flex gap-2">
          <Link to="/">
            <Button type="button" variant="secondary">
              戻る
            </Button>
          </Link>
          <Button type="submit" disabled={!form.title || !form.questionText || !form.answer || !form.category}>
            <Save size={16} />
            保存
          </Button>
        </div>
      </div>

      <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
        <Field label="科目">
          <SelectInput value={form.subject} onChange={(event) => update('subject', event.target.value as Subject)}>
            {Object.entries(SUBJECT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="カテゴリ">
          <TextInput value={form.category} onChange={(event) => update('category', event.target.value)} placeholder="地理、歴史、語彙など" required />
        </Field>
        <Field label="単元">
          <TextInput value={form.unit} onChange={(event) => update('unit', event.target.value)} placeholder="日本のすがた、平安時代など" />
        </Field>
        <Field label="タイトル">
          <TextInput value={form.title} onChange={(event) => update('title', event.target.value)} required />
        </Field>
        <Field label="問題文">
          <TextArea value={form.questionText} onChange={(event) => update('questionText', event.target.value)} required />
        </Field>
        <Field label="正解">
          <TextInput value={form.answer} onChange={(event) => update('answer', event.target.value)} required />
        </Field>
        <Field label="読み">
          <TextInput value={form.reading} onChange={(event) => update('reading', event.target.value)} placeholder="文中書き取りで使う読み" />
        </Field>
        <Field label="デフォルト出題形式">
          <SelectInput value={form.defaultQuestionType} onChange={(event) => update('defaultQuestionType', event.target.value as QuestionType)}>
            {Object.entries(QUESTION_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="重要度">
          <SelectInput value={form.importance} onChange={(event) => update('importance', Number(event.target.value) as 1 | 2 | 3)}>
            <option value={1}>1 低</option>
            <option value={2}>2 標準</option>
            <option value={3}>3 高</option>
          </SelectInput>
        </Field>
        <Field label="状態">
          <SelectInput value={form.status} onChange={(event) => update('status', event.target.value as StudyItemStatus)}>
            <option value="active">active</option>
            <option value="mastered">mastered</option>
            <option value="paused">paused</option>
          </SelectInput>
        </Field>
        <Field label="メモ">
          <TextArea value={form.note} onChange={(event) => update('note', event.target.value)} />
        </Field>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Eye size={16} />
            問題文プレビュー
          </h3>
          <p className="text-base leading-7">{renderQuestionText(previewItem, form.defaultQuestionType) || '問題文を入力してください。'}</p>
          <p className="mt-4 text-sm text-slate-500">答え: {form.answer || '-'}</p>
        </div>
      </div>
    </form>
  );
}

function toFormState(item: StudyItem): FormState {
  return {
    subject: item.subject,
    category: item.category,
    unit: item.unit ?? '',
    title: item.title,
    questionText: item.questionText,
    answer: item.answer,
    reading: item.reading ?? '',
    note: item.note ?? '',
    defaultQuestionType: item.defaultQuestionType,
    importance: item.importance,
    status: item.status,
  };
}
