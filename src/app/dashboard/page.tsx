"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getDashboardStats, getUserSessions, getSessionWithAnswers, deleteSession } from "@/services/session-service";
import type { DashboardStats, DbInterviewSession, SessionWithAnswers } from "@/lib/supabase/database.types";
import type { User, AuthResponse } from "@supabase/supabase-js";
import Link from "next/link";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [sessions, setSessions] = useState<DbInterviewSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionWithAnswers | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function loadDashboard() {
      const { data }: AuthResponse = await supabase.auth.getUser();
      const authUser = data?.user ?? null;
      if (!authUser) {
        window.location.href = "/";
        return;
      }
      setUser(authUser);

      const [dashboardStats, sessionList] = await Promise.all([
        getDashboardStats(),
        getUserSessions(),
      ]);

      setStats(dashboardStats);
      setSessions(sessionList);
      setLoading(false);
    }

    loadDashboard();
  }, [supabase.auth]);

  const handleViewSession = async (sessionId: string) => {
    setSessionLoading(true);
    const detailed = await getSessionWithAnswers(sessionId);
    setSelectedSession(detailed);
    setSessionLoading(false);
  };

  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this session? This action cannot be undone.")) return;

    const success = await deleteSession(sessionId);
    if (success) {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (selectedSession?.id === sessionId) setSelectedSession(null);
      // Reload stats
      const newStats = await getDashboardStats();
      setStats(newStats);
    } else {
      alert("Failed to delete session. Please ensure your Supabase RLS policies are applied.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <div className="text-electric-yellow font-black animate-pulse uppercase tracking-widest">
          Loading Dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian text-silver-fox p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b-4 border-electric-yellow pb-6">
          <div>
            <p className="text-hot-pink font-black uppercase tracking-[0.3em] text-xs mb-2">Performance Center</p>
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter">
              DASH<span className="text-electric-yellow">BOARD</span>
            </h1>
          </div>
          <div className="text-right">
            <p className="text-silver-fox/60 text-xs font-bold uppercase tracking-widest">Logged in as</p>
            <p className="text-electric-yellow font-black">{user?.email}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Sessions" value={stats?.totalSessions || 0} color="border-electric-yellow" />
          <StatCard label="Avg Score" value={`${stats?.overallAverage}%`} color="border-hot-pink" />
          <StatCard label="Best Performance" value={`${stats?.bestScore}%`} color="border-white" />
          <StatCard label="Top Focus" value={stats?.mostPracticedRole || "—"} color="border-silver-fox" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Column: Session History */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
              <span className="w-8 h-8 bg-electric-yellow text-obsidian flex items-center justify-center text-lg">01</span>
              Interview History
            </h2>

            <div className="space-y-4">
              {sessions.length > 0 ? (
                sessions.map((session) => (
                  <div 
                    key={session.id}
                    onClick={() => handleViewSession(session.id)}
                    className={`cursor-pointer group relative border-4 transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none p-5 bg-black/40 ${selectedSession?.id === session.id ? 'border-hot-pink shadow-none bg-hot-pink/5' : 'border-silver-fox/20 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]'}`}
                  >
                    {/* Delete Button */}
                    <button 
                      onClick={(e) => handleDeleteSession(e, session.id)}
                      className="absolute top-4 right-4 p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:text-hot-pink"
                      title="Delete Session"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>

                    <div className="flex justify-between items-start mb-3 mr-8">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-hot-pink mb-1">
                          {new Date(session.created_at).toLocaleDateString()}
                        </p>
                        <h3 className="text-xl font-black text-white group-hover:text-electric-yellow transition-colors">
                          {session.role_target}
                        </h3>
                        {session.company_target && (
                          <p className="text-xs font-bold text-silver-fox/60 uppercase">@ {session.company_target}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-electric-yellow">{session.avg_score}%</p>
                        <p className="text-[10px] font-bold uppercase text-silver-fox/40">Avg Score</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-silver-fox/60">
                      <span>{session.question_count} Questions</span>
                      <span>•</span>
                      <span>{session.interview_mode} Mode</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="border-4 border-dashed border-silver-fox/20 p-12 text-center">
                  <p className="text-silver-fox/40 font-bold uppercase tracking-widest">No sessions recorded yet.</p>
                  <Link href="/interview" className="inline-block mt-4 text-electric-yellow font-black border-b-2 border-electric-yellow hover:text-white hover:border-white transition-all">
                    Start Your First Session →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Column: Detailed Insights */}
          <div className="space-y-8">
            {/* Detailed View */}
            <div className="border-4 border-electric-yellow bg-obsidian p-6 shadow-[8px_8px_0px_0px_#FF006E]">
              <h2 className="text-xl font-black uppercase mb-6 flex justify-between items-center">
                Detailed View
                {sessionLoading && <span className="animate-spin text-hot-pink">⟳</span>}
              </h2>

              {selectedSession ? (
                <div className="space-y-6">
                  {selectedSession.interview_answers.map((answer, idx) => (
                    <div key={answer.id} className="border-l-4 border-hot-pink pl-4 py-1 space-y-2">
                      <p className="text-[10px] font-black text-hot-pink uppercase tracking-widest">Question {idx + 1}</p>
                      <p className="text-sm font-bold text-white leading-tight">{answer.question}</p>
                      <div className="flex justify-between items-center">
                         <span className={`text-[10px] font-black uppercase px-2 py-0.5 ${
                           answer.hiring_signal === 'strong_yes' ? 'bg-green-500/20 text-green-400' :
                           answer.hiring_signal === 'lean_yes' ? 'bg-blue-500/20 text-blue-400' :
                           answer.hiring_signal === 'strong_no' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                         }`}>
                           {answer.hiring_signal.replace('_', ' ')}
                         </span>
                         <span className="text-lg font-black text-electric-yellow">{answer.overall_score}%</span>
                      </div>
                      <details className="group">
                        <summary className="text-[10px] font-black uppercase cursor-pointer text-silver-fox/40 hover:text-silver-fox transition-colors list-none">
                          View Details +
                        </summary>
                        <div className="mt-3 space-y-4 pt-3 border-t border-silver-fox/10">
                          <div>
                            <p className="text-[10px] font-black uppercase text-electric-yellow mb-1">Your Transcript</p>
                            <p className="text-xs italic text-silver-fox/70 leading-relaxed">&quot;{answer.transcript}&quot;</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase text-hot-pink mb-1">AI Improvement</p>
                            <p className="text-xs text-silver-fox/90 leading-relaxed">{answer.rewritten_answer}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-white/5 p-2 border border-white/10">
                              <p className="text-[8px] font-black uppercase text-silver-fox/40 mb-1">Strength</p>
                              <p className="text-[10px] font-bold text-silver-fox">{answer.top_strength}</p>
                            </div>
                            <div className="bg-white/5 p-2 border border-white/10">
                              <p className="text-[8px] font-black uppercase text-silver-fox/40 mb-1">Improvement</p>
                              <p className="text-[10px] font-bold text-silver-fox">{answer.top_improvement}</p>
                            </div>
                          </div>
                        </div>
                      </details>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-sm text-silver-fox/40 font-bold italic">Select a session from the history to view detailed AI feedback per question.</p>
                </div>
              )}
            </div>

            {/* Skill Radar */}
            <div className="border-4 border-silver-fox bg-black/40 p-6">
              <h3 className="text-lg font-black uppercase mb-4 text-white">Skill Radar</h3>
              <div className="space-y-4">
                {Object.entries(stats?.skillAverages || {}).map(([skill, value]) => (
                  <div key={skill}>
                    <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                      <span>{skill}</span>
                      <span className="text-electric-yellow">{value}%</span>
                    </div>
                    <div className="h-2 bg-white/5 border border-white/10 overflow-hidden">
                      <div 
                        className="h-full bg-electric-yellow transition-all duration-1000"
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weakness Tags */}
            <div className="border-4 border-hot-pink bg-black/40 p-6 shadow-[4px_4px_0px_0px_#FF006E]">
              <h3 className="text-lg font-black uppercase mb-4 text-white">Weakness Trends</h3>
              <div className="flex flex-wrap gap-2">
                {stats?.weaknessFrequency.length ? (
                  stats.weaknessFrequency.map(([tag, count]) => (
                    <span key={tag} className="px-2 py-1 bg-hot-pink/10 border border-hot-pink/30 text-[10px] font-bold text-hot-pink uppercase">
                      {tag} ({count})
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-silver-fox/40 italic">Not enough data yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className={`border-4 ${color} bg-obsidian p-4 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)]`}>
      <p className="text-[10px] font-black uppercase tracking-widest text-silver-fox/60 mb-1">{label}</p>
      <p className="text-xl sm:text-2xl font-black text-white truncate">{value}</p>
    </div>
  );
}
