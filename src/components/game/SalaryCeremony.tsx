'use client';

import { useGameState } from '@/lib/context/GameContext';

export default function SalaryCeremony() {
  const { state, dispatch } = useGameState();
  
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
    
  // Helper function to determine change description and style
  const getChangeInfo = (current: number, previous: number | undefined) => {
    if (previous === undefined) return { text: 'No change', style: 'text-amber-700' };
    
    const diff = current - previous;
    const percent = previous !== 0 ? Math.abs(Math.round((diff / previous) * 100)) : 100;
    
    if (diff > 0) {
      return {
        text: `↑ Increased by ${percent}%`,
        style: 'text-green-600'
      };
    } else if (diff < 0) {
      return {
        text: `↓ Decreased by ${percent}%`,
        style: 'text-red-600'
      };
    } else {
      return {
        text: 'No change',
        style: 'text-amber-700'
      };
    }
  };
  
  const previousRecord = state.financialHistory.length > 1 
    ? state.financialHistory[state.financialHistory.length - 2] 
    : null;
    
  const revenueChange = getChangeInfo(
    latestRecord?.revenue || 0, 
    previousRecord?.revenue
  );
  
  const expensesChange = getChangeInfo(
    latestRecord?.expenses || 0, 
    previousRecord?.expenses
  );
  
  const profitChange = getChangeInfo(
    (latestRecord?.revenue || 0) - (latestRecord?.expenses || 0),
    previousRecord ? previousRecord.revenue - previousRecord.expenses : undefined
  );
  
  const workerChange = getChangeInfo(
    latestRecord?.workerCount || 0,
    previousRecord?.workerCount
  );
  
  const healthChange = getChangeInfo(
    latestRecord?.workerHealth || 0,
    previousRecord?.workerHealth
  );
  
  const satisfactionChange = getChangeInfo(
    latestRecord?.workerSatisfaction || 0,
    previousRecord?.workerSatisfaction
  );
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-amber-50 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-amber-200">
          <h2 className="text-2xl font-bold text-amber-900 text-center">
            Weekly Salary Ceremony
          </h2>
          <p className="text-center text-amber-700 mt-1">
            Week {state.currentWeek - 1} Summary
          </p>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-amber-900 mb-3">Financial Overview</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-amber-100 p-3 rounded-md">
                <p className="text-sm text-amber-800">Weekly Revenue</p>
                <p className="text-xl font-bold text-amber-900">
                  {formatCurrency(latestRecord?.revenue || 0)}
                </p>
                <p className={`text-xs ${revenueChange.style}`}>{revenueChange.text}</p>
              </div>
              
              <div className="bg-amber-100 p-3 rounded-md">
                <p className="text-sm text-amber-800">Weekly Expenses</p>
                <p className="text-xl font-bold text-amber-900">
                  {formatCurrency(latestRecord?.expenses || 0)}
                </p>
                <p className={`text-xs ${expensesChange.style}`}>{expensesChange.text}</p>
              </div>
              
              <div className="bg-amber-100 p-3 rounded-md col-span-2">
                <p className="text-sm text-amber-800">Weekly Profit</p>
                <p className={`text-xl font-bold ${(latestRecord?.revenue || 0) - (latestRecord?.expenses || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency((latestRecord?.revenue || 0) - (latestRecord?.expenses || 0))}
                </p>
                <p className={`text-xs ${profitChange.style}`}>{profitChange.text}</p>
              </div>
              
              <div className="bg-amber-100 p-3 rounded-md col-span-2">
                <p className="text-sm text-amber-800">Treasury Balance</p>
                <p className="text-xl font-bold text-amber-900">
                  {formatCurrency(state.treasury)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-xl font-bold text-amber-900 mb-3">Workforce Status</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-amber-100 p-3 rounded-md">
                <p className="text-sm text-amber-800">Workers</p>
                <p className="text-xl font-bold text-amber-900">
                  {latestRecord?.workerCount || 0}
                </p>
                <p className={`text-xs ${workerChange.style}`}>{workerChange.text}</p>
              </div>
              
              <div className="bg-amber-100 p-3 rounded-md">
                <p className="text-sm text-amber-800">Health</p>
                <p className="text-xl font-bold text-amber-900">
                  {latestRecord?.workerHealth.toFixed(0) || 0}%
                </p>
                <p className={`text-xs ${healthChange.style}`}>{healthChange.text}</p>
              </div>
              
              <div className="bg-amber-100 p-3 rounded-md">
                <p className="text-sm text-amber-800">Satisfaction</p>
                <p className="text-xl font-bold text-amber-900">
                  {latestRecord?.workerSatisfaction.toFixed(0) || 0}%
                </p>
                <p className={`text-xs ${satisfactionChange.style}`}>{satisfactionChange.text}</p>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-xl font-bold text-amber-900 mb-3">Production Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-amber-100 p-3 rounded-md">
                <p className="text-sm text-amber-800">Mineral Production</p>
                <p className="text-xl font-bold text-amber-900">
                  {latestRecord?.production.toFixed(0) || 0} tons
                </p>
              </div>
              
              <div className="bg-amber-100 p-3 rounded-md">
                <p className="text-sm text-amber-800">Mineral Price</p>
                <p className="text-xl font-bold text-amber-900">
                  {formatCurrency(latestRecord?.mineralPrice || 0)}/ton
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <button
              onClick={() => dispatch({ type: 'CLOSE_CEREMONY' })}
              className="bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-700"
            >
              Continue to Week {state.currentWeek}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 