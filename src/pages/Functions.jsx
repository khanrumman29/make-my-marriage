import React, { useState, useEffect } from 'react';
import {
  Plus,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { useWedding } from '../contexts/WeddingContext';
import { getFunctions, createFunction, deleteFunction } from '../services/functions';
import { formatINR, formatDate, formatTime } from '../utils/formatters';

export function Functions() {
  const { currentWedding, userRole } = useWedding();
  const [functions, setFunctions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const canEdit = userRole !== 'viewer';

  // New function form state
  const [formData, setFormData] = useState({
    name: '',
    eventDate: '2026-12-18',
    startTime: '18:00',
    endTime: '22:00',
    venue: '',
    plannedBudget: '',
    description: '',
  });

  useEffect(() => {
    let isMounted = true;
    async function loadFns() {
      if (!currentWedding?.id) return;
      try {
        setLoading(true);
        const data = await getFunctions(currentWedding.id);
        if (isMounted) setFunctions(data || []);
      } catch (err) {
        console.error('Failed to load functions:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadFns();
    return () => {
      isMounted = false;
    };
  }, [currentWedding?.id]);

  const handleAddFunction = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.eventDate) return;
    setError('');
    setSubmitting(true);

    try {
      const created = await createFunction(currentWedding.id, formData);
      setFunctions([...functions, created]);
      setIsModalOpen(false);
      setFormData({
        name: '',
        eventDate: '2026-12-18',
        startTime: '18:00',
        endTime: '22:00',
        venue: '',
        plannedBudget: '',
        description: '',
      });
    } catch (err) {
      console.error('Error creating function:', err);
      setError(err.message || 'Failed to create function. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this wedding function?')) return;
    try {
      await deleteFunction(id);
      setFunctions(functions.filter((f) => f.id !== id));
    } catch (err) {
      console.error('Error deleting function:', err);
      alert('Could not delete function: ' + (err.message || 'Permission denied'));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Wedding Functions & Ceremonies"
        subtitle="Organize celebrations, timings, venues, planned budgets, and linked tasks."
        actions={
          canEdit && (
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={() => setIsModalOpen(true)}
            >
              Add Function
            </Button>
          )
        }
      />

      {loading ? (
        <div className="p-12 flex flex-col items-center justify-center text-muted">
          <Loader2 className="w-6 h-6 animate-spin text-forest mb-2" />
          <span className="text-xs">Loading wedding functions...</span>
        </div>
      ) : functions.length === 0 ? (
        <Card className="p-12 text-center text-muted">
          <Calendar className="w-10 h-10 mx-auto text-muted/40 mb-3" />
          <p className="font-serif text-lg text-ink">No wedding functions yet</p>
          <p className="text-xs text-muted mt-1">
            Add ceremonies such as Haldi, Mehndi, Sangeet, Nikah, or Reception.
          </p>
          {canEdit && (
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsModalOpen(true)}
              className="mt-4"
            >
              Add First Ceremony
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {functions.map((fn) => {
            const budget = fn.plannedBudget || 0;
            const spent = fn.actualExpenses || 0;
            const remaining = budget - spent;
            const isOverBudget = remaining < 0;

            return (
              <Card key={fn.id} hoverEffect className="flex flex-col justify-between">
                <div>
                  {/* Header: Title and Status */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-serif text-xl font-normal text-ink">{fn.name}</h3>
                      <p className="text-xs text-muted mt-1 leading-relaxed line-clamp-2">
                        {fn.description || 'Ceremony celebration with family and guests.'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <StatusBadge status={fn.status || 'upcoming'} />
                      {canEdit && (
                        <button
                          title="Delete Ceremony"
                          onClick={() => handleDelete(fn.id)}
                          className="p-1 text-muted hover:text-danger rounded-control hover:bg-danger-tint transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Date, Time & Venue */}
                  <div className="p-3 bg-canvas rounded-control border border-border/80 my-3.5 space-y-1.5 text-xs text-ink">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-gold shrink-0" />
                      <span className="font-medium">{formatDate(fn.eventDate)}</span>
                      {fn.startTime && (
                        <span className="text-muted">
                          • {formatTime(fn.startTime)} {fn.endTime ? `- ${formatTime(fn.endTime)}` : ''}
                        </span>
                      )}
                    </div>
                    {fn.venue && (
                      <div className="flex items-center gap-2 text-muted">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{fn.venue}</span>
                      </div>
                    )}
                  </div>

                  {/* Budget & Expense Breakdown */}
                  {budget > 0 && (
                    <div className="space-y-2 mt-4 pt-3 border-t border-border/60">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted font-medium">Planned Budget</span>
                        <span className="font-semibold text-ink">
                          {formatINR(budget)}
                        </span>
                      </div>

                      <ProgressBar
                        value={spent}
                        max={budget || 1}
                        variant={isOverBudget ? 'warning' : 'forest'}
                        height="h-2"
                        showPercentage={false}
                      />
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between">
                  <span className="text-xs text-gold font-medium flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Ceremony Active
                  </span>
                  <div className="text-xs text-muted">
                    {formatDate(fn.eventDate)}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Function Modal Dialog */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create Wedding Ceremony"
          subtitle="Add a function like Mehndi, Haldi, Nikah, Wedding Ceremony or Reception."
        >
          {error && (
            <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-control flex items-start gap-2 text-xs text-danger">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAddFunction} className="space-y-4">
            <Input
              label="Ceremony / Function Name *"
              required
              placeholder="e.g. Sangeet & Mehndi Night"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Date *"
                type="date"
                required
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
              />
              <Input
                label="Start Time"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
              <Input
                label="End Time"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Venue or Hall"
                placeholder="e.g. The Courtyard Lawn, Taj West End"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              />
              <Input
                label="Planned Budget (₹)"
                type="number"
                min="0"
                placeholder="e.g. 450000"
                value={formData.plannedBudget}
                onChange={(e) => setFormData({ ...formData, plannedBudget: e.target.value })}
              />
            </div>

            <Input
              label="Ceremony Notes & Theme"
              placeholder="e.g. Floral yellow theme, festive lunch, Chaat counters"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={submitting}
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Creating...
                  </span>
                ) : (
                  'Create Ceremony'
                )}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
