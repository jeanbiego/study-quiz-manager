import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { AppData, StudyItem } from '../../domain/types';
import { AppDataContext } from '../AppDataContext';
import { QuizBuilderPage } from './QuizBuilderPage';

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
    { ...baseItem, id: 'science_item', subject: 'science', category: '生物', title: '植物' },
  ],
  reviewStates: [],
  quizzes: [],
  answerRecords: [],
};

function renderPage() {
  render(
    <MemoryRouter>
      <AppDataContext.Provider value={{ data, setData: vi.fn(), replaceData: vi.fn() }}>
        <QuizBuilderPage />
      </AppDataContext.Provider>
    </MemoryRouter>,
  );
}

describe('QuizBuilderPage', () => {
  it('uses learner-friendly quiz settings without a due-date-only option', () => {
    renderPage();
    const countSelect = screen.getByRole('combobox', { name: '問題数' });
    const targetSelect = screen.getByRole('combobox', { name: '問題の選び方' });
    const orderSelect = screen.getByRole('combobox', { name: '問題の並べ方' });

    expect(countSelect).toHaveValue('7');
    expect(within(countSelect).getAllByRole('option').map((option) => option.textContent)).toEqual(['7問', '14問', '21問', '28問', '35問']);
    expect(within(targetSelect).getByRole('option', { name: '学習中の問題すべて' })).toBeInTheDocument();
    expect(within(targetSelect).getByRole('option', { name: 'まだ採点していない問題' })).toBeInTheDocument();
    expect(within(targetSelect).getByRole('option', { name: '一度でもまちがえた問題' })).toBeInTheDocument();
    expect(within(targetSelect).queryByRole('option', { name: '期限到来のみ' })).not.toBeInTheDocument();
    expect(within(orderSelect).getByRole('option', { name: '復習のおすすめ順' })).toBeInTheDocument();
    expect(within(orderSelect).getByRole('option', { name: '登録・編集が古い順' })).toBeInTheDocument();
    expect(within(orderSelect).getByRole('option', { name: 'ランダムな順番' })).toBeInTheDocument();
  });

  it('shows only units for the selected subject and clears the selected unit when the subject changes', async () => {
    const user = userEvent.setup();
    renderPage();
    const subjectSelect = screen.getByRole('combobox', { name: '科目' });
    const unitSelect = screen.getByRole('combobox', { name: '単元' });

    await user.selectOptions(subjectSelect, 'social');

    expect(within(unitSelect).getByRole('option', { name: '地理' })).toBeInTheDocument();
    expect(within(unitSelect).queryByRole('option', { name: '漢字' })).not.toBeInTheDocument();
    expect(within(unitSelect).queryByRole('option', { name: '生物' })).not.toBeInTheDocument();

    await user.selectOptions(unitSelect, '地理');
    await user.selectOptions(subjectSelect, 'science');

    expect(unitSelect).toHaveValue('');
    expect(within(unitSelect).getByRole('option', { name: '生物' })).toBeInTheDocument();
    expect(within(unitSelect).queryByRole('option', { name: '地理' })).not.toBeInTheDocument();
  });
});
