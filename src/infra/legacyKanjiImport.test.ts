import { describe, expect, it } from 'vitest';
import { EMPTY_APP_DATA } from './storage';
import { importLegacyKanjiData } from './legacyKanjiImport';

const problemsCsv = `id,sentence,answer_kanji,reading,created_at,incorrect_count
problem-1,日本の標準時子午線は兵庫県明石市を通ります。,明石市,アカシシ,2025-09-23T13:49:46.651443,1
problem-2,体の寸法にあった服。,寸法,スンポウ,2025-09-23T14:06:19.363939,0
`;

const attemptsCsv = `id,problem_id,attempted_at,is_correct
attempt-1,problem-1,2025-09-23T14:10:24.351351,False
attempt-2,problem-1,2025-09-24T14:10:24.351351,True
attempt-3,problem-2,2025-09-24T14:10:24.351351,True
`;

describe('importLegacyKanjiData', () => {
  it('converts kanji generator problems and attempts into app data', () => {
    const { data, summary } = importLegacyKanjiData(EMPTY_APP_DATA, problemsCsv, attemptsCsv);

    expect(summary).toEqual({
      addedItems: 2,
      skippedItems: 0,
      addedAnswerRecords: 3,
      skippedAnswerRecords: 0,
    });
    expect(data.studyItems[0]).toMatchObject({
      subject: 'japanese',
      category: '漢字',
      answer: '明石市',
      reading: 'あかしし',
      defaultQuestionType: 'fill_blank',
    });
    expect(data.answerRecords[0]).toMatchObject({
      result: 'partial',
      mistakeType: 'wrong_character',
      questionTypeUsed: 'fill_blank',
    });
    expect(data.reviewStates.find((state) => state.studyItemId === 'legacy-kanji-problem-1')).toMatchObject({
      correctCount: 1,
      mistakeCount: 2,
      lastResult: 'correct',
    });
  });

  it('does not duplicate previously imported rows', () => {
    const first = importLegacyKanjiData(EMPTY_APP_DATA, problemsCsv, attemptsCsv);
    const second = importLegacyKanjiData(first.data, problemsCsv, attemptsCsv);

    expect(second.summary.addedItems).toBe(0);
    expect(second.summary.addedAnswerRecords).toBe(0);
  });
});
