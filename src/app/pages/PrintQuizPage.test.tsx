import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { AppData, StudyItem } from '../../domain/types';
import { AppDataContext } from '../AppDataContext';
import { PrintQuizPage } from './PrintQuizPage';

const baseItem: StudyItem = {
  id: 'social_item',
  subject: 'social',
  category: '地理',
  title: '日本の地理',
  questionText: '日本の首都はどこですか。',
  answer: '東京',
  defaultQuestionType: 'short_answer',
  importance: 2,
  status: 'active',
  createdAt: '2026-05-01T00:00:00.000Z',
  updatedAt: '2026-05-01T00:00:00.000Z',
};

const data: AppData = {
  schemaVersion: 1,
  studyItems: [
    baseItem,
    { ...baseItem, id: 'japanese_item', subject: 'japanese', category: '漢字', title: '漢字' },
  ],
  reviewStates: [],
  quizzes: [
    {
      id: 'quiz_1',
      createdAt: '2026-05-25T12:00:00.000Z',
      title: '2026/5/25 小テスト',
      itemIds: ['social_item', 'japanese_item'],
    },
  ],
  answerRecords: [],
};

describe('PrintQuizPage', () => {
  it('shows a compact one-line printed heading without the subject summary', () => {
    render(
      <MemoryRouter initialEntries={['/quizzes/quiz_1/print']}>
        <AppDataContext.Provider value={{ data, setData: vi.fn(), replaceData: vi.fn() }}>
          <Routes>
            <Route path="/quizzes/:quizId/print" element={<PrintQuizPage />} />
          </Routes>
        </AppDataContext.Provider>
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: '本日のクイズ 2026/5/25' })).toHaveClass('text-xl');
    expect(screen.queryByRole('heading', { name: '2026/5/25 小テスト 問題用紙' })).not.toBeInTheDocument();
    expect(screen.queryByText('社会 / 国語 / 地理 / 漢字')).not.toBeInTheDocument();
  });
});
