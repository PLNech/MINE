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
              Allow me to extend my heartfelt congratulations on your recent acquisition 
              of the Blackrock Mining Operation. As your newly appointed secretary, it is 
              my duty to inform you that your late uncle's bequest includes not only the 
              mineral rights but also the full responsibility for developing what will 
              undoubtedly become a most profitable company town.
            </p>
            
            <p>
              Your treasury currently stands at <span className="font-semibold">$10,000</span> – a 
              modest but sufficient sum to begin your venture. I have taken the liberty of 
              preparing the initial paperwork and securing the necessary permits.
            </p>
            
            <p>
              Your first and most crucial decision will be setting an appropriate weekly 
              salary for your future workforce. A competitive wage will attract laborers 
              to your operation, while judicious financial management will ensure healthy 
              profits. Remember, a shrewd capitalist understands that workers are simply 
              cogs in your industrial machine – well-oiled but ultimately replaceable.
            </p>
            
            <p className="italic text-amber-700">
              "A fair day's wage for a fair day's work – with 'fair' being determined solely by the party 
              signing the checks." – <span className="font-semibold">The Capitalist's Handbook, 1870</span>
            </p>
            
            <p>
              It would be prudent to begin by constructing barracks to house your workers, followed by 
              careful assignment of duties. The mine shall be the beating heart of your enterprise – all 
              other considerations are secondary to its productive output.
            </p>
            
            <p>
              I remain your faithful servant in this promising endeavor and will provide weekly reports 
              on your operation's progress.
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