'use client';

import { useGameState } from '@/lib/context/GameContext';

export default function IntroModal() {
  const { state, dispatch } = useGameState();
  
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-amber-50 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-amber-200">
          <h2 className="text-2xl font-bold text-amber-900">This Town Is Mine</h2>
        </div>
        
        <div className="p-6">
          <div className="prose prose-amber max-w-none">
            <p className="italic text-amber-700">
              April 15th, 1875
            </p>
            
            <p>
              Esteemed Mine Proprietor,
            </p>
            
            <p>
              Congratulations on acquiring the Blackrock Mining Operation! As your new secretary, 
              I must inform you that your late uncle's bequest includes not just mineral rights but 
              the responsibility of developing a profitable company town.
            </p>
            
            <p>
              Your treasury stands at <span className="font-semibold">$10,000</span> – a modest sum 
              to kickstart your venture. I've prepared the initial paperwork and secured the necessary permits.
            </p>
            
            <p>
              Your first crucial decision is setting a competitive weekly salary for your workforce. 
              A fair wage will attract laborers, while wise financial management ensures profits. 
              Remember, a savvy capitalist knows that workers are merely cogs in the industrial machine – 
              well-oiled yet replaceable.
            </p>
            
            <p className="italic text-amber-700">
              "A fair day's wage for a fair day's work – with 'fair' defined solely by the party 
              signing the checks." – <span className="font-semibold">The Capitalist's Handbook, 1870</span>
            </p>
            
            <p>
              Begin by constructing barracks for your workers, followed by careful duty assignments. 
              The mine will be the heart of your enterprise – all else is secondary to its output.
            </p>
            
            <p>
              I remain your faithful servant in this endeavor and will provide weekly reports on your progress.
            </p>
            
            <p className="text-right mt-6">
              Most respectfully yours,<br />
              <span className="font-semibold italic">J. Worthington Preston</span><br />
              Secretary & Bookkeeper
            </p>
          </div>
          
          <div className="mt-8 text-center">
            <button
              onClick={() => dispatch({ type: 'ACKNOWLEDGE_INTRO' })}
              className="bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-700"
            >
              Begin Your Empire
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 