export interface HealthRecord {
  id: string;
  date: string;
  weight: number;
  pulse: number;
  temperature: number;
}

export type MedicationFrequency =
  | { type: 'daily' }
  | { type: 'weekly'; dayOfWeek: number }
  | { type: 'monthly'; dayOfMonth: number };

export interface Medication {
  id: string;
  name: string;
  frequency: MedicationFrequency;
  startDate: string;
  endDate?: string;
  notes?: string;
}

export interface AppState {
  healthRecords: HealthRecord[];
  medications: Medication[];
}
