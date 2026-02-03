import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { HealthRecord } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  records: HealthRecord[];
}

export const HealthChart = ({ records }: Props) => {
  if (records.length === 0) {
    return (
      <div className="chart-container">
        <p className="no-data">グラフを表示するにはデータを入力してください</p>
      </div>
    );
  }

  const labels = records.map((r) => r.date);

  const weightData = {
    labels,
    datasets: [
      {
        label: '体重 (kg)',
        data: records.map((r) => r.weight),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1,
      },
    ],
  };

  const pulseData = {
    labels,
    datasets: [
      {
        label: '脈拍 (回/分)',
        data: records.map((r) => r.pulse),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.1,
      },
    ],
  };

  const temperatureData = {
    labels,
    datasets: [
      {
        label: '体温 (°C)',
        data: records.map((r) => r.temperature),
        borderColor: 'rgb(255, 159, 64)',
        backgroundColor: 'rgba(255, 159, 64, 0.5)',
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
  };

  return (
    <div className="charts-section">
      <h2>健康データ推移</h2>
      <div className="charts-grid">
        <div className="chart-container">
          <h3>体重</h3>
          <div className="chart-wrapper">
            <Line data={weightData} options={options} />
          </div>
        </div>
        <div className="chart-container">
          <h3>脈拍</h3>
          <div className="chart-wrapper">
            <Line data={pulseData} options={options} />
          </div>
        </div>
        <div className="chart-container">
          <h3>体温</h3>
          <div className="chart-wrapper">
            <Line data={temperatureData} options={options} />
          </div>
        </div>
      </div>
    </div>
  );
};
