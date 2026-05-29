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

function renderPage(appData: AppData = data, setData = vi.fn()) {
  return render(
    <MemoryRouter>
      <AppDataContext.Provider value={{ data: appData, setData, replaceData: vi.fn() }}>
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

  it('warns before saving a duplicated answer and allows confirmed creation', async () => {
    const user = userEvent.setup();
    const setData = vi.fn();
    const appData: AppData = {
      ...data,
      studyItems: [
        {
          id: 'item_existing',
          subject: 'science',
          category: 'biology',
          unit: 'biology',
          title: '表裏',
          questionText: '既存の問題文',
          answer: '表裏',
          defaultQuestionType: 'fill_blank',
          importance: 2,
          status: 'active',
          createdAt: '2026-05-01T00:00:00.000Z',
          updatedAt: '2026-05-01T00:00:00.000Z',
        },
      ],
    };

    renderPage(appData, setData);
    const [questionText, answer] = screen.getAllByRole('textbox');

    await user.type(questionText, '新しい問題文');
    await user.type(answer, '表裏');

    expect(screen.getByText('重複の可能性があります')).toBeInTheDocument();

    const saveButton = screen.getAllByRole('button').at(-1)!;
    await user.click(saveButton);

    expect(setData).not.toHaveBeenCalled();
    expect(screen.getByText('保存するには、重複候補の確認チェックを入れてください。')).toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: '重複候補を確認したので、このまま保存する' }));
    await user.click(saveButton);

    expect(setData).toHaveBeenCalledOnce();
  });
});
