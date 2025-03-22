'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-amber-50 p-4">
      <div className="w-full max-w-3xl bg-amber-100 rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-bold text-amber-900 text-center mb-6">This Town Is Mine</h1>
        <p className="text-lg text-amber-800 mb-8 text-center">
          An incremental management game with robber baron aesthetics where the consequences of 
          controlling an entire town come to light.
        </p>
        
        <div className="mb-8 p-6 bg-amber-50 rounded-lg border border-amber-200">
          <h2 className="text-xl font-bold text-amber-900 mb-4">About The Game</h2>
          <p className="text-amber-800 mb-4">
            Assume the role of a 19th-century capitalist establishing and developing a 
            company town around a newly acquired mine. Balance profits with worker needs 
            as you expand from a small camp to a thriving metropolis.
          </p>
          <p className="text-amber-800">
            Will you build a worker's utopia, an exploitative industrial machine, 
            or something between? Every decision shapes the future of your town.
          </p>
        </div>
        
        <div className="flex justify-center">
          <Link href="/game" className="inline-block bg-amber-600 text-white px-6 py-3 rounded-md hover:bg-amber-700 text-lg font-medium">
            Start Playing
          </Link>
        </div>
        
        <p className="text-center text-amber-700 mt-8 text-sm">
          A game about power, economics, and the human cost of progress.
        </p>
      </div>
    </main>
  );
}
