import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { AppData } from '../../domain/types';
import { AppDataContext } from '../AppDataContext';
import { ItemFormPage } from './ItemFormPage';

const data: AppData = {
  schemaVersion: 1,
  studyItems: [],
  reviewStates: [],
  quizzes: [],
  answerRecords: [],
};

function renderPage() {
  render(
    <MemoryRouter>
      <AppDataContext.Provider value={{ data, setData: vi.fn(), replaceData: vi.fn() }}>
        <ItemFormPage />
      </AppDataContext.Provider>
    </MemoryRouter>,
  );
}

describe('ItemFormPage', () => {
  it('starts a new quiz with the kanji fill-blank defaults', () => {
    renderPage();

    expect(screen.getByRole('combobox', { name: '科目' })).toHaveValue('japanese');
    expect(screen.getByRole('combobox', { name: '単元' })).toHaveValue('漢字');
    expect(screen.getByRole('combobox', { name: '出題形式' })).toHaveValue('fill_blank');
  });

  it('updates a completed prompt preview when its question type changes', async () => {
    const user = userEvent.setup();
    renderPage();
    const typeSelect = screen.getByRole('combobox', { name: '出題形式' });

    await user.type(screen.getByRole('textbox', { name: '問題文' }), '次の読みを漢字で書きなさい。');
    await user.type(screen.getByRole('textbox', { name: '正解' }), '朝日');
    await user.selectOptions(typeSelect, 'short_answer');
    const previewText = screen.getByText('問題文プレビュー').parentElement?.querySelector('p.text-base');

    expect(previewText?.textContent).toBe('次の読みを漢字で書きなさい。');

    await user.selectOptions(typeSelect, 'fill_blank');

    expect(previewText?.textContent).toBe('次の読みを漢字で書きなさい。 （　　　）');
    expect(within(typeSelect).getByRole('option', { name: '穴埋め' })).toBeInTheDocument();
  });
});
