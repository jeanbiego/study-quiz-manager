import { describe, expect, it } from 'vitest';
import type { AppData, StudyItem } from '../domain/types';
import { cleanupLegacyKanjiMetadata } from './legacyKanjiMetadataCleanup';

function item(overrides: Partial<StudyItem>): StudyItem {
  return {
    id: 'legacy-kanji-unspecified',
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

describe('cleanupLegacyKanjiMetadata', () => {
  it('assigns confidently identified social and science items to their units', () => {
    const cleaned = cleanupLegacyKanjiMetadata(
      data([
        item({ id: 'legacy-kanji-c2271d5b-8f67-4467-b179-9be11656bc95', answer: '寝殿造' }),
        item({ id: 'legacy-kanji-94e577a9-e349-4e8c-8f69-481f430c1625', answer: '還元' }),
      ]),
    );

    expect(cleaned.studyItems).toEqual([
      expect.objectContaining({ answer: '寝殿造', subject: 'social', category: '歴史', unit: '歴史' }),
      expect.objectContaining({ answer: '還元', subject: 'science', category: '化学', unit: '化学' }),
    ]);
  });

  it('keeps manual subject corrections unchanged', () => {
    const manuallyCorrected = item({
      id: 'legacy-kanji-c2271d5b-8f67-4467-b179-9be11656bc95',
      subject: 'science',
      category: '生物',
      unit: '生物',
    });

    expect(cleanupLegacyKanjiMetadata(data([manuallyCorrected])).studyItems[0]).toBe(manuallyCorrected);
  });

  it('renames the remaining japanese legacy unit to kanji without changing unrelated items', () => {
    const nonLegacy = item({ id: 'manually-created', unit: 'kanji_test_generator' });
    const cleaned = cleanupLegacyKanjiMetadata(data([item({ id: 'legacy-kanji-uncertain' }), nonLegacy]));

    expect(cleaned.studyItems[0]).toMatchObject({ subject: 'japanese', category: '漢字', unit: '漢字' });
    expect(cleaned.studyItems[1]).toBe(nonLegacy);
  });
});
