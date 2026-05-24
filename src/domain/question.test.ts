import { describe, expect, it } from 'vitest';
import { renderQuestionText } from './question';
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
});
