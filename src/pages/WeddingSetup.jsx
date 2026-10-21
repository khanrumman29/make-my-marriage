import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { createWeddingWorkspace } from '../services/weddings';
import { useWedding } from '../contexts/WeddingContext';

export function WeddingSetup() {
  const navigate = useNavigate();
  const { refreshWeddings } = useWedding();
  const [formData, setFormData] = useState({
    weddingName: "Ayesha & Rumman's Wedding",
    brideName: 'Ayesha Khan',
    groomName: 'Rumman Siddiqui',
    weddingDate: '2026-12-18',
    budget: '2500000',
    currency: 'INR',
    venue: 'Taj West End, Bengaluru',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const budgetNum = parseFloat(formData.budget) || 0;
      const budgetPaise = Math.round(budgetNum * 100);

      await createWeddingWorkspace({
        name: formData.weddingName,
        coupleNames: `${formData.brideName.trim()} & ${formData.groomName.trim()}`,
        weddingDate: formData.weddingDate,
        venue: formData.venue,
        city: formData.venue.includes(',') ? formData.venue.split(',').pop().trim() : '',
        budgetPaise,
      });

      // Refresh context wedding state
      await refreshWeddings();

      // Navigate to active dashboard
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Wedding onboarding setup error:', err);
      setError(err.message || 'Failed to initialize workspace. Please check your inputs and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gold-tint text-gold mx-auto mb-2">
          <Heart className="w-5 h-5 fill-current" />
        </div>
        <h2 className="font-serif text-2xl text-ink font-normal">Wedding Setup</h2>
        <p className="text-xs text-muted mt-1">Configure your personal wedding workspace</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-control flex items-start gap-2.5 text-xs text-danger">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Wedding Workspace Name *"
          required
          placeholder="e.g. Ayesha & Rumman's Wedding"
          value={formData.weddingName}
          onChange={(e) => setFormData({ ...formData, weddingName: e.target.value })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Bride's Name *"
            required
            placeholder="e.g. Ayesha Khan"
            value={formData.brideName}
            onChange={(e) => setFormData({ ...formData, brideName: e.target.value })}
          />
          <Input
            label="Groom's Name *"
            required
            placeholder="e.g. Rumman Siddiqui"
            value={formData.groomName}
            onChange={(e) => setFormData({ ...formData, groomName: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Wedding Date *"
            type="date"
            required
            value={formData.weddingDate}
            onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
          />
          <Input
            label="Estimated Total Budget (₹) *"
            type="number"
            required
            min="1000"
            placeholder="e.g. 2500000"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
          />
        </div>

        <Input
          label="Main Wedding Venue"
          placeholder="e.g. Taj West End, Bengaluru"
          value={formData.venue}
          onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2"
          disabled={submitting}
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Creating Workspace...
            </span>
          ) : (
            'Create Wedding Workspace & Continue'
          )}
        </Button>
      </form>
    </div>
  );
}
