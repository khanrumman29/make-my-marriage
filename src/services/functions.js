import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mockFunctions } from '../mock/sampleWeddingData';

/**
 * Fetch functions/events for a wedding
 */
export async function getFunctions(weddingId) {
  if (!isSupabaseConfigured || !weddingId) {
    return mockFunctions;
  }

  const { data, error } = await supabase
    .from('wedding_functions')
    .select('*')
    .eq('wedding_id', weddingId)
    .order('event_date', { ascending: true });

  if (error) {
    console.error('Error fetching functions:', error);
    throw error;
  }

  return (data || []).map((fn) => ({
    id: fn.id,
    weddingId: fn.wedding_id,
    name: fn.name,
    eventDate: fn.event_date ? fn.event_date.split('T')[0] : '',
    startTime: fn.start_time || '',
    endTime: fn.end_time || '',
    venue: fn.venue || 'Venue TBD',
    plannedBudget: Math.round(Number(fn.planned_budget_paise || 0) / 100),
    description: fn.notes || '',
    tasksCount: 0,
    completedTasksCount: 0,
  }));
}

/**
 * Create a new function
 */
export async function createFunction(weddingId, fnData) {
  if (!isSupabaseConfigured) {
    return {
      id: `fn-${Date.now()}`,
      weddingId,
      ...fnData,
      plannedBudget: Number(fnData.plannedBudget) || 0,
      tasksCount: 0,
      completedTasksCount: 0,
    };
  }

  const { data: { user } } = await supabase.auth.getUser();
  const plannedBudgetPaise = Math.round((Number(fnData.plannedBudget) || 0) * 100);

  const { data, error } = await supabase
    .from('wedding_functions')
    .insert([
      {
        wedding_id: weddingId,
        name: fnData.name,
        event_date: fnData.eventDate ? `${fnData.eventDate}T00:00:00Z` : null,
        start_time: fnData.startTime || null,
        end_time: fnData.endTime || null,
        venue: fnData.venue || null,
        planned_budget_paise: plannedBudgetPaise,
        notes: fnData.description || null,
        created_by: user ? user.id : null,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating function:', error);
    throw error;
  }

  return {
    id: data.id,
    weddingId: data.wedding_id,
    name: data.name,
    eventDate: data.event_date ? data.event_date.split('T')[0] : '',
    startTime: data.start_time || '',
    endTime: data.end_time || '',
    venue: data.venue || 'Venue TBD',
    plannedBudget: Math.round(Number(data.planned_budget_paise || 0) / 100),
    description: data.notes || '',
    tasksCount: 0,
    completedTasksCount: 0,
  };
}

/**
 * Update an existing function
 */
export async function updateFunction(id, updates) {
  if (!isSupabaseConfigured) {
    return { id, ...updates };
  }

  const dbUpdates = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.eventDate !== undefined) {
    dbUpdates.event_date = updates.eventDate ? `${updates.eventDate}T00:00:00Z` : null;
  }
  if (updates.startTime !== undefined) dbUpdates.start_time = updates.startTime;
  if (updates.endTime !== undefined) dbUpdates.end_time = updates.endTime;
  if (updates.venue !== undefined) dbUpdates.venue = updates.venue;
  if (updates.description !== undefined) dbUpdates.notes = updates.description;
  if (updates.plannedBudget !== undefined) {
    dbUpdates.planned_budget_paise = Math.round(Number(updates.plannedBudget) * 100);
  }

  const { data, error } = await supabase
    .from('wedding_functions')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating function:', error);
    throw error;
  }

  return {
    id: data.id,
    weddingId: data.wedding_id,
    name: data.name,
    eventDate: data.event_date ? data.event_date.split('T')[0] : '',
    startTime: data.start_time || '',
    endTime: data.end_time || '',
    venue: data.venue || 'Venue TBD',
    plannedBudget: Math.round(Number(data.planned_budget_paise || 0) / 100),
    description: data.notes || '',
  };
}

/**
 * Delete a function
 */
export async function deleteFunction(id) {
  if (!isSupabaseConfigured) {
    return true;
  }

  const { error } = await supabase
    .from('wedding_functions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting function:', error);
    throw error;
  }

  return true;
}
