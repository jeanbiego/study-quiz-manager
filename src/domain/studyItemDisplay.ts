import type { StudyItem } from './types';

export function getStudyItemUnit(item: Pick<StudyItem, 'category' | 'unit'>): string {
  return item.unit?.trim() || item.category;
}

export function createStudyItemTitle(answer: string, questionText: string): string {
  const trimmedAnswer = answer.trim();
  if (trimmedAnswer) {
    return trimmedAnswer;
  }

  const trimmedQuestion = questionText.trim();
  return trimmedQuestion.length > 24 ? `${trimmedQuestion.slice(0, 24)}...` : trimmedQuestion;
}

export function getStudyItemSummary(item: Pick<StudyItem, 'answer' | 'questionText' | 'title'>): string {
  return item.questionText || item.answer || item.title;
}
