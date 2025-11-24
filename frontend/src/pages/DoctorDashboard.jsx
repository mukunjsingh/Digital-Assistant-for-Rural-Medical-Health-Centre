import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DoctorContext } from '../context/DoctorContext';
import { getDoctorAppointments, updateAppointmentStatus } from '../utils/api';

export const DoctorDashboard = () => {
  const { doctor, doctorToken, refreshProfile, logoutDoctor } = useContext(DoctorContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(doctor);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(!doctor);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const data = await refreshProfile();
        if (data) {
          setProfile(data);
        }
      } catch (err) {
        setError('Failed to load doctor profile. Please log in again.');
      } finally {
        setLoading(false);
      }
    };

    if (!doctor) {
      loadProfile();
    } else {
      setProfile(doctor);
      setLoading(false);
    }
  }, [doctor, refreshProfile]);

  useEffect(() => {
    const loadAppointments = async () => {
      if (!doctor || !doctorToken) return;

      try {
        setLoadingAppointments(true);
        const response = await getDoctorAppointments(doctor._id, doctorToken);
        if (response.success) {
          setAppointments(response.appointments || []);
        }
      } catch (err) {
        console.error('Failed to load appointments:', err);
      } finally {
        setLoadingAppointments(false);
      }
    };

    if (doctor && doctorToken) {
      loadAppointments();
    }
  }, [doctor, doctorToken]);

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    if (!doctorToken) return;

    try {
      const response = await updateAppointmentStatus(appointmentId, newStatus, doctorToken);
      if (response.success) {
        // Update local state
        setAppointments((prev) =>
          prev.map((apt) =>
            apt._id === appointmentId ? { ...apt, status: newStatus } : apt
          )
        );
      } else {
        setError(response.message || 'Failed to update appointment status');
      }
    } catch (err) {
      setError(err.message || 'Failed to update appointment status');
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-6 md:py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="card mb-4 md:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
            <button
              onClick={logoutDoctor}
              className="btn-secondary bg-white text-blue-600 hover:bg-gray-100 text-sm md:text-base w-full sm:w-auto"
            >
              Logout
            </button>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          {profile ? (
            <div className="grid gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="text-xl font-semibold text-gray-900">{profile.name}</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{profile.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact</p>
                  <p className="font-medium text-gray-900">{profile.contact}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Specialization</p>
                <p className="font-medium text-gray-900">{profile.specialization}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="font-medium text-gray-900">
                  {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">No doctor profile found.</p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 md:gap-4 mb-4 md:mb-6 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 md:px-6 py-2 font-medium transition whitespace-nowrap text-sm md:text-base ${
              activeTab === 'overview'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-4 md:px-6 py-2 font-medium transition relative whitespace-nowrap text-sm md:text-base ${
              activeTab === 'appointments'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Appointments
            {appointments.filter((apt) => apt.status === 'pending').length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {appointments.filter((apt) => apt.status === 'pending').length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'overview' && (
          <>
            <div className="card mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <button
                  onClick={() => navigate('/doctor/patients')}
                  className="card text-left hover:shadow-lg transition transform hover:scale-105 cursor-pointer border-2 border-blue-200 hover:border-blue-400"
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="text-3xl md:text-4xl">👥</div>
                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">Manage Patients</h3>
                      <p className="text-gray-600 text-xs md:text-sm">
                        View and manage all registered patients
                      </p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('appointments')}
                  className="card text-left hover:shadow-lg transition transform hover:scale-105 cursor-pointer border-2 border-green-200 hover:border-green-400"
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="text-3xl md:text-4xl">📅</div>
                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">Appointments</h3>
                      <p className="text-gray-600 text-xs md:text-sm">
                        View and manage appointment requests
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Next Steps</h2>
              <ul className="list-disc pl-5 text-gray-700 space-y-2 text-sm md:text-base">
                <li>Review and manage patient profiles from the Patients section.</li>
                <li>Check and respond to appointment requests.</li>
                <li>Monitor AI chat logs to understand patient concerns.</li>
                <li>Generate AI summaries for patient interactions.</li>
              </ul>
            </div>
          </>
        )}

        {activeTab === 'appointments' && (
          <div className="card">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">My Appointments</h2>
            {loadingAppointments ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-600 mt-2 text-sm md:text-base">Loading appointments...</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-8 md:py-12">
                <div className="text-5xl md:text-6xl mb-4">📅</div>
                <p className="text-gray-500 text-base md:text-lg">No appointments found.</p>
                <p className="text-gray-400 text-xs md:text-sm mt-2">
                  Appointment requests will appear here when patients book with you.
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-300 bg-gray-50">
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">Patient</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">Date</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">Time</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">Reason</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">Status</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((appointment) => (
                        <tr
                          key={appointment._id}
                          className="border-b border-gray-200 hover:bg-gray-50 transition"
                        >
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-gray-900">
                                {appointment.patientId?.name || 'N/A'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {appointment.patientId?.email || ''}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {new Date(appointment.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-gray-700">{appointment.time}</td>
                          <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                            {appointment.reason}
                          </td>
                          <td className="px-4 py-3">{getStatusBadge(appointment.status)}</td>
                          <td className="px-4 py-3">
                            {appointment.status === 'pending' ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleStatusUpdate(appointment._id, 'accepted')}
                                  className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(appointment._id, 'rejected')}
                                  className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">No action needed</span>
                            )}
                          </td>
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
                            {appointment.patientId?.name || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {appointment.patientId?.email || ''}
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
                      {appointment.status === 'pending' && (
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => handleStatusUpdate(appointment._id, 'accepted')}
                            className="flex-1 px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(appointment._id, 'rejected')}
                            className="flex-1 px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
            {appointments.length > 0 && (
              <div className="mt-4 text-xs md:text-sm text-gray-600 flex flex-wrap gap-2">
                <span>Total: <span className="font-semibold">{appointments.length}</span></span>
                <span>•</span>
                <span>Pending: <span className="font-semibold text-yellow-600">
                  {appointments.filter((apt) => apt.status === 'pending').length}
                </span></span>
                <span>•</span>
                <span>Accepted: <span className="font-semibold text-green-600">
                  {appointments.filter((apt) => apt.status === 'accepted').length}
                </span></span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


