import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config({ path: "../.env" });

const app = express();
app.use(cors());
app.use(express.json());

// 🚑 EXPLICIT API KEY (THIS FIXES EVERYTHING)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

app.get("/", (req, res) => {
  res.send("🚑 MediBot Backend Running");
});

app.post("/medibot", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question?.trim()) {
      return res.json({
        reply: "⚠️ Please describe the patient condition clearly."
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are MediBot — an ambulance emergency nurse.
Give short, clear, step-by-step first-aid actions only.

Patient case: ${question}`
            }
          ]
        }
      ]
    });

    const reply =
      response?.text ||
      response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ Keep airway open. Monitor breathing and rush to hospital.";

    res.json({ reply });
  } catch (err) {
    console.error("GEMINI ERROR:", err);
    res.json({
      reply: "⚠️ Keep airway open. Monitor breathing and rush to hospital."
    });
  }
});

app.listen(5050, "0.0.0.0", () => {
  console.log("🚑 MediBot LIVE on http://localhost:5050");
});
