import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { DoctorContext } from '../context/DoctorContext';
import { AuthContext } from '../context/AuthContext';
import { doctorLogin } from '../utils/api';

export const DoctorLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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
    setLoading(true);

    try {
      const response = await doctorLogin(formData);
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
      <div className="card max-w-md w-full">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-4 md:mb-6">
          Doctor Login
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
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

          <div className="mb-6">
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
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Logging In...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-4">
          Need an account?{' '}
          <Link to="/doctor/register" className="text-blue-600 font-medium hover:underline">
            Register as Doctor
          </Link>
        </p>
      </div>
    </div>
  );
};


