import { useState } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  format,
  isSameMonth,
  isSameDay,
} from 'date-fns';
import { ja } from 'date-fns/locale';
import type { Medication } from '../types';
import { getMedicationsDueOn } from '../utils/medication';

interface Props {
  medications: Medication[];
}

export const MedicationCalendar = ({ medications }: Props) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = new Date();

  const renderHeader = () => {
    return (
      <div className="calendar-header">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="btn btn-small">
          &lt;
        </button>
        <h3>{format(currentMonth, 'yyyy年M月', { locale: ja })}</h3>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="btn btn-small">
          &gt;
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    return (
      <div className="calendar-days">
        {days.map((day, index) => (
          <div key={index} className={`calendar-day-name ${index === 0 ? 'sunday' : index === 6 ? 'saturday' : ''}`}>
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const medicationsDue = getMedicationsDueOn(medications, cloneDay);
        const isToday = isSameDay(day, today);
        const isCurrentMonth = isSameMonth(day, monthStart);

        days.push(
          <div
            key={day.toString()}
            className={`calendar-cell ${!isCurrentMonth ? 'disabled' : ''} ${isToday ? 'today' : ''} ${medicationsDue.length > 0 ? 'has-medication' : ''}`}
          >
            <span className="day-number">{format(day, 'd')}</span>
            {medicationsDue.length > 0 && (
              <div className="medication-dots">
                {medicationsDue.map((med) => (
                  <span key={med.id} className="medication-dot" title={med.name}>
                    {med.name.charAt(0)}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="calendar-row">
          {days}
        </div>
      );
      days = [];
    }

    return <div className="calendar-body">{rows}</div>;
  };

  const renderTodaysMedications = () => {
    const todaysMeds = getMedicationsDueOn(medications, today);

    return (
      <div className="todays-medications">
        <h3>今日の投薬</h3>
        {todaysMeds.length === 0 ? (
          <p className="no-data">今日投与する薬はありません</p>
        ) : (
          <ul>
            {todaysMeds.map((med) => (
              <li key={med.id} className="today-medication-item">
                <strong>{med.name}</strong>
                {med.notes && <span className="notes">{med.notes}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <div className="medication-calendar">
      <h2>投薬カレンダー</h2>
      {renderTodaysMedications()}
      <div className="calendar">
        {renderHeader()}
        {renderDays()}
        {renderCells()}
      </div>
      <div className="calendar-legend">
        <span className="legend-item">
          <span className="legend-dot"></span>
          投薬予定あり
        </span>
      </div>
    </div>
  );
};
