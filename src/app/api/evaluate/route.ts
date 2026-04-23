import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPT } from "@/services/gemini-service";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { roleTarget, question, transcript, audioAnalysis, videoAnalysis, imageBase64 } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "API Key not configured on server" }, { status: 500 });
    }

    // DEBUG: List available models to terminal to find the correct ID
    /*
    const listModels = await genAI.getGenerativeModel({ model: "gemini-pro" }); 
    // Note: genAI doesn't have a direct listModels, but we can try common IDs
    */

    // Using Gemini 3 Flash Preview (2026 Standard)
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const prompt = `
      Evaluate the following interview response for the role of ${roleTarget}.
      
      QUESTION: ${question}
      USER TRANSCRIPT: ${transcript}
      
      ${audioAnalysis ? `AUDIO SIGNALS: ${audioAnalysis}` : ""}
      ${videoAnalysis ? `VIDEO SIGNALS: ${videoAnalysis}` : ""}
      
      If an image is provided, analyze the candidate's facial expressions, eye contact, and posture.
      
      Provide specific feedback, quote the transcript, and be encouraging but honest.
      
      IMPORTANT: You MUST also provide a "Perfect Example Answer" (example_answer) that would score 100% for this specific question.
    `;

    // Prepare content parts for multimodal input
    const parts: any[] = [{ text: SYSTEM_PROMPT }, { text: prompt }];
    
    if (imageBase64) {
      const imageData = imageBase64.split(",")[1]; // Remove prefix
      parts.push({
        inlineData: {
          data: imageData,
          mimeType: "image/jpeg"
        }
      });
    }

    const result = await model.generateContent(parts);
    const response = await result.response;
    const text = response.text();
    
    const jsonStr = text.match(/\{[\s\S]*\}/)?.[0] || text;
    const evaluation = JSON.parse(jsonStr);

    return NextResponse.json(evaluation);
  } catch (error: any) {
    console.error("Gemini API Error Detail:", error);
    
    // Fallback attempt with 'gemini-pro' if flash fails
    if (error.message?.includes("404")) {
       return NextResponse.json({ 
         error: "Model not found. Your API key might only have access to 'gemini-pro'. Please check your Google AI Studio dashboard.",
         suggestion: "Try changing the model to 'gemini-pro' in src/app/api/evaluate/route.ts"
       }, { status: 404 });
    }

    return NextResponse.json({ error: error.message || "Failed to evaluate interview" }, { status: 500 });
  }
}
