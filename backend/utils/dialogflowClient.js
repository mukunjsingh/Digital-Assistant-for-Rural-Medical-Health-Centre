const analyzeSymptoms = async (userMessage, sessionId) => {
  try {
    const response = {
      intent: 'symptom.check',
      confidence: 0.85,
      response: generateMockResponse(userMessage),
      suggestions: [
        'Stay hydrated',
        'Get adequate rest',
        'Monitor your symptoms',
        'Consult a doctor if symptoms persist',
      ],
    };

    return response;
  } catch (error) {
    console.error('Dialogflow API Error:', error);
    throw new Error('Failed to analyze symptoms');
  }
};

const generateMockResponse = (message) => {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('fever') || lowerMessage.includes('temperature')) {
    return 'I understand you have a fever. Please monitor your temperature regularly. If it goes above 102°F (39°C) or persists for more than 3 days, please visit the health centre immediately.';
  }

  if (lowerMessage.includes('cough') || lowerMessage.includes('cold')) {
    return 'For cough and cold symptoms, try to rest, drink warm fluids, and avoid cold beverages. If symptoms worsen or persist beyond a week, please book an appointment.';
  }

  if (lowerMessage.includes('headache') || lowerMessage.includes('pain')) {
    return 'Headaches can have various causes. Try to rest in a quiet, dark room. Stay hydrated. If the pain is severe or accompanied by other symptoms, please seek medical attention.';
  }

  if (lowerMessage.includes('stomach') || lowerMessage.includes('digestive')) {
    return 'For stomach issues, try eating light, easily digestible foods. Stay hydrated with clean water. Avoid spicy or oily foods. If symptoms persist, please consult a doctor.';
  }

  return 'Thank you for sharing your symptoms. I recommend booking an appointment with our healthcare provider for a proper diagnosis. Would you like me to help you schedule an appointment?';
};

module.exports = { analyzeSymptoms };
