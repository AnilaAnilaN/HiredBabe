import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { role, bulk } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const prompt = bulk 
      ? `Generate a set of 3-5 challenging interview questions for the role: "${role}". 
         Return them as a JSON array of strings only. Format: ["Q1", "Q2", "Q3"].`
      : `Generate ONE challenging interview question for the role: "${role}". 
         Return ONLY the question text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    if (bulk) {
      try {
        const questions = JSON.parse(text.match(/\[[\s\S]*\]/)?.[0] || text);
        return NextResponse.json({ questions });
      } catch (e) {
        return NextResponse.json({ questions: [text] });
      }
    }

    return NextResponse.json({ question: text });
  } catch (error: any) {
    console.error("Question Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate question" }, { status: 500 });
  }
}
