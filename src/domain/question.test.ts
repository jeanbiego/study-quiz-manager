import { describe, expect, it } from 'vitest';
import { renderQuestionText, renderQuestionTextWithAnswer } from './question';
import type { StudyItem } from './types';

const baseItem: StudyItem = {
  id: 'item_1',
  subject: 'japanese',
  category: '漢字',
  unit: '漢字',
  title: '浴びる',
  questionText: '朝日を浴びる。',
  answer: '浴びる',
  defaultQuestionType: 'fill_blank',
  importance: 2,
  status: 'active',
  createdAt: '2026-05-24T00:00:00.000Z',
  updatedAt: '2026-05-24T00:00:00.000Z',
};

describe('renderQuestionText', () => {
  it('uses reading inside the blank when it is available', () => {
    expect(renderQuestionText({ ...baseItem, reading: 'あびる' }, 'fill_blank')).toBe('朝日を（あびる）。');
  });

  it('uses an empty blank when reading is not available', () => {
    expect(renderQuestionText(baseItem, 'fill_blank')).toBe('朝日を（　　　）。');
  });

  it('uses an empty blank when reading is the same as the answer', () => {
    expect(renderQuestionText({ ...baseItem, answer: '太陽', questionText: '太陽が昇る。', reading: '太陽' }, 'fill_blank')).toBe('（　　　）が昇る。');
  });

  it('appends a blank when a fill-blank prompt does not contain its answer', () => {
    expect(renderQuestionText({ ...baseItem, questionText: '次の読みを漢字で書きなさい。' }, 'fill_blank')).toBe(
      '次の読みを漢字で書きなさい。 （　　　）',
    );
  });
});

describe('renderQuestionTextWithAnswer', () => {
  it('wraps the answer in parentheses for fill-blank review displays', () => {
    expect(
      renderQuestionTextWithAnswer(
        {
          ...baseItem,
          questionText: '北条氏は執権となって幕府の政治を動かしました。',
          answer: '執権',
        },
        'fill_blank',
      ),
    ).toBe('北条氏は（執権）となって幕府の政治を動かしました。');
  });

  it('leaves short-answer prompts unchanged', () => {
    expect(renderQuestionTextWithAnswer(baseItem, 'short_answer')).toBe(baseItem.questionText);
  });
});
