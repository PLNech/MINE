interface MiningAnecdote {
  quote: string;
  attribution?: string;
  type: 'observation' | 'overheard' | 'incident' | 'memo' | 'store_notice' | 'safety_bulletin';
}

export const miningAnecdotes: MiningAnecdote[] = [
  // Company Store Notices
  {
    quote: "NEW! Buy now, pay eventually™ - The Company Store's revolutionary lifetime payment plan. Because why should death stop you from contributing to the company's bottom line?",
    type: "store_notice"
  },
  {
    quote: "Special offer: Trade your Sunday rest for store credit! Remember, time off is just money waiting to be made.",
    attribution: "- Company Store Bulletin",
    type: "store_notice"
  },
  
  // Safety Bulletins
  {
    quote: "Reminder: Coughing during work hours is considered voluntary productivity reduction and will be deducted from your pay.",
    attribution: "- Safety Officer Smith",
    type: "safety_bulletin"
  },
  {
    quote: "New safety regulation: Workers must now count their fingers both before AND after their shift. Lost digits are no excuse for reduced output.",
    type: "safety_bulletin"
  },

  // Overheard Conversations
  {
    quote: "Did you hear? Old Thompson finally paid off his grandfather's company store debt. His grandchildren are so proud.",
    attribution: "- Overheard in the lunch queue",
    type: "overheard"
  },
  {
    quote: "They say Jenkins found a gold nugget yesterday. Poor fellow accidentally swallowed it trying to hide it. Now he's working overtime to... process it out.",
    attribution: "- Break room gossip",
    type: "overheard"
  },
  
  // Management Memos
  {
    quote: "Effective immediately: Humming while working is permitted, but only company-approved tunes. See attached 3,000-page manual for the complete list.",
    type: "memo"
  },
  {
    quote: "The new Mandatory Voluntary Overtime Initiative has been a tremendous success. Participation rate remains at a surprising 100%.",
    attribution: "- Management Circular #247",
    type: "memo"
  },
  
  // Foreman Observations
  {
    quote: "Worker satisfaction increased 23% after installing mirrors in Shaft 5. Turns out they just needed to see their own smiling faces. The fact that management can now monitor them better is purely coincidental.",
    attribution: "- Foreman's Weekly Report",
    type: "observation"
  },
  {
    quote: "Noticed Wilson trying to calculate his debt-to-happiness ratio again. Reminded him that advanced mathematics requires a Special Thinking Permit.",
    attribution: "- Shift Supervisor Log",
    type: "observation"
  },

  // Incident Reports
  {
    quote: "Minor incident in Shaft 3: Workers discovered that singing in harmony increases productivity. Unfortunately, this counts as unauthorized team building and had to be stopped.",
    type: "incident"
  },
  {
    quote: "Investigation concluded that last week's 'ghost sighting' was just Peterson's great-grandfather's debt still haunting the lower levels.",
    attribution: "- Incident Report #458",
    type: "incident"
  },
  
  // More Store Notices
  {
    quote: "EXCITING NEWS: The company store now accepts future grandchildren as loan collateral! Building generational wealth, one unborn worker at a time.",
    type: "store_notice"
  },
  {
    quote: "Limited time offer: Trade your dreams for store credit! Current exchange rate: 1 aspiration = 5 CompanyBucks™",
    type: "store_notice"
  },
  
  // More Safety Bulletins
  {
    quote: "Remember: A tired worker is an inefficient worker. Purchase our new Premium Air™ subscription for enhanced oxygen content in your work area!",
    attribution: "- Workplace Enhancement Division",
    type: "safety_bulletin"
  },
  {
    quote: "Notice: The new Smile Detection System is for your benefit. Workers failing to maintain appropriate cheerfulness will be enrolled in mandatory joy enhancement sessions.",
    type: "safety_bulletin"
  },
  
  // More Overheard
  {
    quote: "I heard they're installing 'motivation speakers' in the lower levels. Turns out it's just recordings of calculator sounds counting our debt interest.",
    attribution: "- Anonymous Miner",
    type: "overheard"
  },
  {
    quote: "My grandfather always said the light at the end of the tunnel was a train. Turns out it was just the company store's 'Everything Must Go (Including You)' sale.",
    attribution: "- Overheard during lunch break",
    type: "overheard"
  },
  
  // More Memos
  {
    quote: "Productivity Tip #472: Remember, every breath you take is company air. Make it count!",
    attribution: "- Management Efficiency Newsletter",
    type: "memo"
  },
  {
    quote: "Congratulations to Shaft 7 for achieving negative debt growth rate of -0.001%! Celebration permits are available for purchase at the company store.",
    type: "memo"
  },
  
  // More Observations
  {
    quote: "Noticed increased worker satisfaction after installing the new 'Window to Freedom' in Shaft 6. It's actually just a picture of the sky, but morale improved 15%.",
    attribution: "- Efficiency Expert Report",
    type: "observation"
  },
  {
    quote: "Workers in Section C have developed a complex blinking system to communicate. Recommended installing strobe lights to optimize their innovative productivity technique.",
    type: "observation"
  },
  
  // More Incidents
  {
    quote: "Alert: Multiple workers reported feeling 'hope' during yesterday's shift. Maintenance has been notified to fix the ventilation system.",
    type: "incident"
  },
  {
    quote: "Investigation ongoing into workers allegedly using lunch breaks to dream about the outside world. Recommended solution: Shorter lunch breaks.",
    attribution: "- Internal Affairs",
    type: "incident"
  }
];

export function getRandomAnecdotes(count: number = 1): MiningAnecdote[] {
  const shuffled = [...miningAnecdotes].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, miningAnecdotes.length));
} 
