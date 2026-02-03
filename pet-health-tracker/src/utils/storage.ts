import type { AppState, HealthRecord, Medication } from '../types';

const STORAGE_KEY = 'pet-health-tracker';

const getDefaultState = (): AppState => ({
  healthRecords: [],
  medications: [],
});

export const loadState = (): AppState => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return getDefaultState();
  }
  return JSON.parse(stored);
};

export const saveState = (state: AppState): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const addHealthRecord = (record: HealthRecord): AppState => {
  const state = loadState();
  state.healthRecords.push(record);
  state.healthRecords.sort((a, b) => a.date.localeCompare(b.date));
  saveState(state);
  return state;
};

export const deleteHealthRecord = (id: string): AppState => {
  const state = loadState();
  state.healthRecords = state.healthRecords.filter((r) => r.id !== id);
  saveState(state);
  return state;
};

export const addMedication = (medication: Medication): AppState => {
  const state = loadState();
  state.medications.push(medication);
  saveState(state);
  return state;
};

export const updateMedication = (medication: Medication): AppState => {
  const state = loadState();
  const index = state.medications.findIndex((m) => m.id === medication.id);
  if (index !== -1) {
    state.medications[index] = medication;
    saveState(state);
  }
  return state;
};

export const deleteMedication = (id: string): AppState => {
  const state = loadState();
  state.medications = state.medications.filter((m) => m.id !== id);
  saveState(state);
  return state;
};
