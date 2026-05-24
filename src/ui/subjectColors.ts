import type { Subject } from '../domain/types';

const subjectBadgeClasses: Record<Subject, string> = {
  japanese: 'bg-[#f0c2c4] text-[#7b1e22] ring-[#e6999c]',
  science: 'bg-[#fae7d1] text-[#9b5c12] ring-[#f4cfa4]',
  social: 'bg-[#c4dbc6] text-[#3a5f3e] ring-[#a4c8a8]',
};

export function getSubjectBadgeClass(subject: Subject): string {
  return subjectBadgeClasses[subject];
}
