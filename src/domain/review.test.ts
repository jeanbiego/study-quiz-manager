import { describe, expect, it } from 'vitest';
import type { AnswerRecord } from './types';
import { createInitialReviewState, getNextQuestionType, updateReviewState } from './review';

function record(overrides: Partial<AnswerRecord>): AnswerRecord {
  return {
    id: 'answer_1',
    studyItemId: 'item_1',
    quizId: 'quiz_1',
    answeredAt: '2026-05-24T00:00:00.000Z',
    result: 'correct',
    questionTypeUsed: 'short_answer',
    ...overrides,
  };
}

describe('updateReviewState', () => {
  it('extends the next review interval as consecutive correct answers increase', () => {
    const first = updateReviewState(createInitialReviewState('item_1'), record({}), new Date('2026-05-24T00:00:00'));
    const second = updateReviewState(first.reviewState, record({}), new Date('2026-05-24T00:00:00'));
    const third = updateReviewState(second.reviewState, record({}), new Date('2026-05-24T00:00:00'));

    expect(first.reviewState.nextReviewDate).toBe('2026-05-31');
    expect(second.reviewState.nextReviewDate).toBe('2026-06-07');
    expect(third.reviewState.nextReviewDate).toBe('2026-06-23');
  });

  it('prioritizes fill blank after a wrong character mistake', () => {
    expect(getNextQuestionType(record({ result: 'partial', mistakeType: 'wrong_character' }))).toBe('fill_blank');
  });

  it('prioritizes short answer or fill blank after a wrong term mistake', () => {
    expect(getNextQuestionType(record({ result: 'incorrect', mistakeType: 'wrong_term', questionTypeUsed: 'fill_blank' }))).toBe('short_answer');
  });
});
