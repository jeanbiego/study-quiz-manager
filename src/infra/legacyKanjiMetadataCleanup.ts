import type { AppData, StudyItem, Subject } from '../domain/types';

type SubjectCorrection = {
  subject: Exclude<Subject, 'japanese'>;
  unit: string;
};

const KANJI_UNIT = '漢字';

// Only rows whose subject is explicit from their wording are corrected automatically.
const LEGACY_SUBJECT_CORRECTIONS: Record<string, SubjectCorrection> = {
  'legacy-kanji-c2271d5b-8f67-4467-b179-9be11656bc95': { subject: 'social', unit: '歴史' }, // 寝殿造
  'legacy-kanji-f41067cf-acfa-46e5-8429-acdec5cb3880': { subject: 'social', unit: '歴史' }, // 十二単
  'legacy-kanji-7814e1a7-e430-4039-bc75-02380115c928': { subject: 'social', unit: '歴史' }, // 阿倍仲麻呂
  'legacy-kanji-c26f665f-58d9-43cd-be3f-8d1b2961c921': { subject: 'social', unit: '歴史' }, // 前方後円墳
  'legacy-kanji-12fe2e44-6729-4c59-af63-5ba1857ead48': { subject: 'science', unit: '地学' }, // 地層
  'legacy-kanji-7b894c09-84cc-4c99-8cd9-de0a2a7cb226': { subject: 'science', unit: '地学' }, // 岩石
  'legacy-kanji-70aa46dd-abc9-411a-8b8a-69ed406f90d8': { subject: 'social', unit: '歴史' }, // 今川義元
  'legacy-kanji-7e6080f8-475b-426d-92b3-551bc6f51d83': { subject: 'social', unit: '歴史' }, // 姫路城
  'legacy-kanji-10efd5df-110a-4679-bdbf-8ef6ad59b1ac': { subject: 'social', unit: '歴史' }, // 石見銀山
  'legacy-kanji-7cdef3bd-1259-4435-87d4-c74910b7b74a': { subject: 'social', unit: '歴史' }, // 執権
  'legacy-kanji-6a6ef3bd-ba93-49de-9682-a600d03a81c5': { subject: 'social', unit: '歴史' }, // 尼将軍
  'legacy-kanji-4af068df-ad05-4ea4-bd67-bc00f3c053c2': { subject: 'social', unit: '歴史' }, // 六波羅探題
  'legacy-kanji-0d6e9c6c-9909-4681-9131-59597cdee25d': { subject: 'social', unit: '歴史' }, // 元寇
  'legacy-kanji-7f79e972-d628-47e3-81ba-b47599f2cca0': { subject: 'science', unit: '生物' }, // 生物の共存
  'legacy-kanji-a05eb272-7fb0-41c2-82a7-fd5497af6ed5': { subject: 'social', unit: '歴史' }, // 蔵屋敷
  'legacy-kanji-e09ea7bd-5759-41fa-b7f5-6a7fd8ca5c4e': { subject: 'social', unit: '歴史' }, // 福沢諭吉
  'legacy-kanji-70a8300d-07e0-4d62-99a5-3de6466016ae': { subject: 'social', unit: '歴史' }, // 太閤検地
  'legacy-kanji-b536f093-ac98-4263-a49d-5922a8272344': { subject: 'social', unit: '歴史' }, // 財閥解体
  'legacy-kanji-6838a100-913f-4962-b4d4-99e226042630': { subject: 'social', unit: '歴史' }, // 東条英機
  'legacy-kanji-16d1c118-c697-4ede-882f-86f639096c85': { subject: 'social', unit: '歴史' }, // 隣組
  'legacy-kanji-98919eea-0215-4bf7-b955-c3c130cf7acc': { subject: 'science', unit: '地学' }, // 緯度と南中高度
  'legacy-kanji-8e5f8c9a-cbcc-4e74-ae45-0a321813fccc': { subject: 'social', unit: '地理' }, // 石炭の輸入
  'legacy-kanji-f8b29605-1a49-49b0-85cd-2eadca1a6b77': { subject: 'science', unit: '生物' }, // 複眼
  'legacy-kanji-33089612-62dd-4088-ae71-496e2ca32cf9': { subject: 'social', unit: '公民' }, // 雇用機会均等法
  'legacy-kanji-66396a3e-2479-46a8-93f5-a177cd757104': { subject: 'social', unit: '公民' }, // 拒否権
  'legacy-kanji-a540c423-dc89-4b16-86ae-0fadba138764': { subject: 'social', unit: '公民' }, // 公的扶助
  'legacy-kanji-94e577a9-e349-4e8c-8f69-481f430c1625': { subject: 'science', unit: '化学' }, // 酸化・還元反応
  'legacy-kanji-f723adde-ab4e-4cee-8763-cbdb6e5bdd97': { subject: 'social', unit: '公民' }, // 直接税・間接税
  'legacy-kanji-898c9a68-a7ad-41dc-897f-814e28d47a1f': { subject: 'social', unit: '歴史' }, // 日中共同声明
  'legacy-kanji-d078f2b5-5ba0-40dd-86cf-f6b4715cc8a7': { subject: 'social', unit: '公民' }, // 直接請求権
};

export function cleanupLegacyKanjiMetadata(current: AppData): AppData {
  let changed = false;
  const studyItems = current.studyItems.map((item) => {
    const corrected = cleanupLegacyItem(item);
    changed ||= corrected !== item;
    return corrected;
  });

  return changed ? { ...current, studyItems } : current;
}

function cleanupLegacyItem(item: StudyItem): StudyItem {
  if (!item.id.startsWith('legacy-kanji-') || item.subject !== 'japanese') {
    return item;
  }

  const correction = LEGACY_SUBJECT_CORRECTIONS[item.id];
  if (correction) {
    return {
      ...item,
      subject: correction.subject,
      category: correction.unit,
      unit: correction.unit,
    };
  }

  if (item.unit === 'kanji_test_generator') {
    return {
      ...item,
      category: KANJI_UNIT,
      unit: KANJI_UNIT,
    };
  }

  return item;
}
