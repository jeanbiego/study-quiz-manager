import { Edit3, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SUBJECT_LABELS, QUESTION_TYPE_LABELS } from '../../domain/types';
import type { Subject } from '../../domain/types';
import { Button } from '../../ui/Button';
import { SelectInput, TextInput } from '../../ui/FormField';
import { useAppDataContext } from '../AppDataContext';
import { useMemo, useState } from 'react';

export function ItemsPage() {
  const { data, setData } = useAppDataContext();
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState<Subject | ''>('');
  const [category, setCategory] = useState('');

  const stateByItemId = useMemo(() => new Map(data.reviewStates.map((state) => [state.studyItemId, state])), [data.reviewStates]);
  const categories = useMemo(() => [...new Set(data.studyItems.map((item) => item.category).filter(Boolean))].sort(), [data.studyItems]);

  const filteredItems = data.studyItems.filter((item) => {
    const queryTarget = `${item.title} ${item.questionText} ${item.answer} ${item.category} ${item.unit ?? ''}`.toLowerCase();
    return (
      (!query || queryTarget.includes(query.toLowerCase())) &&
      (!subject || item.subject === subject) &&
      (!category || item.category === category)
    );
  });

  function deleteItem(itemId: string) {
    if (!confirm('この知識項目を削除しますか。関連する復習状態と履歴も削除されます。')) {
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
          <h2 className="text-2xl font-semibold">知識項目</h2>
          <p className="text-sm text-slate-500">{data.studyItems.length}件登録済み</p>
        </div>
        <Link to="/items/new">
          <Button>
            <Plus size={16} />
            新規登録
          </Button>
        </Link>
      </div>

      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-[1fr_160px_180px]">
        <TextInput placeholder="タイトル、問題文、正解で検索" value={query} onChange={(event) => setQuery(event.target.value)} />
        <SelectInput value={subject} onChange={(event) => setSubject(event.target.value as Subject | '')}>
          <option value="">全科目</option>
          {Object.entries(SUBJECT_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </SelectInput>
        <SelectInput value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="">全カテゴリ</option>
          {categories.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </SelectInput>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[900px] border-collapse text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">科目</th>
              <th className="px-4 py-3">カテゴリ</th>
              <th className="px-4 py-3">タイトル</th>
              <th className="px-4 py-3">正解</th>
              <th className="px-4 py-3">形式</th>
              <th className="px-4 py-3">次回</th>
              <th className="px-4 py-3">状態</th>
              <th className="px-4 py-3">最終結果</th>
              <th className="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => {
              const reviewState = stateByItemId.get(item.id);
              return (
                <tr key={item.id} className="border-t border-slate-200">
                  <td className="px-4 py-3">{SUBJECT_LABELS[item.subject]}</td>
                  <td className="px-4 py-3">{item.category}</td>
                  <td className="px-4 py-3 font-medium">{item.title}</td>
                  <td className="px-4 py-3">{item.answer}</td>
                  <td className="px-4 py-3">{QUESTION_TYPE_LABELS[item.defaultQuestionType]}</td>
                  <td className="px-4 py-3">{reviewState?.nextReviewDate ?? '未復習'}</td>
                  <td className="px-4 py-3">{item.status}</td>
                  <td className="px-4 py-3">{reviewState?.lastResult ?? '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link to={`/items/${item.id}/edit`}>
                        <Button variant="secondary" title="編集">
                          <Edit3 size={15} />
                        </Button>
                      </Link>
                      <Button variant="danger" title="削除" onClick={() => deleteItem(item.id)}>
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!filteredItems.length ? <p className="p-6 text-sm text-slate-500">条件に一致する知識項目はありません。</p> : null}
      </div>
    </section>
  );
}
