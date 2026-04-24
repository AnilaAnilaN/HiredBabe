import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPT } from "@/services/gemini-service";
import { InterviewEvaluation, InterviewSession } from "@/types/interview";

const GEMINI_MODEL = "gemini-3.1-flash-lite-preview";

const noResponseEvaluation: InterviewEvaluation = {
  has_response: false,
  response_status:
    "No spoken answer was captured yet. Start the round and speak before finishing or waiting for the timer.",
  technical_score: 0,
  vibe_score: 0,
  star_score: 0,
  content_score: 0,
  clarity_score: 0,
  confidence_score: 0,
  structure_score: 0,
  relevance_score: 0,
  brevity_score: 0,
  overall_score: 0,
  technical_feedback: "",
  vibe_feedback: "",
  star_feedback: "",
  pacing_feedback: "",
  filler_word_feedback: "",
  role_fit_feedback: "",
  top_strength: "",
  top_improvement: "",
  example_answer: "",
  rewritten_answer: "",
  retry_prompt:
    "Try again after speaking your answer out loud so HiredBabe can evaluate the real response.",
  hiring_signal: "borderline",
  filler_word_count: 0,
  estimated_wpm: 0,
  strengths: [],
  action_items: [],
  weakness_tags: [],
  follow_up_question: "",
};

function clampScore(value: unknown) {
  const num = Number(value);
  if (Number.isNaN(num)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(num)));
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function asHiringSignal(
  value: unknown,
): InterviewEvaluation["hiring_signal"] {
  if (
    value === "strong_no" ||
    value === "borderline" ||
    value === "lean_yes" ||
    value === "strong_yes"
  ) {
    return value;
  }

  return "borderline";
}

function countWords(text: string) {
  const words = text.trim().match(/\b[\w'-]+\b/g);
  return words ? words.length : 0;
}

function isQuotaError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("429") || message.toLowerCase().includes("quota");
}

function sanitizeEvaluation(raw: unknown): InterviewEvaluation {
  if (!raw || typeof raw !== "object") {
    throw new Error("Gemini returned an invalid evaluation payload.");
  }

  const data = raw as Record<string, unknown>;

  return {
    has_response:
      typeof data.has_response === "boolean" ? data.has_response : true,
    response_status: asString(data.response_status, "ok"),
    technical_score: clampScore(data.technical_score),
    vibe_score: clampScore(data.vibe_score),
    star_score: clampScore(data.star_score),
    content_score: clampScore(data.content_score),
    clarity_score: clampScore(data.clarity_score),
    confidence_score: clampScore(data.confidence_score),
    structure_score: clampScore(data.structure_score),
    relevance_score: clampScore(data.relevance_score),
    brevity_score: clampScore(data.brevity_score),
    overall_score: clampScore(data.overall_score),
    technical_feedback: asString(data.technical_feedback),
    vibe_feedback: asString(data.vibe_feedback),
    star_feedback: asString(data.star_feedback),
    pacing_feedback: asString(data.pacing_feedback),
    filler_word_feedback: asString(data.filler_word_feedback),
    role_fit_feedback: asString(data.role_fit_feedback),
    top_strength: asString(data.top_strength),
    top_improvement: asString(data.top_improvement),
    example_answer: asString(data.example_answer),
    rewritten_answer: asString(data.rewritten_answer),
    retry_prompt: asString(data.retry_prompt),
    hiring_signal: asHiringSignal(data.hiring_signal),
    filler_word_count: clampScore(data.filler_word_count),
    estimated_wpm: clampScore(data.estimated_wpm),
    strengths: asStringArray(data.strengths),
    action_items: asStringArray(data.action_items),
    weakness_tags: asStringArray(data.weakness_tags),
    follow_up_question: asString(data.follow_up_question),
  };
}

function buildPrompt(session: InterviewSession) {
  const priorWeaknesses =
    session.priorWeaknesses && session.priorWeaknesses.length > 0
      ? session.priorWeaknesses.join(", ")
      : "none yet";

  return `
Evaluate the following interview response.

TARGET ROLE: ${session.roleTarget}
TARGET COMPANY: ${session.companyTarget || "Not provided"}
PRESSURE MODE: ${session.pressureMode || "coach"}
INTERVIEW MODE: ${session.interviewMode || "video"}
ANSWER DURATION: ${session.answerDurationSec || 0} seconds
KNOWN WEAKNESSES SO FAR: ${priorWeaknesses}

JOB DESCRIPTION:
${session.jobDescription || "Not provided"}

RESUME CONTEXT:
${session.resumeContext || "Not provided"}

QUESTION:
${session.question}

USER TRANSCRIPT:
${session.transcript || "No transcript provided."}

${session.audioAnalysis ? `AUDIO SIGNALS: ${session.audioAnalysis}` : ""}
${session.videoAnalysis ? `VIDEO SIGNALS: ${session.videoAnalysis}` : ""}

If an image is provided, inspect eye contact, visible confidence, and posture. If the image is weak or unavailable, say nothing about it rather than inventing details.

Rules:
- Return strict JSON only.
- If no real answer was provided, set has_response to false and explain that no response was captured.
- Do not invent strengths, pacing, structure, or role-fit commentary when there is no answer.
- When there is an answer, be direct, specific, and encouraging.
`;
}

export async function POST(req: Request) {
  const session = (await req.json()) as InterviewSession;
  const transcriptWordCount = countWords(session.transcript || "");

  try {
    if (transcriptWordCount === 0) {
      return NextResponse.json(noResponseEvaluation);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is not configured on the server." },
        { status: 503 },
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const parts: Array<
      | { text: string }
      | { inlineData: { data: string; mimeType: string } }
    > = [{ text: SYSTEM_PROMPT }, { text: buildPrompt(session) }];

    if (session.imageBase64) {
      const imageData = session.imageBase64.split(",")[1];
      if (imageData) {
        parts.push({
          inlineData: {
            data: imageData,
            mimeType: "image/jpeg",
          },
        });
      }
    }

    const result = await model.generateContent(parts);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);

    return NextResponse.json(sanitizeEvaluation(parsed));
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string; response?: { data?: unknown } };
    console.error("--- GEMINI DEBUG START ---");
    console.error("Error Status:", err?.status);
    console.error("Error Message:", err?.message);
    console.error("Error Details:", JSON.stringify(err?.response?.data || {}, null, 2));
    console.error("--- GEMINI DEBUG END ---");

    if (isQuotaError(error)) {
      return NextResponse.json(
        {
          error:
            "Gemini evaluation is temporarily unavailable because the current API key has hit quota limits. Add a new Gemini API key or retry after the quota window resets.",
        },
        { status: 429 },
      );
    }

    const message = error instanceof Error ? error.message : "Failed to evaluate interview";
    const isServiceBusy = message.includes("503") || message.includes("Service Unavailable") || message.includes("high demand");

    if (isServiceBusy) {
      return NextResponse.json(
        {
          error: "HiredBabe is getting a lot of love right now! Our AI coach is currently busy helping other candidates. Please wait a minute and try again.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
