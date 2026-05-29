import { describe, expect, it } from 'vitest';
import type { StudyItem } from './types';
import { findDuplicateStudyItemWarnings, normalizeStudyItemMatchText } from './duplicateStudyItem';

const baseItem: StudyItem = {
  id: 'item_existing',
  subject: 'japanese',
  category: 'kanji',
  unit: 'kanji',
  title: '表裏',
  questionText: '表裏一体',
  answer: '表裏',
  defaultQuestionType: 'fill_blank',
  importance: 2,
  status: 'active',
  createdAt: '2026-05-01T00:00:00.000Z',
  updatedAt: '2026-05-01T00:00:00.000Z',
};

describe('findDuplicateStudyItemWarnings', () => {
  it('warns when the same answer already exists in another subject or unit', () => {
    const warnings = findDuplicateStudyItemWarnings(
      {
        id: 'item_new',
        answer: '表裏',
        questionText: '別の問題文',
      },
      [{ ...baseItem, subject: 'science', unit: 'biology', category: 'biology' }],
    );

    expect(warnings).toHaveLength(1);
    expect(warnings[0].reasons).toContain('same_answer');
  });

  it('ignores the item being edited', () => {
    const warnings = findDuplicateStudyItemWarnings(
      {
        id: baseItem.id,
        answer: baseItem.answer,
        questionText: baseItem.questionText,
      },
      [baseItem],
    );

    expect(warnings).toEqual([]);
  });

  it('warns for related answers that appear in each other question text', () => {
    const warnings = findDuplicateStudyItemWarnings(
      {
        id: 'item_new',
        answer: '表裏一体',
        questionText: '物事の長所と短所は、表裏一体である。',
      },
      [baseItem],
    );

    expect(warnings).toHaveLength(1);
    expect(warnings[0].reasons).toEqual(['related_answer', 'answer_in_existing_question', 'existing_answer_in_question']);
  });

  it('does not warn for one-character answer containment alone', () => {
    const warnings = findDuplicateStudyItemWarnings(
      {
        id: 'item_new',
        answer: '中国',
        questionText: '中国の歴史',
      },
      [{ ...baseItem, answer: '国', questionText: '国の名前' }],
    );

    expect(warnings).toEqual([]);
  });

  it('skips malformed imported items during scans', () => {
    const warnings = findDuplicateStudyItemWarnings(
      {
        id: 'item_new',
        answer: '表裏',
        questionText: '新しい問題文',
      },
      [
        null,
        { ...baseItem, id: 'missing_answer', answer: undefined },
        { ...baseItem, id: 'missing_question', questionText: undefined },
        { ...baseItem, id: 'valid_item' },
      ] as unknown as StudyItem[],
    );

    expect(warnings).toHaveLength(1);
    expect(warnings[0].item.id).toBe('valid_item');
  });
});

describe('normalizeStudyItemMatchText', () => {
  it('normalizes width, case, and whitespace', () => {
    expect(normalizeStudyItemMatchText(' ＡbＣ  １２ ')).toBe('abc12');
  });

  it('returns an empty string for non-string values', () => {
    expect(normalizeStudyItemMatchText(undefined)).toBe('');
  });
});
