import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export const Home = () => {
  const { token, user } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-accent-50">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-4xl mx-auto text-center mb-8 md:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-3 md:mb-4">
            Digital Health Assistant
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-2">
            Bringing Quality Healthcare to Rural Communities
          </p>
          <p className="text-sm sm:text-base md:text-lg text-gray-500">
            Check symptoms, book appointments, and connect with healthcare professionals
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
          <Link
            to="/chat"
            className="card text-center hover:shadow-lg transition transform hover:scale-105"
          >
            <div className="text-3xl md:text-4xl mb-2 md:mb-3">🩺</div>
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
              Symptom Checker
            </h3>
            <p className="text-sm md:text-base text-gray-600">
              Describe your symptoms and get instant guidance
            </p>
          </Link>

          <Link
            to={token ? '/appointment' : '/login'}
            className="card text-center hover:shadow-lg transition transform hover:scale-105"
          >
            <div className="text-3xl md:text-4xl mb-2 md:mb-3">📅</div>
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
              Book Appointment
            </h3>
            <p className="text-sm md:text-base text-gray-600">
              Schedule a visit with our medical team
            </p>
          </Link>

          {user?.role === 'admin' && (
            <Link
              to="/dashboard"
              className="card text-center hover:shadow-lg transition transform hover:scale-105"
            >
              <div className="text-3xl md:text-4xl mb-2 md:mb-3">📊</div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Dashboard</h3>
              <p className="text-sm md:text-base text-gray-600">
                View appointments and chat logs
              </p>
            </Link>
          )}

          {!token && (
            <Link
              to="/login"
              className="card text-center hover:shadow-lg transition transform hover:scale-105"
            >
              <div className="text-3xl md:text-4xl mb-2 md:mb-3">🔐</div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                Get Started
              </h3>
              <p className="text-sm md:text-base text-gray-600">
                Login or register for personalized care
              </p>
            </Link>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 md:p-8 mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">
            How It Works
          </h2>
          <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-2 md:mb-3">1</div>
              <h4 className="font-bold text-gray-900 mb-2 text-base md:text-lg">Check Symptoms</h4>
              <p className="text-sm md:text-base text-gray-600">
                Use our AI-powered symptom checker to understand your health
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-2 md:mb-3">2</div>
              <h4 className="font-bold text-gray-900 mb-2 text-base md:text-lg">Book Appointment</h4>
              <p className="text-sm md:text-base text-gray-600">
                Schedule a visit at your convenience
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-2 md:mb-3">3</div>
              <h4 className="font-bold text-gray-900 mb-2 text-base md:text-lg">Get Care</h4>
              <p className="text-sm md:text-base text-gray-600">
                Receive professional medical guidance
              </p>
            </div>
          </div>
        </div>

        {!token && (
          <div className="text-center">
            <Link
              to="/register"
              className="btn-primary bg-blue-600 text-white py-2 md:py-3 px-6 md:px-8 text-base md:text-lg"
            >
              Get Started Now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
