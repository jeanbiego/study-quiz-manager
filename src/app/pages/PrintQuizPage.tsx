import { CheckSquare, Printer } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { renderQuestionText } from '../../domain/question';
import { QUESTION_TYPE_LABELS } from '../../domain/types';
import { Button } from '../../ui/Button';
import { useAppDataContext } from '../AppDataContext';

export function PrintQuizPage() {
  const { quizId } = useParams();
  const { data, setData } = useAppDataContext();
  const quiz = data.quizzes.find((candidate) => candidate.id === quizId);
  const items = quiz?.itemIds.map((id) => data.studyItems.find((item) => item.id === id)).filter((item) => item !== undefined) ?? [];

  function printQuiz() {
    if (!quiz) {
      return;
    }

    setData((current) => ({
      ...current,
      quizzes: current.quizzes.map((candidate) => (candidate.id === quiz.id ? { ...candidate, printedAt: new Date().toISOString() } : candidate)),
    }));
    window.print();
  }

  if (!quiz) {
    return <p className="text-sm text-slate-500">小テストが見つかりません。</p>;
  }

  return (
    <section className="grid gap-5">
      <div className="print:hidden flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{quiz.title}</h2>
          <p className="text-sm text-slate-500">問題用紙と解答用紙を別ページとして印刷します。</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/quizzes/${quiz.id}/score`}>
            <Button variant="secondary">
              <CheckSquare size={16} />
              採点入力へ
            </Button>
          </Link>
          <Button onClick={printQuiz}>
            <Printer size={16} />
            印刷
          </Button>
        </div>
      </div>

      <PrintableSheet title={`${quiz.title} 問題用紙`} items={items} quiz={quiz} showAnswers={false} />
      <PrintableSheet title={`${quiz.title} 解答用紙`} items={items} quiz={quiz} showAnswers />
    </section>
  );
}

type PrintableSheetProps = {
  title: string;
  items: NonNullable<ReturnType<typeof useAppDataContext>['data']['studyItems'][number]>[];
  quiz: NonNullable<ReturnType<typeof useAppDataContext>['data']['quizzes'][number]>;
  showAnswers: boolean;
};

function PrintableSheet({ title, items, quiz, showAnswers }: PrintableSheetProps) {
  return (
    <section className="print-page min-h-[280mm] rounded-lg bg-white p-8 shadow-sm print:min-h-0 print:rounded-none print:p-0 print:shadow-none">
      <h2 className="mb-1 text-center text-2xl font-semibold">{title}</h2>
      <p className="mb-8 text-center text-sm text-slate-500">
        日付:<span className="inline-block w-20" />年<span className="inline-block w-12" />月<span className="inline-block w-12" />日
        <span className="inline-block w-10" />名前:<span className="inline-block w-32" />
      </p>
      <ol className="grid gap-6">
        {items.map((item, index) => {
          const questionType = quiz.questionTypesByItemId?.[item.id] ?? item.defaultQuestionType;
          return (
            <li key={item.id} className="break-inside-avoid">
              <div className="flex gap-3">
                <span className="font-semibold">{index + 1}.</span>
                <div className="grid flex-1 gap-2">
                  <p className="text-base leading-7">{renderQuestionText(item, questionType)}</p>
                  <p className="text-xs text-slate-500">{QUESTION_TYPE_LABELS[questionType]}</p>
                  {showAnswers ? (
                    <div className="rounded-md border border-slate-300 bg-slate-50 p-3">
                      <p className="font-semibold">答え: {item.answer}</p>
                      {item.note ? <p className="mt-1 text-sm text-slate-600">メモ: {item.note}</p> : null}
                    </div>
                  ) : (
                    <div className="h-12 border-b-2 border-slate-400" />
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
