import { updateReviewState } from '../domain/review';
import type { AnswerRecord, AppData, Quiz, Result, ReviewState, StudyItem } from '../domain/types';

type LegacyProblemRow = {
  id: string;
  sentence: string;
  answer_kanji: string;
  reading: string;
  created_at: string;
  incorrect_count: string;
};

type LegacyAttemptRow = {
  id: string;
  problem_id: string;
  attempted_at: string;
  is_correct: string;
};

export type LegacyKanjiImportSummary = {
  addedItems: number;
  skippedItems: number;
  addedAnswerRecords: number;
  skippedAnswerRecords: number;
};

const LEGACY_QUIZ_ID = 'legacy-kanji-test-generator';

export function importLegacyKanjiData(
  current: AppData,
  problemsCsv: string,
  attemptsCsv: string,
): { data: AppData; summary: LegacyKanjiImportSummary } {
  const problemRows = parseCsv<LegacyProblemRow>(problemsCsv);
  const attemptRows = parseCsv<LegacyAttemptRow>(attemptsCsv).sort((left, right) => left.attempted_at.localeCompare(right.attempted_at));
  const existingItemIds = new Set(current.studyItems.map((item) => item.id));
  const existingRecordIds = new Set(current.answerRecords.map((record) => record.id));
  const reviewStateByItemId = new Map(current.reviewStates.map((state) => [state.studyItemId, state]));
  const itemStatusById = new Map(current.studyItems.map((item) => [item.id, item.status]));

  const importedItems: StudyItem[] = [];
  let skippedItems = 0;

  for (const row of problemRows) {
    const item = toStudyItem(row);
    if (existingItemIds.has(item.id)) {
      skippedItems += 1;
      continue;
    }

    existingItemIds.add(item.id);
    importedItems.push(item);
    reviewStateByItemId.set(item.id, reviewStateByItemId.get(item.id) ?? createImportedReviewState(item.id, row));
    itemStatusById.set(item.id, item.status);
  }

  const knownProblemIds = new Set(problemRows.map((row) => row.id));
  const importedRecords: AnswerRecord[] = [];
  let skippedAnswerRecords = 0;

  for (const row of attemptRows) {
    if (!knownProblemIds.has(row.problem_id)) {
      skippedAnswerRecords += 1;
      continue;
    }

    const record = toAnswerRecord(row);
    if (existingRecordIds.has(record.id)) {
      skippedAnswerRecords += 1;
      continue;
    }

    existingRecordIds.add(record.id);
    importedRecords.push(record);
    const update = updateReviewState(reviewStateByItemId.get(record.studyItemId), record, new Date(record.answeredAt));
    reviewStateByItemId.set(record.studyItemId, update.reviewState);
    itemStatusById.set(record.studyItemId, update.nextStatus);
  }

  const importedItemIds = new Set(importedItems.map((item) => item.id));
  const nextStudyItems = [
    ...current.studyItems.map((item) => {
      const status = itemStatusById.get(item.id);
      return status && status !== item.status ? { ...item, status } : item;
    }),
    ...importedItems.map((item) => ({ ...item, status: itemStatusById.get(item.id) ?? item.status })),
  ];

  const nextQuizzes = ensureLegacyQuiz(current.quizzes, [...importedItemIds], importedRecords);

  return {
    data: {
      ...current,
      studyItems: nextStudyItems,
      reviewStates: [...reviewStateByItemId.values()],
      answerRecords: [...importedRecords, ...current.answerRecords],
      quizzes: nextQuizzes,
    },
    summary: {
      addedItems: importedItems.length,
      skippedItems,
      addedAnswerRecords: importedRecords.length,
      skippedAnswerRecords,
    },
  };
}

function toStudyItem(row: LegacyProblemRow): StudyItem {
  const incorrectCount = Number(row.incorrect_count || 0);
  return {
    id: toLegacyItemId(row.id),
    subject: 'japanese',
    category: '漢字',
    unit: 'kanji_test_generator',
    title: `${row.answer_kanji}（${katakanaToHiragana(row.reading)}）`,
    questionText: row.sentence,
    answer: row.answer_kanji,
    reading: katakanaToHiragana(row.reading),
    note: 'kanji_test_generator から移行',
    defaultQuestionType: 'fill_blank',
    importance: incorrectCount >= 3 ? 3 : incorrectCount >= 1 ? 2 : 1,
    status: 'active',
    createdAt: normalizeDate(row.created_at),
    updatedAt: normalizeDate(row.created_at),
  };
}

function toAnswerRecord(row: LegacyAttemptRow): AnswerRecord {
  const result: Result = row.is_correct.toLowerCase() === 'true' ? 'correct' : 'partial';
  return {
    id: `legacy-kanji-attempt-${row.id}`,
    studyItemId: toLegacyItemId(row.problem_id),
    quizId: LEGACY_QUIZ_ID,
    answeredAt: normalizeDate(row.attempted_at),
    result,
    mistakeType: result === 'partial' ? 'wrong_character' : undefined,
    questionTypeUsed: 'fill_blank',
  };
}

function createImportedReviewState(studyItemId: string, row: LegacyProblemRow): ReviewState {
  return {
    studyItemId,
    correctCount: 0,
    mistakeCount: Number(row.incorrect_count || 0),
    consecutiveCorrectCount: 0,
  };
}

function ensureLegacyQuiz(quizzes: Quiz[], importedItemIds: string[], importedRecords: AnswerRecord[]): Quiz[] {
  if (!importedRecords.length && !importedItemIds.length) {
    return quizzes;
  }

  const existing = quizzes.find((quiz) => quiz.id === LEGACY_QUIZ_ID);
  if (existing) {
    const itemIds = [...new Set([...existing.itemIds, ...importedItemIds])];
    return quizzes.map((quiz) => (quiz.id === LEGACY_QUIZ_ID ? { ...quiz, itemIds } : quiz));
  }

  return [
    {
      id: LEGACY_QUIZ_ID,
      createdAt: importedRecords[0]?.answeredAt ?? new Date().toISOString(),
      title: '旧漢字テスト移行履歴',
      subjectFilter: ['japanese'],
      categoryFilter: ['漢字'],
      itemIds: importedItemIds,
      questionTypesByItemId: Object.fromEntries(importedItemIds.map((id) => [id, 'fill_blank'])),
      scoredAt: importedRecords.at(-1)?.answeredAt,
    },
    ...quizzes,
  ];
}

function parseCsv<T extends Record<string, string>>(csv: string): T[] {
  const rows: string[][] = [];
  let field = '';
  let row: string[] = [];
  let inQuotes = false;

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index];
    const next = csv[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      field += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      row.push(field);
      field = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') {
        index += 1;
      }
      row.push(field);
      field = '';
      if (row.some((value) => value.length > 0)) {
        rows.push(row);
      }
      row = [];
    } else {
      field += char;
    }
  }

  row.push(field);
  if (row.some((value) => value.length > 0)) {
    rows.push(row);
  }

  const [headers, ...records] = rows;
  if (!headers) {
    return [];
  }

  return records.map((record) =>
    Object.fromEntries(headers.map((header, index) => [header, record[index] ?? ''])) as T,
  );
}

function toLegacyItemId(id: string): string {
  return `legacy-kanji-${id}`;
}

function normalizeDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function katakanaToHiragana(value: string): string {
  return value.replace(/[\u30a1-\u30f6]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0x60));
}
