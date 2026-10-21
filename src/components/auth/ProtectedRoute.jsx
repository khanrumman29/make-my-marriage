import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useWedding } from '../../contexts/WeddingContext';
import { Sparkles } from 'lucide-react';

export function ProtectedRoute() {
  const { user, loading, isConfigured } = useAuth();
  const { currentWedding, isLoadingWedding } = useWedding();
  const location = useLocation();

  if (loading || (user && isConfigured && isLoadingWedding)) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-forest text-gold-tint flex items-center justify-center animate-pulse shadow-md mb-4">
          <Sparkles className="w-6 h-6 animate-spin text-gold" />
        </div>
        <p className="font-serif text-lg text-forest font-medium">Make My Marriage</p>
        <p className="text-xs text-muted mt-1">Loading your workspace...</p>
      </div>
    );
  }

  // Not signed in
  if (!user && isConfigured) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Signed in but has not completed wedding onboarding yet
  if (user && isConfigured && !currentWedding && location.pathname !== '/setup') {
    return <Navigate to="/setup" replace />;
  }

  return <Outlet />;
}
