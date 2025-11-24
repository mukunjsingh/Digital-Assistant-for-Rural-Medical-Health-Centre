import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getPatientAppointments } from '../utils/api';

export const PatientAppointments = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!token || !user) {
        setError('Please log in to view your appointments.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getPatientAppointments(user._id, token);
        if (response.success) {
          setAppointments(response.appointments || []);
        } else {
          setError(response.message || 'Failed to fetch appointments');
        }
      } catch (err) {
        setError(err.message || 'Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [token, user]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      accepted: { bg: 'bg-green-100', text: 'text-green-800', label: 'Accepted' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
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
      <div className="container mx-auto max-w-4xl">
        <div className="mb-4 md:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Appointments</h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={() => navigate('/appointment')}
              className="btn-primary bg-blue-600 text-white text-sm md:text-base w-full sm:w-auto"
            >
              Book New Appointment
            </button>
            <button
              onClick={() => navigate('/')}
              className="btn-secondary text-sm md:text-base w-full sm:w-auto"
            >
              ← Back to Home
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="card">
          {appointments.length === 0 ? (
            <div className="text-center py-8 md:py-12">
              <div className="text-5xl md:text-6xl mb-4">📅</div>
              <p className="text-gray-500 text-base md:text-lg mb-2">No appointments found.</p>
              <p className="text-gray-400 text-xs md:text-sm mb-4">
                Book your first appointment to get started.
              </p>
              <button
                onClick={() => navigate('/appointment')}
                className="btn-primary bg-blue-600 text-white text-sm md:text-base"
              >
                Book Appointment
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-300 bg-gray-50">
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Doctor</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Specialization</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Date</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Time</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Reason</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appointment) => (
                      <tr
                        key={appointment._id}
                        className="border-b border-gray-200 hover:bg-gray-50 transition"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {appointment.doctorId?.name || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {appointment.doctorId?.specialization || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {new Date(appointment.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-gray-700">{appointment.time}</td>
                        <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                          {appointment.reason}
                        </td>
                        <td className="px-4 py-3">{getStatusBadge(appointment.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {appointments.map((appointment) => (
                  <div
                    key={appointment._id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">
                          Dr. {appointment.doctorId?.name || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {appointment.doctorId?.specialization || 'N/A'}
                        </p>
                      </div>
                      <div>{getStatusBadge(appointment.status)}</div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Date:</span>
                        <span className="text-gray-900">
                          {new Date(appointment.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Time:</span>
                        <span className="text-gray-900">{appointment.time}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Reason:</span>
                        <p className="text-gray-900 mt-1">{appointment.reason}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {appointments.length > 0 && (
            <div className="mt-4 text-xs md:text-sm text-gray-600">
              Total Appointments: <span className="font-semibold">{appointments.length}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

