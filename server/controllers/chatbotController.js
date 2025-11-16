
import User from "../models/userModel.js";
import axios from "axios";
import NodeCache from 'node-cache';
import { formatUserForResponse } from "../utilities/formatters.js";

// --- Helper Functions & Constants ---

const calculateCosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0, magnitudeA = 0, magnitudeB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magnitudeA += vecA[i] * vecA[i];
    magnitudeB += vecB[i] * vecB[i];
  }
  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
};

const GREETING_KEYWORDS = ["hi", "hello", "hey", "hlo", "helo"];
const GREETING_RESPONSES = [
  "Hi there! Welcome to Codemate. How can I help you find a partner?",
  "Hello, coder! What can I do for you today?",
  "Hey! Ready to find a coding partner? Just tell me what you're looking for.",
];

// Removed SIMPLE_SKILL_KEYWORDS and ROLE_CONCEPTS for simpler logic

const queryCache = new NodeCache({ stdTTL: 86400 }); // Cache for 24 hours

export const chatbotResponse = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const lowerCaseMessage = message.toLowerCase().trim();
    
    // --- Step 1: Handle Greetings ---
    if (GREETING_KEYWORDS.some(g => lowerCaseMessage.includes(g))) {
      const randomResponse = GREETING_RESPONSES[Math.floor(Math.random() * GREETING_RESPONSES.length)];
      return res.json({ success: true, botResponse: randomResponse, matches: [] });
    }

    // --- Step 2: Get or Create Query Expansion (with Caching) ---
    let expandedQueryText = "";
    const cachedExpansion = queryCache.get(lowerCaseMessage);

    if (cachedExpansion) {
      console.log(`CACHE HIT for query: "${lowerCaseMessage}"`);
      expandedQueryText = cachedExpansion;
    } else {
      // CACHE MISS: Always perform a full expansion
      console.log(`CACHE MISS for query: "${lowerCaseMessage}". Calling generative AI...`);
      const expansionPrompt = `A user is searching for a developer with this request: "${message}". Expand this request into a rich, descriptive paragraph detailing the ideal skills, roles, and technologies.`;
      
      const expansionResponse = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
        { contents: [{ parts: [{ text: expansionPrompt }] }] },
        { headers: { "Content-Type": "application/json" } }
      );
      
      expandedQueryText = expansionResponse.data.candidates[0].content.parts[0].text;
      
      // Save the new expansion to the cache
      queryCache.set(lowerCaseMessage, expandedQueryText);
    }
    
    // --- Step 3: Get Embedding for the Expanded Query ---
    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${process.env.GEMINI_API_KEY}`,
      { content: { parts: [{ "text": expandedQueryText }] } },
      { headers: { "Content-Type": "application/json" } }
    );
    const queryVector = geminiResponse.data.embedding?.values || [];

    if (queryVector.length === 0) {
      return res.status(500).json({ success: false, message: "Failed to generate embedding from Gemini API" });
    }

    // --- Step 4: Find and Rank Matches ---
    const allUsers = await User.find({_id: {$ne: req.userId}})
        .select("name skills bio profilePic location availability college");

    const matches = [];
    allUsers.forEach(user => {
      let bestMatchScore = 0;
      let bestMatchSkill = null;
      user.skills.forEach(skill => {
        const similarity = calculateCosineSimilarity(queryVector, skill.vector);
        if (similarity > bestMatchScore) {
          bestMatchScore = similarity;
          bestMatchSkill = skill.name;
        }
      });
      if (bestMatchScore > 0.6) {
        matches.push({
          user: formatUserForResponse(user), // Use the shared helper for complete data
          matchingSkill: bestMatchSkill,
          score: bestMatchScore
        });
      }
    });

    const topMatches = matches.sort((a, b) => b.score - a.score);

    // --- Step 5: Construct and Send Response ---
    let responseText = topMatches.length > 0
      ? "I've found some potential coding partners for you! Here are the top matches based on your request:"
      : "I'M couldn't find any suitable coding partners. Try rephrasing your message with more specific skills or interests.";

    res.json({ success: true, botResponse: responseText, matches: topMatches });

  } catch (err) {
    console.error("Chatbot API Error:", err.response?.data || err.message);
s.status(500).json({ success: false, message: "Failed to get chatbot response." });
  }
};