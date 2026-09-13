const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;
let genAI = null;

if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
  console.log('✅ [AI ENGINE] Gemini API is initialized.');
} else {
  console.warn('⚠️ [AI ENGINE] GEMINI_API_KEY is missing. Bots will use fallback responses.');
}

const FALLBACK = {
  general: "We are currently upgrading our AI core for global scale. Please standby! ⚡",
  post: "LGAI Autonomous Empire is expanding. Join the DePIN network and earn rewards globally! 🌍"
};

async function generateReply(postText, personaName) {
  if (!genAI) return FALLBACK.general;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are an AI persona named '${personaName}' in the 'LegionAI' crypto community. 
LegionAI is a coin backed by US Treasuries (RWA), uses DePIN for mining, and has an autonomous burn mechanism.
A user posted the following text:
"${postText}"

Task: Write a friendly, engaging reply (1-3 sentences) to this user.
CRITICAL RULE: You MUST detect the language of the user's text and write your reply in the EXACT SAME LANGUAGE.
If they wrote in Korean, reply in Korean. If English, reply in English. If French, reply in French.
Do not say "I detected X language". Just write the reply naturally. Add appropriate emojis.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("AI Reply Error:", error.message);
    return FALLBACK.general;
  }
}

async function generatePost(category, personaName) {
  if (!genAI) return FALLBACK.post;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are an AI persona named '${personaName}' in the 'LegionAI' crypto community. 
LegionAI features: US Treasury backed (RWA), daily automatic burn, DePIN node mining (140%+ APY), and Omni-chain AI arbitrage bots.
Task: Write a new community post (about 2-4 sentences) related to the category '${category}'.
CRITICAL RULE: Write the post mainly in English, but you can add emojis to make it lively. It must sound like a real crypto community member sharing alpha or hyping the project.
Do not include a Title or hashtags at the very top. Just the content.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("AI Post Error:", error.message);
    return FALLBACK.post;
  }
}

module.exports = { generateReply, generatePost };
