import { DailyTransaction, FinancialRecord } from '../types/types';
import { ChartDataPoint, StackedChartDataPoint } from '@/components/charts/ChartTypes';

// Convert financial records to chart data points
export const financialHistoryToChartData = (
  history: FinancialRecord[]
): ChartDataPoint[] => {
  return history.map(record => ({
    date: new Date(record.date),
    value: record.profit,
    label: `Week ${record.week}`
  }));
};

// Convert treasury history to chart data
export const treasuryHistoryToChartData = (
  history: FinancialRecord[]
): ChartDataPoint[] => {
  return history.map(record => ({
    date: new Date(record.date),
    value: record.treasury,
    label: `Week ${record.week}`
  }));
};

// Convert daily transactions to revenue chart data
export const dailyTransactionsToRevenueData = (
  transactions: DailyTransaction[]
): ChartDataPoint[] => {
  return transactions.map(tx => ({
    date: new Date(tx.week * 7 + tx.day - 1), // Approximate date
    value: tx.revenue,
    label: `Day ${tx.day}, Week ${tx.week}`
  }));
};

// Convert daily transactions to expense chart data
export const dailyTransactionsToExpenseData = (
  transactions: DailyTransaction[]
): ChartDataPoint[] => {
  return transactions.map(tx => {
    const totalExpenses = tx.expenses.maintenance + 
      (tx.expenses.salaries || 0) + 
      (tx.expenses.upgrades || 0) + 
      (tx.expenses.construction || 0);
    
    return {
      date: new Date(tx.week * 7 + tx.day - 1), // Approximate date
      value: totalExpenses,
      label: `Day ${tx.day}, Week ${tx.week}`
    };
  });
};

// Convert daily transactions to stacked expense data
export const dailyTransactionsToStackedExpenseData = (
  transactions: DailyTransaction[]
): StackedChartDataPoint[] => {
  return transactions.map(tx => ({
    date: new Date(tx.week * 7 + tx.day - 1), // Approximate date
    value: 0, // Will be calculated from categories
    categories: {
      Maintenance: tx.expenses.maintenance,
      Salaries: tx.expenses.salaries || 0,
      Upgrades: tx.expenses.upgrades || 0,
      Construction: tx.expenses.construction || 0
    }
  }));
};

// Generate worker efficiency data
export const generateWorkerEfficiencyData = (
  satisfaction: number[],
  health: number[],
  productivity: number[]
): {
  satisfactionData: ChartDataPoint[];
  healthData: ChartDataPoint[];
  productivityData: ChartDataPoint[];
} => {
  const dates = Array.from({ length: satisfaction.length }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (satisfaction.length - i - 1));
    return date;
  });
  
  return {
    satisfactionData: dates.map((date, i) => ({
      date,
      value: satisfaction[i],
      label: `Satisfaction: ${satisfaction[i].toFixed(0)}%`
    })),
    healthData: dates.map((date, i) => ({
      date,
      value: health[i],
      label: `Health: ${health[i].toFixed(0)}%`
    })),
    productivityData: dates.map((date, i) => ({
      date,
      value: productivity[i],
      label: `Productivity: ${productivity[i].toFixed(2)}`
    }))
  };
};

// Calculate profit margin percentage
export const calculateProfitMargin = (revenue: number, expenses: number): number => {
  if (revenue === 0) return 0;
  return ((revenue - expenses) / revenue) * 100;
};

// Calculate ROI for different investments
export const calculateROI = (
  cost: number, 
  annualReturn: number
): { roi: number; yearsToBreakEven: number } => {
  const roi = (annualReturn / cost) * 100;
  const yearsToBreakEven = cost / annualReturn;
  
  return { roi, yearsToBreakEven };
};

// Generate a price fluctuation band
export const generatePriceFluctuationBand = (
  basePrice: number,
  fluctuationPercentage: number,
  days: number
): { 
  priceData: ChartDataPoint[]; 
  upperBand: ChartDataPoint[]; 
  lowerBand: ChartDataPoint[];
} => {
  const dates = Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - i - 1));
    return date;
  });
  
  // Generate random price within fluctuation limits
  const priceData = dates.map(date => {
    const randomFactor = 1 + (Math.random() * fluctuationPercentage * 2 - fluctuationPercentage);
    return {
      date,
      value: Math.round(basePrice * randomFactor)
    };
  });
  
  // Generate upper and lower bands
  const upperBand = dates.map(date => ({
    date,
    value: Math.round(basePrice * (1 + fluctuationPercentage))
  }));
  
  const lowerBand = dates.map(date => ({
    date,
    value: Math.round(basePrice * (1 - fluctuationPercentage))
  }));
  
  return { priceData, upperBand, lowerBand };
};

// Generate housing utilization data
export const generateHousingUtilization = (
  capacity: number,
  utilization: number,
  weeks: number
): { 
  capacityData: ChartDataPoint[];
  utilizationData: ChartDataPoint[];
} => {
  const dates = Array.from({ length: weeks }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (weeks - i - 1) * 7);
    return date;
  });
  
  // Capacity is constant
  const capacityData = dates.map(date => ({
    date,
    value: capacity
  }));
  
  // Utilization grows over time
  const utilizationData = dates.map((date, i) => ({
    date,
    value: Math.min(capacity, Math.round(utilization * (1 + i * 0.1)))
  }));
  
  return { capacityData, utilizationData };
};