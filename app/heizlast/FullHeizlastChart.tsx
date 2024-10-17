import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import styled from 'styled-components';

// Definiere die Schnittstelle für die Chart-Daten
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

// Styled Component Wrapper
const ChartWrapper = styled.div`
  width: 100%;
  height: 100%;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f5f5;
  border-radius: 12px;

  svg {
    font-family: 'Roboto', sans-serif;
  }
`;

const FullHeizlastChart: React.FC<{ data: ClimateChartData }> = ({ data }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    drawChart(data);
  }, [data]);

  const drawChart = (data: ClimateChartData) => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 100, bottom: 50, left: 100 };
    const width = 900 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    // Define chart group
    const chart = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Define scales
    const xScale = d3
      .scaleLinear()
      .domain([-20, 20]) // Temperature range from -20°C to 20°C
      .range([0, width]);

    const yLeftScale = d3
      .scaleLinear()
      .domain([0, 6000]) // kWh from 0 to 6000
      .range([height, 0]);

    const yRightScale = d3
      .scaleLinear()
      .domain([0, 30]) // kW from 0 to 30
      .range([height, 0]);

    // Draw Axes
    chart
      .append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(9)
          .tickFormat((d) => `${d}°C`),
      )
      .attr('font-size', '12px');

    chart
      .append('g')
      .call(
        d3
          .axisLeft(yLeftScale)
          .ticks(5)
          .tickFormat((d) => `${d} kWh`),
      )
      .attr('font-size', '12px');

    chart
      .append('g')
      .attr('transform', `translate(${width}, 0)`)
      .call(
        d3
          .axisRight(yRightScale)
          .ticks(5)
          .tickFormat((d) => `${d} kW`),
      )
      .attr('font-size', '12px');

    // Define line generators
    const lineGenerator = (accessor: (d: any) => number, scale: any) =>
      d3
        .line<any>()
        .x((d, i) => xScale(i - 20))
        .y((d) => scale(accessor(d)))
        .curve(d3.curveMonotoneX);

    // Draw lines for each data set
    const lineData = [
      {
        data: data.buildingHeatingLoad,
        color: 'black',
        label: 'Gebäudeheizlast (Building Heating Load)',
        scale: yLeftScale,
        yAxis: 'left',
      },
      {
        data: data.heatPumpConsumption,
        color: 'blue',
        label: 'kWh WP (Heat Pump Consumption)',
        scale: yLeftScale,
        yAxis: 'left',
      },
      {
        data: data.gasConsumption,
        color: 'orange',
        label: 'kWh Gas (Gas Consumption)',
        scale: yLeftScale,
        yAxis: 'left',
      },
      {
        data: data.peakLoadCoverageGas,
        color: 'green',
        label: 'Spitzenlastabdeckung Gas (Peak Load Coverage Gas)',
        scale: yRightScale,
        yAxis: 'right',
        dasharray: '5,5',
      },
      {
        data: data.nominalHeatOutputHP,
        color: 'cyan',
        label: 'Nenn-Wärmeleistung WP (Nominal Heat Output HP)',
        scale: yRightScale,
        yAxis: 'right',
        dasharray: '5,5',
      },
      {
        data: data.minHeatOutputHP,
        color: 'purple',
        label: 'Min. Wärmeleistung WP (Minimum Heat Output HP)',
        scale: yRightScale,
        yAxis: 'right',
      },
      {
        data: data.cyclicOperationHP,
        color: 'red',
        label: 'Taktbetrieb WP (Cyclic Operation HP)',
        scale: yRightScale,
        yAxis: 'right',
      },
      {
        data: data.totalConsumption,
        color: 'darkred',
        label: 'kWh Gesamt (Total kWh)',
        scale: yLeftScale,
        yAxis: 'left',
      },
    ];

    lineData.forEach(({ data, color, dasharray, scale }) => {
      chart
        .append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', dasharray || '0')
        .attr(
          'd',
          lineGenerator((d: number) => d, scale),
        );
    });

    // Draw legend
    const legend = svg
      .append('g')
      .attr(
        'transform',
        `translate(${width + margin.left + 10}, ${margin.top})`,
      )
      .attr('class', 'legend');

    lineData.forEach((d, i) => {
      const legendRow = legend
        .append('g')
        .attr('transform', `translate(0, ${i * 20})`);

      legendRow
        .append('rect')
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', d.color);

      legendRow
        .append('text')
        .attr('x', 20)
        .attr('y', 10)
        .attr('text-anchor', 'start')
        .attr('alignment-baseline', 'middle')
        .text(d.label);
    });
  };

  return (
    <ChartWrapper>
      <svg ref={svgRef} width="900" height="600"></svg>
    </ChartWrapper>
  );
};

export default FullHeizlastChart;
