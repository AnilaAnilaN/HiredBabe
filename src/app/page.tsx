import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-obsidian flex flex-col items-center justify-center p-4 md:p-24 overflow-hidden relative">
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

      <div className="z-10 max-w-5xl w-full flex flex-col items-center text-center space-y-10 md:space-y-12">
        <div className="relative group flex flex-col items-center px-2 w-full">
          <div className="absolute -inset-x-4 -inset-y-2 bg-hot-pink blur-lg opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
          <h1 className="relative text-[15vw] sm:text-7xl md:text-9xl font-extrabold text-electric-yellow leading-[0.8] select-none tracking-tighter text-center">
            HIRED<span className="text-silver-fox">BABE</span>
          </h1>
          <div className="mt-4 md:absolute md:bottom-[-20px] md:right-0 bg-hot-pink text-white px-3 py-1 text-[10px] md:text-xs font-bold tracking-widest uppercase transform rotate-2 md:rotate-2">
            AI INTERVIEW COACH
          </div>
        </div>

        <p className="max-w-2xl text-base sm:text-lg md:text-2xl font-light text-silver-fox leading-relaxed px-4">
          BRIDGE THE GAP BETWEEN{" "}
          <span className="text-electric-yellow font-bold italic">KNOWING THE ANSWER</span>{" "}
          AND <br className="hidden md:block" />
          <span className="text-hot-pink font-bold underline decoration-4 underline-offset-8 ml-1">
            NAILING THE DELIVERY
          </span>
          .
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 w-full px-4">
          <FeatureCard
            title="Multimodal AI"
            description="Video, audio, and text analysis to catch your every micro-expression."
            icon={
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            }
          />

          <FeatureCard
            title="Vibe Scoring"
            description="Objective metrics on your confidence, pacing, and filler-word usage."
            icon={
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16V8m5 8V4m5 12v-6M4 20h16"
              />
            }
          />

          <FeatureCard
            title="STAR Check"
            description="Automated structure analysis ensuring your stories hit the mark every time."
            className="sm:col-span-2 md:col-span-1"
            icon={
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            }
          />
        </div>

        <div className="grid w-full grid-cols-1 sm:grid-cols-3 gap-3 px-4">
          <StatPill label="Role-Aware Sessions" value="JD + Resume" />
          <StatPill label="Coaching Loop" value="Retry + Rewrite" />
          <StatPill label="Progress Tracking" value="Saved Locally" />
        </div>

        <div className="pt-4 md:pt-8 flex flex-col items-center gap-5">
          <Link
            href="/interview"
            className="btn-neo text-lg md:text-2xl px-10 md:px-16 py-4 md:py-6 shadow-[8px_8px_0px_0px_rgba(255,0,110,1)] text-center"
          >
            START INTERVIEW
          </Link>
          <p className="text-[10px] text-silver-fox opacity-50 tracking-[0.3em] uppercase px-4 text-center">
            Powered by Gemini / Resume-aware / Interview progress tracking
          </p>
        </div>
      </div>
    </main>
  );
}

function FeatureCard({
  title,
  description,
  icon,
  className = "",
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`card-brutal group hover:bg-electric-yellow hover:text-obsidian transition-colors ${className}`}>
      <div className="h-12 w-12 bg-hot-pink mb-4 border-2 border-obsidian flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {icon}
        </svg>
      </div>
      <h3 className="text-xl md:text-2xl mb-2">{title}</h3>
      <p className="text-xs md:text-sm">{description}</p>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-2 border-silver-fox/30 bg-white/5 px-4 py-3 text-center">
      <div className="text-[9px] font-black uppercase tracking-[0.25em] text-hot-pink sm:text-[10px]">
        {label}
      </div>
      <div className="mt-2 text-sm font-black uppercase text-electric-yellow sm:text-base">
        {value}
      </div>
    </div>
  );
}
