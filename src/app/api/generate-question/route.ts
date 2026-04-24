import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { QuestionRequest } from "@/types/interview";

const GEMINI_MODEL = "gemini-3.1-flash-lite-preview";

function isQuotaError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("429") || message.toLowerCase().includes("quota");
}

function buildQuestionPrompt(request: QuestionRequest) {
  if (request.kind === "followup") {
    return `
You are generating a realistic interviewer follow-up question.

ROLE: ${request.role}
COMPANY: ${request.companyTarget || "Not provided"}
JOB DESCRIPTION:
${request.jobDescription || "Not provided"}

RESUME CONTEXT:
${request.resumeContext || "Not provided"}

CURRENT QUESTION:
${request.currentQuestion || "Not provided"}

USER ANSWER:
${request.transcript || "Not provided"}

EVALUATION SUMMARY:
${request.evaluationSummary || "Not provided"}

Return a single concise follow-up question only. Make it probing, realistic, and specific.
`;
  }

  if (request.bulk) {
    return `
Generate 5 interview questions as a strict JSON array of strings.

ROLE: ${request.role}
COMPANY: ${request.companyTarget || "Not provided"}
JOB DESCRIPTION:
${request.jobDescription || "Not provided"}

RESUME CONTEXT:
${request.resumeContext || "Not provided"}

Rules:
- Mix behavioral, role-specific, and execution questions.
- At least one question should test ownership.
- At least one should test measurable impact.
- At least one should sound like a realistic hiring manager question.
- Return only JSON like ["Question 1", "Question 2"].
`;
  }

  return `
Generate one interview question only.

ROLE: ${request.role}
COMPANY: ${request.companyTarget || "Not provided"}
JOB DESCRIPTION:
${request.jobDescription || "Not provided"}

RESUME CONTEXT:
${request.resumeContext || "Not provided"}

The question should feel realistic and tailored to the candidate's likely interview.
Return only the question text.
`;
}

export async function POST(req: Request) {
  const request = (await req.json()) as QuestionRequest;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "Gemini API key is not configured on the server.",
          source: "gemini",
        },
        { status: 503 },
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const result = await model.generateContent(buildQuestionPrompt(request));
    const text = result.response.text().trim();

    if (request.kind === "followup") {
      return NextResponse.json({
        question: text.replace(/^["']|["']$/g, "").trim(),
        source: "gemini",
      });
    }

    if (request.bulk) {
      try {
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text) as unknown;
        const questions = Array.isArray(parsed)
          ? parsed.filter((item): item is string => typeof item === "string")
          : [];

        return NextResponse.json({
          questions: questions.length > 0 ? questions : [text],
          source: "gemini",
        });
      } catch {
        return NextResponse.json({ questions: [text], source: "gemini" });
      }
    }

    return NextResponse.json({
      question: text.replace(/^["']|["']$/g, "").trim(),
      source: "gemini",
    });
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
            "Gemini question generation is temporarily unavailable because the current API key has hit quota limits. Add a new Gemini API key or retry after the quota window resets.",
          source: "gemini",
        },
        { status: 429 },
      );
    }

    const message = error instanceof Error ? error.message : "Failed to generate question";
    const isServiceBusy = message.includes("503") || message.includes("Service Unavailable") || message.includes("high demand");

    if (isServiceBusy) {
      return NextResponse.json(
        {
          error: "HiredBabe is getting a lot of love right now! Our AI coach is currently busy helping other candidates. Please wait a minute and try again.",
          source: "gemini",
        },
        { status: 503 },
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
