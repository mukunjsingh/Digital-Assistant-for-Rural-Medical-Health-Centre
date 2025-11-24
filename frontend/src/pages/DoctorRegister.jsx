import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { DoctorContext } from '../context/DoctorContext';
import { AuthContext } from '../context/AuthContext';
import { doctorRegister } from '../utils/api';

export const DoctorRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specialization: '',
    contact: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginDoctor } = useContext(DoctorContext);
  const { logout } = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await doctorRegister({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        specialization: formData.specialization,
        contact: formData.contact,
      });

      const { token, ...doctorData } = response;
      
      // Clear patient session if exists
      logout();
      
      loginDoctor(doctorData, token);
      navigate('/doctor/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-accent-50 flex items-center justify-center px-4">
      <div className="card max-w-2xl w-full">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-4 md:mb-6">
          Doctor Registration
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                required
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                required
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specialization
              </label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                className="input-field"
                required
                placeholder="e.g., General Physician"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number
              </label>
              <input
                type="tel"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                className="input-field"
                required
                placeholder="Phone number"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                required
                placeholder="At least 6 characters"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input-field"
                required
                placeholder="Confirm password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Creating Account...' : 'Register as Doctor'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-4">
          Already have an account?{' '}
          <Link to="/doctor/login" className="text-blue-600 font-medium hover:underline">
            Doctor Login
          </Link>
        </p>
      </div>
    </div>
  );
};


