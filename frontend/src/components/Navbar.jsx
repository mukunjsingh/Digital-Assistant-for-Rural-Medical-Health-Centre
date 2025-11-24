import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { DoctorContext } from '../context/DoctorContext';

export const Navbar = () => {
  const { user, token, logout } = useContext(AuthContext);
  const { doctor, doctorToken, logoutDoctor } = useContext(DoctorContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const handleDoctorLogout = () => {
    logoutDoctor();
    setMobileMenuOpen(false);
    navigate('/');
  };

  // Determine which user type is logged in (priority: doctor > patient)
  const isDoctorLoggedIn = doctorToken && doctor;
  const isPatientLoggedIn = token && user && !isDoctorLoggedIn;
  const isLoggedIn = isDoctorLoggedIn || isPatientLoggedIn;

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-accent-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-xl md:text-2xl font-bold">
            <span>🏥</span>
            <span className="hidden sm:inline">Rural Health</span>
            <span className="sm:hidden">Health</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            {!isLoggedIn ? (
              <>
                <Link
                  to="/login"
                  className="hover:text-blue-100 transition font-medium text-sm lg:text-base"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary bg-white text-blue-600 hover:bg-gray-100 text-sm lg:text-base px-4 py-2 rounded-lg"
                >
                  Register
                </Link>
                <span className="w-px h-6 bg-white/40" />
                <Link
                  to="/doctor/login"
                  className="hover:text-blue-100 transition font-medium text-sm lg:text-base"
                >
                  Doctor Portal
                </Link>
              </>
            ) : isDoctorLoggedIn ? (
              <>
                <span className="text-sm lg:text-base">
                  Dr. {doctor?.name || 'Doctor'}
                </span>
                <Link
                  to="/doctor/dashboard"
                  className="hover:text-blue-100 transition font-medium text-sm lg:text-base"
                >
                  Dashboard
                </Link>
                <Link
                  to="/doctor/patients"
                  className="hover:text-blue-100 transition font-medium text-sm lg:text-base"
                >
                  Patients
                </Link>
                <button
                  onClick={handleDoctorLogout}
                  className="btn-primary bg-white text-blue-600 hover:bg-gray-100 text-sm lg:text-base px-4 py-2 rounded-lg"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <span className="text-sm lg:text-base">{user?.name || 'User'}</span>
                <Link
                  to="/my-appointments"
                  className="hover:text-blue-100 transition font-medium text-sm lg:text-base"
                >
                  Appointments
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/dashboard"
                    className="hover:text-blue-100 transition font-medium text-sm lg:text-base"
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="btn-primary bg-white text-blue-600 hover:bg-gray-100 text-sm lg:text-base px-4 py-2 rounded-lg"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-white/20 pt-4">
            <div className="flex flex-col gap-3">
              {!isLoggedIn ? (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:text-blue-100 transition font-medium py-2"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-primary bg-white text-blue-600 hover:bg-gray-100 px-4 py-2 rounded-lg text-center"
                  >
                    Register
                  </Link>
                  <div className="border-t border-white/20 my-2"></div>
                  <Link
                    to="/doctor/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:text-blue-100 transition font-medium py-2"
                  >
                    Doctor Portal
                  </Link>
                </>
              ) : isDoctorLoggedIn ? (
                <>
                  <div className="text-sm text-blue-100 py-2">
                    Dr. {doctor?.name || 'Doctor'}
                  </div>
                  <Link
                    to="/doctor/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:text-blue-100 transition font-medium py-2"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/doctor/patients"
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:text-blue-100 transition font-medium py-2"
                  >
                    Patients
                  </Link>
                  <button
                    onClick={handleDoctorLogout}
                    className="btn-primary bg-white text-blue-600 hover:bg-gray-100 px-4 py-2 rounded-lg text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <div className="text-sm text-blue-100 py-2">
                    {user?.name || 'User'}
                  </div>
                  <Link
                    to="/my-appointments"
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:text-blue-100 transition font-medium py-2"
                  >
                    Appointments
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="hover:text-blue-100 transition font-medium py-2"
                    >
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="btn-primary bg-white text-blue-600 hover:bg-gray-100 px-4 py-2 rounded-lg text-left"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
