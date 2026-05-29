import { AlertTriangle, Eye, RotateCcw, Save } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { findDuplicateStudyItemWarnings, type DuplicateStudyItemReason } from '../../domain/duplicateStudyItem';
import { renderQuestionText } from '../../domain/question';
import { createInitialReviewState } from '../../domain/review';
import { createStudyItemTitle } from '../../domain/studyItemDisplay';
import { getDefaultUnit, getUnitOptions } from '../../domain/subjectUnits';
import { QUESTION_TYPE_LABELS, SUBJECT_LABELS } from '../../domain/types';
import type { QuestionType, StudyItem, Subject } from '../../domain/types';
import { createId } from '../../infra/id';
import { Button } from '../../ui/Button';
import { Field, SelectInput, TextArea, TextInput } from '../../ui/FormField';
import { useAppDataContext } from '../AppDataContext';

type FormState = {
  subject: Subject;
  unit: string;
  questionText: string;
  answer: string;
  reading: string;
  defaultQuestionType: QuestionType;
};

const availableQuestionTypes: QuestionType[] = ['short_answer', 'fill_blank'];
const maxDuplicateWarningsShown = 5;

const duplicateReasonLabels: Record<DuplicateStudyItemReason, string> = {
  same_answer: '答えが同一',
  related_answer: '答えが包含関係',
  answer_in_existing_question: '新しい答えが既存の問題文に含まれる',
  existing_answer_in_question: '既存の答えが新しい問題文に含まれる',
};

const emptyForm: FormState = {
  subject: 'japanese',
  unit: getDefaultUnit('japanese'),
  questionText: '',
  answer: '',
  reading: '',
  defaultQuestionType: 'fill_blank',
};

export function ItemFormPage() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { data, setData } = useAppDataContext();
  const existingItem = data.studyItems.find((item) => item.id === itemId);
  const [form, setForm] = useState<FormState>(() => (existingItem ? toFormState(existingItem) : emptyForm));
  const [duplicateWarningAccepted, setDuplicateWarningAccepted] = useState(false);
  const [duplicateWarningAttempted, setDuplicateWarningAttempted] = useState(false);
  const unitOptions = getUnitOptions(form.subject, form.unit);

  const previewItem = useMemo<StudyItem>(
    () => ({
      id: existingItem?.id ?? 'preview',
      createdAt: existingItem?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subject: form.subject,
      category: form.unit,
      unit: form.unit || undefined,
      title: createStudyItemTitle(form.answer, form.questionText) || 'プレビュー',
      questionText: form.questionText,
      answer: form.answer,
      reading: form.reading || undefined,
      defaultQuestionType: form.defaultQuestionType,
      importance: existingItem?.importance ?? 2,
      status: existingItem?.status ?? 'active',
    }),
    [existingItem?.createdAt, existingItem?.id, existingItem?.importance, existingItem?.status, form],
  );
  const duplicateWarnings = useMemo(() => findDuplicateStudyItemWarnings(previewItem, data.studyItems), [data.studyItems, previewItem]);
  const hasDuplicateWarnings = duplicateWarnings.length > 0;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    resetDuplicateConfirmation();
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateSubject(subject: Subject) {
    resetDuplicateConfirmation();
    setForm((current) => ({
      ...current,
      subject,
      unit: getDefaultUnit(subject),
    }));
  }

  function resetNewItemForm() {
    resetDuplicateConfirmation();
    setForm(emptyForm);
  }

  function resetDuplicateConfirmation() {
    setDuplicateWarningAccepted(false);
    setDuplicateWarningAttempted(false);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const now = new Date().toISOString();
    const unit = form.unit.trim();
    const questionText = form.questionText.trim();
    const answer = form.answer.trim();
    const item: StudyItem = {
      id: existingItem?.id ?? createId('item'),
      createdAt: existingItem?.createdAt ?? now,
      updatedAt: now,
      subject: form.subject,
      category: unit,
      unit,
      title: createStudyItemTitle(answer, questionText),
      questionText,
      answer,
      reading: form.reading.trim() || undefined,
      defaultQuestionType: form.defaultQuestionType,
      importance: existingItem?.importance ?? 2,
      status: existingItem?.status ?? 'active',
    };

    if (hasDuplicateWarnings && !duplicateWarningAccepted) {
      setDuplicateWarningAttempted(true);
      return;
    }

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
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Quiz Editor</p>
          <h2 className="text-3xl font-semibold tracking-tight">{existingItem ? 'クイズを編集' : 'クイズを登録'}</h2>
          <p className="mt-1 text-sm text-slate-500">復習したい内容と問題を登録します。</p>
        </div>
        <div className="flex gap-2">
          {existingItem ? (
            <Link to="/">
              <Button type="button" variant="secondary">
                戻る
              </Button>
            </Link>
          ) : (
            <Button type="button" variant="secondary" onClick={resetNewItemForm}>
              <RotateCcw size={16} />
              リセット
            </Button>
          )}
          <Button type="submit" disabled={!form.unit || !form.questionText || !form.answer}>
            <Save size={16} />
            保存
          </Button>
        </div>
      </div>

      <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
        <Field label="科目">
          <SelectInput value={form.subject} onChange={(event) => updateSubject(event.target.value as Subject)}>
            {Object.entries(SUBJECT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="出題形式">
          <SelectInput value={form.defaultQuestionType} onChange={(event) => update('defaultQuestionType', event.target.value as QuestionType)}>
            {availableQuestionTypes.map((value) => (
              <option key={value} value={value}>
                {QUESTION_TYPE_LABELS[value]}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="単元">
          <SelectInput value={form.unit} onChange={(event) => update('unit', event.target.value)}>
            {unitOptions.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="問題文">
          <TextArea value={form.questionText} onChange={(event) => update('questionText', event.target.value)} required />
        </Field>
        <Field label="正解">
          <TextInput value={form.answer} onChange={(event) => update('answer', event.target.value)} required />
        </Field>
        <Field label="読み">
          <TextInput value={form.reading} onChange={(event) => update('reading', event.target.value)} placeholder="任意" />
        </Field>
        {hasDuplicateWarnings ? (
          <div className="grid gap-3 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 md:col-span-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 shrink-0" size={18} />
              <div>
                <p className="font-semibold">重複の可能性があります</p>
                <p className="mt-1 text-amber-900">科目や単元が違う項目も含めて確認しています。確認後もこのまま保存できます。</p>
              </div>
            </div>
            <ul className="grid gap-2">
              {duplicateWarnings.slice(0, maxDuplicateWarningsShown).map((warning) => (
                <li key={warning.item.id} className="grid gap-1 border-t border-amber-200 pt-2">
                  <p className="font-medium">
                    {warning.item.answer} / {SUBJECT_LABELS[warning.item.subject]} / {warning.item.unit ?? warning.item.category}
                  </p>
                  <p className="line-clamp-2 text-amber-900">{warning.item.questionText}</p>
                  <p className="text-xs text-amber-800">{warning.reasons.map((reason) => duplicateReasonLabels[reason]).join('・')}</p>
                </li>
              ))}
            </ul>
            {duplicateWarnings.length > maxDuplicateWarningsShown ? (
              <p className="text-xs text-amber-800">ほか {duplicateWarnings.length - maxDuplicateWarningsShown} 件の候補があります。</p>
            ) : null}
            <label className="flex items-start gap-2 text-sm font-medium">
              <input
                type="checkbox"
                className="mt-0.5 size-4 rounded border-amber-300 text-amber-700 focus:ring-amber-500"
                checked={duplicateWarningAccepted}
                onChange={(event) => {
                  setDuplicateWarningAccepted(event.target.checked);
                  if (event.target.checked) {
                    setDuplicateWarningAttempted(false);
                  }
                }}
              />
              <span>重複候補を確認したので、このまま保存する</span>
            </label>
            {duplicateWarningAttempted && !duplicateWarningAccepted ? (
              <p className="text-xs font-semibold text-amber-900">保存するには、重複候補の確認チェックを入れてください。</p>
            ) : null}
          </div>
        ) : null}
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
    unit: item.unit ?? item.category,
    questionText: item.questionText,
    answer: item.answer,
    reading: item.reading ?? '',
    defaultQuestionType: item.defaultQuestionType === 'contextual_writing' ? 'fill_blank' : item.defaultQuestionType,
  };
}
