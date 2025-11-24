import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DoctorContext } from '../context/DoctorContext';
import { getPatientChatHistory, getPatientById } from '../utils/api';
import { ChatBubble } from '../components/ChatBubble';

export const ChatHistory = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { doctorToken } = useContext(DoctorContext);
  const [patient, setPatient] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!doctorToken || !patientId) {
        setError('Invalid request.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch patient info
        const patientResponse = await getPatientById(patientId, doctorToken);
        if (patientResponse.success) {
          setPatient(patientResponse.patient);
        }

        // Fetch chat history
        const historyResponse = await getPatientChatHistory(patientId, doctorToken, page, 50);
        if (historyResponse.success) {
          // Sort by timestamp (oldest first for chat display)
          const sortedHistory = [...historyResponse.chatHistory].sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
          );
          
          if (page === 1) {
            setChatHistory(sortedHistory);
          } else {
            setChatHistory((prev) => [...prev, ...sortedHistory]);
          }
          
          setHasMore(
            historyResponse.pagination.currentPage < historyResponse.pagination.totalPages
          );
        } else {
          setError(historyResponse.message || 'Failed to fetch chat history');
        }
      } catch (err) {
        setError(err.message || 'Failed to load chat history');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [patientId, doctorToken, page]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  };

  if (loading && page === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-6 md:py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-4 md:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Chat History</h1>
            {patient && (
              <p className="text-sm md:text-base text-gray-600 mt-1">Patient: {patient.name}</p>
            )}
          </div>
          <button
            onClick={() => navigate(`/doctor/patients/${patientId}`)}
            className="btn-secondary text-sm md:text-base w-full sm:w-auto"
          >
            ← Back to Profile
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="card">
          {chatHistory.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No chat history found.</p>
              <p className="text-gray-400 text-sm mt-2">
                This patient hasn't interacted with the AI assistant yet.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 pb-4 border-b border-gray-200">
                <p className="text-xs md:text-sm text-gray-600">
                  Total Messages: <span className="font-semibold">{chatHistory.length}</span>
                </p>
              </div>
              
              <div className="max-h-64 md:max-h-96 overflow-y-auto mb-4 bg-gray-50 rounded-lg p-3 md:p-4">
                {chatHistory.map((message, index) => (
                  <ChatBubble
                    key={`${message.timestamp}-${index}`}
                    message={message.message}
                    sender={message.role === 'user' ? 'user' : 'bot'}
                  />
                ))}
                {loading && page > 1 && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {hasMore && (
                <div className="text-center">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="btn-secondary disabled:bg-gray-400 text-sm md:text-base"
                  >
                    {loading ? 'Loading...' : 'Load More Messages'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

