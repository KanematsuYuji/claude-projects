import { useState, useEffect } from 'react';
import {
  HealthRecordForm,
  HealthRecordList,
  HealthChart,
  MedicationForm,
  MedicationList,
  MedicationCalendar,
} from './components';
import type { AppState, HealthRecord, Medication } from './types';
import {
  loadState,
  addHealthRecord,
  deleteHealthRecord,
  addMedication,
  deleteMedication,
} from './utils/storage';
import './App.css';

type Tab = 'health' | 'medication';

function App() {
  const [state, setState] = useState<AppState>({ healthRecords: [], medications: [] });
  const [activeTab, setActiveTab] = useState<Tab>('health');

  useEffect(() => {
    setState(loadState());
  }, []);

  const handleAddHealthRecord = (record: HealthRecord) => {
    const newState = addHealthRecord(record);
    setState(newState);
  };

  const handleDeleteHealthRecord = (id: string) => {
    if (confirm('この記録を削除しますか？')) {
      const newState = deleteHealthRecord(id);
      setState(newState);
    }
  };

  const handleAddMedication = (medication: Medication) => {
    const newState = addMedication(medication);
    setState(newState);
  };

  const handleDeleteMedication = (id: string) => {
    if (confirm('この薬を削除しますか？')) {
      const newState = deleteMedication(id);
      setState(newState);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>ペット健康管理</h1>
      </header>

      <nav className="tab-nav">
        <button
          className={`tab-button ${activeTab === 'health' ? 'active' : ''}`}
          onClick={() => setActiveTab('health')}
        >
          健康データ
        </button>
        <button
          className={`tab-button ${activeTab === 'medication' ? 'active' : ''}`}
          onClick={() => setActiveTab('medication')}
        >
          投薬管理
        </button>
      </nav>

      <main className="main-content">
        {activeTab === 'health' && (
          <div className="health-section">
            <div className="input-section">
              <HealthRecordForm onSubmit={handleAddHealthRecord} />
              <HealthRecordList
                records={state.healthRecords}
                onDelete={handleDeleteHealthRecord}
              />
            </div>
            <HealthChart records={state.healthRecords} />
          </div>
        )}

        {activeTab === 'medication' && (
          <div className="medication-section">
            <div className="input-section">
              <MedicationForm onSubmit={handleAddMedication} />
              <MedicationList
                medications={state.medications}
                onDelete={handleDeleteMedication}
              />
            </div>
            <MedicationCalendar medications={state.medications} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
