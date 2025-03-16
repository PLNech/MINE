import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-parchment bg-paper-texture p-8">
      <main className="max-w-2xl text-center space-y-8">
        <h1 className="text-6xl font-im-fell text-amber-900">
          This Town Is <em>Mine</em>
        </h1>
        
        <p className="text-xl font-old-standard text-gray-800">
          Congratulations! You've just inherited a moderately profitable mine 
          and the moral burden of several dozen soon-to-be employees.
        </p>
        
        <div className="space-y-4 text-lg font-old-standard text-gray-700">
          <p>
            Will you be remembered as a benevolent captain of industry,
            or just another robber baron with excellent accounting skills?
          </p>
          <p className="italic">
            (Let's be honest, we both know which way this is going...)
          </p>
        </div>

        <Link 
          href="/game"
          className="inline-block mt-8 px-8 py-4 bg-amber-700 text-white rounded-lg 
            hover:bg-amber-600 transform hover:-translate-y-1 transition-all
            font-im-fell text-2xl shadow-lg hover:shadow-xl"
        >Embrace Your Destiny
        </Link>
        
        <p className="text-sm text-gray-600 italic mt-4">
          No human workers were permanently harmed in the making of this game. 
          Temporary harm is, of course, an externality we're willing to accept.
        </p>
      </main>
      
      {/* Decorative elements */}
      <div className="absolute top-4 right-4 text-6xl transform rotate-12">⛏️</div>
      <div className="absolute bottom-4 left-4 text-6xl transform -rotate-12">💰</div>
    </div>
  );
}
