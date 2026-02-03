import type { Medication, MedicationFrequency } from '../types';
import {
  format,
  getDay,
  getDate,
  isAfter,
  isBefore,
  startOfDay,
  parseISO,
} from 'date-fns';

export const isMedicationDue = (medication: Medication, date: Date): boolean => {
  const checkDate = startOfDay(date);
  const startDate = startOfDay(parseISO(medication.startDate));

  if (isBefore(checkDate, startDate)) {
    return false;
  }

  if (medication.endDate) {
    const endDate = startOfDay(parseISO(medication.endDate));
    if (isAfter(checkDate, endDate)) {
      return false;
    }
  }

  const { frequency } = medication;

  switch (frequency.type) {
    case 'daily':
      return true;
    case 'weekly':
      return getDay(checkDate) === frequency.dayOfWeek;
    case 'monthly':
      return getDate(checkDate) === frequency.dayOfMonth;
    default:
      return false;
  }
};

export const getMedicationsDueOn = (
  medications: Medication[],
  date: Date
): Medication[] => {
  return medications.filter((med) => isMedicationDue(med, date));
};

export const getFrequencyLabel = (frequency: MedicationFrequency): string => {
  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];

  switch (frequency.type) {
    case 'daily':
      return '毎日';
    case 'weekly':
      return `毎週${dayNames[frequency.dayOfWeek]}曜日`;
    case 'monthly':
      return `毎月${frequency.dayOfMonth}日`;
    default:
      return '';
  }
};

export const formatDate = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export const formatDisplayDate = (date: Date): string => {
  return format(date, 'yyyy年M月d日');
};
