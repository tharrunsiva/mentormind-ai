import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import DashboardLayout from './layouts/DashboardLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import OnboardingWizard from './pages/OnboardingWizard';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import AssessmentPage from './pages/AssessmentPage';
import CareerExplorerPage from './pages/CareerExplorerPage';
import SkillGapPage from './pages/SkillGapPage';
import RoadmapPage from './pages/RoadmapPage';
import ResourcesPage from './pages/ResourcesPage';
import MentorChatPage from './pages/MentorChatPage';
import PeersPage from './pages/PeersPage';
import InterviewRoomPage from './pages/InterviewRoomPage';
import AnalyticsPage from './pages/AnalyticsPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <>
      {/* Living Colorful Aurora Background Canvas */}
      <div className="aurora-bg-container" aria-hidden="true">
        <div className="aurora-blob aurora-blob-1"></div>
        <div className="aurora-blob aurora-blob-2"></div>
        <div className="aurora-blob aurora-blob-3"></div>
        <div className="aurora-blob aurora-blob-4"></div>
        <div className="aurora-blob aurora-blob-5"></div>
      </div>

      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Onboarding Wizard */}
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <OnboardingWizard />
          </ProtectedRoute>
        }
      />

      {/* Protected Dashboard Pages */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="assessment" element={<AssessmentPage />} />
        <Route path="careers" element={<CareerExplorerPage />} />
        <Route path="skill-gap" element={<SkillGapPage />} />
        <Route path="roadmap" element={<RoadmapPage />} />
        <Route path="resources" element={<ResourcesPage />} />
        <Route path="mentor" element={<MentorChatPage />} />
        <Route path="peers" element={<PeersPage />} />
        <Route path="interviews" element={<InterviewRoomPage />} />
        <Route path="interviews/:id" element={<InterviewRoomPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="admin" element={<AdminDashboardPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}

export default App;
