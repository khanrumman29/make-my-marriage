import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mockTasks } from '../mock/sampleWeddingData';

/**
 * Fetch tasks for a wedding
 */
export async function getTasks(weddingId) {
  if (!isSupabaseConfigured || !weddingId) {
    return mockTasks;
  }

  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      function:wedding_functions (
        id,
        name
      )
    `)
    .eq('wedding_id', weddingId)
    .order('due_at', { ascending: true, nullsFirst: false });

  if (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }

  return (data || []).map((t) => ({
    id: t.id,
    weddingId: t.wedding_id,
    title: t.title,
    description: t.description || '',
    priority: t.priority,
    status: t.status,
    dueDate: t.due_at ? t.due_at.split('T')[0] : '',
    functionName: t.function?.name || '',
    assignedTo: t.assigned_to,
  }));
}

/**
 * Create a new task
 */
export async function createTask(weddingId, taskData) {
  if (!isSupabaseConfigured) {
    return {
      id: `tsk-${Date.now()}`,
      weddingId,
      ...taskData,
      status: taskData.status || 'todo',
    };
  }

  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('tasks')
    .insert([
      {
        wedding_id: weddingId,
        title: taskData.title,
        description: taskData.description || null,
        function_id: taskData.functionId || null,
        assigned_to: taskData.assignedTo || null,
        due_at: taskData.dueDate ? `${taskData.dueDate}T00:00:00Z` : null,
        priority: taskData.priority || 'medium',
        status: taskData.status || 'todo',
        created_by: user ? user.id : null,
      },
    ])
    .select(`
      *,
      function:wedding_functions (
        id,
        name
      )
    `)
    .single();

  if (error) {
    console.error('Error creating task:', error);
    throw error;
  }

  return {
    id: data.id,
    weddingId: data.wedding_id,
    title: data.title,
    description: data.description || '',
    priority: data.priority,
    status: data.status,
    dueDate: data.due_at ? data.due_at.split('T')[0] : '',
    functionName: data.function?.name || '',
  };
}

/**
 * Update task status or fields
 */
export async function updateTask(id, updates) {
  if (!isSupabaseConfigured) {
    return { id, ...updates };
  }

  const dbUpdates = {};
  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.dueDate !== undefined) {
    dbUpdates.due_at = updates.dueDate ? `${updates.dueDate}T00:00:00Z` : null;
  }

  const { data, error } = await supabase
    .from('tasks')
    .update(dbUpdates)
    .eq('id', id)
    .select(`
      *,
      function:wedding_functions (
        id,
        name
      )
    `)
    .single();

  if (error) {
    console.error('Error updating task:', error);
    throw error;
  }

  return {
    id: data.id,
    weddingId: data.wedding_id,
    title: data.title,
    description: data.description || '',
    priority: data.priority,
    status: data.status,
    dueDate: data.due_at ? data.due_at.split('T')[0] : '',
    functionName: data.function?.name || '',
  };
}

/**
 * Delete a task
 */
export async function deleteTask(id) {
  if (!isSupabaseConfigured) {
    return true;
  }

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting task:', error);
    throw error;
  }

  return true;
}
