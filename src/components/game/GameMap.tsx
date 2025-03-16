'use client';

import { useGame } from '@/lib/context/GameContext';
import { TutorialStage } from '@/lib/types/game';
import { useState } from 'react';

export default function GameMap() {
  const { state, dispatch } = useGame();
  const [expandedBuildingId, setExpandedBuildingId] = useState<string | null>(null);

  const handleExpandBuilding = (buildingId: string | null) => {
    setExpandedBuildingId(buildingId);
    
    // Track tutorial progress
    if (buildingId && !state.tutorial.conditions.hasViewedWorkers) {
      dispatch({ 
        type: 'UPDATE_TUTORIAL_CONDITION', 
        payload: { condition: 'hasViewedWorkers', value: true } 
      });
    }
  };

  return (
    <div className="p-6 bg-amber-50 min-h-full font-mono text-gray-800">
      <h2 className="text-2xl font-im-fell mb-6 border-b-2 border-gray-800 pb-2">
        Town Layout
      </h2>
      
      <div className="space-y-4 whitespace-pre-wrap">
        {/* Buildings list */}
        {state.buildings.map(building => (
          <div 
            key={building.id} 
            className={`cursor-pointer ${building.type !== 'Mine' ? 'pl-4' : ''}`}
            onClick={() => handleExpandBuilding(
              expandedBuildingId === building.id ? null : building.id
            )}
          >
            <div className={building.type === 'Mine' ? 'font-bold' : ''}>
              {building.type === 'Mine' ? 'The Mine' : `- ${building.type}`} [
              Level {building.level} | Workers: {building.workers.length}
              {building.condition ? ` | Condition: ${building.condition}%` : ''}]
            </div>
            {expandedBuildingId === building.id && (
              <div className="pl-4 text-sm text-gray-600 mt-1">
                {building.workers.length === 0 ? "No workers assigned" : 
                  state.workers
                    .filter(w => building.workers.includes(w.id))
                    .map(w => `${w.name} (${w.role}) - Health: ${w.health}% | Satisfaction: ${w.satisfaction}%`)
                    .join('\n')}
              </div>
            )}
          </div>
        ))}
        
        {state.buildings.length === 0 && (
          <div className="text-gray-600 italic">
            A barren plot of land, waiting for your capitalistic touch...
          </div>
        )}
      </div>
      
      {/* Unassigned Workers */}
      {state.workers.length > 0 && (
        <div className="mt-8 pt-4 border-t-2 border-gray-300">
          <div className="font-bold mb-2">
            Unassigned Workers [{state.workers.filter(w => 
              !state.buildings.some(b => b.workers.includes(w.id))
            ).length}]
          </div>
          <div className="pl-4 text-sm text-gray-600">
            {state.workers
              .filter(w => !state.buildings.some(b => b.workers.includes(w.id)))
              .map(w => `${w.name} (${w.role})`).join('\n')}
          </div>
        </div>
      )}
      
      {/* Workers section */}
      {state.workers.length > 0 && (
        <div className="mt-8 pt-4 border-t-2 border-gray-300">
          <h3 className="font-im-fell text-lg mb-4">Workers in The Mine</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.workers.map(worker => (
              <div key={worker.id} className="flex items-center gap-3 p-2 bg-amber-100/50 rounded">
                <div className="text-2xl filter sepia">👷</div>
                <div>
                  <div className="font-bold">{worker.name}</div>
                  <div className="text-sm text-gray-600">
                    Health: {worker.health}% | Satisfaction: {worker.satisfaction}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 