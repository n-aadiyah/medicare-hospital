
import { createContext, useContext, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [loading, setLoading] = useState(false);

  const saveSession = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  };

  // Patient: request OTP
  const sendPatientOTP = async (email) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/patient/send-otp', {
        email,
      });
      return response.data;
    } finally {
      setLoading(false);
    }
  };

  // Patient: verify OTP and login
  const verifyPatientOTP = async (email, otp) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/patient/verify-otp', {
        email,
        otp,
      });

      saveSession(response.data);
      return response.data;
    } finally {
      setLoading(false);
    }
  };

  // Doctor/Admin: username and password login
  const doctorAdminLogin = async (username, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        username,
        password,
      });

      saveSession(response.data);
      return response.data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        sendPatientOTP,
        verifyPatientOTP,
        doctorAdminLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
};
