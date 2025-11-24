import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { DoctorContext } from '../context/DoctorContext';
import { getAllPatients } from '../utils/api';

export const PatientList = () => {
  const { doctorToken } = useContext(DoctorContext);
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      if (!doctorToken) {
        setError('Please log in as a doctor to view patients.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getAllPatients(doctorToken);
        if (response.success) {
          setPatients(response.patients || []);
        } else {
          setError(response.message || 'Failed to fetch patients');
        }
      } catch (err) {
        setError(err.message || 'Failed to load patients');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [doctorToken]);

  const handleViewProfile = (patientId) => {
    navigate(`/doctor/patients/${patientId}`);
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
      <div className="container mx-auto max-w-6xl">
        <div className="mb-4 md:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Patient Management</h1>
          <button
            onClick={() => navigate('/doctor/dashboard')}
            className="btn-secondary text-sm md:text-base w-full sm:w-auto"
          >
            ← Back to Dashboard
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="card">
          {patients.length === 0 ? (
            <div className="text-center py-8 md:py-12">
              <p className="text-gray-500 text-base md:text-lg">No patients found.</p>
              <p className="text-gray-400 text-xs md:text-sm mt-2">
                Patients will appear here once they register and interact with the system.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-300 bg-gray-50">
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Name</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Email</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Phone</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Registered</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Visits</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((patient) => (
                      <tr
                        key={patient._id}
                        className="border-b border-gray-200 hover:bg-gray-50 transition"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900">{patient.name}</td>
                        <td className="px-4 py-3 text-gray-700">{patient.email}</td>
                        <td className="px-4 py-3 text-gray-700">{patient.phone}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {new Date(patient.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {patient.visitCount || 0}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleViewProfile(patient._id)}
                            className="btn-primary bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-700"
                          >
                            View Profile
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {patients.map((patient) => (
                  <div
                    key={patient._id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">{patient.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{patient.email}</p>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {patient.visitCount || 0} visits
                      </span>
                    </div>
                    <div className="space-y-2 text-sm mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Phone:</span>
                        <span className="text-gray-900">{patient.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Registered:</span>
                        <span className="text-gray-900">
                          {new Date(patient.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewProfile(patient._id)}
                      className="w-full btn-primary bg-blue-600 text-white text-sm py-2 hover:bg-blue-700"
                    >
                      View Profile
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {patients.length > 0 && (
            <div className="mt-4 text-xs md:text-sm text-gray-600">
              Total Patients: <span className="font-semibold">{patients.length}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

