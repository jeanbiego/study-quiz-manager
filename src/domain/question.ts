import type { QuestionType, StudyItem } from './types';

export function resolveQuestionType(item: StudyItem, lastMistakeType?: string): QuestionType {
  if (lastMistakeType === 'wrong_character') {
    return 'contextual_writing';
  }

  if (lastMistakeType === 'wrong_term') {
    return item.defaultQuestionType === 'contextual_writing' ? 'short_answer' : item.defaultQuestionType;
  }

  return item.defaultQuestionType;
}

export function renderQuestionText(item: StudyItem, questionType: QuestionType): string {
  if (questionType === 'short_answer') {
    return item.questionText;
  }

  if (questionType === 'fill_blank') {
    return item.questionText.includes(item.answer) ? item.questionText.replace(item.answer, '（　　　）') : item.questionText;
  }

  if (item.reading && item.questionText.includes(item.answer)) {
    return item.questionText.replace(item.answer, `（${item.reading}）`);
  }

  if (item.reading) {
    return `${item.questionText}（${item.reading}）`;
  }

  return item.questionText;
}
