import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
  ChartTypeRegistry,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

export interface ClimateChartData {
  temperatures: number[];
  buildingHeatingLoad: number[];
  heatPumpConsumption: number[];
  gasConsumption: number[];
  peakLoadCoverageGas: number[];
  nominalHeatOutputHP: number[];
  minHeatOutputHP: number[];
  cyclicOperationHP: number[];
  totalConsumption: number[];
}

interface ClimateChartProps {
  data: ClimateChartData;
}

const ClimateChart: React.FC<ClimateChartProps> = ({ data }) => {
  const options: ChartOptions<'bar' | 'line'> = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Außentemperatur (°C)',
        },
        min: -15,
        max: 20,
        ticks: {
          stepSize: 5,
          callback: function (value) {
            return value + '°C';
          },
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'kWh',
        },
        min: 0,
        max: 6000,
        ticks: {
          stepSize: 1000,
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'kW',
        },
        min: 0,
        max: 30,
        ticks: {
          stepSize: 5,
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'kWh und Außentemperatur',
      },
    },
  };

  const chartData: ChartData<'bar' | 'line', number[], string> = {
    labels: data.temperatures.map(String),
    datasets: [
      {
        type: 'line' as const,
        label: 'Gebäudeheizlast',
        data: data.buildingHeatingLoad,
        borderColor: 'black',
        fill: false,
        yAxisID: 'y1',
      },
      {
        type: 'bar' as const,
        label: 'kWh Gas',
        data: data.gasConsumption,
        backgroundColor: 'rgba(255, 206, 86, 0.5)',
        yAxisID: 'y',
      },
      {
        type: 'bar' as const,
        label: 'kWh WP',
        data: data.heatPumpConsumption,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        yAxisID: 'y',
      },
      {
        type: 'line' as const,
        label: 'Spitzenlastabdeckung Gas',
        data: data.peakLoadCoverageGas,
        borderColor: 'rgb(255, 159, 64)',
        borderDash: [5, 5],
        yAxisID: 'y1',
        fill: false,
      },
      {
        type: 'line' as const,
        label: 'Nenn-Wärmeleistung WP',
        data: data.nominalHeatOutputHP,
        borderColor: 'rgba(75, 192, 192, 0.5)',
        borderDash: [5, 5],
        yAxisID: 'y1',
        fill: false,
      },
      {
        type: 'line' as const,
        label: 'min. Wärmeleistung WP',
        data: data.minHeatOutputHP,
        borderColor: 'rgba(153, 102, 255, 0.5)',
        yAxisID: 'y1',
        fill: false,
      },
      {
        type: 'line' as const,
        label: 'Taktbetrieb WP',
        data: data.cyclicOperationHP,
        borderColor: 'rgba(255, 99, 132, 0.5)',
        yAxisID: 'y1',
        fill: false,
      },
      {
        type: 'line' as const,
        label: 'kWh gesamt',
        data: data.totalConsumption,
        borderColor: 'rgba(255, 0, 0, 0.8)',
        yAxisID: 'y',
        fill: false,
      },
    ],
  };

  return <Chart type="bar" options={options} data={chartData} />;
};

export default ClimateChart;
