const axios = require('axios');

async function test() {
  const models = ['gemini', 'openai', 'claude', 'deepseek'];
  for (const model of models) {
    try {
      const response = await axios.post(
        'https://text.pollinations.ai/',
        { messages: [{ role: 'user', content: 'Say hello ' + model }], model: model },
        { headers: { 'Content-Type': 'application/json' } }
      );
      console.log(`Success ${model}:`, response.data);
    } catch (e) {
      console.log(`Failed ${model}:`, e.message);
    }
  }
}
test();
