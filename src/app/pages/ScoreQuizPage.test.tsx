import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { AppData, StudyItem } from '../../domain/types';
import { AppDataContext } from '../AppDataContext';
import { ScoreQuizPage } from './ScoreQuizPage';

const fillBlankItem: StudyItem = {
  id: 'history_item',
  subject: 'social',
  category: '歴史',
  title: '鎌倉幕府',
  questionText: '北条氏は執権となって幕府の政治を動かしました。',
  answer: '執権',
  defaultQuestionType: 'fill_blank',
  importance: 2,
  status: 'active',
  createdAt: '2026-05-01T00:00:00.000Z',
  updatedAt: '2026-05-01T00:00:00.000Z',
};

const data: AppData = {
  schemaVersion: 1,
  studyItems: [fillBlankItem],
  reviewStates: [],
  quizzes: [
    {
      id: 'quiz_1',
      createdAt: '2026-05-24T00:00:00.000Z',
      title: '2026/5/25 小テスト',
      itemIds: ['history_item'],
      questionTypesByItemId: {
        history_item: 'fill_blank',
      },
    },
  ],
  answerRecords: [],
};

describe('ScoreQuizPage', () => {
  it('shows the target answer in context for fill-blank scoring', () => {
    render(
      <MemoryRouter initialEntries={['/quizzes/quiz_1/score']}>
        <AppDataContext.Provider value={{ data, setData: vi.fn(), replaceData: vi.fn() }}>
          <Routes>
            <Route path="/quizzes/:quizId/score" element={<ScoreQuizPage />} />
          </Routes>
        </AppDataContext.Provider>
      </MemoryRouter>,
    );

    expect(screen.getByText('北条氏は（執権）となって幕府の政治を動かしました。')).toBeInTheDocument();
    expect(screen.getByText('模範解答: 執権')).toBeInTheDocument();
  });
});
