import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { WeddingProvider } from './contexts/WeddingContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppLayout } from './layouts/AppLayout';
import { AuthLayout } from './layouts/AuthLayout';

// Primary Pages
import { Dashboard } from './pages/Dashboard';
import { Expenses } from './pages/Expenses';
import { Functions } from './pages/Functions';
import { Invitations } from './pages/Invitations';
import { FamilySettings } from './pages/FamilySettings';

// Auth & Onboarding Pages
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ResetPassword } from './pages/ResetPassword';
import { WeddingSetup } from './pages/WeddingSetup';

// Public Guest Page
import { PublicInvitation } from './pages/PublicInvitation';

export default function App() {
  return (
    <AuthProvider>
      <WeddingProvider>
        <BrowserRouter>
          <Routes>
            {/* Protected Workspace Layout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/functions" element={<Functions />} />
                <Route path="/invitations" element={<Invitations />} />
                <Route path="/family-settings" element={<FamilySettings />} />
              </Route>
            </Route>

            {/* Authentication & Onboarding Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/setup" element={<WeddingSetup />} />
            </Route>

            {/* Standalone Public Invitation Page (No Auth Required) */}
            <Route path="/invite/:token" element={<PublicInvitation />} />

            {/* Catch-all Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </WeddingProvider>
    </AuthProvider>
  );
}
