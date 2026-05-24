export function toDateOnly(value: Date | string): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(value: Date | string, days: number): string {
  const date = typeof value === 'string' ? new Date(value) : new Date(value.getTime());
  date.setDate(date.getDate() + days);
  return toDateOnly(date);
}

export function differenceInCalendarDays(left: string, right: string): number {
  const leftDate = new Date(`${left}T00:00:00`);
  const rightDate = new Date(`${right}T00:00:00`);
  return Math.floor((leftDate.getTime() - rightDate.getTime()) / 86_400_000);
}
