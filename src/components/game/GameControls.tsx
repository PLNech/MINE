'use client';

import { useState } from 'react';
import { useGameState } from '@/lib/context/GameContext';
import { BuildingType } from '@/lib/types/types';

export default function GameControls() {
  const { state, dispatch } = useGameState();
  const [salary, setSalary] = useState(state.salary);
  
  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSalary = parseInt(e.target.value, 10);
    setSalary(newSalary);
  };
  
  const handleSalarySubmit = () => {
    dispatch({ type: 'SET_SALARY', payload: salary });
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Calculate estimated arrivals based on current salary
  const calculateEstimatedArrivals = () => {
    const migrationFactor = 50;
    const minSalary = 10;
    const maxSalary = 100;
    
    const availableHousing = state.maxWorkerCapacity - state.workerCount;
    let arrivals = Math.floor((salary - minSalary) / (maxSalary - minSalary) * migrationFactor);
    arrivals = Math.min(arrivals, availableHousing);
    arrivals = Math.max(arrivals, 0);
    
    return arrivals;
  };
  
  // Filter buildings that can be constructed based on unlocks
  const availableBuildings = state.buildings.filter(building => {
    // If already operational, skip
    if (building.isOperational) return false;
    
    // If doesn't have unlock requirement, it's available
    if (!building.unlockRequirement) return true;
    
    // Check town scale requirement
    const meetsScaleRequirement = 
      !building.unlockRequirement.townScale || 
      state.townScale >= building.unlockRequirement.townScale;
    
    // Check treasury requirement if specified
    const meetsTreasuryRequirement = 
      !building.unlockRequirement.treasury || 
      state.treasury >= building.unlockRequirement.treasury;
    
    return meetsScaleRequirement && meetsTreasuryRequirement;
  });
  
  return (
    <div className="bg-amber-100 p-6 rounded-lg shadow-md">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-amber-900 mb-4">Weekly Salary</h2>
        <div className="mb-4">
          <div className="flex justify-between text-sm text-amber-800 mb-1">
            <span>$10</span>
            <span>$100</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={salary}
            onChange={handleSalaryChange}
            className="w-full h-4 bg-amber-300 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <div className="flex justify-between mb-4">
          <span className="text-lg font-semibold">{formatCurrency(salary)}</span>
          <button
            onClick={handleSalarySubmit}
            className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700"
          >
            Set Salary
          </button>
        </div>
        <div className="text-sm text-amber-800">
          <p>Current worker count: {state.workerCount}</p>
          <p>Estimated new arrivals: {calculateEstimatedArrivals()}</p>
          <p>Weekly salary expense: {formatCurrency(state.workerCount * salary)}</p>
          <p>Worker satisfaction: {state.workerSatisfaction.toFixed(0)}%</p>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-bold text-amber-900 mb-4">Buildings</h2>
        {availableBuildings.length === 0 ? (
          <p className="text-amber-800">No buildings available to construct.</p>
        ) : (
          <div className="space-y-4">
            {availableBuildings.map((building) => (
              <div key={building.id} className="border border-amber-300 p-3 rounded-md">
                <div className="flex justify-between">
                  <span className="font-semibold">{building.name}</span>
                  <span>{formatCurrency(building.constructionCost)}</span>
                </div>
                <p className="text-sm text-amber-800 my-2">{building.description}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-amber-700">
                    Maintenance: {formatCurrency(building.maintenanceCost)}/week
                  </span>
                  <button
                    onClick={() => dispatch({ type: 'CONSTRUCT_BUILDING', payload: building.type })}
                    disabled={state.treasury < building.constructionCost}
                    className={`px-3 py-1 rounded text-sm ${
                      state.treasury < building.constructionCost 
                        ? 'bg-amber-300 text-amber-600 cursor-not-allowed' 
                        : 'bg-amber-600 text-white hover:bg-amber-700'
                    }`}
                  >
                    Construct
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-bold text-amber-900 mb-4">Worker Assignment</h2>
        <div className="space-y-4">
          {state.buildings
            .filter(building => building.isOperational && building.workerCapacity > 0)
            .map((building) => (
              <div key={building.id} className="border border-amber-300 p-3 rounded-md">
                <div className="flex justify-between">
                  <span className="font-semibold">{building.name}</span>
                  <span>{building.assignedWorkers} / {building.workerCapacity}</span>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <input
                    type="range"
                    min="0"
                    max={building.workerCapacity}
                    value={building.assignedWorkers}
                    onChange={(e) => {
                      dispatch({ 
                        type: 'ASSIGN_WORKERS', 
                        payload: { 
                          buildingId: building.id, 
                          workerCount: parseInt(e.target.value, 10) 
                        } 
                      });
                    }}
                    className="flex-grow h-2 bg-amber-300 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="w-8 text-center">{building.assignedWorkers}</span>
                </div>
              </div>
            ))}
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-bold text-amber-900 mb-4">Financial Summary</h2>
        <div className="text-sm text-amber-800">
          <p>Weekly revenue: {formatCurrency(state.weeklyRevenue)}</p>
          <p>Weekly expenses: {formatCurrency(state.weeklyExpenses)}</p>
          <p>Current treasury: {formatCurrency(state.treasury)}</p>
          <p>Mineral price: {formatCurrency(state.currentMineralPrice)}/ton</p>
        </div>
      </div>
    </div>
  );
}