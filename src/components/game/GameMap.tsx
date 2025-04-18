'use client';

import { useGameState } from '@/lib/context/GameContext';
import { BuildingType, EffectType } from '@/lib/types/types';
import { useState, useEffect } from 'react';

// Type for grouped building data
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
};

export default function GameMap() {
  const { state } = useGameState();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
        isOperational: building.isOperational
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

  // Helper to get building effect value
  const getBuildingEffectValue = (buildingId: string, effectType: EffectType): number => {
    const building = state.buildings.find(b => b.id === buildingId);
    if (!building) return 0;
    
    const effect = building.effects.find(e => e.type === effectType);
    return effect ? effect.value : 0;
  };
  
  // Loading skeleton for server-side rendering
  if (!isClient) {
    return (
      <div className="bg-amber-100 p-6 rounded-lg shadow-md h-full animate-pulse">
        <div className="h-8 bg-amber-200 rounded w-48 mb-6"></div>
        <div className="border-4 border-amber-800 p-4 rounded-lg mb-8 bg-amber-50/50">
          <div className="h-6 bg-amber-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-amber-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-amber-200 rounded w-full"></div>
            <div className="h-4 bg-amber-200 rounded w-full"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-32 bg-amber-200 rounded"></div>
          <div className="h-32 bg-amber-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-amber-100 p-6 rounded-lg shadow-md h-full">
      <h2 className="text-2xl font-bold text-amber-900 mb-6">Town Map</h2>
      
      <div className="border-4 border-amber-800 p-4 rounded-lg mb-8 bg-amber-50">
        <h3 className="text-xl font-bold text-amber-900 mb-4 flex justify-between">
          <span>{state.buildings.find(b => b.type === BuildingType.MINE)?.name || 'Mine'}</span>
          <span className="text-sm font-normal">
            Workers: {state.buildings.find(b => b.type === BuildingType.MINE)?.assignedWorkers || 0}
          </span>
        </h3>
        <p className="mb-4 text-amber-800">
          Production: {state.totalMineralExtraction.toFixed(0)} tons extracted
        </p>
        <div className="text-sm text-amber-700 mb-2">
          <div className="flex justify-between">
            <span>Current mineral price:</span>
            <span>{formatCurrency(state.currentMineralPrice)}/ton</span>
          </div>
          <div className="flex justify-between">
            <span>Weekly revenue:</span>
            <span>{formatCurrency(state.weeklyRevenue)}</span>
          </div>
        </div>
        <div className="text-xs text-amber-600 italic">
          Mining operations decrease worker health by {
            Math.abs(getBuildingEffectValue('mine-1', EffectType.HEALTH))
          }% per week.
        </div>
      </div>

      {/* Operational Buildings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {Object.values(groupedBuildings)
          .filter(building => building.operationalCount > 0)
          .map(building => (
            <div 
              key={building.type}
              className={`border-2 border-amber-500 p-3 rounded-lg bg-amber-50`}
            >
              <h4 className="font-bold text-amber-900 flex justify-between">
                <span>
                  {building.name} 
                  {building.operationalCount > 1 ? ` (${building.operationalCount})` : ''}
                </span>
                {building.totalWorkerCapacity > 0 && (
                  <span className="text-sm font-normal">
                    Workers: {building.assignedWorkers} / {building.totalWorkerCapacity}
                  </span>
                )}
              </h4>
              <p className="text-sm text-amber-800 my-2">{building.description}</p>
              <div className="text-xs text-amber-700 space-y-1">
                {building.effects.map((effect, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{effect.type}:</span>
                    <span className={effect.value >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {effect.value > 0 ? '+' : ''}{effect.value}%
                    </span>
                  </div>
                ))}
                <div className="flex justify-between">
                  <span>Maintenance:</span>
                  <span>
                    {formatCurrency(building.totalMaintenanceCost)}/week 
                    {building.operationalCount > 1 ? ` (${formatCurrency(building.totalMaintenanceCost / building.operationalCount)}/w × ${building.operationalCount})` : ''}
                  </span>
                </div>
                {building.totalWorkerCapacity > 0 && (
                  <div className="flex justify-between">
                    <span>Capacity:</span>
                    <span>
                      {building.totalWorkerCapacity} workers 
                      {building.operationalCount > 1 ? ` (${building.totalWorkerCapacity / building.operationalCount} × ${building.operationalCount})` : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>
      
      {/* Construction in Progress Buildings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.values(groupedBuildings)
          .filter(building => building.constructionCount > 0)
          .map(building => (
            <div 
              key={building.type}
              className="border-2 border-dashed border-amber-400 p-3 rounded-lg bg-amber-50/50"
            >
              <h4 className="font-bold text-amber-800">
                {building.name} 
                {building.constructionCount > 1 ? ` (${building.constructionCount})` : ''}
              </h4>
              <p className="text-sm text-amber-700 my-2">Under construction</p>
              <div className="w-full bg-amber-200 rounded-full h-2.5">
                <div 
                  className="bg-amber-600 h-2.5 rounded-full" 
                  style={{ width: `${building.constructionProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-right mt-1 text-amber-600">
                {building.constructionProgress}% complete
              </p>
            </div>
          ))}
      </div>
      
      {/* Town statistics summary */}
      <div className="mt-8 border-t-2 border-amber-300 pt-4">
        <h3 className="text-lg font-bold text-amber-900 mb-2">Town Status: {state.townScale}</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-amber-800">Population: {state.workerCount}</p>
            <p className="text-amber-800">Housing capacity: {state.maxWorkerCapacity}</p>
            <p className="text-amber-800">Average health: {state.workerHealth.toFixed(0)}%</p>
          </div>
          <div>
            <p className="text-amber-800">Average satisfaction: {state.workerSatisfaction.toFixed(0)}%</p>
            <p className="text-amber-800">Weekly arrivals: {state.weeklyMigration.arrivals}</p>
            <p className="text-amber-800">Weekly departures: {state.weeklyMigration.departures}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 