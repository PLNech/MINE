'use client';

import { useEffect, useRef } from 'react';

interface PieChartSegment {
  label: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  data: PieChartSegment[];
  width?: number;
  height?: number;
  title?: string;
  showLegend?: boolean;
  tooltipFormatter?: (v: number) => string;
}

export default function PieChart({
  data,
  width = 300,
  height = 300,
  title,
  showLegend = true,
  tooltipFormatter = (v: number) => v.toString()
}: PieChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!chartRef.current || !data.length) return;
    
    // Clear previous chart
    chartRef.current.innerHTML = '';
    
    // Calculate margins and dimensions
    const margin = { top: 30, right: 30, bottom: 30, left: 30 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Set default colors if not provided
    const defaultColors = [
      '#d97706', '#f59e0b', '#fbbf24', '#fcd34d', '#fef3c7',
      '#65a30d', '#84cc16', '#bef264',
      '#14b8a6', '#5eead4',
      '#6366f1', '#a5b4fc'
    ];
    
    // Calculate total value
    const total = data.reduce((sum, d) => sum + d.value, 0);
    
    // Create SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width.toString());
    svg.setAttribute('height', height.toString());
    chartRef.current.appendChild(svg);
    
    // Create group for chart area
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${width / 2},${height / 2})`);
    svg.appendChild(g);
    
    // Calculate pie segments
    const radius = Math.min(innerWidth, innerHeight) / 2;
    let startAngle = 0;
    
    data.forEach((segment, i) => {
      // Skip segments with no value
      if (segment.value <= 0) return;
      
      // Calculate angles
      const percentage = segment.value / total;
      const endAngle = startAngle + percentage * 2 * Math.PI;
      
      // Calculate arc path
      const x1 = radius * Math.sin(startAngle);
      const y1 = -radius * Math.cos(startAngle);
      const x2 = radius * Math.sin(endAngle);
      const y2 = -radius * Math.cos(endAngle);
      
      // Determine if the arc is more than 180 degrees (large-arc-flag)
      const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;
      
      // Create pie segment path
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const d = [
        `M 0 0`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');
      
      path.setAttribute('d', d);
      path.setAttribute('fill', segment.color || defaultColors[i % defaultColors.length]);
      path.setAttribute('stroke', '#fff');
      path.setAttribute('stroke-width', '1');
      
      // Add hover effects
      path.addEventListener('mouseover', () => {
        path.setAttribute('opacity', '0.8');
        
        // Calculate tooltip position
        const midAngle = startAngle + (endAngle - startAngle) / 2;
        const tooltipX = radius * 0.7 * Math.sin(midAngle) + width / 2;
        const tooltipY = -radius * 0.7 * Math.cos(midAngle) + height / 2;
        
        const tooltip = document.createElement('div');
        tooltip.className = 'absolute bg-amber-50 border border-amber-300 p-2 rounded text-xs z-10';
        tooltip.style.left = `${tooltipX}px`;
        tooltip.style.top = `${tooltipY}px`;
        tooltip.style.transform = 'translate(-50%, -50%)';
        tooltip.innerHTML = `
          <div class="font-medium">${segment.label}</div>
          <div>${tooltipFormatter(segment.value)}</div>
          <div>(${Math.round(percentage * 100)}%)</div>
        `;
        tooltip.id = 'chart-tooltip';
        chartRef.current?.appendChild(tooltip);
      });
      
      path.addEventListener('mouseout', () => {
        path.setAttribute('opacity', '1');
        document.getElementById('chart-tooltip')?.remove();
      });
      
      g.appendChild(path);
      
      // Add text labels for larger segments
      if (percentage > 0.05) {
        const midAngle = startAngle + (endAngle - startAngle) / 2;
        const labelX = radius * 0.65 * Math.sin(midAngle);
        const labelY = -radius * 0.65 * Math.cos(midAngle);
        
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', labelX.toString());
        label.setAttribute('y', labelY.toString());
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('alignment-baseline', 'middle');
        label.setAttribute('font-size', '10');
        label.setAttribute('fill', '#fff');
        label.setAttribute('pointer-events', 'none');
        label.textContent = `${Math.round(percentage * 100)}%`;
        g.appendChild(label);
      }
      
      startAngle = endAngle;
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
    
    // Add legend if showLegend is true
    if (showLegend) {
      const legend = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      
      // Position legend below the chart
      const legendX = width / 2 - ((data.length * 80) / 2);
      const legendY = height - 20;
      
      legend.setAttribute('transform', `translate(${legendX}, ${legendY})`);
      
      data.forEach((segment, i) => {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('transform', `translate(${i * 80}, 0)`);
        
        // Add color square
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('width', '10');
        rect.setAttribute('height', '10');
        rect.setAttribute('fill', segment.color || defaultColors[i % defaultColors.length]);
        group.appendChild(rect);
        
        // Add category name
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', '15');
        text.setAttribute('y', '8');
        text.setAttribute('font-size', '10');
        text.setAttribute('fill', '#92400e');
        text.textContent = segment.label;
        group.appendChild(text);
        
        legend.appendChild(group);
      });
      
      svg.appendChild(legend);
    }
    
  }, [data, width, height, title, showLegend, tooltipFormatter]);
  
  return (
    <div className="relative">
      <div ref={chartRef}></div>
    </div>
  );
}