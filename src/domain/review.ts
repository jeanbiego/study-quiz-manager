import { addDays, toDateOnly } from './date';
import type { AnswerRecord, QuestionType, ReviewState, StudyItemStatus } from './types';

export type ReviewUpdate = {
  reviewState: ReviewState;
  nextStatus: StudyItemStatus;
  nextQuestionType: QuestionType;
};

const MASTERED_AFTER_CONSECUTIVE_CORRECT = 4;

export function createInitialReviewState(studyItemId: string): ReviewState {
  return {
    studyItemId,
    correctCount: 0,
    mistakeCount: 0,
    consecutiveCorrectCount: 0,
  };
}

export function getNextQuestionType(record: Pick<AnswerRecord, 'result' | 'mistakeType' | 'questionTypeUsed'>): QuestionType {
  if (record.result === 'partial' || record.mistakeType === 'wrong_character') {
    return 'fill_blank';
  }

  if (record.result === 'incorrect' || record.mistakeType === 'wrong_term') {
    return record.questionTypeUsed === 'fill_blank' ? 'short_answer' : 'fill_blank';
  }

  return record.questionTypeUsed;
}

export function updateReviewState(
  previous: ReviewState | undefined,
  record: AnswerRecord,
  now: Date = new Date(record.answeredAt),
): ReviewUpdate {
  const current = previous ?? createInitialReviewState(record.studyItemId);
  const answeredDate = toDateOnly(now);

  if (record.result === 'correct') {
    const consecutiveCorrectCount = current.consecutiveCorrectCount + 1;
    const intervalDays = consecutiveCorrectCount >= 3 ? 30 : consecutiveCorrectCount === 2 ? 14 : 7;
    const nextStatus = consecutiveCorrectCount >= MASTERED_AFTER_CONSECUTIVE_CORRECT ? 'mastered' : 'active';

    return {
      reviewState: {
        ...current,
        lastReviewedAt: answeredDate,
        nextReviewDate: nextStatus === 'mastered' ? undefined : addDays(now, intervalDays),
        correctCount: current.correctCount + 1,
        consecutiveCorrectCount,
        lastResult: record.result,
        lastMistakeType: undefined,
      },
      nextStatus,
      nextQuestionType: getNextQuestionType(record),
    };
  }

  const intervalDays = record.result === 'partial' ? 3 : 1;

  return {
    reviewState: {
      ...current,
      lastReviewedAt: answeredDate,
      nextReviewDate: addDays(now, intervalDays),
      mistakeCount: current.mistakeCount + 1,
      consecutiveCorrectCount: 0,
      lastResult: record.result,
      lastMistakeType: record.mistakeType,
    },
    nextStatus: 'active',
    nextQuestionType: getNextQuestionType(record),
  };
}
