import { describe, expect, it } from 'vitest';
import { selectQuizItems } from './quizSelection';
import type { ReviewState, StudyItem } from './types';

const baseItem: StudyItem = {
  id: 'item_1',
  subject: 'social',
  category: '地理',
  title: '明石市',
  questionText: '日本の標準時子午線が通る市はどこですか。',
  answer: '明石市',
  defaultQuestionType: 'short_answer',
  importance: 2,
  status: 'active',
  createdAt: '2026-05-01T00:00:00.000Z',
  updatedAt: '2026-05-01T00:00:00.000Z',
};

describe('selectQuizItems', () => {
  it('excludes mastered and paused items from normal quiz selection', () => {
    const selected = selectQuizItems(
      [
        baseItem,
        { ...baseItem, id: 'item_2', status: 'mastered' },
        { ...baseItem, id: 'item_3', status: 'paused' },
      ],
      [],
      { count: 10, today: new Date('2026-05-24T00:00:00') },
    );

    expect(selected.map(({ item }) => item.id)).toEqual(['item_1']);
  });

  it('prioritizes due items and accumulated mistakes', () => {
    const states: ReviewState[] = [
      {
        studyItemId: 'item_1',
        nextReviewDate: '2026-05-24',
        correctCount: 5,
        mistakeCount: 0,
        consecutiveCorrectCount: 1,
      },
      {
        studyItemId: 'item_2',
        nextReviewDate: '2026-05-20',
        correctCount: 0,
        mistakeCount: 3,
        consecutiveCorrectCount: 0,
        lastResult: 'incorrect',
        lastMistakeType: 'wrong_term',
      },
    ];

    const selected = selectQuizItems(
      [baseItem, { ...baseItem, id: 'item_2', title: '桓武天皇', importance: 3 }],
      states,
      { count: 2, today: new Date('2026-05-24T00:00:00') },
    );

    expect(selected[0].item.id).toBe('item_2');
    expect(selected[0].questionType).toBe('short_answer');
  });

  it('uses fill-blank after a wrong-term mistake unless the default is short answer', () => {
    const selected = selectQuizItems(
      [{ ...baseItem, defaultQuestionType: 'contextual_writing' }],
      [
        {
          studyItemId: 'item_1',
          correctCount: 0,
          mistakeCount: 1,
          consecutiveCorrectCount: 0,
          lastResult: 'incorrect',
          lastMistakeType: 'wrong_term',
        },
      ],
      { count: 1, today: new Date('2026-05-24T00:00:00') },
    );

    expect(selected[0].questionType).toBe('fill_blank');
  });

  it('can target only unreviewed items', () => {
    const selected = selectQuizItems(
      [baseItem, { ...baseItem, id: 'item_2', title: '桓武天皇' }],
      [
        {
          studyItemId: 'item_1',
          lastReviewedAt: '2026-05-20',
          nextReviewDate: '2026-05-27',
          correctCount: 1,
          mistakeCount: 0,
          consecutiveCorrectCount: 1,
        },
      ],
      { count: 10, target: 'unreviewed', today: new Date('2026-05-24T00:00:00') },
    );

    expect(selected.map(({ item }) => item.id)).toEqual(['item_2']);
  });

  it('can target items with mistakes', () => {
    const selected = selectQuizItems(
      [baseItem, { ...baseItem, id: 'item_2', title: '桓武天皇' }],
      [
        {
          studyItemId: 'item_1',
          correctCount: 2,
          mistakeCount: 0,
          consecutiveCorrectCount: 2,
        },
        {
          studyItemId: 'item_2',
          correctCount: 1,
          mistakeCount: 1,
          consecutiveCorrectCount: 0,
        },
      ],
      { count: 10, target: 'mistakes', today: new Date('2026-05-24T00:00:00') },
    );

    expect(selected.map(({ item }) => item.id)).toEqual(['item_2']);
  });

  it('can order by oldest updated item first', () => {
    const selected = selectQuizItems(
      [
        { ...baseItem, id: 'item_1', updatedAt: '2026-05-20T00:00:00.000Z' },
        { ...baseItem, id: 'item_2', updatedAt: '2026-05-01T00:00:00.000Z' },
      ],
      [],
      { count: 10, order: 'oldest_updated', today: new Date('2026-05-24T00:00:00') },
    );

    expect(selected.map(({ item }) => item.id)).toEqual(['item_2', 'item_1']);
  });

  it('uses the local calendar date as the deterministic random seed', () => {
    const items = [
      { ...baseItem, id: 'seed_item_1' },
      { ...baseItem, id: 'seed_item_2' },
      { ...baseItem, id: 'seed_item_3' },
      { ...baseItem, id: 'seed_item_4' },
    ];

    const selected = selectQuizItems(items, [], {
      count: 4,
      order: 'random',
      today: new Date(2026, 4, 24, 23, 30),
    });
    const selectedWithExplicitLocalSeed = selectQuizItems(items, [], {
      count: 4,
      order: 'random',
      randomSeed: '2026-05-24',
      today: new Date(2026, 4, 24, 23, 30),
    });

    expect(selected.map(({ item }) => item.id)).toEqual(selectedWithExplicitLocalSeed.map(({ item }) => item.id));
  });
});
