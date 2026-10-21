import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mockMessages } from '../mock/sampleWeddingData';

/**
 * Fetch announcements / messages for a wedding
 */
export async function getAnnouncements(weddingId) {
  if (!isSupabaseConfigured || !weddingId) {
    return mockMessages;
  }

  const { data, error } = await supabase
    .from('announcements')
    .select(`
      *,
      creator:profiles (
        full_name,
        avatar_url
      )
    `)
    .eq('wedding_id', weddingId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching announcements:', error);
    throw error;
  }

  return (data || []).map((msg) => ({
    id: msg.id,
    weddingId: msg.wedding_id,
    title: msg.title,
    text: msg.message,
    author: msg.creator?.full_name || 'Family Member',
    createdAt: msg.created_at,
  }));
}

/**
 * Post an announcement / message
 */
export async function createAnnouncement(weddingId, { title = 'Announcement', message }) {
  if (!isSupabaseConfigured) {
    return {
      id: `msg-${Date.now()}`,
      weddingId,
      title,
      text: message,
      author: 'You',
      createdAt: new Date().toISOString(),
    };
  }

  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('announcements')
    .insert([
      {
        wedding_id: weddingId,
        title,
        message,
        created_by: user ? user.id : null,
      },
    ])
    .select(`
      *,
      creator:profiles (
        full_name
      )
    `)
    .single();

  if (error) {
    console.error('Error creating announcement:', error);
    throw error;
  }

  return {
    id: data.id,
    weddingId: data.wedding_id,
    title: data.title,
    text: data.message,
    author: data.creator?.full_name || 'You',
    createdAt: data.created_at,
  };
}
