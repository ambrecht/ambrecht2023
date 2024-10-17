'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import FullHeizlastChart, { ClimateChartData } from './FullHeizlastChart';

// Definiere die Schnittstelle für die API-Daten
interface APIData {
  meanTemperature: number;
  normOutsideTemperature: number;
  height: number;
  climateZone: number;
  monthlyData: Record<string, MonthlyData>;
}

// Definiere die Schnittstelle für die monatlichen Daten
interface MonthlyData {
  heatingDegreeDays: number;
  heatingDays: number;
  heatingDegreeHours: number;
  heatingHours: number;
  outsideTemperature: number;
  outsideTemperatureOnHeatingDays: number;
}

// Definiere konstante Werte aus der CSV, die nicht in der API enthalten sind
const CONSTANT_DATA = {
  nominalHeatOutputHP: 25, // Beispielwert, muss durch reale Daten ersetzt werden
  COP: 3.5,
  peakLoadCoverageGas: 15, // Beispielwert, muss durch reale Daten ersetzt werden
  buildingHeatingLoad: 5000, // Beispielwert, muss durch reale Daten ersetzt werden
  minHeatOutputHP: 5, // Beispielwert, muss durch reale Daten ersetzt werden
  cyclicOperationHP: 10, // Beispielwert, muss durch reale Daten ersetzt werden
};

const PlzForm: React.FC = () => {
  const [plz, setPlz] = useState<string>(''); // Für die Postleitzahl-Eingabe
  const [chartData, setChartData] = useState<ClimateChartData | null>(null); // Für die Diagrammdaten
  const [error, setError] = useState<string | null>(null); // Fehlerzustand für das Handling

  // Funktion zur Verarbeitung der Formularübermittlung
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault(); // Verhindert das Standardverhalten des Formulars
    setError(null); // Fehler zurücksetzen

    if (!plz) {
      setError('Bitte geben Sie eine gültige Postleitzahl ein.');
      return;
    }

    try {
      const response = await fetch(`/api/climate-data?plz=${plz}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Fehler bei der Abfrage der API.');
      }

      const responseData = await response.text();
      const parsedData = parseClimateData(responseData);

      setChartData(parsedData); // Setze die verarbeiteten Daten für das Diagramm
    } catch (error) {
      setError(
        'Fehler beim Abrufen der Klimadaten. Bitte versuchen Sie es erneut.',
      );
      console.error('API-Abfrage fehlgeschlagen:', error);
    }
  };

  // Funktion zum Verarbeiten der empfangenen API-Daten
  const parseClimateData = (htmlString: string): ClimateChartData => {
    const parser = new DOMParser();
    const root = parser.parseFromString(htmlString, 'text/html');

    console.log('Parsed HTML:', root);

    // Extrahiere statische Daten (z.B. Jahresmitteltemperatur, Norm-Außentemperatur)
    const meanTemperature = parseFloat(
      root.querySelector('#mean')?.textContent?.replace('°C', '').trim() || '0',
    );
    const normOutsideTemperature = parseFloat(
      root
        .querySelectorAll('#mean')[1]
        ?.textContent?.replace('°C', '')
        .trim() || '0',
    );
    const height = parseInt(
      root.querySelectorAll('#mean')[2]?.textContent?.replace('m', '').trim() ||
        '0',
    );
    const climateZone = parseInt(
      root.querySelectorAll('#mean')[3]?.textContent?.trim() || '0',
    );

    // Extrahiere die monatlichen Daten aus der Tabelle
    const monthlyData: Record<string, MonthlyData> = {};
    const rows = root.querySelectorAll('.accordion-item table tr');

    rows.forEach((row, index) => {
      if (index === 0) return; // Überspringe die Kopfzeile
      const cells = row.querySelectorAll('td');
      const month = row.querySelector('th')?.textContent?.trim() || '';

      if (month) {
        monthlyData[month] = {
          heatingDegreeDays: parseInt(cells[0]?.textContent?.trim() || '0'),
          heatingDays: parseInt(
            cells[1]?.textContent?.replace('d', '').trim() || '0',
          ),
          heatingDegreeHours: parseInt(cells[2]?.textContent?.trim() || '0'),
          heatingHours: parseInt(
            cells[3]?.textContent?.replace('h', '').trim() || '0',
          ),
          outsideTemperature: parseFloat(
            cells[4]?.textContent?.replace('°C', '').trim() || '0',
          ),
          outsideTemperatureOnHeatingDays: parseFloat(
            cells[5]?.textContent?.replace('°C', '').trim() || '0',
          ),
        };
      }
    });

    console.log('Extracted Monthly Data:', monthlyData);

    // Kombiniere die dynamischen und statischen Daten zu ClimateChartData
    const chartData: ClimateChartData = {
      temperatures: Object.values(monthlyData).map(
        (data) => data.outsideTemperature,
      ),
      buildingHeatingLoad: Array(12).fill(CONSTANT_DATA.buildingHeatingLoad),
      heatPumpConsumption: Array(12).fill(0), // Wird berechnet oder durch echte Daten ersetzt
      gasConsumption: Array(12).fill(0), // Wird berechnet oder durch echte Daten ersetzt
      peakLoadCoverageGas: Array(12).fill(CONSTANT_DATA.peakLoadCoverageGas),
      nominalHeatOutputHP: Array(12).fill(CONSTANT_DATA.nominalHeatOutputHP),
      minHeatOutputHP: Array(12).fill(CONSTANT_DATA.minHeatOutputHP),
      cyclicOperationHP: Array(12).fill(CONSTANT_DATA.cyclicOperationHP),
      totalConsumption: Array(12).fill(0), // Muss berechnet oder durch echte Daten ersetzt werden
    };

    console.log('Parsed ClimateChartData:', chartData);
    return chartData;
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Heizlast-Berechnung</h1>

      <form onSubmit={handleSubmit} className="mb-4">
        <label
          htmlFor="plz"
          className="block text-sm font-medium text-gray-700"
        >
          Postleitzahl
        </label>
        <input
          type="text"
          id="plz"
          value={plz}
          onChange={(e) => setPlz(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="PLZ eingeben"
        />
        <button
          type="submit"
          className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Daten abrufen
        </button>
      </form>

      {error && <p className="text-red-500">{error}</p>}

      {/* Rendern des Diagramms nur, wenn Daten vorhanden sind */}
      {chartData && <FullHeizlastChart data={chartData} />}
    </div>
  );
};

export default PlzForm;
