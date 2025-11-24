import axios from 'axios';

const API_URL = 'http://localhost:5000';

const doctorClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const handleAxiosError = (error) => {
  throw new Error(error.response?.data?.message || error.message || 'Network error');
};

export default API_URL;

export const apiCall = async (endpoint, method = 'GET', data = null, token = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (data && (method === 'POST' || method === 'PUT')) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message || 'Network error');
  }
};

export const doctorRegister = async (payload) => {
  try {
    const { data } = await doctorClient.post('/api/doctors/register', payload);
    return data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const doctorLogin = async (payload) => {
  try {
    const { data } = await doctorClient.post('/api/doctors/login', payload);
    return data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const getDoctorProfile = async (token) => {
  try {
    const { data } = await doctorClient.get('/api/doctors/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Patient Management API functions
export const getAllPatients = async (token) => {
  try {
    const { data } = await doctorClient.get('/api/doctor/patients', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const getPatientById = async (patientId, token) => {
  try {
    const { data } = await doctorClient.get(`/api/doctor/patients/${patientId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const getPatientChatHistory = async (patientId, token, page = 1, limit = 50) => {
  try {
    const { data } = await doctorClient.get(
      `/api/doctor/patients/${patientId}/chat-history?page=${page}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const generatePatientSummary = async (patientId, token, forceRegenerate = false) => {
  try {
    const { data } = await doctorClient.post(
      `/api/doctor/patients/${patientId}/generate-summary`,
      { forceRegenerate },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Appointment API functions
export const getAllDoctors = async () => {
  try {
    const { data } = await doctorClient.get('/api/appointments/doctors');
    return data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const bookAppointment = async (appointmentData, token) => {
  try {
    const { data } = await doctorClient.post('/api/appointments/book', appointmentData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const getPatientAppointments = async (patientId, token) => {
  try {
    const { data } = await doctorClient.get(`/api/appointments/patient/${patientId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const getDoctorAppointments = async (doctorId, token) => {
  try {
    const { data } = await doctorClient.get(`/api/appointments/doctor/${doctorId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const updateAppointmentStatus = async (appointmentId, status, token) => {
  try {
    const { data } = await doctorClient.patch(
      `/api/appointments/${appointmentId}/status`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return data;
  } catch (error) {
    handleAxiosError(error);
  }
};
