import type { QuestionType, StudyItem } from './types';

export function resolveQuestionType(item: StudyItem, lastMistakeType?: string): QuestionType {
  if (lastMistakeType === 'wrong_character') {
    return 'fill_blank';
  }

  if (lastMistakeType === 'wrong_term') {
    return item.defaultQuestionType === 'short_answer' ? 'short_answer' : 'fill_blank';
  }

  return item.defaultQuestionType === 'contextual_writing' ? 'fill_blank' : item.defaultQuestionType;
}

export function renderQuestionText(item: StudyItem, questionType: QuestionType): string {
  if (questionType === 'short_answer') {
    return item.questionText;
  }

  if (questionType === 'fill_blank' || questionType === 'contextual_writing') {
    return item.questionText.includes(item.answer) ? item.questionText.replace(item.answer, '（　　　）') : item.questionText;
  }

  return item.questionText;
}
