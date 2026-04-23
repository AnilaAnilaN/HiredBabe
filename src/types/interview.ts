export interface InterviewEvaluation {
  technical_score: number;
  vibe_score: number;
  star_score: number;
  overall_score: number;
  technical_feedback: string;
  vibe_feedback: string;
  star_feedback: string;
  top_strength: string;
  top_improvement: string;
  example_answer: string;
}

export interface InterviewSession {
  roleTarget: string;
  question: string;
  transcript: string;
  audioAnalysis?: string;
  videoAnalysis?: string;
  imageBase64?: string;
}
