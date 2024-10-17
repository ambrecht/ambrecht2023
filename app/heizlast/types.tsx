// ClimateData: Repräsentiert die API-Daten
export interface ClimateData {
  temperatures: number[]; // Außentemperaturen
  buildingHeatingLoad: number[]; // Heizlast des Gebäudes (kW)
  heatPumpOutput: number[]; // Wärmepumpenleistung (kW)
  heatPumpConsumption: number[]; // Verbrauch Wärmepumpe (kWh)
  gasConsumption: number[]; // Gasverbrauch (kWh)
  totalConsumption: number[]; // Gesamter Verbrauch (kWh)
  minHeatOutputHP: number[]; // Minimale Wärmeleistung Wärmepumpe (kW)
  cyclicOperationHP: number[]; // Taktbetrieb Wärmepumpe (kW)
}

// ChartData: Daten, die dem Diagramm übergeben werden
export interface ChartData {
  temperatures: number[]; // X-Achse: Temperaturen
  buildingHeatingLoad: number[]; // Y1-Achse: Heizlast
  heatPumpConsumption: number[]; // Y-Achse: Verbrauch WP
  gasConsumption: number[]; // Y-Achse: Gasverbrauch
  peakLoadCoverageGas: number[]; // Y1-Achse: Spitzenlastabdeckung Gas
  nominalHeatOutputHP: number[]; // Y1-Achse: Nenn-Wärmepumpenleistung
  minHeatOutputHP: number[]; // Y1-Achse: Min. Wärmepumpenleistung
  cyclicOperationHP: number[]; // Y-Achse: Taktbetrieb WP
  totalConsumption: number[]; // Y-Achse: Gesamtverbrauch
}
