import axios from 'axios';

// IMPORTANT: Do NOT hardcode API keys here! It will cause them to be revoked when pushed to GitHub.
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export const getAiCompletion = async (messages) => {
  try {
    const systemInstruction = `You are AgriBot, a professional AI farming assistant for the SmartAgri platform. Your role is twofold:

1. AGRICULTURAL EXPERT - You must provide accurate, helpful, and scientific advice for any general farming queries. This includes:
   - Crop diseases, pest control, and fungicide/pesticide recommendations.
   - Soil management, fertilizer use, irrigation strategies, and crop cycles.
   - Best farming practices for various crops.
   - Give direct, actionable farming advice. DO NOT refuse to answer general agricultural questions. You are an expert.

2. WEBSITE CONTEXT - You must assist users navigating the SmartAgri website.
Here is the complete structure and features of the site:
   - Dashboard (ActionHome): 'Crop Prediction' (AI crop recommendation) and 'Add Crop Manually'. Quick Access: Calendar, Weather, Analytics.
   - Crop Process Dashboard: Active crop progress, "Today's Work" (daily actionable steps), "Crop Process Timeline", "Weather Advisory", "Profit Snapshot", "Upcoming Tasks".

3. BOT BEHAVIOR:
   - Provide direct answers to agricultural questions (diseases, fertilizers, etc.).
   - If asked about website features, guide them using the Website Context natively.
   - WEBSITE NAVIGATION CAPABILITY: If the user asks you to take them to a page, open a section, or navigate, you can control their screen! To do this, include the exact tag [NAVIGATE:path] in your response. Replace 'path' with one of the following:
     - Dashboard Home: /dashboard
     - Farm Calendar: /dashboard/calendar
     - Weather Center: /dashboard/weather
     - Farm Analytics: /dashboard/analytics
     - Crop Prediction (AI recommend): /recommendation
     - Add Crop Manually: /add-crop
     - Public Home: /
   - Always be welcoming, concise, professional, and action-oriented.`;
    
    // Map OpenAI chat format ('user', 'assistant') to Gemini format ('user', 'model')
    const formattedMessages = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const response = await axios.post(
      API_URL,
      {
        system_instruction: {
          parts: { text: systemInstruction }
        },
        contents: formattedMessages
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || 'Failed to get response from AI.');
  }
};

export const getDailyQuote = async () => {
  try {
    const response = await axios.post(
      API_URL,
      {
        contents: [{ role: 'user', parts: [{ text: 'Generate a unique, short, inspiring, and insightful daily quote related to agriculture, farming, or nature. Do not wrap in quotes. Make it highly motivational and relatable for a farmer.' }] }]
      },
      { headers: { 'Content-Type': 'application/json' } }
    );
    return response.data.candidates[0].content.parts[0].text.trim();
  } catch (error) {
    console.error('Gemini Quote API Error:', error);
    return "The ultimate goal of farming is not the growing of crops, but the cultivation and perfection of human beings. - Masanobu Fukuoka";
  }
};
