import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/Common/ErrorBoundary';
import PageErrorBoundary from './components/Common/PageErrorBoundary';
import ProtectedRoute from './components/Common/ProtectedRoute';
import AdminRoute from './components/Common/AdminRoute';
import Layout from './components/Layout/Layout';
import AdminLayout from './components/Admin/AdminLayout';

// Lazy loaded pages to reduce initial bundle size (reduces loading time)
const HomePage = lazy(() => import('./pages/HomePage'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CropRecommendation = lazy(() => import('./pages/CropRecommendation'));
const DiseaseDetection = lazy(() => import('./pages/DiseaseDetection'));
const Weather = lazy(() => import('./pages/Weather'));
const MarketPrices = lazy(() => import('./pages/MarketPrices'));
const VoiceAssistant = lazy(() => import('./pages/VoiceAssistant'));
const Profile = lazy(() => import('./pages/Profile'));

// Lazy loaded admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const PredictionMonitor = lazy(() => import('./pages/admin/PredictionMonitor'));
const FeedbackManager = lazy(() => import('./pages/admin/FeedbackManager'));
const DatasetManager = lazy(() => import('./pages/admin/DatasetManager'));
const RegionInsights = lazy(() => import('./pages/admin/RegionInsights'));
const AlertManager = lazy(() => import('./pages/admin/AlertManager'));
const ContentManager = lazy(() => import('./pages/admin/ContentManager'));

// Loading spinner fallback during lazy loading
const LoadingFallback = () => (
  <div className="flex h-screen w-full items-center justify-center bg-gray-50">
    <div className="h-12 w-12 animate-spin rounded-full border-b-4 border-t-4 border-emerald-600"></div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <div className="App">
              <Suspense fallback={<LoadingFallback />}>
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
              </Suspense>
            </div>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;