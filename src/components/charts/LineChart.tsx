'use client';

import { useEffect, useRef } from 'react';
import { ChartProps, ChartDataPoint } from './ChartTypes';
import * as d3 from 'd3';

interface LineChartProps {
  data: { date: Date; value: number; label?: string }[];
  width: number;
  height: number;
  title?: string;
  xLabel?: string;
  yLabel?: string;
  showLegend?: boolean;
  tooltipFormatter?: (value: number) => string;
}

export default function LineChart({
  data,
  width = 400,
  height = 200,
  title,
  xLabel,
  yLabel,
  showLegend = true,
  tooltipFormatter = (v: number) => v.toString()
}: LineChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  
  const formatDate = (date: Date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return '';
    }
    return `Week ${Math.floor(date.getTime() / (7 * 24 * 60 * 60 * 1000))}`;
  };
  
  const renderChart = () => {
    if (!chartRef.current || !data.length) return;
    
    // Validate data first
    const validData = data.filter(d => 
      d.date instanceof Date && 
      !isNaN(d.date.getTime()) && 
      typeof d.value === 'number' &&
      !isNaN(d.value)
    );

    if (validData.length === 0) {
      console.warn('No valid data points to render chart');
      return;
    }
    
    // Clear previous chart
    while (chartRef.current.firstChild) {
      chartRef.current.removeChild(chartRef.current.firstChild);
    }
    
    // Calculate margins and dimensions
    const margin = { top: 30, right: 30, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Format dates and values
    const typedData = validData as ChartDataPoint[];
    const values = typedData.map(d => d.value);
    
    // Get min and max values for scales
    const minValue = Math.min(0, ...values);
    const maxValue = Math.max(...values) * 1.1; // Add 10% padding
    
    // Create SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width.toString());
    svg.setAttribute('height', height.toString());
    chartRef.current.appendChild(svg);
    
    // Create group for chart area
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${margin.left},${margin.top})`);
    svg.appendChild(g);
    
    // Create scales with validated domain
    const xScale = d3.scaleTime()
      .domain(d3.extent(validData, d => d.date) as [Date, Date])
      .range([0, innerWidth]);
    
    const yScale = (value: number) => innerHeight - ((value - minValue) / (maxValue - minValue) * innerHeight);
    
    // Create line with safe type checking
    const linePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const pathData = typedData.map((d, i) => {
      const x = xScale(d.date);
      const y = yScale(d.value);
      
      // Skip invalid points
      if (x === undefined || y === undefined || isNaN(x) || isNaN(y)) {
        return '';
      }
      
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    }).filter(Boolean).join(' ');
    
    if (pathData) {
      linePath.setAttribute('d', pathData);
      linePath.setAttribute('fill', 'none');
      linePath.setAttribute('stroke', '#b45309');
      linePath.setAttribute('stroke-width', '2');
      g.appendChild(linePath);
    }
    
    // Create area if values are positive
    const areaPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const areaData = pathData + ' L' + xScale(typedData[typedData.length - 1].date) + ',' + yScale(0) + 
                     ' L' + xScale(typedData[0].date) + ',' + yScale(0) + ' Z';
    
    areaPath.setAttribute('d', areaData);
    areaPath.setAttribute('fill', 'rgba(251, 191, 36, 0.2)');
    g.appendChild(areaPath);
    
    // Create projection line (dashed)
    if (typedData.length > 3) {
      const projectionLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      
      // Use the last 4 points to create a trend line
      const lastPoints = typedData.slice(-4);
      const avgChange = (lastPoints[3].value - lastPoints[0].value) / 3;
      
      // Create 4 projected points
      const projectionPoints = [];
      for (let i = 1; i <= 4; i++) {
        projectionPoints.push({
          date: new Date(typedData[typedData.length - 1].date.getTime() + i * 7 * 24 * 60 * 60 * 1000),
          value: typedData[typedData.length - 1].value + avgChange * i
        });
      }
      
      const projectionData = 'M' + xScale(typedData[typedData.length - 1].date) + ',' + yScale(typedData[typedData.length - 1].value) + ' ' +
        projectionPoints.map((d, i) => 
          'L' + (xScale(typedData[typedData.length - 1].date) + (i + 1) * (innerWidth / (typedData.length - 1))) + ',' + 
          yScale(d.value)
        ).join(' ');
      
      projectionLine.setAttribute('d', projectionData);
      projectionLine.setAttribute('stroke', '#78350f');
      projectionLine.setAttribute('stroke-width', '1.5');
      projectionLine.setAttribute('stroke-dasharray', '4,2');
      projectionLine.setAttribute('fill', 'none');
      g.appendChild(projectionLine);
    }
    
    // Create X axis
    const xAxisGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    xAxisGroup.setAttribute('transform', `translate(0,${innerHeight})`);
    g.appendChild(xAxisGroup);

    const xAxis = d3.axisBottom(xScale)
      .ticks(5)
      .tickFormat((d) => formatDate(d as Date));
    
    // Render the axis into the group
    d3.select(xAxisGroup).call(xAxis);

    // Add X axis line
    const xAxisLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    xAxisLine.setAttribute('x1', '0');
    xAxisLine.setAttribute('y1', '0');
    xAxisLine.setAttribute('x2', innerWidth.toString());
    xAxisLine.setAttribute('y2', '0');
    xAxisLine.setAttribute('stroke', '#92400e');
    g.appendChild(xAxisLine);

    // Update X axis labels with safe type checking
    const skip = Math.max(1, Math.floor(typedData.length / 5));
    typedData.forEach((d, i) => {
      if (i % skip === 0 || i === typedData.length - 1) {
        const x = xScale(d.date);
        if (x !== undefined && !isNaN(x)) {
          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.setAttribute('x', x.toString());
          text.setAttribute('y', '20');
          text.setAttribute('text-anchor', 'middle');
          text.setAttribute('font-size', '10');
          text.setAttribute('fill', '#92400e');
          text.textContent = d.date instanceof Date && !isNaN(d.date.getTime()) 
            ? d.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
            : 'Invalid Date';
          g.appendChild(text);
          
          // Add tick mark
          const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          tick.setAttribute('x1', x.toString());
          tick.setAttribute('y1', '0');
          tick.setAttribute('x2', x.toString());
          tick.setAttribute('y2', '5');
          tick.setAttribute('stroke', '#92400e');
          g.appendChild(tick);
        }
      }
    });

    // Create Y axis
    const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    // Add Y axis line
    const yAxisLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    yAxisLine.setAttribute('x1', '0');
    yAxisLine.setAttribute('y1', '0');
    yAxisLine.setAttribute('x2', '0');
    yAxisLine.setAttribute('y2', innerHeight.toString());
    yAxisLine.setAttribute('stroke', '#92400e');
    yAxis.appendChild(yAxisLine);
    
    // Add Y axis labels and grid lines
    const yTickCount = 5;
    for (let i = 0; i <= yTickCount; i++) {
      const value = minValue + (maxValue - minValue) * (i / yTickCount);
      const y = yScale(value);
      
      // Add label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', '-10');
      text.setAttribute('y', y.toString());
      text.setAttribute('dy', '0.32em');
      text.setAttribute('text-anchor', 'end');
      text.setAttribute('font-size', '10');
      text.setAttribute('fill', '#92400e');
      text.textContent = tooltipFormatter(value);
      yAxis.appendChild(text);
      
      // Add tick mark
      const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      tick.setAttribute('x1', '-5');
      tick.setAttribute('y1', y.toString());
      tick.setAttribute('x2', '0');
      tick.setAttribute('y2', y.toString());
      tick.setAttribute('stroke', '#92400e');
      yAxis.appendChild(tick);
      
      // Add grid line
      const gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      gridLine.setAttribute('x1', '0');
      gridLine.setAttribute('y1', y.toString());
      gridLine.setAttribute('x2', innerWidth.toString());
      gridLine.setAttribute('y2', y.toString());
      gridLine.setAttribute('stroke', '#f4e4d4');
      gridLine.setAttribute('stroke-width', '1');
      yAxis.appendChild(gridLine);
    }
    g.appendChild(yAxis);
    
    // Add data points
    typedData.forEach((d, i) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', xScale(d.date).toString());
      circle.setAttribute('cy', yScale(d.value).toString());
      circle.setAttribute('r', '3');
      circle.setAttribute('fill', '#b45309');
      
      // Add tooltip on hover
      circle.addEventListener('mouseover', () => {
        const tooltip = document.createElement('div');
        tooltip.className = 'absolute bg-amber-50 border border-amber-300 p-2 rounded text-xs z-10';
        tooltip.style.left = `${xScale(d.date) + margin.left + 10}px`;
        tooltip.style.top = `${yScale(d.value) + margin.top - 20}px`;
        tooltip.innerHTML = `
          <div>${d.date instanceof Date && !isNaN(d.date.getTime()) ? d.date.toLocaleDateString() : 'Invalid Date'}</div>
          <div>${tooltipFormatter(d.value)}</div>
        `;
        tooltip.id = 'chart-tooltip';
        chartRef.current?.appendChild(tooltip);
      });
      
      circle.addEventListener('mouseout', () => {
        document.getElementById('chart-tooltip')?.remove();
      });
      
      g.appendChild(circle);
    });
    
    // Add title if provided
    if (title) {
      const titleEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      titleEl.setAttribute('x', (width / 2).toString());
      titleEl.setAttribute('y', '15');
      titleEl.setAttribute('text-anchor', 'middle');
      titleEl.setAttribute('font-size', '14');
      titleEl.setAttribute('font-weight', 'bold');
      titleEl.setAttribute('fill', '#92400e');
      titleEl.textContent = title;
      svg.appendChild(titleEl);
    }
    
    // Add axis labels if provided
    if (xLabel) {
      const xLabelEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      xLabelEl.setAttribute('x', (margin.left + innerWidth / 2).toString());
      xLabelEl.setAttribute('y', (height - 5).toString());
      xLabelEl.setAttribute('text-anchor', 'middle');
      xLabelEl.setAttribute('font-size', '12');
      xLabelEl.setAttribute('fill', '#92400e');
      xLabelEl.textContent = xLabel;
      svg.appendChild(xLabelEl);
    }
    
    if (yLabel) {
      const yLabelEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      yLabelEl.setAttribute('transform', `translate(${10},${margin.top + innerHeight / 2}) rotate(-90)`);
      yLabelEl.setAttribute('text-anchor', 'middle');
      yLabelEl.setAttribute('font-size', '12');
      yLabelEl.setAttribute('fill', '#92400e');
      yLabelEl.textContent = yLabel;
      svg.appendChild(yLabelEl);
    }
  };

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      renderChart();
    }
  }, [data, width, height, title, xLabel, yLabel, tooltipFormatter]);
  
  return (
    <div className="relative">
      {title && <h3 className="text-center mb-2">{title}</h3>}
      <svg
        ref={chartRef}
        width={width}
        height={height}
        className="overflow-visible"
      />
    </div>
  );
}