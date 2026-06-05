/**
 * API Service Layer
 * =================
 * Centralised axios instance configured to talk to the Flask backend.
 * Every page component imports helpers from here instead of calling fetch directly.
 */

import axios from 'axios';
import { supabase } from './supabase';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60s — disease model inference can be slow the first time on CPU
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Get auth token from Supabase ──────────────────────────────────────────────
const getAuthToken = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// ── Request interceptor to add auth token ─────────────────────────────────────
api.interceptors.request.use(
  async (config) => {
    // Get fresh token for each request
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ── Intercept responses to normalise errors ───────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// ── Token helpers (legacy - kept for compatibility) ───────────────────────────
export const setAuthToken = (token) => {
  // This is now handled automatically by the request interceptor
  console.log('setAuthToken called - now handled automatically');
};

// ── Disease Detection ─────────────────────────────────────────────────────────
export const predictDisease = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await api.post('/predict-disease', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// ── Crop Recommendation ───────────────────────────────────────────────────────
export const getCropRecommendation = async ({ N, P, K, temperature, humidity, ph, rainfall }) => {
  const response = await api.post('/crop-recommend', {
    N: Number(N),
    P: Number(P),
    K: Number(K),
    temperature: Number(temperature),
    humidity: Number(humidity),
    ph: Number(ph),
    rainfall: Number(rainfall),
  });
  return response.data;
};

// ── Weather ───────────────────────────────────────────────────────────────────
export const getWeather = async (city) => {
  const response = await api.get('/weather', { params: { city } });
  return response.data;
};

export const getWeatherForecast = async (city) => {
  const response = await api.get('/weather/forecast', { params: { city } });
  return response.data;
};

// ── Chat / Voice Assistant ────────────────────────────────────────────────────
export const sendChatMessage = async (message, history = []) => {
  const response = await api.post('/chat', { message, history });
  return response.data;
};

// ── Market Prices ─────────────────────────────────────────────────────────────
export const getMarketPrices = async ({ commodity = '', state = '', limit = 100 } = {}) => {
  const params = {};
  if (commodity) params.commodity = commodity;
  if (state) params.state = state;
  if (limit !== 100) params.limit = limit;
  const response = await api.get('/market-prices', { params });
  return response.data;
};

// ── User Profile ──────────────────────────────────────────────────────────────
// NOTE: Registration, login, and logout are handled client-side by Supabase SDK
// (see context/AuthContext.js). Only profile fetch uses the Flask backend.
export const getUserProfile = async () => {
  const response = await api.get('/user/profile');
  return response.data;
};

export default api;
