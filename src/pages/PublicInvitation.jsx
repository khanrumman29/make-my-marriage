import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Clock, MapPin, Sparkles, Heart, Loader2, Lock } from 'lucide-react';
import { getPublicInvitationByToken } from '../services/invitations';
import { formatDate } from '../utils/formatters';

export function PublicInvitation() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchInvitation() {
      try {
        setLoading(true);
        const result = await getPublicInvitationByToken(token);
        if (isMounted) {
          if (result && result.is_published) {
            setData(result);
          } else {
            setError(true);
          }
        }
      } catch (err) {
        console.error('Failed to load public invitation:', err);
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchInvitation();
    return () => {
      isMounted = false;
    };
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F1EA] flex flex-col justify-center items-center">
        <Loader2 className="w-8 h-8 text-gold animate-spin mb-3" />
        <p className="font-serif text-forest text-base">Opening Wedding Invitation...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#F4F1EA] py-12 px-4 flex flex-col justify-center items-center">
        <div className="w-full max-w-md bg-surface border border-border rounded-card shadow-md p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-gold-tint text-gold flex items-center justify-center mx-auto">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="font-serif text-2xl text-ink font-normal">Private Invitation</h2>
          <p className="text-xs text-muted leading-relaxed">
            This wedding celebration invitation has not been published yet or the link is invalid. Please contact the hosts for an updated link.
          </p>
        </div>
      </div>
    );
  }

  const coupleDisplay = data.couple_names || data.wedding_name || 'Wedding Celebration';
  const venueTitle = data.venue || 'Wedding Venue';
  const city = data.city || '';

  return (
    <div className="min-h-screen bg-[#F4F1EA] py-12 px-4 sm:px-6 flex flex-col justify-center items-center">
      <div className="w-full max-w-lg bg-surface border-2 border-gold/40 rounded-card shadow-elevated p-8 sm:p-12 text-center relative overflow-hidden">
        {/* Decorative Golden Corner Accents */}
        <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-gold/70" />
        <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-gold/70" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-gold/70" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-gold/70" />

        <div className="space-y-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gold-tint text-gold mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>

          <div>
            <span className="text-xs font-semibold text-muted uppercase tracking-widest block">
              Wedding Invitation
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-forest mt-3 font-normal leading-tight">
              {coupleDisplay}
            </h1>
          </div>

          <div className="w-20 h-px bg-gold/50 mx-auto" />

          <p className="font-serif italic text-base text-ink leading-relaxed px-4">
            "With joyful hearts, we request the honor of your presence and blessings at the celebration of our wedding."
          </p>

          <div className="p-4 rounded-control bg-canvas/80 border border-border/80 space-y-2 text-xs sm:text-sm">
            <div className="flex items-center justify-center gap-2 font-semibold text-ink">
              <Calendar className="w-4 h-4 text-gold" />
              <span>{formatDate(data.wedding_date)}</span>
            </div>

            <div className="flex items-center justify-center gap-2 text-ink font-medium pt-1">
              <MapPin className="w-4 h-4 text-gold shrink-0" />
              <span>{venueTitle}</span>
            </div>

            {city && (
              <p className="text-xs text-muted max-w-xs mx-auto">
                {city}
              </p>
            )}
          </div>

          <div className="pt-4 text-center">
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(
                `${venueTitle} ${city}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-control bg-forest text-white text-xs font-semibold hover:bg-forest-hover shadow-subtle transition-all"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Get Directions to Venue</span>
            </a>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-muted flex items-center gap-1.5">
        <span>Celebrated with</span>
        <Heart className="w-3 h-3 text-gold fill-current" />
        <span>on Make My Marriage</span>
      </div>
    </div>
  );
}
