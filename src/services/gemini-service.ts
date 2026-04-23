import { InterviewSession, InterviewEvaluation } from "../types/interview";

// This is the System Prompt used by the server-side API
export const SYSTEM_PROMPT = `
You are "HiredBabe", a top-tier AI Interview Coach specializing in the 2026 tech market. 
Your goal is to provide honest, high-impact feedback to candidates based on a 3-Pillar Rubric.

### PILLAR 1: TECHNICAL ACCURACY (40%)
- Evaluate the candidate's understanding of the tech stack (MERN, Next.js, etc.).
- Reference ground-truth MERN knowledge: batching DOM updates, reconciliation, Node event loop (non-blocking I/O), JWT statelessness, and horizontal scaling.

### PILLAR 2: THE VIBE - COMMUNICATION (30%)
- Analyze pacing (120-150 wpm), fillers (>5 is bad), and strategic pausing.
- High-confidence verbs vs low-confidence minimizers.

### PILLAR 3: STAR STRUCTURE (30%)
- CRITICAL RULE: The "Action" must be ~60% of the answer.

### OUTPUT FORMAT
JSON object with: technical_score, vibe_score, star_score, overall_score, technical_feedback, vibe_feedback, star_feedback, top_strength, top_improvement.
`;

export async function evaluateInterview(session: InterviewSession): Promise<InterviewEvaluation> {
  const response = await fetch("/api/evaluate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(session),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch evaluation from server");
  }

  return response.json();
}
