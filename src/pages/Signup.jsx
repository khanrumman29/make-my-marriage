import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';

export function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await signUp(email, password, name);
      // Move to first-time wedding setup screen
      navigate('/setup');
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'Unable to create account. Please check details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-serif text-2xl text-ink font-normal">Begin Your Journey</h2>
        <p className="text-xs text-muted mt-1">Create your personal wedding planning account</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-control flex items-start gap-2.5 text-xs text-danger">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-4">
        <Input
          label="Your Full Name"
          type="text"
          required
          icon={User}
          placeholder="e.g. Rumman Siddiqui"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          label="Email Address"
          type="email"
          required
          icon={Mail}
          placeholder="your.email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          label="Choose Password"
          type="password"
          required
          icon={Lock}
          placeholder="At least 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
              <Loader2 className="w-4 h-4 animate-spin" /> Creating Account...
            </span>
          ) : (
            'Create Account & Setup'
          )}
        </Button>
      </form>

      <div className="text-center text-xs text-muted pt-2 border-t border-border/60">
        <span>Already have an account? </span>
        <Link to="/login" className="text-forest hover:underline font-semibold">
          Sign In
        </Link>
      </div>
    </div>
  );
}
