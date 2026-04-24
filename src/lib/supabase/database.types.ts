export interface DbInterviewSession {
  id: string;
  user_id: string;
  role_target: string;
  company_target: string;
  interview_mode: string;
  pressure_mode: string;
  question_count: number;
  avg_score: number;
  best_score: number;
  created_at: string;
}

export interface DbInterviewAnswer {
  id: string;
  session_id: string;
  user_id: string;
  question: string;
  transcript: string;
  overall_score: number;
  technical_score: number;
  vibe_score: number;
  star_score: number;
  clarity_score: number;
  confidence_score: number;
  relevance_score: number;
  hiring_signal: string;
  top_strength: string;
  top_improvement: string;
  rewritten_answer: string;
  weakness_tags: string[];
  strengths: string[];
  action_items: string[];
  filler_word_count: number;
  estimated_wpm: number;
  created_at: string;
}

export interface SessionWithAnswers extends DbInterviewSession {
  interview_answers: DbInterviewAnswer[];
}

export interface DashboardStats {
  totalSessions: number;
  totalAnswers: number;
  overallAverage: number;
  bestScore: number;
  mostPracticedRole: string;
  skillAverages: {
    technical: number;
    vibe: number;
    star: number;
    clarity: number;
    confidence: number;
    relevance: number;
  };
  hiringSignals: {
    strong_yes: number;
    lean_yes: number;
    borderline: number;
    strong_no: number;
  };
  weaknessFrequency: [string, number][];
  recentScores: { score: number; date: string }[];
}
