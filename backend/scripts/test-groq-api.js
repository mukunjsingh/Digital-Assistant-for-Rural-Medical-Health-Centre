/**
 * Test script to verify Groq API is working
 */
require('dotenv').config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

if (!GROQ_API_KEY) {
  console.error('❌ GROQ_API_KEY not found in .env file');
  process.exit(1);
}

console.log('Testing Groq API...');
console.log(`Model: ${GROQ_MODEL}`);
console.log(`API Key: ${GROQ_API_KEY.substring(0, 10)}...\n`);

fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${GROQ_API_KEY}`,
  },
  body: JSON.stringify({
    model: GROQ_MODEL,
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Say hello in one word.' },
    ],
    max_tokens: 20,
  }),
})
  .then(async (response) => {
    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ API Error:', response.status, response.statusText);
      console.error('Response:', JSON.stringify(data, null, 2));
      process.exit(1);
    }
    
    console.log('✅ API Test Successful!');
    console.log('Response:', data.choices[0]?.message?.content || 'No content');
    console.log('\nYour Groq API is working correctly!');
  })
  .catch((error) => {
    console.error('❌ Network Error:', error.message);
    console.error('Make sure you have internet connection.');
    process.exit(1);
  });

