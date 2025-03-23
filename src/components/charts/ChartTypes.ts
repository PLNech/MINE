export interface ChartDataPoint {
  date: Date;
  value: number;
  label?: string;
}

export interface StackedChartDataPoint {
  date: Date;
  value: number;
  categories: {
    [key: string]: number;
  };
}

export interface ChartProps {
  data: ChartDataPoint[];
  width: number;
  height: number;
  title?: string;
  yLabel?: string;
  showLegend?: boolean;
  tooltipFormatter?: (value: number) => string;
  xAxisFormatter?: (date: Date) => string;
}