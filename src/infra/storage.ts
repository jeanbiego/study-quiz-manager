import type { AppData } from '../domain/types';

const STORAGE_KEY = 'study-quiz-manager:data:v1';

export const EMPTY_APP_DATA: AppData = {
  schemaVersion: 1,
  studyItems: [],
  reviewStates: [],
  quizzes: [],
  answerRecords: [],
};

export function loadAppData(): AppData {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return EMPTY_APP_DATA;
  }

  try {
    return normalizeAppData(JSON.parse(raw));
  } catch {
    return EMPTY_APP_DATA;
  }
}

export function saveAppData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function normalizeAppData(value: unknown): AppData {
  if (!value || typeof value !== 'object') {
    return EMPTY_APP_DATA;
  }

  const candidate = value as Partial<AppData>;
  return {
    schemaVersion: 1,
    studyItems: Array.isArray(candidate.studyItems) ? candidate.studyItems : [],
    reviewStates: Array.isArray(candidate.reviewStates) ? candidate.reviewStates : [],
    quizzes: Array.isArray(candidate.quizzes) ? candidate.quizzes : [],
    answerRecords: Array.isArray(candidate.answerRecords) ? candidate.answerRecords : [],
  };
}
