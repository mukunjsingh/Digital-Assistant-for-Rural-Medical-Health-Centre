import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { DoctorContext } from '../context/DoctorContext';

export const DoctorProtectedRoute = ({ children }) => {
  const { doctorToken, loading } = useContext(DoctorContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!doctorToken) {
    return <Navigate to="/doctor/login" />;
  }

  return children;
};


