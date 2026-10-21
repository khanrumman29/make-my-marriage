import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mockWedding, mockFamilyMembers } from '../mock/sampleWeddingData';

const LOCAL_STORAGE_KEY = 'mmm_custom_wedding';

export function getStoredWedding() {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Could not read wedding from localStorage:', e);
  }
  return null;
}

export function saveStoredWedding(data) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Could not save wedding to localStorage:', e);
  }
}

/**
 * Creates a wedding workspace atomically and assigns creator as first admin
 */
export async function createWeddingWorkspace({
  name,
  coupleNames = '',
  weddingDate = null,
  venue = '',
  city = '',
  budgetPaise = 0,
}) {
  const bride = coupleNames.split('&')[0]?.trim() || 'Bride';
  const groom = coupleNames.split('&')[1]?.trim() || 'Groom';
  const newWedding = {
    ...mockWedding,
    id: `wed-${Date.now()}`,
    weddingName: name,
    coupleNames: coupleNames || `${bride} & ${groom}`,
    brideName: bride,
    groomName: groom,
    weddingDate: weddingDate || '2026-12-18',
    venue: venue || '',
    city: city || '',
    budget: Math.round(budgetPaise / 100),
    totalBudgetPaise: budgetPaise,
  };

  saveStoredWedding(newWedding);

  if (!isSupabaseConfigured) {
    return newWedding;
  }

  try {
    const { data, error } = await supabase.rpc('create_wedding_workspace', {
      p_name: name,
      p_couple_names: coupleNames,
      p_wedding_date: weddingDate || null,
      p_venue: venue || null,
      p_city: city || null,
      p_budget_paise: budgetPaise,
    });

    if (error) {
      console.warn('Supabase create wedding note:', error.message);
      return newWedding;
    }

    return data || newWedding;
  } catch (err) {
    console.warn('Supabase create wedding exception, using local store:', err);
    return newWedding;
  }
}

/**
 * Fetch weddings the current user belongs to
 */
export async function getUserWeddings() {
  const activeLocal = getStoredWedding() || mockWedding;

  if (!isSupabaseConfigured) {
    return [{
      wedding: activeLocal,
      role: 'admin',
    }];
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return [{
        wedding: activeLocal,
        role: 'admin',
      }];
    }

    const { data, error } = await supabase
      .from('wedding_members')
      .select(`
        id,
        role,
        relation,
        joined_at,
        wedding:weddings (
          id,
          name,
          couple_names,
          wedding_date,
          venue,
          city,
          currency_code,
          total_budget_paise,
          created_by,
          created_at
        )
      `)
      .eq('user_id', user.id);

    if (error || !data || data.length === 0) {
      return [{
        wedding: activeLocal,
        role: 'admin',
      }];
    }

    return data;
  } catch (err) {
    console.warn('Error fetching user weddings, fallback to local:', err);
    return [{
      wedding: activeLocal,
      role: 'admin',
    }];
  }
}

/**
 * Fetch members for a specific wedding
 */
export async function getWeddingMembers(weddingId) {
  if (!isSupabaseConfigured) {
    return mockFamilyMembers;
  }

  const { data, error } = await supabase
    .from('wedding_members')
    .select(`
      id,
      wedding_id,
      user_id,
      role,
      relation,
      joined_at,
      profile:profiles (
        id,
        full_name,
        avatar_url,
        phone
      )
    `)
    .eq('wedding_id', weddingId);

  if (error) {
    console.error('Error fetching wedding members:', error);
    throw error;
  }

  return (data || []).map((m) => ({
    id: m.id,
    userId: m.user_id,
    name: m.profile?.full_name || 'Family Member',
    email: '',
    role: m.role,
    relation: m.relation || 'Family',
    avatar: m.profile?.avatar_url || '',
    joinedAt: m.joined_at,
  }));
}

/**
 * Update wedding details
 */
export async function updateWedding(weddingId, updates) {
  const current = getStoredWedding() || mockWedding;
  const budgetNum = updates.totalBudgetPaise !== undefined
    ? Math.round(updates.totalBudgetPaise / 100)
    : (updates.budget !== undefined ? Number(updates.budget) : current.budget);

  const coupleNames = updates.coupleNames || current.coupleNames || '';
  const bride = updates.brideName || (coupleNames.includes('&') ? coupleNames.split('&')[0]?.trim() : current.brideName);
  const groom = updates.groomName || (coupleNames.includes('&') ? coupleNames.split('&')[1]?.trim() : current.groomName);

  const updatedWedding = {
    ...current,
    ...updates,
    id: weddingId || current.id,
    weddingName: updates.name ?? updates.weddingName ?? current.weddingName,
    coupleNames: coupleNames || `${bride} & ${groom}`,
    brideName: bride,
    groomName: groom,
    weddingDate: updates.weddingDate ? updates.weddingDate.split('T')[0] : current.weddingDate,
    venue: updates.venue ?? current.venue,
    city: updates.city ?? current.city,
    budget: budgetNum,
    totalBudgetPaise: updates.totalBudgetPaise ?? (budgetNum * 100),
  };

  saveStoredWedding(updatedWedding);

  if (!isSupabaseConfigured) {
    return updatedWedding;
  }

  try {
    const dbUpdates = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.coupleNames !== undefined) dbUpdates.couple_names = updates.coupleNames;
    if (updates.weddingDate !== undefined) dbUpdates.wedding_date = updates.weddingDate;
    if (updates.venue !== undefined) dbUpdates.venue = updates.venue;
    if (updates.city !== undefined) dbUpdates.city = updates.city;
    if (updates.totalBudgetPaise !== undefined) dbUpdates.total_budget_paise = updates.totalBudgetPaise;

    const { data, error } = await supabase
      .from('weddings')
      .update(dbUpdates)
      .eq('id', weddingId)
      .select()
      .maybeSingle();

    if (error) {
      console.warn('Supabase update warning, falling back to local storage:', error.message);
      return updatedWedding;
    }

    if (data) {
      const merged = {
        ...updatedWedding,
        id: data.id,
        weddingName: data.name,
        coupleNames: data.couple_names,
        weddingDate: data.wedding_date,
        venue: data.venue,
        city: data.city,
        budget: Math.round(Number(data.total_budget_paise || 0) / 100),
        totalBudgetPaise: data.total_budget_paise,
      };
      saveStoredWedding(merged);
      return merged;
    }
  } catch (err) {
    console.warn('Supabase update exception, saved locally:', err);
  }

  return updatedWedding;
}

/**
 * Invite a member to the wedding
 */
export async function addWeddingMember(weddingId, { userId, role = 'family_member', relation = '' }) {
  if (!isSupabaseConfigured) {
    return { id: `mem-${Date.now()}`, weddingId, userId, role, relation };
  }

  const { data, error } = await supabase
    .from('wedding_members')
    .insert([
      {
        wedding_id: weddingId,
        user_id: userId,
        role,
        relation,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error adding wedding member:', error);
    throw error;
  }

  return data;
}
