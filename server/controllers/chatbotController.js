import User from "../models/userModel.js";
import axios from "axios";
import NodeCache from 'node-cache';

// --- Helper Functions & Constants ---

const calculateCosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) {
    return 0;
  }
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magnitudeA += vecA[i] * vecA[i];
    magnitudeB += vecB[i] * vecB[i];
  }
  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }
  return dotProduct / (magnitudeA * magnitudeB);
};

const GREETING_KEYWORDS = ["hi", "hello", "hey", "hlo", "helo"];
const GREETING_RESPONSES = [
  "Hi there! Welcome to Codemate. How can I help you find a partner?",
  "Hello, coder! What can I do for you today?",
  "Hey! Ready to find a coding partner? Just tell me what you're looking for.",
  "Hi, I'm Codemate AI. How may I assist you?",
  "Hello! Glad you're here. How can I help you find a collaborator?"
];

// --- Cache Initialization ---
// Cache items for 24 hours (86400 seconds)
const queryCache = new NodeCache({ stdTTL: 86400 });

export const chatbotResponse = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    // --- Step 1: Handle Simple Greetings ---
    const lowerCaseMessage = message.toLowerCase();
    if (GREETING_KEYWORDS.some(g => lowerCaseMessage.includes(g))) {
      const randomResponse = GREETING_RESPONSES[Math.floor(Math.random() * GREETING_RESPONSES.length)];
      return res.json({ success: true, botResponse: randomResponse, matches: [] });
    }

    // --- Step 2: Smart Query Expansion with Caching ---
    let expandedQueryText = "";
    const cachedExpansion = queryCache.get(lowerCaseMessage);

    if (cachedExpansion) {
      // CACHE HIT: Use the saved expansion
      console.log(`CACHE HIT for query: "${lowerCaseMessage}"`);
      expandedQueryText = cachedExpansion;
    } else {
      // CACHE MISS: Generate a new expansion
      console.log(`CACHE MISS for query: "${lowerCaseMessage}". Calling generative AI...`);
      const prompt = `A user is searching for a developer with this request: "${message}". Expand this request into a rich, descriptive paragraph detailing the ideal skills, roles, and technologies for this developer.`;
      
      const expansionResponse = await axios.post(
       `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
        { contents: [{ parts: [{ text: prompt }] }] },
        { headers: { "Content-Type": "application/json" } }
      );
      
      expandedQueryText = expansionResponse.data.candidates[0].content.parts[0].text;
      
      // Save the new expansion to the cache for future use
      queryCache.set(lowerCaseMessage, expandedQueryText);
    }
    
    // --- Step 3: Get embedding for the EXPANDED query ---
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
    const allUsers = await User.find({_id: {$ne: req.userId}}).select("name skills bio profilePic");
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
          user: {
            id: user._id,
            name: user.name,
            bio: user.bio,
            profilePic: user.profilePic
          },
          matchingSkill: bestMatchSkill,
          score: bestMatchScore
        });
      }
    });

    const topMatches = matches.sort((a, b) => b.score - a.score);

    // --- Step 5: Construct and Send Response ---
    let responseText = topMatches.length > 0
      ? "I've found some potential coding partners for you! Here are the top matches based on your request:"
      : "I couldn't find any suitable coding partners. Try rephrasing your message with more specific skills or interests.";

    res.json({ success: true, botResponse: responseText, matches: topMatches });

  } catch (err) {
    console.error("Chatbot API Error:", err.response?.data || err.message);
    res.status(500).json({ success: false, message: "Failed to get chatbot response." });
  }
};
// import User from "../models/userModel.js";
// import axios from "axios";
// // A simple utility function to calculate cosine similarity between two vectors
// const calculateCosineSimilarity = (vecA, vecB) => {
//   if (!vecA || !vecB || vecA.length !== vecB.length) {
//     return 0;
//   }
//   let dotProduct = 0;
//   let magnitudeA = 0;
//   let magnitudeB = 0;
//   for (let i = 0; i < vecA.length; i++) {
//     dotProduct += vecA[i] * vecB[i];
//     magnitudeA += vecA[i] * vecA[i];
//     magnitudeB += vecB[i] * vecB[i];
//   }
//   magnitudeA = Math.sqrt(magnitudeA);
//   magnitudeB = Math.sqrt(magnitudeB);
//   if (magnitudeA === 0 || magnitudeB === 0) {
//     return 0;
//   }
//   return dotProduct / (magnitudeA * magnitudeB);
// };

// // Simple list of greeting keywords for a fast check
// const GREETING_KEYWORDS = ["hi", "hello", "hey", "hlo", "helo"];

// // Array of diverse greeting responses for more dynamic interactions
// const GREETING_RESPONSES = [
//   "Hi there! Welcome to Codemate. How can I help you?",
//   "Hello, coder! What can I do for you today?",
//   "Hey! Ready to find a coding partner? Just tell me what you're looking for.",
//   "Hi, I'm Codemate AI. How may I assist you?",
//   "Hello! Glad you're here. How can I help you find a collaborator?"
// ];

// export const chatbotResponse= async (req, res) => {
//   try {
//     const { message } = req.body;
//     if (!message) {
//       return res.status(400).json({ success: false, message: "Message is required" });
//     }

//     // Step 1: Check for a simple greeting first
//     const lowerCaseMessage = message.toLowerCase();
//     const isGreeting = GREETING_KEYWORDS.some(greeting => lowerCaseMessage.includes(greeting));

//     if (isGreeting) {
//       // Pick a random response from the greeting array
//       const randomResponse = GREETING_RESPONSES[Math.floor(Math.random() * GREETING_RESPONSES.length)];
//       // Return a clean, structured response for the frontend
//       return res.json({ success: true, botResponse: randomResponse, matches: [] });
//     }

//     // Step 2: Get embedding vector for the user's message using Gemini API
//     const geminiResponse = await axios.post(
//       `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${process.env.GEMINI_API_KEY}`,
//       {
//         "content": {
//           "parts": [
//             { "text": message }
//           ]
//         }
//       },
//       { headers: { "Content-Type": "application/json" } }
//     );
//     const queryVector = geminiResponse.data.embedding?.values || [];

//     if (queryVector.length === 0) {
//       return res.status(500).json({ success: false, message: "Failed to generate embedding from Gemini API" });
//     }

//     // Step 3: Get all user profiles from the database
//     const allUsers = await User.find({}).select("name skills bio profilePic");

//     // Step 4: Calculate cosine similarity to find the best matches
//     const matches = [];
//     allUsers.forEach(user => {
//       let bestMatchScore = 0;
//       let bestMatchSkill = null;
//       user.skills.forEach(skill => {
//         const similarity = calculateCosineSimilarity(queryVector, skill.vector);
//         if (similarity > bestMatchScore) {
//           bestMatchScore = similarity;
//           bestMatchSkill = skill.name;
//         }
//       });
//       // Only consider matches above a certain threshold (e.g., 0.6)
//       if (bestMatchScore > 0.6) {
//         matches.push({
//           user: {
//             id: user._id,
//             name: user.name,
//             bio: user.bio,
//             profilePic: user.profilePic
//           },
//           matchingSkill: bestMatchSkill,
//           score: bestMatchScore
//         });
//       }
//     });

//     // Sort matches by score in descending order and get the top 3
//     const topMatches = matches.sort((a, b) => b.score - a.score);

//     // Step 5: Construct the final chatbot response
//     let responseText;
//     if (topMatches.length > 0) {
//       responseText = "I've found some potential coding partners for you! Here are some top matches:";
//     } else {
//       responseText = "I couldn't find any suitable coding partners for your request. Try rephrasing your message with more specific skills or interests.";
//     }

//     // Send a structured response
//     res.json({ success: true, botResponse: responseText, matches: topMatches });

//   } catch (err) {
//     // console.error("Chatbot API Error:", err.response?.data || err.message);
//     res.status(500).json({ success: false, message: "Failed to get chatbot response." });
//   }
// }