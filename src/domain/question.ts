import type { QuestionType, StudyItem } from './types';

const blankPlaceholderPattern = /[（(][\s\u3000]*[）)]/;

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
    const reading = item.reading?.trim();
    const blankText = reading && reading !== item.answer ? `（${reading}）` : '（　　　）';
    if (!item.questionText) {
      return item.questionText;
    }

    if (blankPlaceholderPattern.test(item.questionText)) {
      return item.questionText;
    }

    return item.answer && item.questionText.includes(item.answer)
      ? item.questionText.replace(item.answer, blankText)
      : `${item.questionText} ${blankText}`;
  }

  return item.questionText;
}

export function renderQuestionTextWithAnswer(item: StudyItem, questionType: QuestionType): string {
  if (questionType === 'short_answer') {
    return item.questionText;
  }

  if (questionType === 'fill_blank' || questionType === 'contextual_writing') {
    if (!item.questionText || !item.answer) {
      return item.questionText;
    }

    const answerText = `（${item.answer}）`;
    if (item.questionText.includes(item.answer)) {
      return item.questionText.replace(item.answer, answerText);
    }

    return blankPlaceholderPattern.test(item.questionText)
      ? item.questionText.replace(blankPlaceholderPattern, answerText)
      : `${item.questionText} ${answerText}`;
  }

  return item.questionText;
}
