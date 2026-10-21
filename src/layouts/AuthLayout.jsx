import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export function AuthLayout({ title, subtitle }) {
  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Icon */}
        <Link to="/" className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-forest text-gold-tint shadow-subtle mb-4">
          <Sparkles className="w-6 h-6" />
        </Link>
        <h1 className="font-serif text-2xl sm:text-3xl text-ink font-normal tracking-tight">
          Make My Marriage
        </h1>
        <p className="mt-1 text-sm text-muted">
          Your personal wedding planning workspace
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-surface py-8 px-6 sm:px-8 border border-border rounded-card shadow-subtle">
          <Outlet />
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-muted">
        A private wedding workspace for you and your family.
      </div>
    </div>
  );
}
