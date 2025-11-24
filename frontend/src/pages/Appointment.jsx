import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllDoctors, bookAppointment } from '../utils/api';
import { AuthContext } from '../context/AuthContext';

export const Appointment = () => {
  const [formData, setFormData] = useState({
    doctorId: '',
    date: '',
    time: '',
    reason: '',
  });
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [success, setSuccess] = useState(false);
  const [appointmentData, setAppointmentData] = useState(null);
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoadingDoctors(true);
        const response = await getAllDoctors();
        if (response.success) {
          setDoctors(response.doctors || []);
        } else {
          setError('Failed to load doctors. Please try again.');
        }
      } catch (err) {
        setError(err.message || 'Failed to load doctors');
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      navigate('/login');
      return;
    }

    if (!formData.doctorId || !formData.date || !formData.time || !formData.reason) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const response = await bookAppointment(formData, token);
      if (response.success) {
        setAppointmentData(response.appointment);
        setSuccess(true);
        setFormData({
          doctorId: '',
          date: '',
          time: '',
          reason: '',
        });
      } else {
        setError(response.message || 'Failed to book appointment');
      }
    } catch (err) {
      setError(err.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  if (success && appointmentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent-50 to-blue-50 flex items-center justify-center px-4 py-6">
        <div className="card max-w-md w-full text-center">
          <div className="text-5xl md:text-6xl mb-4">✅</div>
          <h2 className="text-2xl md:text-3xl font-bold text-green-600 mb-4">
            Appointment Booked!
          </h2>
          <div className="text-left bg-gray-50 rounded-lg p-3 md:p-4 mb-4">
            <p className="text-xs md:text-sm text-gray-600 mb-2">
              <span className="font-semibold">Doctor:</span>{' '}
              {appointmentData.doctorId?.name || 'N/A'}
            </p>
            <p className="text-xs md:text-sm text-gray-600 mb-2">
              <span className="font-semibold">Specialization:</span>{' '}
              {appointmentData.doctorId?.specialization || 'N/A'}
            </p>
            <p className="text-xs md:text-sm text-gray-600 mb-2">
              <span className="font-semibold">Date:</span>{' '}
              {new Date(appointmentData.date).toLocaleDateString()}
            </p>
            <p className="text-xs md:text-sm text-gray-600 mb-2">
              <span className="font-semibold">Time:</span> {appointmentData.time}
            </p>
            <p className="text-xs md:text-sm text-gray-600">
              <span className="font-semibold">Status:</span>{' '}
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                {appointmentData.status}
              </span>
            </p>
          </div>
          <p className="text-sm md:text-base text-gray-600 mb-4">
            Your appointment request has been sent to the doctor. You will be notified once they respond.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => navigate('/my-appointments')}
              className="btn-primary bg-blue-600 text-white flex-1 text-sm md:text-base"
            >
              View My Appointments
            </button>
            <button
              onClick={() => navigate('/')}
              className="btn-secondary flex-1 text-sm md:text-base"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-accent-50 py-6 md:py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="card">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">
            Book an Appointment
          </h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {loadingDoctors ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-600 mt-2 text-sm md:text-base">Loading doctors...</p>
            </div>
          ) : doctors.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-4 md:mb-6 text-sm md:text-base">
              No doctors available at the moment. Please contact the administration.
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Doctor *
                </label>
                <select
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleChange}
                  className="input-field text-sm md:text-base"
                  required
                >
                  <option value="">Choose a doctor...</option>
                  {doctors.map((doctor) => (
                    <option key={doctor._id} value={doctor._id}>
                      Dr. {doctor.name} - {doctor.specialization}
                    </option>
                  ))}
                </select>
                {formData.doctorId && (
                  <p className="text-xs text-gray-500 mt-1">
                    {doctors.find((d) => d._id === formData.doctorId)?.contact && (
                      <>Contact: {doctors.find((d) => d._id === formData.doctorId).contact}</>
                    )}
                  </p>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Appointment Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="input-field text-sm md:text-base"
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Appointment Time *
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="input-field text-sm md:text-base"
                    required
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Appointment *
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  className="input-field text-sm md:text-base"
                  required
                  placeholder="Describe the reason for your appointment"
                  rows="4"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !formData.doctorId}
                className="w-full btn-primary bg-blue-600 disabled:bg-gray-400 text-sm md:text-base py-2 md:py-3"
              >
                {loading ? 'Booking...' : 'Book Appointment'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
