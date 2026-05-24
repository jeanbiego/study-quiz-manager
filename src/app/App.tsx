import { BookOpen, ClipboardList, Database, FileCheck2, ListChecks, Printer } from 'lucide-react';
import { NavLink, Route, Routes } from 'react-router-dom';
import { useAppData } from '../infra/useAppData';
import { AppDataContext } from './AppDataContext';
import { BackupPage } from './pages/BackupPage';
import { ItemFormPage } from './pages/ItemFormPage';
import { ItemsPage } from './pages/ItemsPage';
import { PrintQuizPage } from './pages/PrintQuizPage';
import { QuizBuilderPage } from './pages/QuizBuilderPage';
import { QuizzesPage } from './pages/QuizzesPage';
import { ScoreQuizPage } from './pages/ScoreQuizPage';

const navItems = [
  { to: '/', label: '知識項目', icon: ListChecks },
  { to: '/items/new', label: '新規登録', icon: BookOpen },
  { to: '/quiz/new', label: '小テスト作成', icon: Printer },
  { to: '/quizzes', label: '小テスト履歴', icon: ClipboardList },
  { to: '/backup', label: 'バックアップ', icon: Database },
];

export function App() {
  const appData = useAppData();

  return (
    <AppDataContext.Provider value={appData}>
      <div className="min-h-screen bg-slate-50 text-slate-950">
        <header className="print:hidden border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl font-semibold">Study Quiz Manager</h1>
              <p className="text-sm text-slate-500">登録、出題、印刷、採点、復習更新をローカルで管理します。</p>
            </div>
            <nav className="flex flex-wrap gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `inline-flex min-h-10 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                      isActive ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`
                  }
                >
                  <item.icon size={16} />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6 print:max-w-none print:p-0">
          <Routes>
            <Route path="/" element={<ItemsPage />} />
            <Route path="/items/new" element={<ItemFormPage />} />
            <Route path="/items/:itemId/edit" element={<ItemFormPage />} />
            <Route path="/quiz/new" element={<QuizBuilderPage />} />
            <Route path="/quizzes" element={<QuizzesPage />} />
            <Route path="/quizzes/:quizId/print" element={<PrintQuizPage />} />
            <Route path="/quizzes/:quizId/score" element={<ScoreQuizPage />} />
            <Route path="/backup" element={<BackupPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </AppDataContext.Provider>
  );
}

function NotFoundPage() {
  return (
    <section className="grid gap-3">
      <FileCheck2 size={28} />
      <h2 className="text-lg font-semibold">ページが見つかりません</h2>
      <NavLink to="/" className="text-sm font-medium text-slate-700 underline">
        一覧へ戻る
      </NavLink>
    </section>
  );
}
