import { GoogleGenerativeAI } from "@google/generative-ai";

async function testKey() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ No API key found in Environment");
    return;
  }

  console.log("Testing key...");
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  try {
    const result = await model.generateContent("Say 'System Online'");
    console.log("✅ SUCCESS! Gemini responded:", result.response.text());
  } catch (error) {
    console.error("❌ FAILURE!");
    console.error("Status:", error.status);
    console.error("Message:", error.message);
  }
}

testKey();
