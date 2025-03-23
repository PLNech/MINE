'use client';

import { useState, useEffect } from 'react';
import { useGameState } from '@/lib/context/GameContext';
import { BuildingType, EffectType } from '@/lib/types/types';
import UpgradesPanel from './UpgradesPanel';

// Type for grouped building data (can be shared across components)
type GroupedBuilding = {
  type: BuildingType;
  name: string;
  description: string;
  count: number;
  operationalCount: number;
  constructionCount: number;
  totalMaintenanceCost: number;
  totalWorkerCapacity: number;
  assignedWorkers: number;
  effects: Array<{type: EffectType, value: number}>;
  constructionProgress: number;
  isOperational: boolean;
  constructionCost: number;
  maxCount?: number;
};

export default function GameControls() {
  const { state, dispatch } = useGameState();
  const [isClient, setIsClient] = useState(false);
  const [salary, setSalary] = useState(50); // Start with a default value
  const [hoveredBuildingId, setHoveredBuildingId] = useState<string | null>(null);
  
  // Set isClient and sync salary with game state after mount
  useEffect(() => {
    setIsClient(true);
    setSalary(state.salary);
  }, [state.salary]);
  
  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSalary = parseInt(e.target.value, 10);
    setSalary(newSalary);
    dispatch({ type: 'SET_SALARY', payload: newSalary });
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
  const calculateEstimatedArrivals = (salaryValue = salary) => {
    const migrationFactor = 50;
    const minSalary = 10;
    const maxSalary = 100;
    
    const availableHousing = state.maxWorkerCapacity - state.workerCount;
    let arrivals = Math.floor((salaryValue - minSalary) / (maxSalary - minSalary) * migrationFactor);
    arrivals = Math.min(arrivals, availableHousing);
    arrivals = Math.max(arrivals, 0);
    
    return arrivals;
  };
  
  // Calculate optimal salary based on current production metrics
  const calculateOptimalSalary = () => {
    const mineralPrice = state.currentMineralPrice;
    const baseProductionPerWorker = state.baseProductionPerWorker * 7; // Weekly production
    
    // Simple model: each worker should produce at least 3x their salary
    const optimalSalary = Math.round(mineralPrice * baseProductionPerWorker / 3);
    return Math.max(10, Math.min(100, optimalSalary));
  };
  
  const optimalSalary = calculateOptimalSalary();
  
  // Get satisfaction impact based on current salary
  const getSatisfactionImpact = (currentSalary = salary) => {
    const regionalAverage = 50; // Simplification for now
    const difference = currentSalary - regionalAverage;
    
    if (difference >= 20) return { text: "Very High", style: "text-green-600" };
    if (difference >= 10) return { text: "High", style: "text-green-500" };
    if (difference >= 0) return { text: "Average", style: "text-amber-500" };
    if (difference >= -10) return { text: "Low", style: "text-orange-500" };
    return { text: "Very Low", style: "text-red-600" };
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
  
  // Get today's economic performance
  const dailyChangeColor = state.todayRevenue > state.todayExpenses 
    ? 'text-green-600' 
    : 'text-red-600';
  
  // Calculate building efficiency (profit per worker)
  const calculateBuildingEfficiency = (buildingId: string) => {
    const building = state.buildings.find(b => b.id === buildingId);
    if (!building || !building.isOperational) return { value: 0, text: "N/A" };
    
    if (building.type === BuildingType.MINE) {
      const dailyProduction = building.assignedWorkers * state.baseProductionPerWorker;
      const dailyRevenue = dailyProduction * state.currentMineralPrice;
      const dailyMaintenance = building.maintenanceCost / 7;
      const dailyProfit = dailyRevenue - dailyMaintenance;
      
      const efficiencyPerWorker = building.assignedWorkers > 0 
        ? dailyProfit / building.assignedWorkers 
        : 0;
      
      let efficiencyText = "Poor";
      let textColor = "text-red-600";
      
      if (efficiencyPerWorker > 30) {
        efficiencyText = "Excellent";
        textColor = "text-green-600";
      } else if (efficiencyPerWorker > 20) {
        efficiencyText = "Good";
        textColor = "text-green-500";
      } else if (efficiencyPerWorker > 10) {
        efficiencyText = "Average";
        textColor = "text-amber-500";
      } else if (efficiencyPerWorker > 0) {
        efficiencyText = "Below Average";
        textColor = "text-orange-500";
      }
      
      return { 
        value: efficiencyPerWorker,
        text: efficiencyText,
        color: textColor
      };
    }
    
    return { value: 0, text: "N/A" };
  };
  
  // Building tooltip content
  const getBuildingTooltip = (buildingId: string) => {
    const building = state.buildings.find(b => b.id === buildingId);
    if (!building) return null;
    
    const efficiency = calculateBuildingEfficiency(buildingId);
    
    return (
      <div className="absolute z-10 bg-amber-50 border border-amber-300 rounded-md shadow-lg p-3 w-64 text-sm">
        <h4 className="font-semibold text-amber-900 mb-1">{building.name}</h4>
        <p className="text-xs text-amber-700 mb-2">{building.description}</p>
        
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Maintenance:</span>
            <span>{formatCurrency(building.maintenanceCost)}/week</span>
          </div>
          
          {building.isOperational && building.workerCapacity > 0 && (
            <>
              <div className="flex justify-between">
                <span>Workers:</span>
                <span>{building.assignedWorkers} / {building.workerCapacity}</span>
              </div>
              <div className="flex justify-between">
                <span>Efficiency:</span>
                <span className={efficiency.color}>{efficiency.text}</span>
              </div>
            </>
          )}
          
          {!building.isOperational && building.constructionProgress > 0 && (
            <div className="flex justify-between">
              <span>Construction:</span>
              <span>{building.constructionProgress}% complete</span>
            </div>
          )}
          
          <div className="mt-2 pt-2 border-t border-amber-200">
            <div className="text-xs font-medium mb-1">Effects:</div>
            {building.effects.map((effect, index) => (
              <div key={index} className="grid grid-cols-2 text-xs">
                <span>{effect.type}:</span>
                <span className={effect.value >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {effect.value > 0 ? '+' : ''}{effect.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  // Enhanced worker assignment section
  const renderWorkerAssignments = () => {
    const operationalBuildings = state.buildings
      .filter(building => building.isOperational && building.workerCapacity > 0);
    
    if (operationalBuildings.length === 0) {
      return <p className="text-amber-800">No buildings available for worker assignment.</p>;
    }
    
    // Calculate unassigned workers
    const totalAssigned = operationalBuildings.reduce(
      (sum, building) => sum + building.assignedWorkers, 0
    );
    const unassignedWorkers = state.workerCount - totalAssigned;
    
    return (
      <div>
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-amber-900">Worker Assignment</h3>
          <span className="text-sm bg-amber-200 px-2 py-1 rounded">
            <span className="font-medium">{unassignedWorkers}</span> unassigned
          </span>
        </div>
        
        <div className="space-y-4">
          {operationalBuildings.map((building) => (
            <div key={building.id} className="border border-amber-300 p-3 rounded-md bg-amber-50/80">
              <div className="flex justify-between">
                <div>
                  <span className="font-semibold text-amber-900">{building.name}</span>
                  <div className="text-xs text-amber-700 mt-1">
                    {building.type === BuildingType.MINE ? "Production" : "Service"} building
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-medium">{building.assignedWorkers} / {building.workerCapacity}</span>
                  <div className="text-xs text-amber-700 mt-1">
                    {Math.round(building.assignedWorkers / building.workerCapacity * 100)}% staffed
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mt-3">
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
                  className={`flex-grow h-2 rounded-lg appearance-none cursor-pointer ${
                    building.assignedWorkers / building.workerCapacity > 0.8 
                      ? "bg-green-400" 
                      : building.assignedWorkers / building.workerCapacity > 0.5 
                        ? "bg-amber-400" 
                        : "bg-red-300"
                  }`}
                />
                <span className="w-8 text-center">{building.assignedWorkers}</span>
              </div>
              
              {/* Efficiency indicator */}
              {building.type === BuildingType.MINE && (
                <div className="mt-2 text-xs">
                  <span className="text-amber-800">Estimated daily production: </span>
                  <span className="font-medium">
                    {(building.assignedWorkers * state.baseProductionPerWorker * 
                      (0.5 + (state.workerHealth * 0.25) / 100 + (state.workerSatisfaction * 0.25) / 100)
                    ).toFixed(1)} tons
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Group buildings by type and calculate aggregated metrics
  const groupedBuildings = state.buildings.reduce((acc, building) => {
    if (!acc[building.type]) {
      acc[building.type] = {
        type: building.type,
        name: building.name,
        description: building.description,
        count: 1,
        operationalCount: building.isOperational ? 1 : 0,
        constructionCount: !building.isOperational && building.constructionProgress > 0 ? 1 : 0,
        totalMaintenanceCost: building.maintenanceCost,
        totalWorkerCapacity: building.workerCapacity,
        assignedWorkers: building.assignedWorkers,
        effects: building.effects,
        constructionProgress: building.constructionProgress,
        isOperational: building.isOperational,
        constructionCost: building.constructionCost,
        maxCount: building.maxCount
      };
    } else {
      const group = acc[building.type];
      group.count++;
      group.operationalCount += building.isOperational ? 1 : 0;
      group.constructionCount += !building.isOperational && building.constructionProgress > 0 ? 1 : 0;
      group.totalMaintenanceCost += building.maintenanceCost;
      group.totalWorkerCapacity += building.workerCapacity;
      group.assignedWorkers += building.assignedWorkers;
      group.constructionProgress = Math.max(group.constructionProgress, building.constructionProgress);
    }
    return acc;
  }, {} as Record<BuildingType, GroupedBuilding>);
  
  // Early return with loading state if not client-side
  if (!isClient) {
    return (
      <div className="bg-amber-100 p-6 rounded-lg shadow-md animate-pulse">
        <div className="h-8 bg-amber-200 rounded w-48 mb-4"></div>
        <div className="space-y-4">
          <div className="h-24 bg-amber-200 rounded"></div>
          <div className="h-24 bg-amber-200 rounded"></div>
          <div className="h-24 bg-amber-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-100 p-6 rounded-lg shadow-md">
      {/* 1. Production Info */}
      <div className="mb-8 bg-amber-50/80 p-4 rounded-md border border-amber-200">
        <h2 className="text-xl font-bold text-amber-900 mb-3">Today's Production</h2>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-amber-800 mb-1">Mineral Extraction</p>
            <p className="text-xl font-semibold">{state.todayExtraction.toFixed(1)} tons</p>
          </div>
          
          <div>
            <p className="text-amber-800 mb-1">Revenue</p>
            <p className="text-xl font-semibold text-green-600">{formatCurrency(state.todayRevenue)}</p>
          </div>
          
          <div>
            <p className="text-amber-800 mb-1">Expenses</p>
            <p className="text-xl font-semibold text-red-600">{formatCurrency(state.todayExpenses)}</p>
          </div>
        </div>
        
        <div className="mt-3 pt-2 border-t border-amber-200">
          <div className="flex justify-between items-center">
            <span className="text-amber-800">Net Change</span>
            <span className={`text-lg font-semibold ${dailyChangeColor}`}>
              {formatCurrency(state.todayRevenue - state.todayExpenses)}
            </span>
          </div>
          
          <div className="mt-2 text-xs text-amber-600">
            <p>Current mineral price: {formatCurrency(state.currentMineralPrice)}/ton</p>
          </div>
        </div>
      </div>

      {/* 2. Financial Summary */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-amber-900 mb-4">Financial Summary</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-amber-50/80 p-3 rounded-md">
            <div className="mb-2">
              <span className="text-amber-800">Weekly revenue: </span>
              <span className="float-right font-medium text-green-600">{formatCurrency(state.weeklyRevenue)}</span>
            </div>
            <div className="mb-2">
              <span className="text-amber-800">Weekly expenses: </span>
              <span className="float-right font-medium text-red-600">{formatCurrency(state.weeklyExpenses)}</span>
            </div>
            <div className="border-t border-amber-200 pt-1 font-medium">
              <span className="text-amber-900">Net profit: </span>
              <span className={`float-right ${state.weeklyRevenue - state.weeklyExpenses >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(state.weeklyRevenue - state.weeklyExpenses)}
              </span>
            </div>
          </div>
          
          <div className="bg-amber-50/80 p-3 rounded-md">
            <div className="mb-2">
              <span className="text-amber-800">Treasury: </span>
              <span className="float-right font-medium">{formatCurrency(state.treasury)}</span>
            </div>
            <div className="mb-2">
              <span className="text-amber-800">Mineral price: </span>
              <span className="float-right font-medium">{formatCurrency(state.currentMineralPrice)}/ton</span>
            </div>
            <div className="mb-2">
              <span className="text-amber-800">Current day: </span>
              <span className="float-right font-medium">Week {state.currentWeek}, Day {state.currentDay}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Salary Controls */}
      <div className="mb-8">
        <h2 className="text-xl text-amber-900 mb-4">
          Weekly Salary: <span className="font-bold">{formatCurrency(salary)}</span>
        </h2>
        <div className="mb-4 relative">
          <div className="flex justify-between text-sm text-amber-800 mb-1">
            <span>$10</span>
            <span className="cursor-help underline decoration-dotted">
              Optimal: {formatCurrency(calculateOptimalSalary())}
            </span>
            <span>$100</span>
          </div>
          
          <input
            type="range"
            min="10"
            max="100"
            value={salary}
            onChange={handleSalaryChange}
            className={`w-full h-4 rounded-lg appearance-none cursor-pointer ${
              salary < calculateOptimalSalary() - 10 ? "bg-red-300" :
              salary < calculateOptimalSalary() ? "bg-amber-300" :
              salary > calculateOptimalSalary() + 10 ? "bg-green-300" : 
              "bg-green-400"
            }`}
          />
          
          {/* Marker for optimal salary */}
          <div 
            className="absolute h-6 w-1 bg-amber-900 top-6" 
            style={{
              left: `${((calculateOptimalSalary() - 10) / 90) * 100}%`,
              transform: 'translateX(-50%)'
            }}
          ></div>
        </div>
        
        <div className="flex justify-between mb-4">
          <div>
            {salary !== state.salary && (
              <span className="text-xs text-amber-600 ml-2">
                (Current: {formatCurrency(state.salary)})
              </span>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-amber-50/80 p-3 rounded-md">
            <p className="mb-1">
              <span className="text-amber-800">Worker count:</span>
              <span className="float-right font-medium">{state.workerCount}</span>
            </p>
            <p className="mb-1">
              <span className="text-amber-800">Est. arrivals:</span>
              <span className="float-right font-medium text-green-600">+{calculateEstimatedArrivals()}</span>
            </p>
            <p className="mb-1">
              <span className="text-amber-800">Weekly cost:</span>
              <span className="float-right font-medium">{formatCurrency(state.workerCount * salary)}</span>
            </p>
            <p>
              <span className="text-amber-800">Per worker:</span>
              <span className="float-right font-medium">{formatCurrency(salary)}/week</span>
            </p>
          </div>
          
          <div className="bg-amber-50/80 p-3 rounded-md">
            <p className="mb-1">
              <span className="text-amber-800">Satisfaction impact:</span>
              <span className={`float-right font-medium ${getSatisfactionImpact().style}`}>
                {getSatisfactionImpact().text}
              </span>
            </p>
            <p className="mb-1">
              <span className="text-amber-800">Current satisfaction:</span>
              <span className="float-right font-medium">{state.workerSatisfaction.toFixed(0)}%</span>
            </p>
            <p className="mb-1">
              <span className="text-amber-800">Health:</span>
              <span className="float-right font-medium">{state.workerHealth.toFixed(0)}%</span>
            </p>
            <p>
              <span className="text-amber-800">Regional avg:</span>
              <span className="float-right font-medium">{formatCurrency(50)}/week</span>
            </p>
          </div>
        </div>
      </div>
      
      {/* 4. Worker Assignment */}
      <div className="mb-8">
        {renderWorkerAssignments()}
      </div>
      
      {/* 5. Buildings */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-amber-900 mb-4">Buildings</h2>
        
        {/* Available to Build */}
        {Object.values(groupedBuildings)
          .filter(building => !building.isOperational && building.constructionProgress === 0)
          .length > 0 && (
          <div className="space-y-4 mb-6">
            <h3 className="font-medium text-amber-800">Available to Build:</h3>
            {Object.values(groupedBuildings)
              .filter(building => !building.isOperational && building.constructionProgress === 0)
              .map(building => (
                <div key={building.type} className="border border-amber-300 p-4 rounded-md bg-amber-50/60">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-amber-900">
                        {building.name}
                        {building.maxCount && (
                          <span className="text-xs text-amber-700 ml-2">
                            ({building.count}/{building.maxCount})
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-amber-700 mt-1">{building.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-amber-900">
                        {formatCurrency(building.constructionCost)}
                      </p>
                      <p className="text-xs text-amber-700">
                        +{formatCurrency(building.totalMaintenanceCost)}/week
                      </p>
                    </div>
      </div>
      
                  <div className="mt-3 flex justify-between items-center">
      <div>
                      {building.effects.map((effect, i) => (
                        <div key={i} className="text-xs">
                          <span className="text-amber-800">{effect.type}: </span>
                          <span className={effect.value >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {effect.value > 0 ? '+' : ''}{effect.value}%
              </span>
            </div>
                      ))}
                    </div>
                    <button
                      onClick={() => dispatch({ type: 'CONSTRUCT_BUILDING', payload: building.type })}
                      disabled={state.treasury < building.constructionCost || 
                        (building.maxCount && building.count >= building.maxCount)}
                      className={`px-4 py-2 rounded ${
                        !building.maxCount || building.count < building.maxCount
                          ? 'bg-amber-600 text-white hover:bg-amber-700'
                          : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      {!building.maxCount || building.count < building.maxCount ? 'Construct' : 'Max Built'}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
        
        {/* Operational and Construction Buildings */}
        <div className="grid grid-cols-2 gap-3">
          {/* Operational Buildings */}
          {Object.values(groupedBuildings)
            .filter(building => building.operationalCount > 0)
            .map(building => (
              <div key={building.type} className="border border-amber-300 p-3 rounded-md bg-amber-50/60">
                <div className="font-medium text-amber-900">
                  {building.name}
                  {building.operationalCount > 1 ? ` (${building.operationalCount})` : ''}
                </div>
                
                {building.totalWorkerCapacity > 0 ? (
                  <div className="text-xs text-amber-700 mt-1">
                    {building.assignedWorkers}/{building.totalWorkerCapacity} workers
                  </div>
                ) : (
                  <div className="text-xs text-amber-700 mt-1">
                    Service building
                  </div>
                )}
                
                <div className="text-xs text-amber-600 mt-1">
                  {formatCurrency(building.totalMaintenanceCost)}/week
                </div>
              </div>
            ))}
          
          {/* Construction in Progress Buildings */}
          {Object.values(groupedBuildings)
            .filter(building => building.constructionCount > 0)
            .map(building => (
              <div key={building.type} className="border border-dashed border-amber-300 p-3 rounded-md bg-amber-50/40">
                <div className="font-medium text-amber-900">
                  {building.name}
                  {building.constructionCount > 1 ? ` (${building.constructionCount})` : ''}
            </div>
                <div className="text-xs text-amber-700 mt-1">Under Construction</div>
                <div className="w-full bg-amber-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-amber-600 h-2 rounded-full" 
                    style={{ width: `${building.constructionProgress}%` }}
                  ></div>
            </div>
          </div>
            ))}
        </div>
      </div>

      {/* 6. Upgrades */}
      <UpgradesPanel />
    </div>
  );
}