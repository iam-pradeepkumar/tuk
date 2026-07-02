import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

let currentMaxId = -1;
let idMutex = false;

app.post('/api/generate-id', async (req, res) => {
  while (idMutex) {
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  idMutex = true;
  try {
    if (currentMaxId === -1) {
      if (supabase) {
        const { data } = await supabase.from('memberships').select('memberId, cardId');
        if (data && data.length > 0) {
          const nrfNumbers = data
            .map((m: any) => {
              const id = m.cardId || m.memberId || '';
              const match = id.match(/^NRF-(\d+)$/);
              return match ? parseInt(match[1], 10) : null;
            })
            .filter((n): n is number => n !== null);
          if (nrfNumbers.length > 0) {
            currentMaxId = Math.max(...nrfNumbers);
          } else {
            currentMaxId = 7000;
          }
        } else {
          currentMaxId = 7000;
        }
      } else {
        currentMaxId = 7000;
      }
    }
    currentMaxId++;
    res.json({ id: `NRF-${currentMaxId}` });
  } catch (e) {
    console.error("Generate ID Error:", e);
    currentMaxId++;
    res.json({ id: `NRF-${currentMaxId > 0 ? currentMaxId : 7001}` });
  } finally {
    idMutex = false;
  }
});

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
  const models = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
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
      // console.warn(`[Translation] Model ${model} failed:`, error.message || error);
      lastError = error;
      // Continue to next model immediately
    }
  }
  throw lastError || new Error("All translation models failed");
}

// API routes FIRST
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
      let text = await generateContentWithFallback(userPrompt, systemPrompt); text = text.replace(/```json\\n?|```/g, '').trim(); const data = JSON.parse(text);
      res.json(data);
    } catch (error: any) {
      // console.warn("[Translation API] Final error in basic translation:", error);
      res.json({
        tamilName: name || "",
        tamilRole: role || ""
      });
    }
});

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
      let text = await generateContentWithFallback(userPrompt, systemPrompt); text = text.replace(/```json\\n?|```/g, '').trim(); const data = JSON.parse(text);
      res.json(data);
    } catch (error: any) {
      // console.warn("[Translation API] Final error in member details translation:", error);
      res.json({
        tamilName: name || "",
        tamilConstituency: constituency || "",
        tamilUnion: union || ""
      });
    }
});

app.get("/api/proxy-image", async (req, res) => {
  const imageUrl = req.query.url as string;
  if (!imageUrl) {
    return res.status(400).send("Missing url parameter");
  }
  try {
    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "Referer": "https://i.ibb.co/"
      }
    });
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

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, {
      setHeaders: (res, path, stat) => {
        if (path.endsWith('.mp4')) {
          res.set('Accept-Ranges', 'bytes');
          res.set('Content-Type', 'video/mp4');
        }
      }
    }));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    
    // Global error handler to suppress 416 Range Not Satisfiable errors
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (err.status === 416) {
        res.status(416).end();
      } else {
        console.error("Server error:", err);
        res.status(err.status || 500).end();
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
