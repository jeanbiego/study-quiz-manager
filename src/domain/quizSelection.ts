import { calculatePriorityScore, isDueForReview } from './priority';
import { resolveQuestionType } from './question';
import { toDateOnly } from './date';
import type { QuestionType, ReviewState, StudyItem, Subject } from './types';

export type QuizTarget = 'all_active' | 'due' | 'unreviewed' | 'mistakes';
export type QuizOrder = 'priority' | 'oldest_updated' | 'random';

export type QuizSelectionOptions = {
  subjects?: Subject[];
  categories?: string[];
  count: number;
  target?: QuizTarget;
  order?: QuizOrder;
  today?: Date;
  randomSeed?: string;
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
  const target = options.target ?? 'all_active';
  const order = options.order ?? 'priority';

  return items
    .filter((item) => item.status === 'active')
    .filter((item) => !options.subjects?.length || options.subjects.includes(item.subject))
    .filter((item) => !options.categories?.length || options.categories.includes(item.category))
    .filter((item) => matchesTarget(stateByItemId.get(item.id), target, today))
    .map((item) => {
      const reviewState = stateByItemId.get(item.id);
      return {
        item,
        questionType: resolveQuestionType(item, reviewState?.lastMistakeType),
        priorityScore: calculatePriorityScore(item, reviewState, today),
      };
    })
    .sort((left, right) => compareSelectedItems(left, right, order, options.randomSeed ?? toSeed(today)))
    .slice(0, Math.max(0, options.count));
}

function matchesTarget(reviewState: ReviewState | undefined, target: QuizTarget, today: Date): boolean {
  if (target === 'all_active') {
    return true;
  }

  if (target === 'due') {
    return isDueForReview(reviewState, today);
  }

  if (target === 'unreviewed') {
    return !reviewState?.lastReviewedAt;
  }

  return (reviewState?.mistakeCount ?? 0) > 0 || reviewState?.lastResult === 'partial' || reviewState?.lastResult === 'incorrect';
}

function compareSelectedItems(left: SelectedQuizItem, right: SelectedQuizItem, order: QuizOrder, seed: string): number {
  if (order === 'oldest_updated') {
    return left.item.updatedAt.localeCompare(right.item.updatedAt) || right.priorityScore - left.priorityScore;
  }

  if (order === 'random') {
    return seededRank(`${seed}:${left.item.id}`) - seededRank(`${seed}:${right.item.id}`);
  }

  return right.priorityScore - left.priorityScore || left.item.updatedAt.localeCompare(right.item.updatedAt);
}

function toSeed(today: Date): string {
  return toDateOnly(today);
}

function seededRank(value: string): number {
  let hash = 2_166_136_261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  return hash >>> 0;
}
