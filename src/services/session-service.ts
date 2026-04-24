import { createClient } from "@/lib/supabase/client";
import type {
  DbInterviewSession,
  DbInterviewAnswer,
  SessionWithAnswers,
  DashboardStats,
} from "@/lib/supabase/database.types";
import type { InterviewEvaluation } from "@/types/interview";

const supabase = createClient();

/* ─── Create a new session ──────────────────────────────── */
export async function createSession(data: {
  userId: string;
  roleTarget: string;
  companyTarget: string;
  interviewMode: string;
  pressureMode: string;
}): Promise<string | null> {
  try {
    const { data: row, error } = await supabase
      .from("interview_sessions")
      .insert({
        user_id: data.userId,
        role_target: data.roleTarget,
        company_target: data.companyTarget,
        interview_mode: data.interviewMode,
        pressure_mode: data.pressureMode,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase error creating session:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return null;
    }

    return row.id;
  } catch (err) {
    console.error("Unexpected error in createSession:", err);
    return null;
  }
}

/* ─── Save an answer ────────────────────────────────────── */
export async function saveAnswer(data: {
  sessionId: string;
  userId: string;
  question: string;
  transcript: string;
  evaluation: InterviewEvaluation;
}): Promise<boolean> {
  try {
    const { error } = await supabase.from("interview_answers").insert({
      session_id: data.sessionId,
      user_id: data.userId,
      question: data.question,
      transcript: data.transcript,
      overall_score: data.evaluation.overall_score,
      technical_score: data.evaluation.technical_score,
      vibe_score: data.evaluation.vibe_score,
      star_score: data.evaluation.star_score,
      clarity_score: data.evaluation.clarity_score,
      confidence_score: data.evaluation.confidence_score,
      relevance_score: data.evaluation.relevance_score,
      hiring_signal: data.evaluation.hiring_signal,
      top_strength: data.evaluation.top_strength,
      top_improvement: data.evaluation.top_improvement,
      rewritten_answer: data.evaluation.rewritten_answer,
      weakness_tags: data.evaluation.weakness_tags,
      strengths: data.evaluation.strengths,
      action_items: data.evaluation.action_items,
      filler_word_count: data.evaluation.filler_word_count,
      estimated_wpm: data.evaluation.estimated_wpm,
    });

    if (error) {
      console.error("Supabase error saving answer:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return false;
    }

    return true;
  } catch (err) {
    console.error("Unexpected error in saveAnswer:", err);
    return false;
  }
}

/* ─── Finalize session with computed stats ───────────────── */
export async function finalizeSession(
  sessionId: string,
  answers: { overall_score: number }[],
): Promise<void> {
  if (answers.length === 0) return;

  try {
    const scores = answers.map((a) => a.overall_score);
    const avg = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
    const best = Math.max(...scores);

    const { error } = await supabase
      .from("interview_sessions")
      .update({
        question_count: answers.length,
        avg_score: avg,
        best_score: best,
      })
      .eq("id", sessionId);

    if (error) {
      console.error("Supabase error finalizing session:", error);
    }
  } catch (err) {
    console.error("Unexpected error in finalizeSession:", err);
  }
}

/* ─── Get all sessions for a user ────────────────────────── */
export async function getUserSessions(): Promise<DbInterviewSession[]> {
  try {
    const { data, error } = await supabase
      .from("interview_sessions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      // Log more details to help debug
      console.error("Supabase error fetching sessions:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Unexpected error in getUserSessions:", err);
    return [];
  }
}

/* ─── Get a session with its answers ─────────────────────── */
export async function getSessionWithAnswers(
  sessionId: string,
): Promise<SessionWithAnswers | null> {
  try {
    const { data, error } = await supabase
      .from("interview_sessions")
      .select("*, interview_answers(*)")
      .eq("id", sessionId)
      .order("created_at", { referencedTable: "interview_answers", ascending: true })
      .single();

    if (error) {
      console.error("Supabase error fetching session details:", error);
      return null;
    }

    return data as SessionWithAnswers;
  } catch (err) {
    console.error("Unexpected error in getSessionWithAnswers:", err);
    return null;
  }
}

/* ─── Delete a session ──────────────────────────────────── */
export async function deleteSession(sessionId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from("interview_sessions")
      .delete()
      .eq("id", sessionId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Supabase error deleting session:", {
        code: error.code,
        message: error.message,
        details: error.details
      });
      return false;
    }

    return true;
  } catch (err) {
    console.error("Unexpected error in deleteSession:", err);
    return false;
  }
}

/* ─── Get all answers for dashboard stats ────────────────── */
export async function getAllAnswers(): Promise<DbInterviewAnswer[]> {
  try {
    const { data, error } = await supabase
      .from("interview_answers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error fetching answers:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Unexpected error in getAllAnswers:", err);
    return [];
  }
}

/* ─── Compute dashboard stats ────────────────────────────── */
export async function getDashboardStats(): Promise<DashboardStats> {
  const [sessions, answers] = await Promise.all([
    getUserSessions(),
    getAllAnswers(),
  ]);

  const totalSessions = sessions.length;
  const totalAnswers = answers.length;

  const overallAverage =
    totalAnswers > 0
      ? Math.round(
          answers.reduce((sum, a) => sum + a.overall_score, 0) / totalAnswers,
        )
      : 0;

  const bestScore =
    totalAnswers > 0
      ? Math.max(...answers.map((a) => a.overall_score))
      : 0;

  // Most practiced role
  const roleCounts = new Map<string, number>();
  sessions.forEach((s) => {
    roleCounts.set(s.role_target, (roleCounts.get(s.role_target) || 0) + 1);
  });
  const mostPracticedRole =
    [...roleCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  // Skill averages
  const avg = (key: keyof DbInterviewAnswer) =>
    totalAnswers > 0
      ? Math.round(
          answers.reduce((sum, a) => sum + (a[key] as number), 0) /
            totalAnswers,
        )
      : 0;

  const skillAverages = {
    technical: avg("technical_score"),
    vibe: avg("vibe_score"),
    star: avg("star_score"),
    clarity: avg("clarity_score"),
    confidence: avg("confidence_score"),
    relevance: avg("relevance_score"),
  };

  // Hiring signals
  const hiringSignals = { strong_yes: 0, lean_yes: 0, borderline: 0, strong_no: 0 };
  answers.forEach((a) => {
    const signal = a.hiring_signal as keyof typeof hiringSignals;
    if (signal in hiringSignals) hiringSignals[signal]++;
  });

  // Weakness frequency
  const weakCounts = new Map<string, number>();
  answers.forEach((a) => {
    (a.weakness_tags || []).forEach((tag) => {
      weakCounts.set(tag, (weakCounts.get(tag) || 0) + 1);
    });
  });
  const weaknessFrequency = [...weakCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  // Recent scores (last 20)
  const recentScores = answers.slice(0, 20).map((a) => ({
    score: a.overall_score,
    date: a.created_at,
  }));

  return {
    totalSessions,
    totalAnswers,
    overallAverage,
    bestScore,
    mostPracticedRole,
    skillAverages,
    hiringSignals,
    weaknessFrequency,
    recentScores,
  };
}
