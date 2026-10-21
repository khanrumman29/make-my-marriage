import React, { useState, useEffect } from 'react';
import {
  Send,
  Eye,
  Copy,
  Check,
  Share2,
  Sparkles,
  Globe,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useWedding } from '../contexts/WeddingContext';
import { getWeddingInvitation, togglePublishInvitation } from '../services/invitations';
import { formatDate } from '../utils/formatters';

export function Invitations() {
  const { currentWedding, userRole } = useWedding();
  const [invitation, setInvitation] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  const canEdit = userRole !== 'viewer';

  useEffect(() => {
    let isMounted = true;
    async function loadInv() {
      if (!currentWedding?.id) return;
      try {
        setLoading(true);
        const data = await getWeddingInvitation(currentWedding.id);
        if (isMounted) setInvitation(data);
      } catch (err) {
        console.error('Failed to load invitation:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadInv();
    return () => {
      isMounted = false;
    };
  }, [currentWedding?.id]);

  const token = invitation?.publicToken || 'sample-token-ayesha-rumman-2026';
  const publicUrl = `${window.location.origin}/invite/${token}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTogglePublish = async () => {
    if (!canEdit || !invitation) return;
    try {
      setPublishing(true);
      const nextState = !invitation.isPublished;
      await togglePublishInvitation(invitation.id, nextState, currentWedding.id);
      setInvitation({ ...invitation, isPublished: nextState });
    } catch (err) {
      console.error('Error toggling publish:', err);
      alert('Could not update invitation publish status: ' + err.message);
    } finally {
      setPublishing(false);
    }
  };

  const weddingDateStr = invitation?.eventDate || currentWedding?.weddingDate || '2026-12-18';
  const venueTitle = invitation?.venueName || currentWedding?.venue || 'Wedding Venue';

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `💍 Wedding Invitation: ${currentWedding?.weddingName || 'Wedding Celebration'}\n\nYou are cordially invited to celebrate our wedding on ${formatDate(
        weddingDateStr
      )} at ${venueTitle}.\n\nView details: ${publicUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-muted">
        <Loader2 className="w-6 h-6 animate-spin text-forest mb-2" />
        <span className="text-xs">Loading invitation details...</span>
      </div>
    );
  }

  const isPublished = Boolean(invitation?.isPublished);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Digital Wedding Invitations"
        subtitle="Craft an elegant digital invitation and share a private guest-friendly link."
        actions={
          <div className="flex items-center gap-2">
            {canEdit && (
              <Button
                variant={isPublished ? 'secondary' : 'primary'}
                size="sm"
                onClick={handleTogglePublish}
                disabled={publishing}
              >
                {publishing ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Updating...
                  </span>
                ) : isPublished ? (
                  'Unpublish'
                ) : (
                  'Publish Invitation'
                )}
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              icon={copied ? Check : Copy}
              onClick={handleCopyLink}
            >
              {copied ? 'Link Copied!' : 'Copy Link'}
            </Button>
          </div>
        }
      />

      {/* Share Notification Banner */}
      <div className="p-4 rounded-card bg-gold-tint/40 border border-gold/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Globe className="w-4 h-4 text-gold shrink-0" />
          <span>
            <strong>Public Invitation Status:</strong>{' '}
            {isPublished ? (
              <span className="text-forest font-semibold">Published & Live for Guests</span>
            ) : (
              <span className="text-warning font-semibold">Draft (Link is private)</span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={Share2}
            onClick={handleShareWhatsApp}
            className="text-forest h-8 text-xs"
          >
            Share on WhatsApp
          </Button>
          <a
            href={`/invite/${token}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-forest hover:text-forest-hover font-medium underline text-xs"
          >
            <span>Preview Page</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Visual Live Invitation Preview matching Stitch */}
      <div className="max-w-2xl mx-auto">
        <div className="relative overflow-hidden rounded-card bg-surface border border-border shadow-elevated p-8 sm:p-12 text-center flex flex-col items-center">
          {/* Subtle floral/ring decorative accent */}
          <div className="w-12 h-12 rounded-full bg-gold-tint text-gold flex items-center justify-center mb-6 shadow-sm">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>

          <span className="text-[11px] uppercase tracking-widest text-gold font-semibold mb-2">
            WE ARE GETTING MARRIED
          </span>

          <h2 className="font-serif text-3xl sm:text-4xl text-ink font-normal tracking-tight mb-3">
            {currentWedding?.coupleNames || `${currentWedding?.brideName} & ${currentWedding?.groomName}`}
          </h2>

          <div className="w-16 h-px bg-gold/50 my-4" />

          <p className="text-xs sm:text-sm text-muted max-w-md mb-8 leading-relaxed">
            With joyful hearts, we request the honor of your presence and blessings at the celebration of our union.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md text-left mb-8">
            <div className="p-4 rounded-control bg-canvas border border-border/80">
              <div className="flex items-center gap-2 text-gold mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                  Ceremony Date
                </span>
              </div>
              <p className="text-xs font-semibold text-ink">
                {formatDate(weddingDateStr)}
              </p>
              <p className="text-[11px] text-muted">Winter Celebration</p>
            </div>

            <div className="p-4 rounded-control bg-canvas border border-border/80">
              <div className="flex items-center gap-2 text-gold mb-1">
                <MapPin className="w-4 h-4" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                  Wedding Venue
                </span>
              </div>
              <p className="text-xs font-semibold text-ink line-clamp-1">
                {venueTitle}
              </p>
              <p className="text-[11px] text-muted">Bengaluru, India</p>
            </div>
          </div>

          {/* Invitation Public Link Box */}
          <div className="w-full max-w-md p-3.5 rounded-control bg-surface-soft/80 border border-border flex items-center justify-between gap-2 text-xs">
            <span className="text-muted truncate select-all">{publicUrl}</span>
            <Button
              variant="secondary"
              size="sm"
              icon={copied ? Check : Copy}
              onClick={handleCopyLink}
              className="shrink-0 h-7 text-[11px]"
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
