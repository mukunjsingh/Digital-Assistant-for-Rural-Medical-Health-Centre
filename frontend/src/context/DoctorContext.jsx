import React, { createContext, useState, useEffect } from 'react';
import { getDoctorProfile } from '../utils/api';

export const DoctorContext = createContext();

export const DoctorProvider = ({ children }) => {
  const [doctor, setDoctor] = useState(null);
  const [doctorToken, setDoctorToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('doctorToken');
    const storedDoctor = localStorage.getItem('doctor');
    const patientToken = localStorage.getItem('token');

    // If patient is logged in, clear doctor session
    if (patientToken) {
      localStorage.removeItem('doctorToken');
      localStorage.removeItem('doctor');
      setDoctorToken(null);
      setDoctor(null);
    } else if (storedToken) {
      setDoctorToken(storedToken);
      if (storedDoctor) {
        setDoctor(JSON.parse(storedDoctor));
      }
    }

    setLoading(false);
  }, []);

  const loginDoctor = (doctorData, token) => {
    // Clear patient session when doctor logs in
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    setDoctor(doctorData);
    setDoctorToken(token);
    localStorage.setItem('doctorToken', token);
    localStorage.setItem('doctor', JSON.stringify(doctorData));
  };

  const logoutDoctor = () => {
    setDoctor(null);
    setDoctorToken(null);
    localStorage.removeItem('doctorToken');
    localStorage.removeItem('doctor');
  };

  const refreshProfile = async () => {
    if (!doctorToken) {
      return null;
    }

    try {
      const profile = await getDoctorProfile(doctorToken);
      setDoctor(profile);
      localStorage.setItem('doctor', JSON.stringify(profile));
      return profile;
    } catch (error) {
      console.error('Failed to refresh doctor profile:', error);
      logoutDoctor();
      throw error;
    }
  };

  return (
    <DoctorContext.Provider
      value={{
        doctor,
        doctorToken,
        loading,
        loginDoctor,
        logoutDoctor,
        refreshProfile,
      }}
    >
      {children}
    </DoctorContext.Provider>
  );
};


