import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DoctorProvider } from './context/DoctorContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DoctorProtectedRoute } from './components/DoctorProtectedRoute';

import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Chat } from './pages/Chat';
import { Appointment } from './pages/Appointment';
import { PatientAppointments } from './pages/PatientAppointments';
import { AdminDashboard } from './pages/AdminDashboard';
import { DoctorLogin } from './pages/DoctorLogin';
import { DoctorRegister } from './pages/DoctorRegister';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { PatientList } from './pages/PatientList';
import { PatientProfile } from './pages/PatientProfile';
import { ChatHistory } from './pages/ChatHistory';

function App() {
  return (
    <Router>
      <AuthProvider>
        <DoctorProvider>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/chat" element={<Chat />} />
              <Route
                path="/appointment"
                element={
                  <ProtectedRoute>
                    <Appointment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-appointments"
                element={
                  <ProtectedRoute>
                    <PatientAppointments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/doctor/login" element={<DoctorLogin />} />
              <Route path="/doctor/register" element={<DoctorRegister />} />
              <Route
                path="/doctor/dashboard"
                element={
                  <DoctorProtectedRoute>
                    <DoctorDashboard />
                  </DoctorProtectedRoute>
                }
              />
              <Route
                path="/doctor/patients"
                element={
                  <DoctorProtectedRoute>
                    <PatientList />
                  </DoctorProtectedRoute>
                }
              />
              <Route
                path="/doctor/patients/:patientId"
                element={
                  <DoctorProtectedRoute>
                    <PatientProfile />
                  </DoctorProtectedRoute>
                }
              />
              <Route
                path="/doctor/patients/:patientId/chat-history"
                element={
                  <DoctorProtectedRoute>
                    <ChatHistory />
                  </DoctorProtectedRoute>
                }
              />
            </Routes>
          </div>
        </DoctorProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
