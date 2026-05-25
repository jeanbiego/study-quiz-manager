import { CheckSquare, Printer } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { renderQuestionText } from '../../domain/question';
import { getStudyItemUnit } from '../../domain/studyItemDisplay';
import { SUBJECT_LABELS } from '../../domain/types';
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
          <p className="text-sm text-slate-500">問題用紙のみ印刷します。模範解答は採点入力画面で確認します。</p>
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

      <PrintableSheet title={getPrintedSheetTitle(quiz.title)} items={items} quiz={quiz} />
    </section>
  );
}

type PrintableSheetProps = {
  title: string;
  items: NonNullable<ReturnType<typeof useAppDataContext>['data']['studyItems'][number]>[];
  quiz: NonNullable<ReturnType<typeof useAppDataContext>['data']['quizzes'][number]>;
};

function PrintableSheet({ title, items, quiz }: PrintableSheetProps) {
  return (
    <section className="print-page min-h-[280mm] rounded-lg bg-white p-8 shadow-sm print:min-h-0 print:rounded-none print:p-0 print:shadow-none">
      <h2 className="mb-8 text-center text-xl font-semibold">{title}</h2>
      <ol className="grid gap-6">
        {items.map((item, index) => {
          const questionType = quiz.questionTypesByItemId?.[item.id] ?? item.defaultQuestionType;
          return (
            <li key={item.id} className="break-inside-avoid">
              <div className="flex gap-3">
                <span className="font-semibold">{index + 1}.</span>
                <div className="grid flex-1 gap-2">
                  <p className="text-xs font-medium text-slate-500">
                    {SUBJECT_LABELS[item.subject]} / {getStudyItemUnit(item)}
                  </p>
                  <p className="text-base leading-7">{renderQuestionText(item, questionType)}</p>
                  <div className="answer-writing-guide h-12" />
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function getPrintedSheetTitle(quizTitle: string): string {
  const dateLabel = quizTitle.match(/^(\d{4}\/\d{1,2}\/\d{1,2}) 小テスト$/)?.[1];
  return dateLabel ? `本日のクイズ ${dateLabel}` : quizTitle;
}
