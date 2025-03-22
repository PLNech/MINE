'use client';

import { useState, useMemo } from 'react';
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

export default function SalaryCeremony() {
  const { state, dispatch } = useGameState();
  const [activeTab, setActiveTab] = useState<'overview' | 'production' | 'workforce' | 'trends'>('overview');
  
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
  
  // Memoize chart data to avoid recalculations
  const chartData = useMemo(() => {
    // Financial history charts
    const profitHistory = financialHistoryToChartData(state.financialHistory);
    const treasuryHistory = treasuryHistoryToChartData(state.financialHistory);
    
    // Daily transaction charts
    const revenueData = dailyTransactionsToRevenueData(currentWeekTransactions);
    const expenseData = dailyTransactionsToExpenseData(currentWeekTransactions);
    const stackedExpenseData = dailyTransactionsToStackedExpenseData(currentWeekTransactions);
    
    // Expense breakdown for pie chart
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
    
    // Production data
    const productionData = currentWeekTransactions.map(tx => ({
      date: new Date(tx.week * 7 + tx.day - 1),
      value: tx.mineralExtraction
    }));
    
    // Worker efficiency data
    const mockSatisfaction = Array.from({ length: 8 }, (_, i) => 
      Math.min(100, Math.max(40, state.workerSatisfaction - 5 + i * 2 + Math.random() * 5))
    );
    const mockHealth = Array.from({ length: 8 }, (_, i) => 
      Math.min(100, Math.max(40, state.workerHealth - 3 + i * 1 + Math.random() * 5))
    );
    const mockProductivity = mockSatisfaction.map((s, i) => 
      (0.5 + (s * 0.25) / 100 + (mockHealth[i] * 0.25) / 100)
    );
    
    const efficiencyData = generateWorkerEfficiencyData(
      mockSatisfaction, mockHealth, mockProductivity
    );
    
    // Fictional industry average
    const industryAvgProduction = productionData.map(d => ({
      ...d,
      value: d.value * 0.8 + Math.random() * 10 // 80% of player's production + noise
    }));
    
    // Calculate production capacity utilization
    const mine = state.buildings.find(b => b.type === 'Mine');
    const maxCapacity = mine ? mine.workerCapacity : 0;
    const utilizationPercentage = mine ? (mine.assignedWorkers / maxCapacity) * 100 : 0;
    
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
      workerEfficiency: efficiencyData
    };
  }, [state.financialHistory, currentWeekTransactions, state.workerSatisfaction, state.workerHealth, state.buildings]);
  
  // Helper function for percentage changes
  const getPercentChange = (current: number, previous: number | undefined): string => {
    if (previous === undefined || previous === 0) return "+0%";
    
    const percentChange = ((current - previous) / Math.abs(previous) * 100);
    return (percentChange > 0 ? "+" : "") + percentChange.toFixed(1) + "%"; 
  };
  
  // Helper to determine change style
  const getChangeStyle = (current: number, previous: number | undefined, inverseColors = false): string => {
    if (previous === undefined) return "text-amber-700";
    
    const isPositive = current > previous;
    // For costs, higher is worse, so invert the color logic if inverseColors is true
    const positiveIsGood = !inverseColors;
    
    if (current === previous) return "text-amber-700";
    return (isPositive === positiveIsGood) ? "text-green-600" : "text-red-600";
  };
  
  return (
    <ClientOnly>
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 overflow-y-auto py-8">
        <div className="bg-amber-50 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-amber-200">
            <h2 className="text-2xl font-bold text-amber-900">Weekly Financial Summary</h2>
            <p className="text-amber-700">Week {state.currentWeek - 1} Report</p>
          </div>
          
          {/* Tab navigation */}
          <div className="flex border-b border-amber-200">
            <button 
              className={`px-4 py-2 ${activeTab === 'overview' ? 'bg-amber-100 border-b-2 border-amber-600' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`px-4 py-2 ${activeTab === 'production' ? 'bg-amber-100 border-b-2 border-amber-600' : ''}`}
              onClick={() => setActiveTab('production')}
            >
              Production
            </button>
            <button 
              className={`px-4 py-2 ${activeTab === 'workforce' ? 'bg-amber-100 border-b-2 border-amber-600' : ''}`}
              onClick={() => setActiveTab('workforce')}
            >
              Workforce
            </button>
            <button 
              className={`px-4 py-2 ${activeTab === 'trends' ? 'bg-amber-100 border-b-2 border-amber-600' : ''}`}
              onClick={() => setActiveTab('trends')}
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
                      />
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-amber-800 mb-2">Daily Production</h4>
                      <BarChart 
                        data={chartData.productionData}
                        width={400}
                        height={200}
                        tooltipFormatter={(v) => `${v.toFixed(1)} tons`}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-amber-100 p-3 rounded-md">
                    <div className="text-sm text-amber-800">Mineral Production</div>
                    <div className="text-xl font-bold text-amber-900">
                      {currentWeekTransactions.reduce((sum, tx) => sum + tx.mineralExtraction, 0).toFixed(0)} tons
                    </div>
                    
                    {previousWeekTransactions.length > 0 && (
                      <div className="text-xs mt-1">
                        <span className={getChangeStyle(
                          currentWeekTransactions.reduce((sum, tx) => sum + tx.mineralExtraction, 0),
                          previousWeekTransactions.reduce((sum, tx) => sum + tx.mineralExtraction, 0)
                        )}>
                          {getPercentChange(
                            currentWeekTransactions.reduce((sum, tx) => sum + tx.mineralExtraction, 0),
                            previousWeekTransactions.reduce((sum, tx) => sum + tx.mineralExtraction, 0)
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-amber-100 p-3 rounded-md">
                    <div className="text-sm text-amber-800">Average Mineral Price</div>
                    <div className="text-xl font-bold text-amber-900">
                      {formatCurrency(
                        currentWeekTransactions.reduce((sum, tx) => sum + tx.mineralPrice, 0) / 
                        Math.max(1, currentWeekTransactions.length)
                      )}/ton
                    </div>
                    
                    {previousWeekTransactions.length > 0 && (
                      <div className="text-xs mt-1">
                        <span className={getChangeStyle(
                          currentWeekTransactions.reduce((sum, tx) => sum + tx.mineralPrice, 0) / currentWeekTransactions.length,
                          previousWeekTransactions.reduce((sum, tx) => sum + tx.mineralPrice, 0) / previousWeekTransactions.length
                        )}>
                          {getPercentChange(
                            currentWeekTransactions.reduce((sum, tx) => sum + tx.mineralPrice, 0) / currentWeekTransactions.length,
                            previousWeekTransactions.reduce((sum, tx) => sum + tx.mineralPrice, 0) / previousWeekTransactions.length
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-amber-100 p-3 rounded-md">
                    <div className="text-sm text-amber-800">Profit per Worker</div>
                    <div className="text-xl font-bold text-amber-900">
                      {state.workerCount > 0 
                        ? formatCurrency(weeklyProfit / state.workerCount) 
                        : formatCurrency(0)}
                    </div>
                    
                    {previousRecord && previousRecord.workerCount > 0 && (
                      <div className="text-xs mt-1">
                        <span className={getChangeStyle(
                          weeklyProfit / state.workerCount,
                          previousRecord.profit / previousRecord.workerCount
                        )}>
                          {getPercentChange(
                            weeklyProfit / state.workerCount,
                            previousRecord.profit / previousRecord.workerCount
                          )}
                        </span>
                      </div>
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
                    <div className="mb-4">
                      <LineChart 
                        data={chartData.workerEfficiency.productivityData}
                        width={400}
                        height={200}
                        title="Worker Productivity"
                        yLabel="Efficiency"
                        tooltipFormatter={(v) => `${v.toFixed(2)}x`}
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
                          chartData.productionData.reduce((sum, d) => sum + d.value, 0).toFixed(1)
                        } tons, compared to the industry average of {
                          chartData.industryAvgProduction.reduce((sum, d) => sum + d.value, 0).toFixed(1)
                        } tons.
                      </p>
                    </div>
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
                    <div className="mb-4">
                      <LineChart 
                        data={chartData.workerEfficiency.satisfactionData}
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
                          (latestRecord?.profit || 0) / (latestRecord?.revenue || 1)
                        }%</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ClientOnly>
  );
}
