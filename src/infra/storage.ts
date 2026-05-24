import type { AppData } from '../domain/types';
import legacyAttemptsCsv from './legacy-data/attempts.csv?raw';
import legacyProblemsCsv from './legacy-data/problems.csv?raw';
import { importLegacyKanjiData } from './legacyKanjiImport';

const STORAGE_KEY = 'study-quiz-manager:data:v1';
const LEGACY_KANJI_MIGRATION_KEY = 'study-quiz-manager:migration:legacy-kanji-generator:v1';

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
    return runLegacyKanjiMigration(EMPTY_APP_DATA);
  }

  try {
    return runLegacyKanjiMigration(normalizeAppData(JSON.parse(raw)));
  } catch {
    return runLegacyKanjiMigration(EMPTY_APP_DATA);
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

function runLegacyKanjiMigration(data: AppData): AppData {
  if (localStorage.getItem(LEGACY_KANJI_MIGRATION_KEY)) {
    return data;
  }

  const { data: migrated } = importLegacyKanjiData(data, legacyProblemsCsv, legacyAttemptsCsv);
  localStorage.setItem(LEGACY_KANJI_MIGRATION_KEY, new Date().toISOString());
  localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
  return migrated;
}
