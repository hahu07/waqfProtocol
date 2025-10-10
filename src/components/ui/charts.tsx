import * as React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BarChartProps {
  data: Array<{ name: string; value: number }>;
  height?: number;
  colors?: string[];
}

export function BarChart({ data, height = 300, colors = ['#3b82f6'] }: BarChartProps) {
  const chartData = {
    labels: data.map(item => item.name),
    datasets: [
      {
        label: 'Amount',
        data: data.map(item => item.value),
        backgroundColor: colors,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        position: 'nearest' as const,
        callbacks: {
          label: (context: any) => {
            return `$${context.raw.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => `$${value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}`
        }
      },
      x: {
        ticks: {
          autoSkip: true,
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  };

  return (
    <div style={{ height: '100%', minHeight: `${height}px` }} className="w-full">
      <Bar data={chartData} options={options} />
    </div>
  );
}
