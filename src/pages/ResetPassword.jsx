import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';

export function ResetPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setError('');
    setSubmitting(true);

    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err.message || 'Unable to send password recovery instructions. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-serif text-2xl text-ink font-normal">Reset Password</h2>
        <p className="text-xs text-muted mt-1">We will send you a recovery link to your email</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-control flex items-start gap-2.5 text-xs text-danger">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {sent ? (
        <div className="text-center py-4 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-success mx-auto" />
          <h3 className="font-serif text-lg text-ink font-normal">Check your inbox</h3>
          <p className="text-xs text-muted">
            We sent recovery instructions to <strong>{email}</strong>. Follow the link to choose a new password.
          </p>
          <div className="pt-2">
            <Link to="/login" className="text-xs text-forest hover:underline font-semibold">
              Return to Login
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            required
            icon={Mail}
            placeholder="your.email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={submitting}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Sending Instructions...
              </span>
            ) : (
              'Send Reset Link'
            )}
          </Button>

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-1 text-xs text-muted hover:text-ink font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
