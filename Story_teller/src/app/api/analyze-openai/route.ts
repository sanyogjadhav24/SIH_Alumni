// Alternative API route using OpenAI's GPT-4 Vision (if you prefer OpenAI over Hugging Face)
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File | null;
    const text = formData.get("text") as string | null;

    if (!image && !text) {
      return NextResponse.json(
        { error: "Please provide either an image or text" },
        { status: 400 }
      );
    }

    let summary = "";
    let sentiment = "Neutral";
    let keyTopics: string[] = [];
    let confidence = 0.85;

    // Prepare content for analysis
    const messages: any[] = [
      {
        role: "system",
        content: `You are an AI assistant that analyzes social media posts. 
        Provide a brief summary, sentiment analysis, and key topics. 
        Respond in JSON format with: summary, sentiment, keyTopics (array), confidence (0-1).`
      }
    ];

    // Add text content
    if (text) {
      messages.push({
        role: "user",
        content: `Analyze this text: "${text}"`
      });
    }

    // Add image content if provided
    if (image) {
      const imageBuffer = await image.arrayBuffer();
      const base64Image = Buffer.from(imageBuffer).toString('base64');
      
      messages.push({
        role: "user",
        content: [
          {
            type: "text",
            text: text ? `Also analyze this image along with the text above:` : "Analyze this image:"
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`
            }
          }
        ]
      });
    }

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4-vision-preview", // or "gpt-4o" for newer models
      messages: messages,
      max_tokens: 1000,
    });

    const responseContent = completion.choices[0].message.content;
    
    try {
      const analysisResult = JSON.parse(responseContent || "{}");
      summary = analysisResult.summary || "Unable to generate summary";
      sentiment = analysisResult.sentiment || "Neutral";
      keyTopics = analysisResult.keyTopics || ["general"];
      confidence = analysisResult.confidence || 0.85;
    } catch (parseError) {
      // Fallback parsing if JSON is malformed
      summary = responseContent || "Analysis completed";
      keyTopics = extractTopicsFromText(responseContent || "");
    }

    return NextResponse.json({
      summary,
      sentiment,
      keyTopics,
      confidence
    });

  } catch (error) {
    console.error("OpenAI analysis error:", error);
    return NextResponse.json(
      { error: "Analysis failed" },
      { status: 500 }
    );
  }
}

function extractTopicsFromText(text: string): string[] {
  // Simple keyword extraction fallback
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  return [...new Set(words)].slice(0, 5);
}