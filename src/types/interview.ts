export type InterviewMode = "video" | "audio";

export type PressureMode = "coach" | "real";

export interface InterviewScoreBreakdown {
  technical_score: number;
  vibe_score: number;
  star_score: number;
  content_score: number;
  clarity_score: number;
  confidence_score: number;
  structure_score: number;
  relevance_score: number;
  brevity_score: number;
  overall_score: number;
}

export interface InterviewEvaluation extends InterviewScoreBreakdown {
  has_response: boolean;
  response_status: string;
  technical_feedback: string;
  vibe_feedback: string;
  star_feedback: string;
  pacing_feedback: string;
  filler_word_feedback: string;
  role_fit_feedback: string;
  top_strength: string;
  top_improvement: string;
  example_answer: string;
  rewritten_answer: string;
  retry_prompt: string;
  hiring_signal: "strong_no" | "borderline" | "lean_yes" | "strong_yes";
  filler_word_count: number;
  estimated_wpm: number;
  strengths: string[];
  action_items: string[];
  weakness_tags: string[];
  follow_up_question: string;
}

export interface InterviewSession {
  roleTarget: string;
  companyTarget?: string;
  jobDescription?: string;
  resumeContext?: string;
  pressureMode?: PressureMode;
  interviewMode?: InterviewMode;
  question: string;
  transcript: string;
  answerDurationSec?: number;
  priorWeaknesses?: string[];
  audioAnalysis?: string;
  videoAnalysis?: string;
  imageBase64?: string;
}

export interface QuestionRequest {
  role: string;
  companyTarget?: string;
  jobDescription?: string;
  resumeContext?: string;
  bulk?: boolean;
  kind?: "default" | "followup";
  currentQuestion?: string;
  transcript?: string;
  evaluationSummary?: string;
}
