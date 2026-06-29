import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Use a larger limit for base64 images
app.use(express.json({ limit: '50mb' }));

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenAI({ apiKey: apiKey || "" });

// API Routes
app.post("/api/generate", async (req, res) => {
  try {
    const { model: modelName, contents, config } = req.body;

    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
    }

    // Ensure model name has the models/ prefix if not present
    let finalModelName = modelName || "gemini-1.5-flash";
    if (!finalModelName.startsWith('models/') && !finalModelName.startsWith('publishers/')) {
      finalModelName = `models/${finalModelName}`;
    }

    const result = await genAI.models.generateContent({
      model: finalModelName,
      contents,
      config
    });
    const response = result as any;
    const text = response.text;

    res.json({ data: text });
  } catch (error: any) {
    console.error("Server API Error:", error);
    res.status(500).json({ 
      error: error.message || "An error occurred during content generation",
      details: error
    });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
