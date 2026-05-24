import { calculatePriorityScore, isDueForReview } from './priority';
import { resolveQuestionType } from './question';
import type { QuestionType, ReviewState, StudyItem, Subject } from './types';

export type QuizSelectionOptions = {
  subjects?: Subject[];
  categories?: string[];
  count: number;
  dueOnly?: boolean;
  today?: Date;
};

export type SelectedQuizItem = {
  item: StudyItem;
  questionType: QuestionType;
  priorityScore: number;
};

export function selectQuizItems(
  items: StudyItem[],
  reviewStates: ReviewState[],
  options: QuizSelectionOptions,
): SelectedQuizItem[] {
  const stateByItemId = new Map(reviewStates.map((state) => [state.studyItemId, state]));
  const today = options.today ?? new Date();

  return items
    .filter((item) => item.status === 'active')
    .filter((item) => !options.subjects?.length || options.subjects.includes(item.subject))
    .filter((item) => !options.categories?.length || options.categories.includes(item.category))
    .filter((item) => !options.dueOnly || isDueForReview(stateByItemId.get(item.id), today))
    .map((item) => {
      const reviewState = stateByItemId.get(item.id);
      return {
        item,
        questionType: resolveQuestionType(item, reviewState?.lastMistakeType),
        priorityScore: calculatePriorityScore(item, reviewState, today),
      };
    })
    .sort((left, right) => right.priorityScore - left.priorityScore || left.item.updatedAt.localeCompare(right.item.updatedAt))
    .slice(0, Math.max(0, options.count));
}
