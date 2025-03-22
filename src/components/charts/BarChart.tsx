'use client';

import { useEffect, useRef } from 'react';
import { ChartProps, ChartDataPoint } from './ChartTypes';

export default function BarChart({
  data,
  width = 400,
  height = 200,
  title,
  xLabel,
  yLabel,
  showLegend = true,
  tooltipFormatter = (v: number) => v.toString()
}: ChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!chartRef.current || !data.length) return;
    
    // Clear previous chart
    chartRef.current.innerHTML = '';
    
    // Calculate margins and dimensions
    const margin = { top: 30, right: 30, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Format data
    const typedData = data as ChartDataPoint[];
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
    
    // Create scales
    const barWidth = innerWidth / typedData.length * 0.8; // 80% of available space per bar
    const xScale = (index: number) => index * (innerWidth / typedData.length) + (innerWidth / typedData.length - barWidth) / 2;
    const yScale = (value: number) => innerHeight - ((value - minValue) / (maxValue - minValue) * innerHeight);
    
    // Create bars
    typedData.forEach((d, i) => {
      const barHeight = innerHeight - yScale(d.value);
      const barGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', xScale(i).toString());
      rect.setAttribute('y', yScale(d.value).toString());
      rect.setAttribute('width', barWidth.toString());
      rect.setAttribute('height', barHeight.toString());
      rect.setAttribute('fill', '#d97706');
      rect.setAttribute('rx', '2'); // Rounded corners
      
      // Add hover effects
      rect.addEventListener('mouseover', () => {
        rect.setAttribute('fill', '#b45309');
        
        const tooltip = document.createElement('div');
        tooltip.className = 'absolute bg-amber-50 border border-amber-300 p-2 rounded text-xs z-10';
        tooltip.style.left = `${xScale(i) + margin.left + barWidth/2}px`;
        tooltip.style.top = `${yScale(d.value) + margin.top - 30}px`;
        tooltip.innerHTML = `
          <div>${d.date.toLocaleDateString()}</div>
          <div>${tooltipFormatter(d.value)}</div>
          ${d.label ? `<div>${d.label}</div>` : ''}
        `;
        tooltip.id = 'chart-tooltip';
        chartRef.current?.appendChild(tooltip);
      });
      
      rect.addEventListener('mouseout', () => {
        rect.setAttribute('fill', '#d97706');
        document.getElementById('chart-tooltip')?.remove();
      });
      
      barGroup.appendChild(rect);
      g.appendChild(barGroup);
    });
    
    // Create X axis
    const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    xAxis.setAttribute('transform', `translate(0,${innerHeight})`);
    
    // Add X axis line
    const xAxisLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    xAxisLine.setAttribute('x1', '0');
    xAxisLine.setAttribute('y1', '0');
    xAxisLine.setAttribute('x2', innerWidth.toString());
    xAxisLine.setAttribute('y2', '0');
    xAxisLine.setAttribute('stroke', '#92400e');
    xAxis.appendChild(xAxisLine);
    
    // Add X axis labels (simplified)
    const skip = Math.max(1, Math.floor(typedData.length / 5));
    typedData.forEach((d, i) => {
      if (i % skip === 0 || i === typedData.length - 1) {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', (xScale(i) + barWidth/2).toString());
        text.setAttribute('y', '20');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', '10');
        text.setAttribute('fill', '#92400e');
        text.textContent = d.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        xAxis.appendChild(text);
        
        // Add tick mark
        const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        tick.setAttribute('x1', (xScale(i) + barWidth/2).toString());
        tick.setAttribute('y1', '0');
        tick.setAttribute('x2', (xScale(i) + barWidth/2).toString());
        tick.setAttribute('y2', '5');
        tick.setAttribute('stroke', '#92400e');
        xAxis.appendChild(tick);
      }
    });
    g.appendChild(xAxis);
    
    // Create Y axis (similar to LineChart)
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
    
    // Add title and labels (similar to LineChart)
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
    
  }, [data, width, height, title, xLabel, yLabel, tooltipFormatter]);
  
  return (
    <div className="relative">
      <div ref={chartRef}></div>
    </div>
  );
}