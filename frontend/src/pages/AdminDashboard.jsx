import React, { useState, useEffect, useContext } from 'react';
import { apiCall } from '../utils/api';
import { AuthContext } from '../context/AuthContext';

export const AdminDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [chatLogs, setChatLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('appointments');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useContext(AuthContext);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      const [appointmentsData, logsData] = await Promise.all([
        apiCall('/api/appointments', 'GET', null, token),
        apiCall('/api/logs', 'GET', null, token),
      ]);

      setAppointments(appointmentsData);
      setChatLogs(logsData.chatLogs || logsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-6 md:py-8 px-4">
      <div className="container mx-auto">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-8">Admin Dashboard</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 md:mb-6 text-sm md:text-base">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 md:gap-4 mb-4 md:mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-4 md:px-6 py-2 rounded-lg font-medium transition text-sm md:text-base whitespace-nowrap ${
              activeTab === 'appointments'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Appointments ({appointments.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 md:px-6 py-2 rounded-lg font-medium transition text-sm md:text-base whitespace-nowrap ${
              activeTab === 'logs'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Chat Logs ({chatLogs.length})
          </button>
        </div>

        {activeTab === 'appointments' && (
          <div className="card">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
              All Appointments
            </h2>
            {appointments.length === 0 ? (
              <p className="text-gray-500 text-sm md:text-base">No appointments found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs md:text-sm">
                  <thead>
                    <tr className="border-b border-gray-300 bg-gray-50">
                      <th className="text-left px-4 py-3 font-semibold">
                        Patient
                      </th>
                      <th className="text-left px-4 py-3 font-semibold">
                        Age
                      </th>
                      <th className="text-left px-4 py-3 font-semibold">
                        Gender
                      </th>
                      <th className="text-left px-4 py-3 font-semibold">
                        Phone
                      </th>
                      <th className="text-left px-4 py-3 font-semibold">
                        Date
                      </th>
                      <th className="text-left px-4 py-3 font-semibold">
                        Time
                      </th>
                      <th className="text-left px-4 py-3 font-semibold">
                        Status
                      </th>
                      <th className="text-left px-4 py-3 font-semibold">
                        Symptoms
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((apt) => (
                      <tr
                        key={apt._id}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3">{apt.patientName}</td>
                        <td className="px-4 py-3">{apt.patientAge}</td>
                        <td className="px-4 py-3 capitalize">
                          {apt.patientGender}
                        </td>
                        <td className="px-4 py-3">{apt.phone}</td>
                        <td className="px-4 py-3">
                          {new Date(apt.appointmentDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">{apt.appointmentTime}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              apt.status === 'confirmed'
                                ? 'bg-green-100 text-green-800'
                                : apt.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {apt.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {apt.symptoms.substring(0, 30)}...
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="card">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
              Chat Logs
            </h2>
            {chatLogs.length === 0 ? (
              <p className="text-gray-500 text-sm md:text-base">No chat logs found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs md:text-sm">
                  <thead>
                    <tr className="border-b border-gray-300 bg-gray-50">
                      <th className="text-left px-4 py-3 font-semibold">
                        Session ID
                      </th>
                      <th className="text-left px-4 py-3 font-semibold">
                        User Message
                      </th>
                      <th className="text-left px-4 py-3 font-semibold">
                        Bot Response
                      </th>
                      <th className="text-left px-4 py-3 font-semibold">
                        Intent
                      </th>
                      <th className="text-left px-4 py-3 font-semibold">
                        Confidence
                      </th>
                      <th className="text-left px-4 py-3 font-semibold">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {chatLogs.map((log) => (
                      <tr
                        key={log._id}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 text-xs text-gray-600">
                          {log.sessionId.substring(0, 20)}...
                        </td>
                        <td className="px-4 py-3">
                          {log.userMessage.substring(0, 40)}...
                        </td>
                        <td className="px-4 py-3">
                          {log.botResponse.substring(0, 40)}...
                        </td>
                        <td className="px-4 py-3">{log.intent || 'N/A'}</td>
                        <td className="px-4 py-3">
                          {log.confidence
                            ? (log.confidence * 100).toFixed(0) + '%'
                            : 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          {new Date(log.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
