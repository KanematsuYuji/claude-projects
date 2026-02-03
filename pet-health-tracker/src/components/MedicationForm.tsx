import { useState } from 'react';
import type { Medication, MedicationFrequency } from '../types';
import { formatDate } from '../utils/medication';

interface Props {
  onSubmit: (medication: Medication) => void;
}

export const MedicationForm = ({ onSubmit }: Props) => {
  const [name, setName] = useState('');
  const [frequencyType, setFrequencyType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [dayOfWeek, setDayOfWeek] = useState(0);
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [startDate, setStartDate] = useState(formatDate(new Date()));
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name) {
      alert('薬の名前を入力してください');
      return;
    }

    let frequency: MedicationFrequency;
    switch (frequencyType) {
      case 'daily':
        frequency = { type: 'daily' };
        break;
      case 'weekly':
        frequency = { type: 'weekly', dayOfWeek };
        break;
      case 'monthly':
        frequency = { type: 'monthly', dayOfMonth };
        break;
    }

    const medication: Medication = {
      id: crypto.randomUUID(),
      name,
      frequency,
      startDate,
      endDate: endDate || undefined,
      notes: notes || undefined,
    };

    onSubmit(medication);
    setName('');
    setNotes('');
  };

  const dayNames = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];

  return (
    <form onSubmit={handleSubmit} className="medication-form">
      <h2>薬の登録</h2>
      <div className="form-group">
        <label htmlFor="med-name">薬の名前</label>
        <input
          type="text"
          id="med-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例: 心臓の薬"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="frequency">投与頻度</label>
        <select
          id="frequency"
          value={frequencyType}
          onChange={(e) => setFrequencyType(e.target.value as 'daily' | 'weekly' | 'monthly')}
        >
          <option value="daily">毎日</option>
          <option value="weekly">毎週</option>
          <option value="monthly">毎月</option>
        </select>
      </div>

      {frequencyType === 'weekly' && (
        <div className="form-group">
          <label htmlFor="dayOfWeek">曜日</label>
          <select
            id="dayOfWeek"
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(parseInt(e.target.value, 10))}
          >
            {dayNames.map((day, index) => (
              <option key={index} value={index}>
                {day}
              </option>
            ))}
          </select>
        </div>
      )}

      {frequencyType === 'monthly' && (
        <div className="form-group">
          <label htmlFor="dayOfMonth">日</label>
          <select
            id="dayOfMonth"
            value={dayOfMonth}
            onChange={(e) => setDayOfMonth(parseInt(e.target.value, 10))}
          >
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
              <option key={day} value={day}>
                {day}日
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="start-date">開始日</label>
        <input
          type="date"
          id="start-date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="end-date">終了日（任意）</label>
        <input
          type="date"
          id="end-date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="notes">メモ（任意）</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="例: 朝食後に投与"
          rows={2}
        />
      </div>

      <button type="submit" className="btn btn-primary">
        薬を登録
      </button>
    </form>
  );
};
