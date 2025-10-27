'use client';

import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type BarChartProps = {
  title: string;
  labels: string[];
  data: number[];
  color?: string;
  maxValue?: number;
  footerText?: string;
};

export function BarChart({ 
  title, 
  labels, 
  data, 
  color = '#3b82f6', // Default to blue-500
  maxValue: propMaxValue,
  footerText 
}: BarChartProps) {
  const maxValue = propMaxValue ?? Math.max(...data, 1);
  
  const chartData = {
    labels,
    datasets: [{
      label: title,
      data,
      backgroundColor: color,
      borderWidth: 0,
      borderRadius: 4,
      categoryPercentage: 0.8,
      barPercentage: 0.9
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: false 
      },
      tooltip: {
        enabled: true,
        position: 'nearest' as const,
        callbacks: {
          label: (context: TooltipItem<'bar'>) => `${context.parsed.y?.toLocaleString() ?? 0}`
        }
      }
    },
    scales: {
      y: { 
        beginAtZero: true,
        max: maxValue,
        grid: { display: false },
        ticks: { display: false }
      },
      x: {
        grid: { display: false },
        ticks: {
          autoSkip: true,
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  };

  return (
    <div className="space-y-3 min-w-[280px] overflow-x-auto">
      <h3 className="font-medium text-sm sm:text-base">{title}</h3>
      <div className="h-[180px] sm:h-[200px] w-full">
        <Bar data={chartData} options={options} />
      </div>
      {footerText && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{footerText}</p>
      )}
    </div>
  );
}