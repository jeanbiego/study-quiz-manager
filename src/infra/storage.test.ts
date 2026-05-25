import { beforeEach, describe, expect, it } from 'vitest';
import type { AppData, StudyItem } from '../domain/types';
import { loadAppData, normalizeImportedAppData } from './storage';

const STORAGE_KEY = 'study-quiz-manager:data:v1';
const INITIAL_MIGRATION_KEY = 'study-quiz-manager:migration:legacy-kanji-generator:v1';
const METADATA_CLEANUP_KEY = 'study-quiz-manager:migration:legacy-kanji-metadata-cleanup:v1';

function item(overrides: Partial<StudyItem>): StudyItem {
  return {
    id: 'legacy-kanji-uncertain',
    subject: 'japanese',
    category: '漢字',
    unit: 'kanji_test_generator',
    title: 'title',
    questionText: 'question',
    answer: 'answer',
    defaultQuestionType: 'fill_blank',
    importance: 1,
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function data(studyItems: StudyItem[]): AppData {
  return {
    schemaVersion: 1,
    studyItems,
    reviewStates: [],
    quizzes: [],
    answerRecords: [],
  };
}

describe('loadAppData legacy metadata cleanup', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('applies metadata cleanup after a completed legacy import without overwriting manual subjects', () => {
    localStorage.setItem(INITIAL_MIGRATION_KEY, '2026-01-01T00:00:00.000Z');
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        data([
          item({ id: 'legacy-kanji-c2271d5b-8f67-4467-b179-9be11656bc95', answer: '寝殿造' }),
          item({
            id: 'legacy-kanji-94e577a9-e349-4e8c-8f69-481f430c1625',
            subject: 'social',
            category: '公民',
            unit: '公民',
          }),
        ]),
      ),
    );

    const loaded = loadAppData();

    expect(loaded.studyItems[0]).toMatchObject({ subject: 'social', category: '歴史', unit: '歴史' });
    expect(loaded.studyItems[1]).toMatchObject({ subject: 'social', category: '公民', unit: '公民' });
    expect(localStorage.getItem(METADATA_CLEANUP_KEY)).not.toBeNull();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '').studyItems).toEqual(loaded.studyItems);
  });

  it('cleans legacy metadata restored from a backup after the one-time migration already ran', () => {
    localStorage.setItem(METADATA_CLEANUP_KEY, '2026-01-01T00:00:00.000Z');

    const imported = normalizeImportedAppData(
      data([
        item({ id: 'legacy-kanji-c2271d5b-8f67-4467-b179-9be11656bc95', answer: '寝殿造' }),
        item({
          id: 'legacy-kanji-94e577a9-e349-4e8c-8f69-481f430c1625',
          subject: 'social',
          category: '公民',
          unit: '公民',
        }),
      ]),
    );

    expect(imported.studyItems[0]).toMatchObject({ subject: 'social', category: '歴史', unit: '歴史' });
    expect(imported.studyItems[1]).toMatchObject({ subject: 'social', category: '公民', unit: '公民' });
  });
});
