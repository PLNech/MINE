'use client';

import { useState, useMemo, useEffect } from 'react';
import { useGameState } from '@/lib/context/GameContext';
import { DailyTransaction } from '@/lib/types/types';
import LineChart from '../charts/LineChart';
import BarChart from '../charts/BarChart';
import StackedBarChart from '../charts/StackedBarChart';
import PieChart from '../charts/PieChart';
import { 
  financialHistoryToChartData,
  treasuryHistoryToChartData,
  dailyTransactionsToRevenueData,
  dailyTransactionsToExpenseData,
  dailyTransactionsToStackedExpenseData,
  calculateProfitMargin,
  generateWorkerEfficiencyData
} from '@/lib/utils/StatsUtils';
import ClientOnly from '@/components/ClientOnly';
import { getRandomAnecdotes } from '@/lib/data/MiningAnecdotes';
import { miningAnecdotes } from '@/lib/data/MiningAnecdotes';
import { StackedChartDataPoint } from '../charts/ChartTypes';

export default function SalaryCeremony() {
  const { state, dispatch } = useGameState();
  const [activeTab, setActiveTab] = useState<'overview' | 'production' | 'workforce' | 'trends'>('overview');
  const [timeLeft, setTimeLeft] = useState(30);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Get the most recent financial record
  const latestRecord = state.financialHistory.length > 0 
    ? state.financialHistory[state.financialHistory.length - 1] 
    : null;
  
  // Get previous record for comparisons
  const previousRecord = state.financialHistory.length > 1 
    ? state.financialHistory[state.financialHistory.length - 2] 
    : null;
  
  // Get the last 7 daily transactions (current week)
  const currentWeekTransactions = state.dailyTransactions.filter(
    t => t.week === state.currentWeek - 1
  );
  
  // Get the previous week's transactions
  const previousWeekTransactions = state.dailyTransactions.filter(
    t => t.week === state.currentWeek - 2
  );
  
  // Calculate weekly totals
  const weeklyRevenue = currentWeekTransactions.reduce((sum, tx) => sum + tx.revenue, 0);
  const weeklyExpenses = currentWeekTransactions.reduce((sum, tx) => {
    return sum + tx.expenses.maintenance + 
      (tx.expenses.salaries || 0) + 
      (tx.expenses.upgrades || 0) + 
      (tx.expenses.construction || 0);
  }, 0);
  
  const weeklyProfit = weeklyRevenue - weeklyExpenses;
  const profitMargin = calculateProfitMargin(weeklyRevenue, weeklyExpenses);
  
    // Helper function to convert week and day to proper date
  const getDateFromWeekAndDay = (week: number, day: number = 1) => {
    // Start from game epoch (e.g., Jan 1, 1920)
    const baseDate = new Date(1920, 0, 1);
    const daysToAdd = (week - 1) * 7 + (day - 1);
    return new Date(baseDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  };

  // Date formatting helpers
  const formatDailyDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatWeeklyDate = (date: Date, weekNum: number) => {
    return `Week ${weekNum}`;
  };

  const formatMonthlyDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short',
      year: 'numeric'
    });
  };

  // Memoize chart data to avoid recalculations
  const chartData = useMemo(() => {
    // Financial history charts
    const profitHistory = state.financialHistory.map(record => ({
      date: getDateFromWeekAndDay(record.week),
      value: record.profit
    }));

    const treasuryHistory = state.financialHistory.map(record => ({
      date: getDateFromWeekAndDay(record.week),
      value: record.treasury
    }));
    
    // Daily transaction charts - ensure we have valid data
    const revenueData = currentWeekTransactions.length > 0 
      ? currentWeekTransactions.map(tx => ({
          date: getDateFromWeekAndDay(tx.week, tx.day),
          value: tx.revenue,
          label: formatDailyDate(getDateFromWeekAndDay(tx.week, tx.day))
        }))
      : Array(7).fill(0).map((_, i) => ({
          date: getDateFromWeekAndDay(state.currentWeek - 1, i + 1),
          value: state.todayRevenue,
          label: formatDailyDate(getDateFromWeekAndDay(state.currentWeek - 1, i + 1))
        }));
    
    const expenseData = currentWeekTransactions.length > 0
      ? currentWeekTransactions.map(tx => {
          const totalExpenses = tx.expenses.maintenance + 
            (tx.expenses.salaries || 0) + 
            (tx.expenses.upgrades || 0) + 
            (tx.expenses.construction || 0);
          return {
            date: getDateFromWeekAndDay(tx.week, tx.day),
            value: totalExpenses
          };
        })
      : Array(7).fill(0).map((_, i) => ({
          date: getDateFromWeekAndDay(state.currentWeek - 1, i + 1),
          value: 0
        }));
    
    // Stacked expense data with fallback
    const stackedExpenseData: StackedChartDataPoint[] = currentWeekTransactions.length > 0
      ? currentWeekTransactions.map(tx => ({
          date: getDateFromWeekAndDay(tx.week, tx.day),
          value: tx.expenses.maintenance + 
                 (tx.expenses.salaries || 0) + 
                 (tx.expenses.upgrades || 0) + 
                 (tx.expenses.construction || 0),
          categories: {
            Maintenance: tx.expenses.maintenance,
            Salaries: tx.expenses.salaries || 0,
            Upgrades: tx.expenses.upgrades || 0,
            Construction: tx.expenses.construction || 0,
          }
        }))
      : Array(7).fill(0).map((_, i) => ({
          date: getDateFromWeekAndDay(state.currentWeek - 1, i + 1),
          value: 0,
          categories: {
            Maintenance: 0,
            Salaries: 0,
            Upgrades: 0,
            Construction: 0,
          }
        }));
    // Expense breakdown for pie chart - ensure we have data
    const expenseBreakdown = [
      { 
        label: 'Maintenance', 
        value: currentWeekTransactions.reduce((sum, tx) => sum + tx.expenses.maintenance, 0),
        color: '#d97706'
      },
      { 
        label: 'Salaries', 
        value: currentWeekTransactions.reduce((sum, tx) => sum + (tx.expenses.salaries || 0), 0),
        color: '#f59e0b'
      },
      { 
        label: 'Upgrades', 
        value: currentWeekTransactions.reduce((sum, tx) => sum + (tx.expenses.upgrades || 0), 0),
        color: '#fbbf24'
      },
      { 
        label: 'Construction', 
        value: currentWeekTransactions.reduce((sum, tx) => sum + (tx.expenses.construction || 0), 0),
        color: '#fcd34d'
      }
    ].filter(item => item.value > 0); // Remove zero items
    
    // If all expenses are zero, add a placeholder
    if (expenseBreakdown.length === 0) {
      expenseBreakdown.push({
        label: 'No Expenses', 
        value: 1,
        color: '#d1d5db'
      });
    }
    
    // Production data with fallback
    const productionData = currentWeekTransactions.length > 0
      ? currentWeekTransactions.map(tx => ({
        date: getDateFromWeekAndDay(tx.week, tx.day),
        value: tx.mineralExtraction,
        label: formatDailyDate(getDateFromWeekAndDay(tx.week, tx.day))
      }))
      : Array(7).fill(0).map((_, i) => ({
        date: getDateFromWeekAndDay(state.currentWeek - 1, i + 1),
        value: state.todayExtraction,
        label: formatDailyDate(getDateFromWeekAndDay(state.currentWeek - 1, i + 1))
      }));
    
    // Generate historical data for time period tabs
    // Last week (already have), month (4 weeks), year (52 weeks)
    // For week/month/year satisfaction and efficiency tabs
    const generateTimeSeriesData = (weeks: number, metricFn: (record: any) => number): TimeSeriesDataPoint[] => {
      const result: TimeSeriesDataPoint[] = [];
      const currentWeek = state.currentWeek;
      
      for (let i = 0; i < weeks; i++) {
        const weekNumber = currentWeek - i - 1;
        if (weekNumber <= 0) break;
        
        // Find financial record for this week
        const record = state.financialHistory.find(r => r.week === weekNumber);
        
        if (record) {
          result.push({
            date: getDateFromWeekAndDay(weekNumber),
            weekNumber,
            value: metricFn(record),
            label: `Week ${weekNumber}`
          });
        }
      }
      
      // Reverse to get chronological order
      return result.reverse();
    };
    
    // Generate worker satisfaction data for different time periods
    const satisfactionWeek = generateTimeSeriesData(1, r => r.workerSatisfaction);
    const satisfactionMonth = generateTimeSeriesData(4, r => r.workerSatisfaction);
    const satisfactionYear = generateTimeSeriesData(52, r => r.workerSatisfaction);
    
    // Generate productivity/efficiency data for different time periods
    const productivityWeek = generateTimeSeriesData(1, r => 
      (0.5 + (r.workerSatisfaction * 0.25) / 100 + (r.workerHealth * 0.25) / 100)
    );
    const productivityMonth = generateTimeSeriesData(4, r => 
      (0.5 + (r.workerSatisfaction * 0.25) / 100 + (r.workerHealth * 0.25) / 100)
    );
    const productivityYear = generateTimeSeriesData(52, r => 
      (0.5 + (r.workerSatisfaction * 0.25) / 100 + (r.workerHealth * 0.25) / 100)
    );
    
    // Industry average production with proper dates
    const industryAvgProduction = productionData.map(d => ({
      date: d.date, // Use the same dates as production data
      value: Math.max(10, d.value * 0.8 + Math.random() * 10)
    }));
    
    // Calculate production capacity utilization
    const mine = state.buildings.find(b => b.type === 'Mine');
    const maxCapacity = mine ? mine.workerCapacity : 0;
    const utilizationPercentage = mine && maxCapacity > 0 ? (mine.assignedWorkers / maxCapacity) * 100 : 0;
    
    const capacityUtilization = [
      { label: 'Utilized', value: utilizationPercentage, color: '#65a30d' },
      { label: 'Unused', value: 100 - utilizationPercentage, color: '#d1d5db' }
    ];
    
    // Return all chart data
    return {
      profitHistory,
      treasuryHistory,
      revenueData,
      expenseData,
      stackedExpenseData,
      expenseBreakdown,
      productionData,
      industryAvgProduction,
      capacityUtilization,
      satisfactionData: {
        week: satisfactionWeek,
        month: satisfactionMonth,
        year: satisfactionYear
      },
      productivityData: {
        week: productivityWeek,
        month: productivityMonth,
        year: productivityYear
      }
    };
  }, [state.financialHistory, currentWeekTransactions, state.workerSatisfaction, state.workerHealth, state.buildings, state.currentWeek, state.todayRevenue, state.todayExtraction]);
  
  // Add new state for time period tabs
  const [productivityTimePeriod, setProductivityTimePeriod] = useState<'week' | 'month' | 'year'>('week');
  const [satisfactionTimePeriod, setSatisfactionTimePeriod] = useState<'week' | 'month' | 'year'>('week');
  
  // Improve the getPercentChange helper to handle more edge cases
  const getPercentChange = (current: number, previous: number | undefined): string => {
    if (previous === undefined || previous === 0) {
      if (current === 0) return "0%";
      return "+∞%"; // Infinity symbol for division by zero
    }
    
    const percentChange = ((current - previous) / Math.abs(previous) * 100);
    if (isNaN(percentChange)) return "N/A";
    
    return (percentChange > 0 ? "+" : "") + percentChange.toFixed(1) + "%"; 
  };
  
  // Helper to format percentages with 2 decimal places
  const formatPercent = (value: number): string => {
    if (isNaN(value)) return "0.00%";
    return value.toFixed(2) + "%";
  };
  
  // Reset timer function
  const resetTimer = () => {
    console.log('Timer reset to 30s');
    setTimeLeft(30);
  };

  // Handle close
  const handleClose = () => {
    console.log('Attempting to close ceremony, current isCeremonyActive:', state.isCeremonyActive);
    dispatch({ type: 'CLOSE_CEREMONY' });
    console.log('Ceremony close dispatched');
  };

  // Modified auto-close effect
  useEffect(() => {
    console.log('Timer effect running, time left:', timeLeft, 'isCeremonyActive:', state.isCeremonyActive);
    
    if (timeLeft <= 0) {
      console.log('Timer reached 0, closing ceremony');
      handleClose();
      return;
    }

    const timer = setTimeout(() => {
      console.log('Decreasing timer from', timeLeft);
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => {
      console.log('Cleaning up timer');
      clearTimeout(timer);
    };
  }, [timeLeft]);

  // Debug component to show state
  const DebugInfo = () => {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className="fixed top-0 right-0 bg-black/50 text-white p-2 text-xs z-[60]">
          Time Left: {timeLeft}s<br />
          Ceremony Active: {state.isCeremonyActive ? 'Yes' : 'No'}<br />
          Last Action: CLOSE_CEREMONY
        </div>
      );
    }
    return null;
  };

  // Modify tab click handler to reset timer
  const handleTabClick = (tab: 'overview' | 'production' | 'workforce' | 'trends') => {
    setActiveTab(tab);
    resetTimer();
  };


  // Helper to determine change style with better handling of edge cases
  const getChangeStyle = (current: number, previous: number | undefined, inverseColors = false): string => {
    if (previous === undefined || isNaN(current) || isNaN(previous)) return "text-amber-700";
    
    if (current === previous) return "text-amber-700";
    
    const isPositive = current > previous;
    // For costs, higher is worse, so invert the color logic if inverseColors is true
    const positiveIsGood = !inverseColors;
    
    // Return appropriate color class
    if (isPositive === positiveIsGood) {
      return current === 0 ? "text-amber-700" : "text-green-600";
    } else {
      return current === 0 ? "text-amber-700" : "text-red-600";
    }
  };


  // Select one random anecdote for each tab
  const [weeklyAnecdotes] = useState(() => {
    const anecdotes = {
      overview: getRandomAnecdotes(1)[0],
      production: getRandomAnecdotes(1)[0],
      workforce: getRandomAnecdotes(1)[0],
      trends: getRandomAnecdotes(1)[0],
    };
    return anecdotes;
  });

  return (
    <ClientOnly>
      <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
        <DebugInfo />
        <div className="bg-amber-50 rounded-lg shadow-xl max-w-6xl w-full my-8 flex flex-col max-h-[calc(100vh-8rem)]">
          <div className="overflow-y-auto flex-1">
            <div className="p-6 border-b border-amber-200">
              <h2 className="text-2xl font-bold text-amber-900">Weekly Financial Summary</h2>
              <p className="text-amber-700">Week {state.currentWeek - 1} Report</p>
            </div>
            
            {/* Tab navigation */}
            <div className="flex border-b border-amber-200">
              <button 
                className={`px-4 py-2 ${activeTab === 'overview' ? 'bg-amber-100 border-b-2 border-amber-600' : ''}`}
                onClick={() => handleTabClick('overview')}
              >
                Overview
              </button>
              <button 
                className={`px-4 py-2 ${activeTab === 'production' ? 'bg-amber-100 border-b-2 border-amber-600' : ''}`}
                onClick={() => handleTabClick('production')}
              >
                Production
              </button>
              <button 
                className={`px-4 py-2 ${activeTab === 'workforce' ? 'bg-amber-100 border-b-2 border-amber-600' : ''}`}
                onClick={() => handleTabClick('workforce')}
              >
                Workforce
              </button>
              <button 
                className={`px-4 py-2 ${activeTab === 'trends' ? 'bg-amber-100 border-b-2 border-amber-600' : ''}`}
                onClick={() => handleTabClick('trends')}
              >
                Trends
              </button>
            </div>
            
            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div>
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="bg-amber-100 p-4 rounded-md">
                      <h3 className="text-lg font-bold text-amber-900 mb-3">Profit & Loss</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-amber-800">Total Revenue:</span>
                          <span className="font-medium">{formatCurrency(weeklyRevenue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-amber-800">Total Expenses:</span>
                          <span className="font-medium text-red-600">-{formatCurrency(weeklyExpenses)}</span>
                        </div>
                        <div className="border-t border-amber-200 pt-2 flex justify-between font-bold">
                          <span className="text-amber-900">Net Profit:</span>
                          <span className={weeklyProfit >= 0 ? "text-green-600" : "text-red-600"}>
                            {formatCurrency(weeklyProfit)}
                          </span>
                        </div>
                        
                        <div className="text-sm mt-1">
                          <span className="text-amber-800">Profit Margin:</span>
                          <span className={`float-right ${profitMargin >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {profitMargin.toFixed(1)}%
                          </span>
                        </div>
                        
                        {previousRecord && (
                          <div className="text-xs mt-2">
                            <span className={getChangeStyle(weeklyProfit, previousRecord.profit)}>
                              {getPercentChange(weeklyProfit, previousRecord.profit)} from last week
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-6">
                        <h4 className="font-medium text-amber-800 mb-2">Weekly Expense Breakdown</h4>
                        <div className="h-64">
                          <PieChart 
                            data={chartData.expenseBreakdown} 
                            height={200} 
                            width={300}
                            tooltipFormatter={formatCurrency}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="bg-amber-100 p-4 rounded-md mb-4">
                        <h3 className="text-lg font-bold text-amber-900 mb-3">Treasury</h3>
                        <div className="text-center mb-3">
                          <div className="text-3xl font-bold text-amber-900">
                            {formatCurrency(state.treasury)}
                          </div>
                          
                          {previousRecord && (
                            <div className={`text-sm ${getChangeStyle(state.treasury, previousRecord.treasury)}`}>
                              {getPercentChange(state.treasury, previousRecord.treasury)} from last week
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-2">
                          <h4 className="font-medium text-amber-800 mb-2">Treasury Balance Trend</h4>
                          <LineChart 
                            data={chartData.treasuryHistory}
                            width={300}
                            height={160}
                            tooltipFormatter={formatCurrency}
                          />
                        </div>
                      </div>
                      
                      <div className="bg-amber-100 p-4 rounded-md">
                        <h3 className="text-lg font-bold text-amber-900 mb-3">Weekly Income vs Expenses</h3>
                        <StackedBarChart 
                          data={chartData.stackedExpenseData}
                          categories={['Maintenance', 'Salaries', 'Upgrades', 'Construction']}
                          width={300}
                          height={200}
                          tooltipFormatter={formatCurrency}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-amber-100 p-4 rounded-md mb-6">
                    <h3 className="text-lg font-bold text-amber-900 mb-3">Daily Performance</h3>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-amber-800 mb-2">Daily Revenue</h4>
                        <BarChart 
                          data={chartData.revenueData}
                          width={400}
                          height={200}
                          tooltipFormatter={formatCurrency}
                          xAxisFormatter={formatDailyDate}
                        />
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-amber-800 mb-2">Daily Production</h4>
                        <BarChart 
                          data={chartData.productionData}
                          width={400}
                          height={200}
                          tooltipFormatter={(v) => `${v.toFixed(1)} tons`}
                          xAxisFormatter={formatDailyDate}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-amber-100 p-3 rounded-md">
                      <div className="text-sm text-amber-800">Mineral Production</div>
                      <div className="text-xl font-bold text-amber-900">
                        {latestRecord 
                          ? `${latestRecord.mineralExtraction.toFixed(0)} tons`
                          : "No data"}
                      </div>
                      
                      {previousRecord && (
                        <div className="text-xs mt-1">
                          <span className={getChangeStyle(
                            latestRecord?.mineralExtraction || 0,
                            previousRecord.mineralExtraction
                          )}>
                            {getPercentChange(
                              latestRecord?.mineralExtraction || 0,
                              previousRecord.mineralExtraction
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-amber-100 p-3 rounded-md">
                      <div className="text-sm text-amber-800">Average Mineral Price</div>
                      <div className="text-xl font-bold text-amber-900">
                        {formatCurrency(state.currentMineralPrice)}/ton
                      </div>
                      
                      {previousRecord && (
                        <div className="text-xs mt-1">
                          <span className={getChangeStyle(
                            state.currentMineralPrice,
                            previousRecord.mineralPrice || 0
                          )}>
                            {getPercentChange(
                              state.currentMineralPrice,
                              previousRecord.mineralPrice || 0
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-amber-100 p-3 rounded-md">
                      <div className="text-sm text-amber-800">Profit per Worker</div>
                      <div className="text-xl font-bold text-amber-900">
                        {state.workerCount > 0 && weeklyProfit !== 0
                          ? formatCurrency(weeklyProfit / state.workerCount)
                          : formatCurrency(state.weeklyRevenue / Math.max(1, state.workerCount))}
                      </div>
                      
                      {previousRecord && (
                        <div className="text-xs mt-1">
                          <span className={getChangeStyle(
                            weeklyProfit / Math.max(1, state.workerCount),
                            previousRecord.workerCount > 0 
                              ? previousRecord.profit / previousRecord.workerCount 
                              : 0
                          )}>
                            {getPercentChange(
                              weeklyProfit / Math.max(1, state.workerCount),
                              previousRecord.workerCount > 0 
                                ? previousRecord.profit / previousRecord.workerCount 
                                : 0
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-amber-100/50 p-4 rounded-md mt-6 border border-amber-200">
                    <h3 className="text-lg font-bold text-amber-900 mb-3">Weekly Mining Musings</h3>
                    <div className="text-amber-800 italic">
                      <p className="mb-1">{weeklyAnecdotes.overview.quote}</p>
                      {weeklyAnecdotes.overview.attribution && (
                        <p className="text-sm text-amber-700">{weeklyAnecdotes.overview.attribution}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Production Tab */}
              {activeTab === 'production' && (
                <div>
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="bg-amber-100 p-4 rounded-md">
                      <h3 className="text-lg font-bold text-amber-900 mb-3">Production Efficiency</h3>
                      
                      {/* Add time period tabs */}
                      <div className="flex border-b border-amber-200 mb-4">
                        <button 
                          className={`px-3 py-1 text-sm ${productivityTimePeriod === 'week' ? 'bg-amber-50 border-b-2 border-amber-600' : ''}`}
                          onClick={() => {
                            setProductivityTimePeriod('week');
                            resetTimer();
                          }}
                        >
                          Last Week
                        </button>
                        <button 
                          className={`px-3 py-1 text-sm ${productivityTimePeriod === 'month' ? 'bg-amber-50 border-b-2 border-amber-600' : ''}`}
                          onClick={() => {
                            setProductivityTimePeriod('month');
                            resetTimer();
                          }}
                        >
                          Last Month
                        </button>
                        <button 
                          className={`px-3 py-1 text-sm ${productivityTimePeriod === 'year' ? 'bg-amber-50 border-b-2 border-amber-600' : ''}`}
                          onClick={() => {
                            setProductivityTimePeriod('year');
                            resetTimer();
                          }}
                        >
                          Last Year
                        </button>
                      </div>
                      
                      <div className="mb-4">
                        <LineChart 
                          data={chartData.productivityData[productivityTimePeriod]}
                          width={400}
                          height={200}
                          title="Worker Productivity"
                          yLabel="Efficiency"
                          tooltipFormatter={(v) => `${v.toFixed(2)}x`}
                          xAxisFormatter={productivityTimePeriod === 'year' 
                            ? formatMonthlyDate 
                            : (date: Date) => formatWeeklyDate(date, Math.floor(date.getTime() / (7 * 24 * 60 * 60 * 1000)) + 1)}
                        />
                      </div>
                      
                      <div className="text-sm p-3 bg-amber-50 rounded-md">
                        <p className="text-amber-800 mb-2">
                          <strong>Worker Productivity Analysis:</strong> Your workforce's productivity is affected by both satisfaction and health metrics.
                        </p>
                        <p className="text-amber-800">
                          Current productivity multiplier: <span className="font-medium">{
                            (0.5 + (state.workerSatisfaction * 0.25) / 100 + (state.workerHealth * 0.25) / 100).toFixed(2)
                          }x</span>
                        </p>
                        <p className="text-xs text-amber-700 mt-2">
                          Each worker produces {(state.baseProductionPerWorker * 
                            (0.5 + (state.workerSatisfaction * 0.25) / 100 + (state.workerHealth * 0.25) / 100)).toFixed(1)} tons per day.
                        </p>
                      </div>
                    </div>
                    <div className="bg-amber-100 p-4 rounded-md">
                      <h3 className="text-lg font-bold text-amber-900 mb-3">Production vs Industry Average</h3>
                      <div className="mb-4">
                        <LineChart 
                          data={[...chartData.productionData, ...chartData.industryAvgProduction]}
                          width={400}
                          height={200}
                          title="Daily Production Comparison"
                          yLabel="Tons"
                          tooltipFormatter={(v) => `${v.toFixed(1)} tons`}
                        />
                      </div>
                      
                      <div className="text-sm p-3 bg-amber-50 rounded-md">
                        <p className="text-amber-800 mb-2">
                          <strong>Competitive Analysis:</strong> Your production is currently {
                            currentWeekTransactions.length > 0 
                              ? chartData.productionData.reduce((sum, d) => sum + d.value, 0).toFixed(1)
                              : "0.0"
                          } tons, compared to the industry average of {
                            chartData.industryAvgProduction.reduce((sum, d) => sum + d.value, 0).toFixed(1)
                          } tons.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-amber-100/50 p-4 rounded-md mt-6 border border-amber-200">
                    <h3 className="text-lg font-bold text-amber-900 mb-3">Weekly Mining Musings</h3>
                    <div className="text-amber-800 italic">
                      <p className="mb-1">{weeklyAnecdotes.production.quote}</p>
                      {weeklyAnecdotes.production.attribution && (
                        <p className="text-sm text-amber-700">{weeklyAnecdotes.production.attribution}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Workforce Tab */}
              {activeTab === 'workforce' && (
                <div>
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="bg-amber-100 p-4 rounded-md">
                      <h3 className="text-lg font-bold text-amber-900 mb-3">Worker Satisfaction</h3>
                      
                      {/* Add time period tabs */}
                      <div className="flex border-b border-amber-200 mb-4">
                        <button 
                          className={`px-3 py-1 text-sm ${satisfactionTimePeriod === 'week' ? 'bg-amber-50 border-b-2 border-amber-600' : ''}`}
                          onClick={() => {
                            setSatisfactionTimePeriod('week');
                            resetTimer();
                          }}
                        >
                          Last Week
                        </button>
                        <button 
                          className={`px-3 py-1 text-sm ${satisfactionTimePeriod === 'month' ? 'bg-amber-50 border-b-2 border-amber-600' : ''}`}
                          onClick={() => {
                            setSatisfactionTimePeriod('month');
                            resetTimer();
                          }}
                        >
                          Last Month
                        </button>
                        <button 
                          className={`px-3 py-1 text-sm ${satisfactionTimePeriod === 'year' ? 'bg-amber-50 border-b-2 border-amber-600' : ''}`}
                          onClick={() => {
                            setSatisfactionTimePeriod('year');
                            resetTimer();
                          }}
                        >
                          Last Year
                        </button>
                      </div>
                      
                      <div className="mb-4">
                        <LineChart 
                          data={chartData.satisfactionData[satisfactionTimePeriod]}
                          width={400}
                          height={200}
                          title="Worker Satisfaction"
                          yLabel="Satisfaction"
                        />
                      </div>
                      <div className="text-sm p-3 bg-amber-50 rounded-md">
                        <p className="text-amber-800 mb-2">
                          <strong>Satisfaction Impact:</strong> Worker satisfaction directly affects productivity.
                        </p>
                        <p className="text-amber-800">
                          Current satisfaction multiplier: <span className="font-medium">{
                            (0.5 + (state.workerSatisfaction * 0.25) / 100).toFixed(2)
                          }x</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-amber-100/50 p-4 rounded-md mt-6 border border-amber-200">
                    <h3 className="text-lg font-bold text-amber-900 mb-3">Weekly Mining Musings</h3>
                    <div className="text-amber-800 italic">
                      <p className="mb-1">{weeklyAnecdotes.workforce.quote}</p>
                      {weeklyAnecdotes.workforce.attribution && (
                        <p className="text-sm text-amber-700">{weeklyAnecdotes.workforce.attribution}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Trends Tab */}
              {activeTab === 'trends' && (
                <div>
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="bg-amber-100 p-4 rounded-md">
                      <h3 className="text-lg font-bold text-amber-900 mb-3">Profit & Loss Trends</h3>
                      <div className="mb-4">
                        <LineChart 
                          data={chartData.profitHistory}
                          width={400}
                          height={200}
                          title="Profit & Loss"
                          yLabel="USD"
                          tooltipFormatter={formatCurrency}
                        />
                      </div>
                      <div className="text-sm p-3 bg-amber-50 rounded-md">
                        <p className="text-amber-800 mb-2">
                          <strong>Financial Performance:</strong> Track your profit and loss over time. 
                        </p>
                        <p className="text-amber-800">
                          Current profit margin: <span className="font-medium">{
                            latestRecord && latestRecord.revenue > 0 
                              ? formatPercent((latestRecord.profit / latestRecord.revenue) * 100)
                              : "0.00%"
                          }</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-amber-100/50 p-4 rounded-md mt-6 border border-amber-200">
                    <h3 className="text-lg font-bold text-amber-900 mb-3">Weekly Mining Musings</h3>
                    <div className="text-amber-800 italic">
                      <p className="mb-1">{weeklyAnecdotes.trends.quote}</p>
                      {weeklyAnecdotes.trends.attribution && (
                        <p className="text-sm text-amber-700">{weeklyAnecdotes.trends.attribution}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="sticky bottom-0 w-full bg-amber-100 p-4 border-t border-amber-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-amber-800">
                Closing in {timeLeft} seconds...
              </span>
              <button 
                onClick={() => dispatch({ type: 'CLOSE_CEREMONY' })}
                className="text-sm text-amber-800 hover:text-amber-900 underline"
              >
                Close Now
              </button>
            </div>
            <div className="h-2 bg-amber-200 rounded-full">
              <div 
                className="h-full bg-amber-600 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${Math.max(0, (timeLeft / 10) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </ClientOnly>
  );
}
