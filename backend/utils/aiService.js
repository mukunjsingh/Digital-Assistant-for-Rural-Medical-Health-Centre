/**
 * AI Service for generating health-related chat responses
 * Supports OpenAI API and can be extended to support other AI providers
 */

const generateAIResponse = async (userMessage, sessionId) => {
  try {
    // Check which AI provider to use from environment variables
    const aiProvider = process.env.AI_PROVIDER || 'openai';

    if (aiProvider === 'openai') {
      return await generateOpenAIResponse(userMessage);
    } else if (aiProvider === 'gemini') {
      return await generateGeminiResponse(userMessage);
    } else if (aiProvider === 'groq') {
      return await generateGroqResponse(userMessage);
    } else if (aiProvider === 'mock' || aiProvider === 'fallback') {
      // Fallback to enhanced mock responses if no API key is available
      return generateMockAIResponse(userMessage);
    } else {
      throw new Error(`Unsupported AI provider: ${aiProvider}`);
    }
  } catch (error) {
    console.error('AI Service Error:', error);
    const aiProvider = process.env.AI_PROVIDER || 'openai';
    let hasApiKey = false;
    if (aiProvider === 'openai') {
      hasApiKey = !!process.env.OPENAI_API_KEY;
    } else if (aiProvider === 'groq') {
      hasApiKey = !!process.env.GROQ_API_KEY;
    } else if (aiProvider === 'gemini') {
      hasApiKey = !!process.env.GEMINI_API_KEY;
    }
    
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      aiProvider: aiProvider,
      hasApiKey: hasApiKey,
      apiKeyPrefix: aiProvider === 'groq' ? (process.env.GROQ_API_KEY?.substring(0, 10) || 'NOT SET') :
                      aiProvider === 'openai' ? (process.env.OPENAI_API_KEY?.substring(0, 10) || 'NOT SET') :
                      (process.env.GEMINI_API_KEY?.substring(0, 10) || 'NOT SET')
    });
    
    // If API call fails and not explicitly set to mock, try mock response as fallback
    if (aiProvider !== 'mock' && aiProvider !== 'fallback') {
      console.log(`API call failed (${aiProvider}), falling back to enhanced mock responses`);
      console.log('To use real AI, configure API keys. For free testing, set AI_PROVIDER=mock in .env');
      return generateMockAIResponse(userMessage);
    }
    
    throw new Error(`Failed to generate AI response: ${error.message}`);
  }
};

/**
 * Generate response using OpenAI API
 */
const generateOpenAIResponse = async (userMessage) => {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured in environment variables');
  }

  const systemPrompt = `You are a helpful and compassionate health assistant for a rural medical health centre. 
Your role is to:
1. Provide general health information and guidance
2. Help users understand their symptoms
3. Suggest when to seek medical attention
4. Offer basic wellness advice
5. Be empathetic and clear in your responses

IMPORTANT DISCLAIMERS TO INCLUDE:
- Always remind users that you provide general information only
- Encourage users to consult healthcare professionals for proper diagnosis
- For emergencies, advise immediate medical attention

Keep responses concise (2-3 paragraphs max), friendly, and professional. Focus on being helpful while being clear about limitations.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `OpenAI API error: ${response.status}`
      );
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || 
      'I apologize, but I could not generate a response. Please try again.';

    // Extract intent and confidence from response
    // In a real implementation, you might use OpenAI's function calling for structured data
    const intent = extractIntent(userMessage, aiResponse);
    const confidence = 0.85; // Default confidence for OpenAI responses

    return {
      response: aiResponse,
      intent: intent,
      confidence: confidence,
      suggestions: generateSuggestions(userMessage, aiResponse),
      model: 'openai',
    };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
};

/**
 * Generate response using Google Gemini API
 */
const generateGeminiResponse = async (userMessage) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  if (!GEMINI_API_KEY || GEMINI_API_KEY.trim() === '') {
    throw new Error('GEMINI_API_KEY is not configured in environment variables');
  }

  const systemPrompt = `You are a helpful and compassionate health assistant for a rural medical health centre. 
Provide general health information, help understand symptoms, suggest when to seek medical attention, and offer basic wellness advice. 
Always remind users that you provide general information only and encourage consulting healthcare professionals. 
Keep responses concise (2-3 paragraphs max), friendly, and professional.`;

  try {
    // Use the newer Gemini 1.5 Flash model (faster and free tier available)
    let modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const deprecatedModels = ['gemini-pro', 'models/gemini-pro'];
    if (deprecatedModels.includes(modelName)) {
      console.warn(
        `Gemini model "${modelName}" is deprecated. Falling back to gemini-1.5-flash. ` +
          'Update GEMINI_MODEL in backend/.env to remove this warning.'
      );
      modelName = 'gemini-1.5-flash';
    }
    
    // Try v1 API first (newer), fallback to v1beta if needed
    let apiVersion = 'v1';
    let response = await fetch(
      `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: `${systemPrompt}\n\nUser question: ${userMessage}` }
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        }),
      }
    );

    // If v1 fails with 404, try v1beta (for older models or compatibility)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 404 && apiVersion === 'v1') {
        console.log(`Model ${modelName} not found in v1, trying v1beta...`);
        apiVersion = 'v1beta';
        response = await fetch(
          `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: `${systemPrompt}\n\nUser question: ${userMessage}` }
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 500,
              },
            }),
          }
        );
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || `Gemini API error: ${response.status}. Try using gemini-1.5-flash model.`
        );
      }
    }

    const data = await response.json();
    const aiResponse = data.candidates[0]?.content?.parts[0]?.text || 
      'I apologize, but I could not generate a response. Please try again.';

    const intent = extractIntent(userMessage, aiResponse);
    const confidence = 0.85;

    return {
      response: aiResponse,
      intent: intent,
      confidence: confidence,
      suggestions: generateSuggestions(userMessage, aiResponse),
      model: 'gemini',
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
};

/**
 * Generate response using Groq API
 */
const generateGroqResponse = async (userMessage) => {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  
  if (!GROQ_API_KEY || GROQ_API_KEY.trim() === '') {
    throw new Error('GROQ_API_KEY is not configured in environment variables');
  }

  const systemPrompt = `You are a helpful and compassionate health assistant for a rural medical health centre. 
Your role is to:
1. Provide general health information and guidance
2. Help users understand their symptoms
3. Suggest when to seek medical attention
4. Offer basic wellness advice
5. Be empathetic and clear in your responses

IMPORTANT DISCLAIMERS TO INCLUDE:
- Always remind users that you provide general information only
- Encourage users to consult healthcare professionals for proper diagnosis
- For emergencies, advise immediate medical attention

Keep responses concise (2-3 paragraphs max), friendly, and professional. Focus on being helpful while being clear about limitations.`;

  try {
    const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant'; // Fast and free model
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || errorData.message || `Groq API error: ${response.status}`;
      console.error('Groq API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        errorData: errorData
      });
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || 
      'I apologize, but I could not generate a response. Please try again.';

    const intent = extractIntent(userMessage, aiResponse);
    const confidence = 0.85;

    return {
      response: aiResponse,
      intent: intent,
      confidence: confidence,
      suggestions: generateSuggestions(userMessage, aiResponse),
      model: 'groq',
    };
  } catch (error) {
    console.error('Groq API Error:', error);
    throw error;
  }
};

/**
 * Extract intent from user message and AI response
 * Simple keyword-based intent extraction (can be enhanced)
 */
const extractIntent = (userMessage, aiResponse) => {
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('fever') || lowerMessage.includes('temperature')) {
    return 'symptom.fever';
  }
  if (lowerMessage.includes('cough') || lowerMessage.includes('cold')) {
    return 'symptom.respiratory';
  }
  if (lowerMessage.includes('headache') || lowerMessage.includes('pain')) {
    return 'symptom.headache';
  }
  if (lowerMessage.includes('stomach') || lowerMessage.includes('digestive') || lowerMessage.includes('nausea')) {
    return 'symptom.digestive';
  }
  if (lowerMessage.includes('appointment') || lowerMessage.includes('book') || lowerMessage.includes('schedule')) {
    return 'appointment.request';
  }
  if (lowerMessage.includes('question') || lowerMessage.includes('ask')) {
    return 'general.question';
  }
  
  return 'general.health_inquiry';
};

/**
 * Generate helpful suggestions based on user message and AI response
 */
const generateSuggestions = (userMessage, aiResponse) => {
  const suggestions = [];
  const lowerMessage = userMessage.toLowerCase();
  const lowerResponse = aiResponse.toLowerCase();
  
  // Common suggestions
  if (lowerResponse.includes('doctor') || lowerResponse.includes('medical')) {
    suggestions.push('Book an appointment with our healthcare provider');
  }
  
  if (lowerMessage.includes('fever') || lowerMessage.includes('temperature')) {
    suggestions.push('Monitor your temperature regularly');
    suggestions.push('Stay hydrated and rest');
  }
  
  if (lowerMessage.includes('cough') || lowerMessage.includes('cold')) {
    suggestions.push('Drink warm fluids');
    suggestions.push('Get adequate rest');
  }
  
  if (lowerMessage.includes('headache') || lowerMessage.includes('pain')) {
    suggestions.push('Rest in a quiet, dark room');
    suggestions.push('Stay hydrated');
  }
  
  // Default suggestions
  if (suggestions.length === 0) {
    suggestions.push('Monitor your symptoms');
    suggestions.push('Consult a healthcare professional if symptoms persist');
  }
  
  return suggestions;
};

/**
 * Generate enhanced mock response when API is not available
 * This provides better responses than the old keyword system
 */
const generateMockAIResponse = (userMessage) => {
  const lowerMessage = userMessage.toLowerCase().trim();
  
  // Expanded pattern matching - check for various health-related queries
  // Fever/Temperature related
  if (lowerMessage.includes('fever') || lowerMessage.includes('temperature') || lowerMessage.includes('hot') || 
      lowerMessage.includes('burning') || lowerMessage.includes('chills') || lowerMessage.includes('sweat')) {
    return {
      response: 'I understand you have a fever. Here\'s what you should know:\n\n• Monitor your temperature regularly. Normal body temperature is around 98.6°F (37°C).\n• If your temperature goes above 102°F (39°C) or persists for more than 3 days, please visit the health centre immediately.\n• Stay hydrated by drinking plenty of water and clear fluids.\n• Rest is important to help your body fight the infection.\n• You can take paracetamol (acetaminophen) as directed, but avoid self-medicating with antibiotics.\n\n⚠️ **Important**: If you experience severe symptoms like difficulty breathing, chest pain, or confusion, seek immediate medical attention.',
      intent: 'symptom.fever',
      confidence: 0.75,
      suggestions: [
        'Monitor your temperature regularly',
        'Stay hydrated and rest',
        'Book an appointment if symptoms persist',
      ],
      model: 'mock-enhanced',
    };
  }

  // Respiratory related
  if (lowerMessage.includes('cough') || lowerMessage.includes('cold') || lowerMessage.includes('sneeze') ||
      lowerMessage.includes('breathing') || lowerMessage.includes('chest') || lowerMessage.includes('throat') ||
      lowerMessage.includes('runny nose') || lowerMessage.includes('congestion') || lowerMessage.includes('wheezing')) {
    return {
      response: 'For cough and cold symptoms, here are some helpful tips:\n\n• Rest is crucial for recovery. Give your body time to heal.\n• Drink warm fluids like herbal tea, warm water with honey and lemon, or clear soups. This helps soothe the throat.\n• Avoid cold beverages and dairy products if they worsen your cough.\n• Use a humidifier or take steamy showers to help with congestion.\n• Gargle with warm salt water to soothe a sore throat.\n• Cover your mouth when coughing or sneezing to prevent spreading.\n\nIf symptoms worsen, persist beyond a week, or you develop a high fever, please book an appointment with our healthcare provider.',
      intent: 'symptom.respiratory',
      confidence: 0.75,
      suggestions: [
        'Drink warm fluids and rest',
        'Use humidifier for congestion',
        'Book appointment if symptoms persist',
      ],
      model: 'mock-enhanced',
    };
  }

  // Head/Pain related
  if (lowerMessage.includes('headache') || lowerMessage.includes('head pain') || lowerMessage.includes('migraine') ||
      lowerMessage.includes('head hurts') || lowerMessage.includes('headache') || lowerMessage.includes('dizzy') ||
      lowerMessage.includes('dizziness') || lowerMessage.includes('pain in head')) {
    return {
      response: 'Headaches can have various causes. Here\'s what may help:\n\n• Rest in a quiet, dark room to reduce stimulation.\n• Stay hydrated - dehydration can cause headaches.\n• Apply a cold or warm compress to your forehead or neck.\n• Avoid triggers like bright lights, loud noises, or strong smells.\n• Practice relaxation techniques like deep breathing.\n• Ensure you\'re getting adequate sleep.\n\n⚠️ **Seek immediate medical attention if**:\n• The pain is severe and sudden\n• Accompanied by fever, stiff neck, or vision changes\n• Headache after a head injury\n• Worsening headache that doesn\'t respond to usual remedies',
      intent: 'symptom.headache',
      confidence: 0.75,
      suggestions: [
        'Rest in a quiet, dark room',
        'Stay hydrated',
        'Consult doctor if pain is severe',
      ],
      model: 'mock-enhanced',
    };
  }

  // Digestive related
  if (lowerMessage.includes('stomach') || lowerMessage.includes('digestive') || lowerMessage.includes('nausea') || 
      lowerMessage.includes('vomit') || lowerMessage.includes('diarrhea') || lowerMessage.includes('belly') ||
      lowerMessage.includes('abdominal') || lowerMessage.includes('indigestion') || lowerMessage.includes('bloating') ||
      lowerMessage.includes('constipation') || lowerMessage.includes('loose motion') || lowerMessage.includes('gas')) {
    return {
      response: 'For stomach and digestive issues:\n\n• Eat light, easily digestible foods like bananas, rice, applesauce, and toast (BRAT diet).\n• Stay hydrated with clean water, oral rehydration solutions, or clear broths.\n• Avoid spicy, oily, fried, or heavy foods until symptoms improve.\n• Avoid dairy products if you have diarrhea.\n• Get plenty of rest.\n• Wash your hands frequently to prevent spreading if it\'s infectious.\n\n⚠️ **Seek medical attention if**:\n• Symptoms persist for more than 2-3 days\n• You see blood in vomit or stool\n• Severe dehydration (dry mouth, dizziness, decreased urination)\n• Severe abdominal pain',
      intent: 'symptom.digestive',
      confidence: 0.75,
      suggestions: [
        'Eat light, digestible foods',
        'Stay hydrated',
        'Consult doctor if symptoms persist',
      ],
      model: 'mock-enhanced',
    };
  }

  if (lowerMessage.includes('appointment') || lowerMessage.includes('book') || lowerMessage.includes('schedule')) {
    return {
      response: 'I can help you book an appointment with our healthcare provider. To schedule an appointment:\n\n1. Click on the "Book Appointment" option in the menu\n2. Fill in your details: patient name, age, gender, contact information\n3. Select your preferred date and time\n4. Describe your symptoms or reason for the visit\n5. Submit the form\n\nOur team will contact you to confirm the appointment details. If you need urgent medical care, please visit the health centre directly or call our emergency number.',
      intent: 'appointment.request',
      confidence: 0.80,
      suggestions: [
        'Book an appointment through the website',
        'Visit health centre for urgent care',
      ],
      model: 'mock-enhanced',
    };
  }

  // Pain related (general)
  if (lowerMessage.includes('pain') || lowerMessage.includes('hurt') || lowerMessage.includes('ache') ||
      lowerMessage.includes('sore') || lowerMessage.includes('discomfort')) {
    return {
      response: 'I understand you\'re experiencing pain or discomfort. Here\'s some general guidance:\n\n• **Rest and Protect**: Avoid activities that worsen the pain\n• **Ice or Heat**: Apply ice packs for acute pain/swelling, or heat for muscle stiffness\n• **Over-the-counter relief**: Pain relievers like paracetamol or ibuprofen (follow package instructions)\n• **Monitor the pain**: Note when it started, what makes it better/worse, and its intensity\n• **Stay hydrated**: Dehydration can sometimes cause pain\n\n⚠️ **Seek immediate medical attention if**:\n• Pain is severe or sudden\n• Pain persists for more than a few days\n• Accompanied by fever, swelling, or other concerning symptoms\n• Pain after an injury\n\nI recommend booking an appointment with our healthcare provider for a proper evaluation. You can use the "Book Appointment" feature in the menu.',
      intent: 'symptom.pain',
      confidence: 0.70,
      suggestions: [
        'Rest and avoid activities that worsen pain',
        'Book an appointment for proper evaluation',
        'Seek immediate care if pain is severe',
      ],
      model: 'mock-enhanced',
    };
  }

  // Fatigue/Weakness related
  if (lowerMessage.includes('tired') || lowerMessage.includes('fatigue') || lowerMessage.includes('weak') ||
      lowerMessage.includes('weakness') || lowerMessage.includes('exhausted') || lowerMessage.includes('energy')) {
    return {
      response: 'Feeling tired or weak can have various causes. Here are some helpful tips:\n\n• **Rest**: Ensure you\'re getting adequate sleep (7-9 hours for adults)\n• **Hydration**: Drink plenty of water throughout the day\n• **Nutrition**: Eat balanced meals with adequate iron, vitamins, and protein\n• **Physical activity**: Light exercise can help boost energy (if fatigue is not due to illness)\n• **Stress management**: High stress can cause fatigue\n• **Avoid overexertion**: Don\'t push yourself too hard\n\n⚠️ **Consult a healthcare provider if**:\n• Fatigue persists for more than 2 weeks\n• Accompanied by other symptoms like fever, weight loss, or pain\n• Interferes with daily activities\n• Sudden onset of severe fatigue\n\nI recommend booking an appointment to rule out any underlying health conditions.',
      intent: 'symptom.fatigue',
      confidence: 0.70,
      suggestions: [
        'Get adequate rest and sleep',
        'Stay hydrated and eat balanced meals',
        'Book an appointment if fatigue persists',
      ],
      model: 'mock-enhanced',
    };
  }

  // Skin related
  if (lowerMessage.includes('rash') || lowerMessage.includes('skin') || lowerMessage.includes('itch') ||
      lowerMessage.includes('red') || lowerMessage.includes('bump') || lowerMessage.includes('pimple')) {
    return {
      response: 'For skin concerns, here\'s some general guidance:\n\n• **Keep it clean**: Gently clean the affected area with mild soap and water\n• **Avoid scratching**: This can worsen irritation and lead to infection\n• **Moisturize**: Use gentle, fragrance-free moisturizers for dry skin\n• **Protect from sun**: Use sunscreen and cover exposed areas if sensitive\n• **Avoid harsh chemicals**: Use mild, hypoallergenic products\n\n⚠️ **See a healthcare provider if**:\n• Rash spreads rapidly or covers large areas\n• Accompanied by fever or other symptoms\n• Severe itching or pain\n• Signs of infection (pus, increased redness, warmth)\n• Rash doesn\'t improve after a few days\n\nI recommend booking an appointment for a proper diagnosis and treatment plan.',
      intent: 'symptom.skin',
      confidence: 0.70,
      suggestions: [
        'Keep affected area clean and avoid scratching',
        'Book an appointment for proper diagnosis',
        'Seek care if rash spreads or worsens',
      ],
      model: 'mock-enhanced',
    };
  }

  // General greetings or short messages
  if (lowerMessage.length < 20 && (
      lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey') ||
      lowerMessage.includes('help') || lowerMessage.includes('what') || lowerMessage.includes('how'))) {
    return {
      response: 'Hello! I\'m your health assistant. I\'m here to help with:\n\n• General health information and guidance\n• Understanding symptoms\n• When to seek medical attention\n• Basic wellness advice\n• Booking appointments\n\nPlease feel free to describe your symptoms or ask any health-related questions. I\'ll do my best to provide helpful information.\n\n⚠️ **Important**: I provide general guidance only, not medical diagnosis. For proper diagnosis and treatment, please consult with our healthcare professionals.',
      intent: 'greeting',
      confidence: 0.80,
      suggestions: [
        'Describe your symptoms',
        'Ask health-related questions',
        'Book an appointment if needed',
      ],
      model: 'mock-enhanced',
    };
  }

  // General health inquiry fallback - make it more helpful
  return {
    response: `Thank you for your question. I understand you're looking for health information regarding: "${userMessage}".\n\nWhile I provide general health guidance, I'm currently running in a limited mode. For the best assistance:\n\n**I can help you with**:\n• General health information and symptom guidance\n• Advice on when to seek medical attention\n• Information about booking appointments\n• Basic wellness tips\n\n**To get personalized help**:\n• Book an appointment with our healthcare provider through the "Book Appointment" menu\n• Describe your symptoms in detail for better guidance\n• For emergencies, visit the health centre immediately\n\n⚠️ **Important**: For proper medical diagnosis and treatment, please consult with our healthcare professionals. I provide general information only.\n\n**You can ask me about**:\n• Fever, cough, cold, headaches\n• Stomach issues, digestive problems\n• Pain, fatigue, skin concerns\n• General health questions\n\nFeel free to ask more specific questions about your symptoms!`,
    intent: 'general.health_inquiry',
    confidence: 0.65,
    suggestions: [
      'Describe your symptoms in detail',
      'Book an appointment for proper diagnosis',
      'Consult healthcare professional for personalized advice',
    ],
    model: 'mock-enhanced',
  };
};

module.exports = {
  generateAIResponse,
};

