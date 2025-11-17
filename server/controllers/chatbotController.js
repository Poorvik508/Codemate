import User from "../models/userModel.js";
import axios from "axios";
import NodeCache from 'node-cache';
import { formatUserForResponse } from "../utilities/formatters.js";

// --- Helper Functions & Constants ---

const calculateCosineSimilarity = (vecA, vecB) => {
  // Safety check: ensure vectors exist and are arrays
  if (!vecA || !vecB || !Array.isArray(vecA) || !Array.isArray(vecB) || vecA.length !== vecB.length) return 0;
  
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

const queryCache = new NodeCache({ stdTTL: 86400 }); 

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

    // --- Step 2: Query Expansion ---
    let expandedQueryText = "";
    const cachedExpansion = queryCache.get(lowerCaseMessage);

    if (cachedExpansion) {
      console.log(`CACHE HIT for query: "${lowerCaseMessage}"`);
      expandedQueryText = cachedExpansion;
    } else {
      console.log(`CACHE MISS for query: "${lowerCaseMessage}". Calling generative AI...`);
      const expansionPrompt = `A user is searching for a developer with this request: "${message}". Expand this request into a rich, descriptive paragraph detailing the ideal skills, roles, and technologies.`;
      
      const expansionResponse = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
        { contents: [{ parts: [{ text: expansionPrompt }] }] },
        { headers: { "Content-Type": "application/json" } }
      );
      
      expandedQueryText = expansionResponse.data.candidates[0].content.parts[0].text;
      queryCache.set(lowerCaseMessage, expandedQueryText);
    }
    
    // --- Step 3: Embedding ---
    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${process.env.GEMINI_API_KEY}`,
      { content: { parts: [{ "text": expandedQueryText }] } },
      { headers: { "Content-Type": "application/json" } }
    );
    const queryVector = geminiResponse.data.embedding?.values || [];

    if (queryVector.length === 0) {
      return res.status(500).json({ success: false, message: "Failed to generate embedding" });
    }

    // --- Step 4: Find and Rank Matches ---
    const allUsers = await User.find({_id: {$ne: req.userId}})
        .select("name skills bio profilePic location availability college");

    const matches = [];
    
    // DEBUG: Check how many users we are scanning
    console.log(`Scanning ${allUsers.length} users for matches...`);

    allUsers.forEach(user => {
      let bestMatchScore = 0;
      let bestMatchSkill = null;
      
      if (user.skills && Array.isArray(user.skills)) {
        user.skills.forEach(skill => {
          // Ensure the skill has a vector before calculating
          if (skill.vector && skill.vector.length > 0) {
            const similarity = calculateCosineSimilarity(queryVector, skill.vector);
            
            // DEBUG: Uncomment this line to see actual scores in your console
            // console.log(`User: ${user.name}, Skill: ${skill.name}, Score: ${similarity}`);

            if (similarity > bestMatchScore) {
              bestMatchScore = similarity;
              bestMatchSkill = skill.name;
            }
          }
        });
      }

      // FIX: Lowered threshold from 0.6 to 0.45
      if (bestMatchScore > 0.45) {
        matches.push({
          user: formatUserForResponse(user),
          matchingSkill: bestMatchSkill,
          score: bestMatchScore
        });
      }
    });

    const topMatches = matches.sort((a, b) => b.score - a.score);

    // --- Step 5: Response ---
    let responseText = topMatches.length > 0
      ? "I've found some potential coding partners for you! Here are the top matches:"
      : "I couldn't find any suitable coding partners. Try rephrasing your message with more specific skills.";

    res.json({ success: true, botResponse: responseText, matches: topMatches });

  } catch (err) {
    console.error("Chatbot API Error:", err.response?.data || err.message);
    res.status(500).json({ success: false, message: "Failed to get chatbot response." });
  }
};