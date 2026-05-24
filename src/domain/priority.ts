import { differenceInCalendarDays, toDateOnly } from './date';
import type { ReviewState, StudyItem } from './types';

export function calculatePriorityScore(item: StudyItem, reviewState: ReviewState | undefined, today: Date = new Date()): number {
  if (item.status !== 'active') {
    return Number.NEGATIVE_INFINITY;
  }

  const todayDate = toDateOnly(today);
  const overdueDays = reviewState?.nextReviewDate ? Math.max(0, differenceInCalendarDays(todayDate, reviewState.nextReviewDate)) : 30;
  const weakness = Math.max(0, (reviewState?.mistakeCount ?? 0) - (reviewState?.correctCount ?? 0)) * 3;
  const recentMistakeBonus = reviewState?.lastResult && reviewState.lastResult !== 'correct' ? 5 : 0;

  return overdueDays + weakness + recentMistakeBonus + item.importance;
}

export function isDueForReview(reviewState: ReviewState | undefined, today: Date = new Date()): boolean {
  if (!reviewState?.nextReviewDate) {
    return true;
  }

  return differenceInCalendarDays(toDateOnly(today), reviewState.nextReviewDate) >= 0;
}
