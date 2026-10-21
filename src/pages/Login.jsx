import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendStatus, setResendStatus] = useState('');

  const handleResendConfirmation = async () => {
    if (!email) return;
    setResendingEmail(true);
    setResendStatus('');
    try {
      const { supabase } = await import('../lib/supabase');
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      if (error) throw error;
      setResendStatus('Confirmation email sent! Please check your inbox and spam folder.');
    } catch (err) {
      setResendStatus(err.message || 'Failed to resend confirmation email.');
    } finally {
      setResendingEmail(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setResendStatus('');
    setSubmitting(true);

    try {
      await signIn(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-serif text-2xl text-ink font-normal">Welcome back</h2>
        <p className="text-xs text-muted mt-1">Sign in to your private wedding workspace</p>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-control flex flex-col gap-2 text-xs text-danger">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-medium">{error}</span>
          </div>
          {error.toLowerCase().includes('email not confirmed') && (
            <div className="pl-6 pt-1 border-t border-red-200/60 flex flex-col gap-2">
              <p className="text-[11px] text-muted">
                Supabase requires email confirmation by default. You can check your inbox, or disable email confirmation in Supabase Dashboard.
              </p>
              <button
                type="button"
                onClick={handleResendConfirmation}
                disabled={resendingEmail}
                className="self-start text-xs font-semibold text-forest hover:underline disabled:opacity-50"
              >
                {resendingEmail ? 'Sending email...' : '✉️ Resend Confirmation Email'}
              </button>
              {resendStatus && (
                <p className="text-[11px] text-forest font-medium">{resendStatus}</p>
              )}
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          required
          icon={Mail}
          placeholder="your.email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div>
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              required
              icon={Lock}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-muted hover:text-ink focus:outline-none"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex justify-end mt-1.5">
            <Link
              to="/reset-password"
              className="text-xs text-forest hover:text-forest-hover font-medium"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={submitting}
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Signing In...
            </span>
          ) : (
            'Sign In to Workspace'
          )}
        </Button>
      </form>

      <div className="text-center text-xs text-muted pt-2 border-t border-border/60">
        <span>Planning your wedding for the first time? </span>
        <Link to="/signup" className="text-forest hover:underline font-semibold">
          Create an Account
        </Link>
      </div>
    </div>
  );
}
