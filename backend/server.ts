import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Enable CORS for all requests to support multi-application architecture
app.use(cors());
app.use(express.json());

// Initialize GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Helper for model fallback when a model is experiencing high demand (503)
async function generateContentWithFallback(userPrompt: string, systemInstruction: string) {
  const models = ["gemini-2.5-flash", "gemini-2.5-pro"];
  let lastError: any = null;

  for (const model of models) {
    try {
      console.log(`[Translation] Trying model: ${model}`);
      const response = await ai.models.generateContent({
        model: model,
        contents: userPrompt,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
        },
      });

      if (response && response.text) {
        console.log(`[Translation] Success with model: ${model}`);
        return response.text;
      }
    } catch (error: any) {
      console.warn(`[Translation] Model ${model} failed:`, error.message || error);
      lastError = error;
    }
  }
  throw lastError || new Error("All translation models failed");
}

// API Route: Translate name and roles
app.post("/api/translate", async (req, res) => {
  const { name, role } = req.body;
  if (!name && !role) {
    return res.status(400).json({ error: "Missing fields to translate" });
  }

  const systemPrompt = `You are a professional Tamil translator and transliterator specializing in formal political, organizational, and executive roles and personal names in Tamil Nadu.
  Translate the given English fields into formal, accurate Tamil.
  Follow these rules:
  - For personal names, perform precise phonetic transliteration (e.g. "Manivannan" -> "மணிவண்ணன்", "Prabakaran" -> "பிரபாகரன்", initials like "S." -> "எஸ்.").
  - For official roles, translate to the standard, widely accepted Tamil administrative/organizational title (e.g. "State Chief Advisor" -> "மாநில தலைமை ஆலோசகர்", "Principal Secretary" -> "முதன்மை செயலாளர்", "Administrative Secretary" -> "நிர்வாக செயலாளர்", "State Organizing Secretary" -> "மாநில அமைப்பாளர் / செயலாளர்", "Zonal Secretary" -> "மண்டல செயலாளர்", "State News Correspondent" -> "மாநில செய்தி தொடர்பாளர்").
  
  Respond in JSON format as specified.`;

  const userPrompt = `Translate the following English inputs to Tamil:
  {
    "name": "${name || ''}",
    "role": "${role || ''}"
  }

  Respond exactly in this JSON format:
  {
    "tamilName": "translated or transliterated Tamil name here",
    "tamilRole": "translated Tamil role here"
  }`;

  try {
    let text = await generateContentWithFallback(userPrompt, systemPrompt);
    text = text.replace(/```json\n?|```/g, '').trim();
    const data = JSON.parse(text);
    res.json(data);
  } catch (error: any) {
    console.warn("[Translation API] Final error in basic translation:", error);
    res.json({
      tamilName: name || "",
      tamilRole: role || ""
    });
  }
});

// API Route: Translate member details (constituency, union, name)
app.post("/api/translate-member-details", async (req, res) => {
  const { name, constituency, union } = req.body;
  if (!name && !constituency && !union) {
    return res.status(400).json({ error: "Missing fields to translate" });
  }

  const systemPrompt = `You are a professional Tamil translator and transliterator specializing in formal personal names, Tamil Nadu constituencies, districts, and local municipal divisions (unions/blocks).
  Translate and transliterate the given English fields into formal, accurate Tamil.
  Follow these rules:
  - For personal names, perform precise phonetic transliteration (e.g. "Kumar" -> "குமார்", "Sundar" -> "சுந்தர்", "Arun" -> "அருண்", "Ramesh" -> "ரமேஷ்").
  - For constituencies and unions, translate/transliterate them correctly using standard Tamil names of towns and administrative areas of Tamil Nadu (e.g., "Madurai East" -> "மதுரை கிழக்கு", "Melur" -> "மேலூர்", "Avadi" -> "ஆவடி", "Tambaram" -> "தாம்பரம்").
  
  Respond in JSON format as specified.`;

  const userPrompt = `Translate the following English inputs to Tamil:
  {
    "name": "${name || ''}",
    "constituency": "${constituency || ''}",
    "union": "${union || ''}"
  }

  Respond exactly in this JSON format:
  {
    "tamilName": "translated or transliterated Tamil name here",
    "tamilConstituency": "translated Tamil constituency here",
    "tamilUnion": "translated Tamil union here"
  }`;

  try {
    let text = await generateContentWithFallback(userPrompt, systemPrompt);
    text = text.replace(/```json\n?|```/g, '').trim();
    const data = JSON.parse(text);
    res.json(data);
  } catch (error: any) {
    console.warn("[Translation API] Final error in member details translation:", error);
    res.json({
      tamilName: name || "",
      tamilConstituency: constituency || "",
      tamilUnion: union || ""
    });
  }
});

// API Route: Proxy images to allow canvas export of cards without CORS contamination
app.get("/api/proxy-image", async (req, res) => {
  const imageUrl = req.query.url as string;
  if (!imageUrl) {
    return res.status(400).send("Missing url parameter");
  }
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      return res.status(response.status).send("Failed to fetch image");
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = response.headers.get("content-type") || "image/png";
    res.set("Content-Type", contentType);
    res.set("Access-Control-Allow-Origin", "*");
    res.send(buffer);
  } catch (error) {
    res.status(500).send("Error proxying image");
  }
});

// Root check endpoint
app.get("/", (req, res) => {
  res.json({ status: "online", service: "National Rights Forum API Backend" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend server running on port ${PORT}`);
});
