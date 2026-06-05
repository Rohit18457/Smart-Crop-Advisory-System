import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/Common/ErrorBoundary';
import PageErrorBoundary from './components/Common/PageErrorBoundary';
import ProtectedRoute from './components/Common/ProtectedRoute';
import AdminRoute from './components/Common/AdminRoute';
import Layout from './components/Layout/Layout';
import AdminLayout from './components/Admin/AdminLayout';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CropRecommendation from './pages/CropRecommendation';
import DiseaseDetection from './pages/DiseaseDetection';
import Weather from './pages/Weather';
import MarketPrices from './pages/MarketPrices';
import VoiceAssistant from './pages/VoiceAssistant';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import PredictionMonitor from './pages/admin/PredictionMonitor';
import FeedbackManager from './pages/admin/FeedbackManager';
import DatasetManager from './pages/admin/DatasetManager';
import RegionInsights from './pages/admin/RegionInsights';
import AlertManager from './pages/admin/AlertManager';
import ContentManager from './pages/admin/ContentManager';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <div className="App">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<PageErrorBoundary pageName="Home"><HomePage /></PageErrorBoundary>} />
                <Route path="/login" element={<PageErrorBoundary pageName="Login"><Login /></PageErrorBoundary>} />
                <Route path="/register" element={<PageErrorBoundary pageName="Register"><Register /></PageErrorBoundary>} />

                {/* Protected farmer routes */}
                <Route path="/app" element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }>
                  <Route index element={<PageErrorBoundary pageName="Dashboard"><Dashboard /></PageErrorBoundary>} />
                  <Route path="dashboard" element={<PageErrorBoundary pageName="Dashboard"><Dashboard /></PageErrorBoundary>} />
                  <Route path="crop-recommendation" element={<PageErrorBoundary pageName="Crop Recommendation"><CropRecommendation /></PageErrorBoundary>} />
                  <Route path="disease-detection" element={<PageErrorBoundary pageName="Disease Detection"><DiseaseDetection /></PageErrorBoundary>} />
                  <Route path="weather" element={<PageErrorBoundary pageName="Weather"><Weather /></PageErrorBoundary>} />
                  <Route path="market-prices" element={<PageErrorBoundary pageName="Market Prices"><MarketPrices /></PageErrorBoundary>} />
                  <Route path="voice-assistant" element={<PageErrorBoundary pageName="Voice Assistant"><VoiceAssistant /></PageErrorBoundary>} />
                  <Route path="profile" element={<PageErrorBoundary pageName="Profile"><Profile /></PageErrorBoundary>} />
                </Route>

                {/* Admin routes */}
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }>
                  <Route index element={<PageErrorBoundary pageName="Admin Dashboard"><AdminDashboard /></PageErrorBoundary>} />
                  <Route path="predictions" element={<PageErrorBoundary pageName="Predictions"><PredictionMonitor /></PageErrorBoundary>} />
                  <Route path="feedback" element={<PageErrorBoundary pageName="Feedback"><FeedbackManager /></PageErrorBoundary>} />
                  <Route path="dataset" element={<PageErrorBoundary pageName="Dataset"><DatasetManager /></PageErrorBoundary>} />
                  <Route path="insights" element={<PageErrorBoundary pageName="Region Insights"><RegionInsights /></PageErrorBoundary>} />
                  <Route path="alerts" element={<PageErrorBoundary pageName="Alerts"><AlertManager /></PageErrorBoundary>} />
                  <Route path="content" element={<PageErrorBoundary pageName="Content"><ContentManager /></PageErrorBoundary>} />
                </Route>
              </Routes>
            </div>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;