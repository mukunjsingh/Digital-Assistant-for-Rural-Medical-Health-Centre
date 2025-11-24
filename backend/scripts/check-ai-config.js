/**
 * Diagnostic script to check AI service configuration
 * Run with: node scripts/check-ai-config.js
 */

require('dotenv').config();

console.log('\n=== AI Service Configuration Check ===\n');

// Check AI Provider
const aiProvider = process.env.AI_PROVIDER || 'openai';
console.log(`✓ AI Provider: ${aiProvider}`);

// Check API Keys
const openaiKey = process.env.OPENAI_API_KEY;
const geminiKey = process.env.GEMINI_API_KEY;
const groqKey = process.env.GROQ_API_KEY;

if (aiProvider === 'openai') {
  if (openaiKey) {
    console.log(`✓ OpenAI API Key: Found (${openaiKey.substring(0, 7)}...)`);
    console.log(`  Full key starts with: ${openaiKey.substring(0, 10)}...`);
  } else {
    console.log(`✗ OpenAI API Key: NOT FOUND`);
    console.log(`  Please add OPENAI_API_KEY to your .env file`);
    console.log(`  Get your key from: https://platform.openai.com/api-keys`);
  }
} else if (aiProvider === 'gemini') {
  if (geminiKey) {
    console.log(`✓ Gemini API Key: Found (${geminiKey.substring(0, 7)}...)`);
  } else {
    console.log(`✗ Gemini API Key: NOT FOUND`);
    console.log(`  Please add GEMINI_API_KEY to your .env file`);
    console.log(`  Get your key from: https://makersuite.google.com/app/apikey`);
  }
} else if (aiProvider === 'groq') {
  if (groqKey) {
    console.log(`✓ Groq API Key: Found (${groqKey.substring(0, 7)}...)`);
  } else {
    console.log(`✗ Groq API Key: NOT FOUND`);
    console.log(`  Please add GROQ_API_KEY to your .env file`);
    console.log(`  Get your key from: https://console.groq.com/keys`);
  }
} else if (aiProvider === 'mock' || aiProvider === 'fallback') {
  console.log(`✓ Using Mock/Enhanced responses (no API key needed)`);
}

// Check model
if (aiProvider === 'openai') {
  const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
  console.log(`✓ OpenAI Model: ${model}`);
} else if (aiProvider === 'gemini') {
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  console.log(`✓ Gemini Model: ${model}`);
} else if (aiProvider === 'groq') {
  const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
  console.log(`✓ Groq Model: ${model}`);
}

// Summary
console.log('\n=== Summary ===');
const apiKey = aiProvider === 'openai' ? openaiKey : (aiProvider === 'gemini' ? geminiKey : (aiProvider === 'groq' ? groqKey : null));
if (apiKey) {
  console.log('✓ Configuration looks good! AI service should work.');
  console.log('  If you still see errors, check:');
  console.log('  1. API key is valid and has credits/quota');
  console.log('  2. Backend server was restarted after adding API key');
  console.log('  3. Internet connection is working');
} else {
  console.log('✗ Configuration incomplete. Please add API key to .env file.');
  console.log('  See SETUP_AI_CHAT.md for detailed instructions.');
}

console.log('\n');

