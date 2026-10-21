import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mockInvitation } from '../mock/sampleWeddingData';

/**
 * Fetch digital invitation for a wedding
 */
export async function getWeddingInvitation(weddingId) {
  if (!isSupabaseConfigured || !weddingId) {
    return mockInvitation;
  }

  const { data, error } = await supabase
    .from('invitations')
    .select(`
      *,
      wedding:weddings (
        name,
        couple_names,
        wedding_date,
        venue,
        city
      )
    `)
    .eq('wedding_id', weddingId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching invitation:', error);
    throw error;
  }

  if (!data) {
    // If no invitation row exists yet, return default structure
    return {
      id: null,
      weddingId,
      title: 'Our Wedding Celebration',
      eventDate: '',
      venueName: '',
      venueAddress: '',
      isPublished: false,
      publicToken: 'default',
      notes: '',
    };
  }

  return {
    id: data.id,
    weddingId: data.wedding_id,
    title: data.title || 'Our Wedding Celebration',
    eventDate: data.wedding?.wedding_date || '',
    venueName: data.wedding?.venue || '',
    venueAddress: data.wedding?.city || '',
    isPublished: data.is_published,
    publicToken: data.public_token,
    channel: data.channel,
    status: data.status,
    notes: data.notes || '',
  };
}

/**
 * Toggle publish status of invitation
 */
export async function togglePublishInvitation(invitationId, isPublished, weddingId) {
  if (!isSupabaseConfigured) {
    return { ...mockInvitation, isPublished };
  }

  if (!invitationId) {
    // Create new invitation row if not existing
    const { data, error } = await supabase
      .from('invitations')
      .insert([
        {
          wedding_id: weddingId,
          is_published: isPublished,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from('invitations')
    .update({ is_published: isPublished })
    .eq('id', invitationId)
    .select()
    .single();

  if (error) {
    console.error('Error toggling invitation publish:', error);
    throw error;
  }

  return data;
}

/**
 * Retrieve safe public invitation data using security definer RPC
 */
export async function getPublicInvitationByToken(token) {
  if (!isSupabaseConfigured || token === 'sample-token-ayesha-rumman-2026') {
    return {
      title: mockInvitation.title,
      is_published: true,
      wedding_name: "Ayesha & Rumman's Wedding",
      couple_names: 'Ayesha Khan & Rumman Siddiqui',
      wedding_date: mockInvitation.eventDate,
      venue: mockInvitation.venueName,
      city: mockInvitation.venueAddress,
    };
  }

  const { data, error } = await supabase.rpc('get_public_invitation', {
    p_token: token,
  });

  if (error) {
    console.error('Error getting public invitation:', error);
    throw error;
  }

  return data;
}
