export type Subject = 'japanese' | 'science' | 'social';

export type QuestionType = 'short_answer' | 'fill_blank' | 'contextual_writing';

export type StudyItemStatus = 'active' | 'mastered' | 'paused';

export type StudyItem = {
  id: string;
  subject: Subject;
  category: string;
  unit?: string;
  title: string;
  questionText: string;
  answer: string;
  reading?: string;
  defaultQuestionType: QuestionType;
  importance: 1 | 2 | 3;
  status: StudyItemStatus;
  createdAt: string;
  updatedAt: string;
};

export type Result = 'correct' | 'partial' | 'incorrect';

export type MistakeType = 'wrong_character' | 'wrong_term';

export type AnswerRecord = {
  id: string;
  studyItemId: string;
  quizId: string;
  answeredAt: string;
  result: Result;
  mistakeType?: MistakeType;
  questionTypeUsed: QuestionType;
};

export type ReviewState = {
  studyItemId: string;
  lastReviewedAt?: string;
  nextReviewDate?: string;
  correctCount: number;
  mistakeCount: number;
  consecutiveCorrectCount: number;
  lastResult?: Result;
  lastMistakeType?: MistakeType;
};

export type Quiz = {
  id: string;
  createdAt: string;
  title: string;
  subjectFilter?: Subject[];
  categoryFilter?: string[];
  itemIds: string[];
  questionTypesByItemId?: Record<string, QuestionType>;
  printedAt?: string;
  scoredAt?: string;
};

export type AppData = {
  schemaVersion: 1;
  studyItems: StudyItem[];
  reviewStates: ReviewState[];
  quizzes: Quiz[];
  answerRecords: AnswerRecord[];
};

export const SUBJECT_LABELS: Record<Subject, string> = {
  japanese: '国語',
  science: '理科',
  social: '社会',
};

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  short_answer: '一問一答',
  fill_blank: '穴埋め',
  contextual_writing: '穴埋め',
};

export const RESULT_LABELS: Record<Result, string> = {
  correct: '○ 正解',
  partial: '△ 字が違う',
  incorrect: '× 違う言葉',
};
