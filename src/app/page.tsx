import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-obsidian flex flex-col items-center justify-center p-4 md:p-24 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#EAFF00" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="z-10 max-w-5xl w-full flex flex-col items-center text-center space-y-12">
        {/* Logo / Title Area */}
        <div className="relative group flex flex-col items-center px-2">
          <div className="absolute -inset-x-4 -inset-y-2 bg-hot-pink blur-lg opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <h1 className="relative text-[11vw] sm:text-7xl md:text-9xl font-extrabold text-electric-yellow leading-[0.8] select-none tracking-tighter text-center">
            HIRED<span className="text-silver-fox">BABE</span>
          </h1>
          <div className="mt-4 md:absolute md:bottom-[-20px] md:right-0 bg-hot-pink text-white px-3 py-1 text-[10px] md:text-xs font-bold tracking-widest uppercase transform rotate-2 md:rotate-2">
            AI INTERVIEW COACH
          </div>
        </div>

        <p className="max-w-2xl text-lg md:text-2xl font-light text-silver-fox leading-relaxed px-4">
          BRIDGE THE GAP BETWEEN <span className="text-electric-yellow font-bold italic">KNOWING THE ANSWER</span> AND <br className="hidden md:block" />
          <span className="text-hot-pink font-bold underline decoration-4 underline-offset-8 ml-1">NAILING THE DELIVERY</span>.
        </p>

        {/* Feature Grid - NeoBrutalist Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 w-full px-4">
          {/* ... existing card 1 ... */}
          <div className="card-brutal group hover:bg-electric-yellow hover:text-obsidian transition-colors">
            <div className="h-12 w-12 bg-hot-pink mb-4 border-2 border-obsidian flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl md:text-2xl mb-2">Multimodal AI</h3>
            <p className="text-xs md:text-sm">Video, audio, and text analysis to catch your every micro-expression.</p>
          </div>

          <div className="card-brutal group hover:bg-electric-yellow hover:text-obsidian transition-colors">
            <div className="h-12 w-12 bg-hot-pink mb-4 border-2 border-obsidian flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 01-2 2h22a2 2 0 01-2-2H9z" />
              </svg>
            </div>
            <h3 className="text-xl md:text-2xl mb-2">Vibe Scoring</h3>
            <p className="text-xs md:text-sm">Objective metrics on your confidence, pacing, and filler-word usage.</p>
          </div>

          <div className="card-brutal group hover:bg-electric-yellow hover:text-obsidian transition-colors sm:col-span-2 md:col-span-1">
            <div className="h-12 w-12 bg-hot-pink mb-4 border-2 border-obsidian flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl md:text-2xl mb-2">STAR Check</h3>
            <p className="text-xs md:text-sm">Automated structure analysis ensuring your stories hit the mark every time.</p>
          </div>
        </div>

        {/* CTA */}
        <div className="pt-8 flex flex-col items-center gap-6">
          <Link href="/interview" className="btn-neo text-xl md:text-2xl px-16 py-6 shadow-[8px_8px_0px_0px_rgba(255,0,110,1)]">
            START INTERVIEW
          </Link>
          <p className="text-[10px] text-silver-fox opacity-50 tracking-[0.3em] uppercase">
            Powered by Gemini 3 Flash / No Cap
          </p>
        </div>
      </div>

    </main>
  );
}
