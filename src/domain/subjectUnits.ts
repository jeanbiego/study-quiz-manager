import type { Subject } from './types';

export const SUBJECT_UNITS: Record<Subject, string[]> = {
  japanese: ['漢字', '語彙力'],
  social: ['地理', '歴史', '公民', '時事'],
  science: ['生物', '地学', '化学', '物理'],
};

export function getDefaultUnit(subject: Subject): string {
  return SUBJECT_UNITS[subject][0];
}

export function getUnitOptions(subject: Subject, currentUnit: string): string[] {
  const options = SUBJECT_UNITS[subject];
  return currentUnit && !options.includes(currentUnit) ? [currentUnit, ...options] : options;
}
