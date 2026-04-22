const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Load .env only in development
if (process.env.NODE_ENV !== "production") {
  try {
    require("dotenv").config();
  } catch (e) {
    // dotenv not available, skip
  }
}

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.set("trust proxy", 1);
app.use(cors({ origin: "*" }));
app.use(express.json());

// ─── Rate Limiter ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Daily limit reached. You get 100 free translations per day. Come back tomorrow!",
  },
});

app.use("/api/translate", limiter);

// ─── Gemini Setup ─────────────────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// ─── Prompts ──────────────────────────────────────────────────────────────────
const PROMPTS = {
  corp_to_human: {
    plain: `You are a corporate jargon translator. Convert the corporate speak into plain, simple, honest English that a normal person would say out loud. Strip all buzzwords, fluff, and vague language. Be direct. Return ONLY the translated text, nothing else.`,
    sarcastic: `You are a sarcastic corporate jargon translator. Convert the corporate speak into plain English, but with a dry, sarcastic tone that highlights how absurd the original was. Return ONLY the translated text, nothing else.`,
    parody: `You are a comedic corporate jargon translator. Convert the corporate speak into hilariously blunt, over-the-top plain English. Exaggerate how ridiculous the original meaning is. Make it funny. Return ONLY the translated text, nothing else.`,
    formal: `You are a professional translator. Convert the corporate speak into clear, formal, but jargon-free English. Maintain a professional tone but be completely direct and clear. Return ONLY the translated text, nothing else.`,
    blunt: `You are an extremely blunt translator. Convert the corporate speak into the most brutally honest, no-nonsense plain English possible. No softening, no diplomacy — just raw truth. Return ONLY the translated text, nothing else.`,
  },
  human_to_corp: {
    plain: `You are a corporate speak generator. Convert the plain, simple text into professional corporate jargon. Use buzzwords, passive voice, and business speak. Make it sound like a McKinsey consultant wrote it. Return ONLY the translated text, nothing else.`,
    sarcastic: `You are a corporate speak generator with a sarcastic edge. Convert the plain text into over-the-top corporate jargon that is so buzzword-heavy it's almost self-aware. Return ONLY the translated text, nothing else.`,
    parody: `You are a parody corporate speak generator. Convert the plain text into the most absurdly buzzword-filled, meaningless corporate waffle imaginable. Pile on the synergies, paradigm shifts, and thought leadership. Make it comedy. Return ONLY the translated text, nothing else.`,
    formal: `You are a formal business writer. Convert the plain text into polished, professional corporate language suitable for a board presentation. Elevated but not absurd. Return ONLY the translated text, nothing else.`,
    blunt: `You are a corporate speak generator. Convert the plain text into corporate language, but keep it unusually direct and blunt for corporate speak — no fluff, just sharp business language. Return ONLY the translated text, nothing else.`,
  },
};

// ─── Translate Endpoint ───────────────────────────────────────────────────────
app.post("/api/translate", async (req, res) => {
  const { text, mode, tone } = req.body;

  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "No text provided." });
  }
  if (text.trim().length === 0) {
    return res.status(400).json({ error: "Text cannot be empty." });
  }
  if (text.length > 1000) {
    return res.status(400).json({ error: "Text too long. Max 1000 characters." });
  }

  const validModes = ["corp_to_human", "human_to_corp"];
  const validTones = ["plain", "sarcastic", "parody", "formal", "blunt"];

  if (!validModes.includes(mode)) {
    return res.status(400).json({ error: "Invalid mode." });
  }
  if (!validTones.includes(tone)) {
    return res.status(400).json({ error: "Invalid tone." });
  }

  try {
    const systemPrompt = PROMPTS[mode][tone];
    const fullPrompt = `${systemPrompt}\n\nText to translate:\n"${text.trim()}"`;
    const result = await model.generateContent(fullPrompt);
    const translation = result.response.text().trim();
    return res.json({ translation });
  } catch (err) {
    console.error("Gemini error:", err.message);
    return res.status(500).json({ error: "Translation failed. Please try again." });
  }
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Corp/BS Translator is running" });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`🔑 Gemini API key: ${process.env.GEMINI_API_KEY ? "loaded" : "MISSING!"}`);
});