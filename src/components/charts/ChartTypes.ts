export interface ChartDataPoint {
  date: Date;
  value: number;
  label?: string;
}

export interface StackedChartDataPoint extends ChartDataPoint {
  categories: {
    [key: string]: number;
  };
}

export interface ChartProps {
  data: ChartDataPoint[] | StackedChartDataPoint[];
  width?: number;
  height?: number;
  title?: string;
  xLabel?: string;
  yLabel?: string;
  showLegend?: boolean;
  tooltipFormatter?: (value: number) => string;
}