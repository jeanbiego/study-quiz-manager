import { Save } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { renderQuestionTextWithAnswer } from '../../domain/question';
import { updateReviewState } from '../../domain/review';
import { QUESTION_TYPE_LABELS, RESULT_LABELS } from '../../domain/types';
import type { AnswerRecord, Result } from '../../domain/types';
import { createId } from '../../infra/id';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { useAppDataContext } from '../AppDataContext';

export function ScoreQuizPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { data, setData } = useAppDataContext();
  const quiz = data.quizzes.find((candidate) => candidate.id === quizId);
  const items = quiz?.itemIds.map((id) => data.studyItems.find((item) => item.id === id)).filter((item) => item !== undefined) ?? [];
  const [results, setResults] = useState<Record<string, Result>>({});

  function submitScores() {
    if (!quiz) {
      return;
    }

    const now = new Date().toISOString();
    setData((current) => {
      const reviewStateByItemId = new Map(current.reviewStates.map((state) => [state.studyItemId, state]));
      const records: AnswerRecord[] = items
        .filter((item) => results[item.id])
        .map((item) => {
          const result = results[item.id];
          return {
            id: createId('answer'),
            studyItemId: item.id,
            quizId: quiz.id,
            answeredAt: now,
            result,
            mistakeType: result === 'partial' ? 'wrong_character' : result === 'incorrect' ? 'wrong_term' : undefined,
            questionTypeUsed: quiz.questionTypesByItemId?.[item.id] ?? item.defaultQuestionType,
          };
        });

      const updates = records.map((record) => updateReviewState(reviewStateByItemId.get(record.studyItemId), record, new Date(now)));
      const nextReviewStates = new Map(current.reviewStates.map((state) => [state.studyItemId, state]));
      updates.forEach((update) => nextReviewStates.set(update.reviewState.studyItemId, update.reviewState));

      const statusByItemId = new Map(updates.map((update) => [update.reviewState.studyItemId, update.nextStatus]));

      return {
        ...current,
        answerRecords: [...records, ...current.answerRecords],
        reviewStates: [...nextReviewStates.values()],
        studyItems: current.studyItems.map((item) => {
          const nextStatus = statusByItemId.get(item.id);
          return nextStatus ? { ...item, status: nextStatus, updatedAt: now } : item;
        }),
        quizzes: current.quizzes.map((candidate) => (candidate.id === quiz.id ? { ...candidate, scoredAt: now } : candidate)),
      };
    });

    navigate('/quizzes');
  }

  if (!quiz) {
    return <p className="text-sm text-slate-500">小テストが見つかりません。</p>;
  }

  const isComplete = items.length > 0 && items.every((item) => results[item.id]);

  return (
    <section className="grid gap-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Scoring</p>
          <h2 className="text-3xl font-semibold tracking-tight">採点入力</h2>
          <p className="mt-1 text-sm text-slate-500">{quiz.title} の紙答案を、ブラウザ上の模範解答と照らし合わせて採点します。</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/quizzes/${quiz.id}/print`}>
            <Button variant="secondary">印刷画面へ</Button>
          </Link>
          <Button disabled={!isComplete} onClick={submitScores}>
            <Save size={16} />
            採点を保存
          </Button>
        </div>
      </div>

      <ol className="grid gap-3">
        {items.map((item, index) => {
          const questionType = quiz.questionTypesByItemId?.[item.id] ?? item.defaultQuestionType;
          return (
            <li key={item.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="grid gap-3 md:grid-cols-[40px_1fr_auto] md:items-center">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">{index + 1}</span>
                <div>
                  <div className="mb-1">
                    <Badge tone={questionType === 'fill_blank' || questionType === 'contextual_writing' ? 'amber' : 'slate'}>{QUESTION_TYPE_LABELS[questionType]}</Badge>
                  </div>
                  <p className="font-medium">{renderQuestionTextWithAnswer(item, questionType)}</p>
                  <p className="text-sm font-medium text-slate-700">模範解答: {item.answer}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(RESULT_LABELS) as Result[]).map((result) => (
                    <Button
                      key={result}
                      type="button"
                      variant={results[item.id] === result ? 'primary' : 'secondary'}
                      onClick={() => setResults((current) => ({ ...current, [item.id]: result }))}
                    >
                      {RESULT_LABELS[result]}
                    </Button>
                  ))}
                </div>
              </div>
              {results[item.id] ? (
                <div className="mt-3 md:ml-10">
                  <Badge tone={results[item.id] === 'correct' ? 'emerald' : results[item.id] === 'partial' ? 'amber' : 'rose'}>
                    {RESULT_LABELS[results[item.id]]}
                  </Badge>
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
