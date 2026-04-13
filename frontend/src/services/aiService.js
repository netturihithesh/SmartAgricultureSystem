import axios from 'axios';

const POLLINATIONS_API_URL = 'https://text.pollinations.ai/';

const fetchWithFallback = async (formattedMessages) => {
  const groqKey = import.meta.env.VITE_GROQ_API_KEY;
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const deepseekKey = import.meta.env.VITE_DEEPSEEK_API_KEY;

  // 1. Try Groq (Ultra-fast Primary due to provided key)
  if (groqKey) {
    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        { model: 'llama-3.3-70b-versatile', messages: formattedMessages },
        { headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' } }
      );
      if (response.data?.choices?.[0]?.message?.content) {
         return response.data.choices[0].message.content;
      }
    } catch (e) {
      console.warn('Groq failed, seamlessly falling back...', e.message);
    }
  }

  // 2. Try Gemini (Backup 1)
  if (geminiKey) {
    try {
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
        { model: 'gemini-1.5-flash', messages: formattedMessages },
        { headers: { 'Authorization': `Bearer ${geminiKey}`, 'Content-Type': 'application/json' } }
      );
      if (response.data?.choices?.[0]?.message?.content) {
         return response.data.choices[0].message.content;
      }
    } catch (e) {
      console.warn('Gemini failed, seamlessly falling back...', e.message);
    }
  }

  // 2. Try DeepSeek (Backup 1)
  if (deepseekKey) {
    try {
      const response = await axios.post(
        'https://api.deepseek.com/chat/completions',
        { model: 'deepseek-chat', messages: formattedMessages },
        { headers: { 'Authorization': `Bearer ${deepseekKey}`, 'Content-Type': 'application/json' } }
      );
      if (response.data?.choices?.[0]?.message?.content) {
         return response.data.choices[0].message.content;
      }
    } catch (e) {
      console.warn('DeepSeek failed, seamlessly falling back...', e.message);
    }
  }

  // 3. Fallback to Pollinations AI (Backup 2 - Free/No Key)
  try {
    const response = await axios.post(
      POLLINATIONS_API_URL,
      { messages: formattedMessages },
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    // Pollinations AI returns raw text usually
    if (typeof response.data === 'string') {
        return response.data;
    } else if (response.data?.choices?.[0]?.message?.content) {
        return response.data.choices[0].message.content;
    }
    return String(response.data);
  } catch (e) {
    console.error('All AI fallback providers failed.', e.message);
    throw new Error('Our AI services are temporarily unavailable. Please try again in a few moments.');
  }
};

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
   - WEBSITE NAVIGATION CAPABILITY: You have the ability to redirect the user's screen. If AND ONLY IF the user explicitly asks to "go to", "open", or "navigate" to a specific page or section, you should output the exact tag [NAVIGATE:path] in your response. 
     - Dashboard Home: /dashboard
     - Farm Calendar: /dashboard/calendar
     - Weather Center: /dashboard/weather
     - Farm Analytics: /dashboard/analytics
     - Crop Prediction (AI recommend): /recommendation
     - Add Crop Manually: /add-crop
     - Public Home: /
   - CRITICAL RULE: NEVER use the [NAVIGATE:path] tag unless the user explicitly requested a page change. Do NOT use it when answering farming questions.
   - Always be welcoming, concise, professional, and action-oriented.`;
    
    const formattedMessages = [
      { role: 'system', content: systemInstruction },
      ...messages.map(m => ({
        role: m.role,
        content: m.content
      }))
    ];

    return await fetchWithFallback(formattedMessages);
  } catch (error) {
    console.error('AI API Error:', error);
    throw new Error(error.message || 'Failed to get response from AI.');
  }
};

export const getDailyQuote = async () => {
  try {
    const text = await fetchWithFallback([{ role: 'user', content: 'Generate a unique, short, inspiring, and insightful daily quote related to agriculture, farming, or nature. Do not wrap in quotes. Make it highly motivational and relatable for a farmer.' }]);
    return text.trim();
  } catch (error) {
    console.error('AI Quote API Error:', error);
    return "The ultimate goal of farming is not the growing of crops, but the cultivation and perfection of human beings. - Masanobu Fukuoka";
  }
};

export const generateStageSchedule = async (cropName, stageName, durationDays, subtasks) => {
  try {
    const prompt = `I am growing ${cropName}. I am about to start the "${stageName}" stage, which lasts for ${durationDays} days.
The required tasks for this stage are:
${subtasks.map(t => `- ${t}`).join('\n')}

Distribute these subtasks logically across the ${durationDays} days. Do not put them all on day 1. 
Return ONLY a valid JSON array. Each element should be an object with:
"relative_day" (integer from 1 to ${durationDays}): when the task should ideally be done.
"task" (string): the exact name of the subtask as provided (DO NOT modify the text of the subtask).
"reason" (string): a very brief 1-sentence reason why this day is optimal.

Do not wrap the response in markdown blocks. Return just the raw JSON array.`;

    const text = await fetchWithFallback([{ role: 'user', content: prompt }]);
    const cleanText = text.replace(/```json/gi, '').replace(/```/gi, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.warn('AI Stage Schedule API Error. Using Simulated Intelligence Fallback.');
    
    // Fallback logic
    const simulatedSchedule = subtasks.map((task, index) => {
      let targetDay = 1;
      if (durationDays > 1) {
        const step = (durationDays - 1) / Math.max(1, subtasks.length - 1);
        targetDay = Math.round(1 + index * step);
      }
      
      const lowerTask = task.toLowerCase();
      let agriculturalReason = "Executing this step strictly on this schedule aligns with established agronomical cycles to maximize cellular growth and yield.";
      
      if (lowerTask.includes('plough') || lowerTask.includes('till') || lowerTask.includes('level')) {
         agriculturalReason = "Proper soil aeration and leveling is critical to ensure uniform water distribution and deep root penetration.";
      } else if (lowerTask.includes('manure') || lowerTask.includes('compost') || lowerTask.includes('basal') || lowerTask.includes('base')) {
         agriculturalReason = "Early nutrient incorporation guarantees that primary macronutrients are available in the root zone prior to peak demand.";
      } else if (lowerTask.includes('seed') || lowerTask.includes('sow') || lowerTask.includes('nursery')) {
         agriculturalReason = "Optimal timing for seedling emergence based on temperature acclimation and biological germination windows.";
      } else if (lowerTask.includes('fungicide') || lowerTask.includes('treat')) {
         agriculturalReason = "Pre-emptive chemical or biological treatment prevents initial pathogen infections during vulnerable embryonic stages.";
      } else if (lowerTask.includes('transplant') || lowerTask.includes('uproot') || lowerTask.includes('spacing')) {
         agriculturalReason = "Executing precise transplantation spacing maximizes canopy sunlight interception and prevents inter-plant nutrient competition.";
      } else if (lowerTask.includes('water') || lowerTask.includes('irriga') || lowerTask.includes('drain')) {
         agriculturalReason = "Strict moisture regulation at this phase prevents fungal spread while meeting the crop's precise evapotranspiration needs.";
      } else if (lowerTask.includes('top dress') || lowerTask.includes('urea') || lowerTask.includes('zinc') || lowerTask.includes('fertilizer') || lowerTask.includes('npk')) {
         agriculturalReason = "Split nutrient application during active vegetative growth exponentially increases nitrogen-use efficiency and prevents groundwater leaching.";
      } else if (lowerTask.includes('pest') || lowerTask.includes('weed') || lowerTask.includes('disease') || lowerTask.includes('spray')) {
         agriculturalReason = "Intervening now breaks the pest lifecycle directly before the economic injury level is critically exceeded.";
      } else if (lowerTask.includes('harvest') || lowerTask.includes('dry') || lowerTask.includes('store') || lowerTask.includes('thresh')) {
         agriculturalReason = "Executing at this precise maturity index ensures optimal grain-filling and strictly prevents post-harvest fungal contamination.";
      } else if (lowerTask.includes('observe') || lowerTask.includes('monitor') || lowerTask.includes('check')) {
         agriculturalReason = "Proactive field scouting is essential during this highly active growth window to detect early stress markers.";
      }
      
      return {
        relative_day: Math.max(1, Math.min(durationDays, targetDay)),
        task: task,
        reason: agriculturalReason
      };
    });
    
    return simulatedSchedule;
  }
};
