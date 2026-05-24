import { CheckSquare, Printer, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SUBJECT_LABELS } from '../../domain/types';
import { Button } from '../../ui/Button';
import { useAppDataContext } from '../AppDataContext';

export function QuizzesPage() {
  const { data, setData } = useAppDataContext();
  const itemById = new Map(data.studyItems.map((item) => [item.id, item]));
  const quizzes = [...data.quizzes].sort((left, right) => right.createdAt.localeCompare(left.createdAt));

  function deleteQuiz(quizId: string) {
    if (!confirm('この小テスト履歴を削除しますか。採点履歴は残ります。')) {
      return;
    }

    setData((current) => ({
      ...current,
      quizzes: current.quizzes.filter((quiz) => quiz.id !== quizId),
    }));
  }

  return (
    <section className="grid gap-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">小テスト履歴</h2>
          <p className="text-sm text-slate-500">{quizzes.length}件作成済み</p>
        </div>
        <Link to="/quiz/new">
          <Button>
            <Printer size={16} />
            小テスト作成
          </Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[860px] border-collapse text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">タイトル</th>
              <th className="px-4 py-3">作成日</th>
              <th className="px-4 py-3">問題数</th>
              <th className="px-4 py-3">科目</th>
              <th className="px-4 py-3">印刷</th>
              <th className="px-4 py-3">採点</th>
              <th className="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.map((quiz) => {
              const subjects = [...new Set(quiz.itemIds.map((id) => itemById.get(id)?.subject).filter((subject) => subject !== undefined))];
              return (
                <tr key={quiz.id} className="border-t border-slate-200">
                  <td className="px-4 py-3 font-medium">{quiz.title}</td>
                  <td className="px-4 py-3">{formatDateTime(quiz.createdAt)}</td>
                  <td className="px-4 py-3">{quiz.itemIds.length}問</td>
                  <td className="px-4 py-3">{subjects.length ? subjects.map((subject) => SUBJECT_LABELS[subject]).join('、') : '-'}</td>
                  <td className="px-4 py-3">{quiz.printedAt ? formatDateTime(quiz.printedAt) : '未印刷'}</td>
                  <td className="px-4 py-3">{quiz.scoredAt ? formatDateTime(quiz.scoredAt) : '未採点'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link to={`/quizzes/${quiz.id}/print`}>
                        <Button variant="secondary" title="印刷">
                          <Printer size={15} />
                        </Button>
                      </Link>
                      <Link to={`/quizzes/${quiz.id}/score`}>
                        <Button variant="secondary" title="採点">
                          <CheckSquare size={15} />
                        </Button>
                      </Link>
                      <Button variant="danger" title="削除" onClick={() => deleteQuiz(quiz.id)}>
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!quizzes.length ? <p className="p-6 text-sm text-slate-500">作成済みの小テストはありません。</p> : null}
      </div>
    </section>
  );
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}
