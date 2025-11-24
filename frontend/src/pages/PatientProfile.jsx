import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DoctorContext } from '../context/DoctorContext';
import { getPatientById, generatePatientSummary } from '../utils/api';

export const PatientProfile = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { doctorToken } = useContext(DoctorContext);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const fetchPatient = async () => {
      if (!doctorToken || !patientId) {
        setError('Invalid request.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getPatientById(patientId, doctorToken);
        if (response.success) {
          setPatient(response.patient);
          if (response.patient.lastSummary) {
            setSummary(response.patient.lastSummary);
          }
        } else {
          setError(response.message || 'Failed to fetch patient details');
        }
      } catch (err) {
        setError(err.message || 'Failed to load patient');
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [patientId, doctorToken]);

  const handleGenerateSummary = async (forceRegenerate = false) => {
    if (!doctorToken || !patientId) return;

    try {
      setSummaryLoading(true);
      const response = await generatePatientSummary(patientId, doctorToken, forceRegenerate);
      if (response.success) {
        setSummary(response.summary);
      } else {
        setError(response.message || 'Failed to generate summary');
      }
    } catch (err) {
      setError(err.message || 'Failed to generate summary');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleViewChatHistory = () => {
    navigate(`/doctor/patients/${patientId}/chat-history`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="card">
            <div className="text-center py-12">
              <p className="text-red-600 text-lg">Patient not found.</p>
              <button
                onClick={() => navigate('/doctor/patients')}
                className="mt-4 btn-secondary"
              >
                ← Back to Patients
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-6 md:py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-4 md:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Patient Profile</h1>
          <button
            onClick={() => navigate('/doctor/patients')}
            className="btn-secondary text-sm md:text-base w-full sm:w-auto"
          >
            ← Back to Patients
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Patient Details Card */}
        <div className="card mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Patient Information</h2>
          <div className="grid sm:grid-cols-2 gap-3 md:gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Full Name</p>
              <p className="text-lg font-semibold text-gray-900">{patient.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Email</p>
              <p className="text-lg text-gray-900">{patient.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Phone</p>
              <p className="text-lg text-gray-900">{patient.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Registration Date</p>
              <p className="text-lg text-gray-900">
                {new Date(patient.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Visits</p>
              <p className="text-lg font-semibold text-blue-600">
                {patient.visitCount || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Chat Logs</p>
              <p className="text-lg text-gray-900">
                {patient.chatLogsCount || 0} messages
              </p>
            </div>
          </div>
        </div>

        {/* AI Chat Summary Card */}
        <div className="card mb-4 md:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">AI Chat Summary</h2>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                onClick={() => handleGenerateSummary(false)}
                disabled={summaryLoading}
                className="btn-primary bg-blue-600 text-white px-4 py-2 text-xs md:text-sm disabled:bg-gray-400"
              >
                {summaryLoading ? 'Generating...' : summary ? 'Refresh' : 'Generate'}
              </button>
              {summary && (
                <button
                  onClick={() => handleGenerateSummary(true)}
                  disabled={summaryLoading}
                  className="btn-secondary text-xs md:text-sm"
                >
                  Force Regenerate
                </button>
              )}
            </div>
          </div>
          {summary ? (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{summary}</p>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No summary available yet.</p>
              <p className="text-sm mt-2">Click "Generate" to create an AI summary of patient interactions.</p>
            </div>
          )}
        </div>

        {/* Actions Card */}
        <div className="card">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Actions</h2>
          <div className="flex gap-4">
            <button
              onClick={handleViewChatHistory}
              className="btn-primary bg-green-600 text-white px-4 md:px-6 py-2 md:py-3 hover:bg-green-700 text-sm md:text-base w-full sm:w-auto"
            >
              View Complete Chat History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

