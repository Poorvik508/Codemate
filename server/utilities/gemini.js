// utils/gemini.js
import fetch from "node-fetch";

export async function getSkillVector(skill) {
  const apiKey = process.env.GEMINI_API_KEY;

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        model: "models/embedding-001",
        content: { parts: [{ text: skill }] },
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to get embedding from Gemini");
  }

  const data = await response.json();
  return data.embedding.values; // array of floats
}
