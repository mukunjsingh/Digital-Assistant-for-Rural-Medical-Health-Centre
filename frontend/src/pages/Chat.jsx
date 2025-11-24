import React, { useState, useRef, useEffect, useContext } from 'react';
import { ChatBubble } from '../components/ChatBubble';
import { useVoiceInput } from '../utils/useVoiceInput';
import { apiCall } from '../utils/api';
import { AuthContext } from '../context/AuthContext';

export const Chat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Hello! I am your AI-powered health assistant. Please describe your symptoms or ask any health-related question, and I will provide helpful guidance.',
      sender: 'bot',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const [sessionId] = useState(`session_${Date.now()}`);
  const messagesEndRef = useRef(null);
  const { token } = useContext(AuthContext);
  const { transcript, isListening, isSupported, startListening } =
    useVoiceInput();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (transcript) {
      setInputValue((prev) => prev + ' ' + transcript);
    }
  }, [transcript]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        text: userMessage,
        sender: 'user',
      },
    ]);

    setLoading(true);

    try {
      // Use the new AI chat endpoint
      const response = await apiCall('/api/ai-chat', 'POST', {
        message: userMessage,
        sessionId,
        language,
      }, token); // Pass token if available (optional)

      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: response.response,
          sender: 'bot',
        },
      ]);

      // Chat log is automatically saved by the backend, no need to manually save
    } catch (error) {
      console.error('Chat error:', error);
      let errorMessage = error.message || 'Sorry, I encountered an error. Please try again.';
      
      // Provide more helpful error messages
      if (errorMessage.includes('not configured') || errorMessage.includes('AI_NOT_CONFIGURED')) {
        errorMessage = 'AI service is not configured. Please ask the administrator to set up the API keys in the backend .env file.';
      } else if (errorMessage.includes('INVALID_API_KEY')) {
        errorMessage = 'Invalid API key detected. Please check the backend configuration.';
      } else if (errorMessage.includes('RATE_LIMIT')) {
        errorMessage = 'AI service is temporarily busy. Please try again in a moment.';
      }
      
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: errorMessage,
          sender: 'bot',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex flex-col">
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-3 md:px-4 py-3 md:py-4 flex items-center justify-between">
          <h1 className="text-lg md:text-2xl font-bold text-gray-900">Symptom Checker</h1>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setLanguage(language === 'en' ? 'hi-IN' : 'en-US')
              }
              className="btn-secondary text-xs md:text-sm px-2 md:px-4 py-1 md:py-2"
            >
              {language === 'en' ? 'हिंदी' : 'English'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 container mx-auto px-3 md:px-4 py-4 md:py-6 max-w-2xl">
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 h-full flex flex-col">
          <div className="flex-1 overflow-y-auto mb-4 md:mb-6 max-h-64 md:max-h-96">
            {messages.map((message) => (
              <ChatBubble
                key={message.id}
                message={message.text}
                sender={message.sender}
              />
            ))}
            {loading && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-200 text-gray-800 px-4 py-3 rounded-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t pt-3 md:pt-4">
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              {isSupported && (
                <button
                  onClick={() =>
                    startListening(language === 'en' ? 'en-US' : 'hi-IN')
                  }
                  disabled={isListening}
                  className={`${
                    isListening
                      ? 'bg-red-600 text-white'
                      : 'btn-secondary'
                  } px-3 md:px-4 py-2 rounded-lg transition text-xs md:text-sm whitespace-nowrap`}
                >
                  {isListening ? '🎙️ Listening...' : '🎤 Voice'}
                </button>
              )}
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask any health-related question or describe your symptoms..."
                className="input-field flex-1 resize-none text-sm md:text-base"
                rows="3"
              />
            </div>

            <button
              onClick={handleSendMessage}
              disabled={loading || !inputValue.trim()}
              className="w-full btn-primary bg-blue-600 disabled:bg-gray-400 text-sm md:text-base py-2 md:py-3"
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border-t border-blue-200 px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 text-center">
        <p>
          💡 Disclaimer: This is an AI assistant for informational purposes only.
          Always consult a healthcare professional for medical advice.
        </p>
      </div>
    </div>
  );
};
