import { useState } from 'react';
import type { HealthRecord } from '../types';
import { formatDate } from '../utils/medication';

interface Props {
  onSubmit: (record: HealthRecord) => void;
}

export const HealthRecordForm = ({ onSubmit }: Props) => {
  const [date, setDate] = useState(formatDate(new Date()));
  const [weight, setWeight] = useState('');
  const [pulse, setPulse] = useState('');
  const [temperature, setTemperature] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!weight || !pulse || !temperature) {
      alert('すべての項目を入力してください');
      return;
    }

    const record: HealthRecord = {
      id: crypto.randomUUID(),
      date,
      weight: parseFloat(weight),
      pulse: parseInt(pulse, 10),
      temperature: parseFloat(temperature),
    };

    onSubmit(record);
    setWeight('');
    setPulse('');
    setTemperature('');
  };

  return (
    <form onSubmit={handleSubmit} className="health-form">
      <h2>健康データ入力</h2>
      <div className="form-group">
        <label htmlFor="date">日付</label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="weight">体重 (kg)</label>
        <input
          type="number"
          id="weight"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          step="0.1"
          min="0"
          placeholder="例: 5.2"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="pulse">脈拍 (回/分)</label>
        <input
          type="number"
          id="pulse"
          value={pulse}
          onChange={(e) => setPulse(e.target.value)}
          min="0"
          placeholder="例: 120"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="temperature">体温 (°C)</label>
        <input
          type="number"
          id="temperature"
          value={temperature}
          onChange={(e) => setTemperature(e.target.value)}
          step="0.1"
          min="30"
          max="45"
          placeholder="例: 38.5"
          required
        />
      </div>
      <button type="submit" className="btn btn-primary">
        記録を保存
      </button>
    </form>
  );
};
