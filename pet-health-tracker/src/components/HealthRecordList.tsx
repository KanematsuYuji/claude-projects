import type { HealthRecord } from '../types';

interface Props {
  records: HealthRecord[];
  onDelete: (id: string) => void;
}

export const HealthRecordList = ({ records, onDelete }: Props) => {
  if (records.length === 0) {
    return null;
  }

  const recentRecords = [...records].reverse().slice(0, 10);

  return (
    <div className="health-record-list">
      <h3>最近の記録</h3>
      <table>
        <thead>
          <tr>
            <th>日付</th>
            <th>体重</th>
            <th>脈拍</th>
            <th>体温</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {recentRecords.map((record) => (
            <tr key={record.id}>
              <td>{record.date}</td>
              <td>{record.weight} kg</td>
              <td>{record.pulse} 回/分</td>
              <td>{record.temperature} °C</td>
              <td>
                <button
                  onClick={() => onDelete(record.id)}
                  className="btn btn-danger btn-small"
                >
                  削除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
