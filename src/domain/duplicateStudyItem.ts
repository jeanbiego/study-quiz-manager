import type { StudyItem } from './types';

export type DuplicateStudyItemReason =
  | 'same_answer'
  | 'related_answer'
  | 'answer_in_existing_question'
  | 'existing_answer_in_question';

export type DuplicateStudyItemWarning = {
  item: StudyItem;
  reasons: DuplicateStudyItemReason[];
};

type DuplicateCandidate = Pick<StudyItem, 'id' | 'answer' | 'questionText'>;

const MIN_RELATED_TERM_LENGTH = 2;

export function findDuplicateStudyItemWarnings(candidate: DuplicateCandidate, items: StudyItem[]): DuplicateStudyItemWarning[] {
  return items
    .filter(isMatchableStudyItem)
    .filter((item) => item.id !== candidate.id)
    .map((item) => ({ item, reasons: getDuplicateReasons(candidate, item) }))
    .filter((warning) => warning.reasons.length > 0);
}

export function normalizeStudyItemMatchText(value: unknown): string {
  return typeof value === 'string' ? value.normalize('NFKC').toLocaleLowerCase().replace(/\s+/g, '') : '';
}

function getDuplicateReasons(candidate: DuplicateCandidate, item: StudyItem): DuplicateStudyItemReason[] {
  const candidateAnswer = normalizeStudyItemMatchText(candidate.answer);
  const existingAnswer = normalizeStudyItemMatchText(item.answer);
  const candidateQuestion = normalizeStudyItemMatchText(candidate.questionText);
  const existingQuestion = normalizeStudyItemMatchText(item.questionText);
  const reasons = new Set<DuplicateStudyItemReason>();

  if (!candidateAnswer || !existingAnswer) {
    return [];
  }

  if (candidateAnswer === existingAnswer) {
    reasons.add('same_answer');
  } else if (hasAnswerContainment(candidateAnswer, existingAnswer)) {
    reasons.add('related_answer');
  }

  if (isSearchableTerm(candidateAnswer) && existingQuestion.includes(candidateAnswer)) {
    reasons.add('answer_in_existing_question');
  }

  if (isSearchableTerm(existingAnswer) && candidateQuestion.includes(existingAnswer)) {
    reasons.add('existing_answer_in_question');
  }

  return [...reasons];
}

function hasAnswerContainment(left: string, right: string): boolean {
  const shorter = left.length < right.length ? left : right;
  const longer = left.length < right.length ? right : left;
  return isSearchableTerm(shorter) && longer.includes(shorter);
}

function isSearchableTerm(value: string): boolean {
  return value.length >= MIN_RELATED_TERM_LENGTH;
}

function isMatchableStudyItem(item: StudyItem): item is StudyItem {
  const candidate = item as Partial<Record<keyof StudyItem, unknown>> | null;
  return (
    !!candidate &&
    typeof candidate === 'object' &&
    typeof candidate.id === 'string' &&
    typeof candidate.answer === 'string' &&
    typeof candidate.questionText === 'string'
  );
}
