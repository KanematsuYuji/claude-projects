import type { Medication } from '../types';
import { getFrequencyLabel } from '../utils/medication';

interface Props {
  medications: Medication[];
  onDelete: (id: string) => void;
}

export const MedicationList = ({ medications, onDelete }: Props) => {
  if (medications.length === 0) {
    return (
      <div className="medication-list">
        <h2>登録済みの薬</h2>
        <p className="no-data">薬が登録されていません</p>
      </div>
    );
  }

  return (
    <div className="medication-list">
      <h2>登録済みの薬</h2>
      <ul>
        {medications.map((med) => (
          <li key={med.id} className="medication-item">
            <div className="medication-info">
              <strong>{med.name}</strong>
              <span className="frequency">{getFrequencyLabel(med.frequency)}</span>
              <span className="dates">
                {med.startDate} 〜 {med.endDate || '継続中'}
              </span>
              {med.notes && <span className="notes">{med.notes}</span>}
            </div>
            <button
              onClick={() => onDelete(med.id)}
              className="btn btn-danger btn-small"
            >
              削除
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
