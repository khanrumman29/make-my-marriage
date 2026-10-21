import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mockExpenses } from '../mock/sampleWeddingData';

/**
 * Fetch all expenses for a wedding
 */
export async function getExpenses(weddingId) {
  if (!isSupabaseConfigured || !weddingId) {
    return mockExpenses;
  }

  const { data, error } = await supabase
    .from('expenses')
    .select(`
      id,
      wedding_id,
      function_id,
      title,
      category,
      amount_paise,
      amount_paid_paise,
      paid_to,
      payment_status,
      expense_date,
      notes,
      created_by,
      created_at,
      function:wedding_functions (
        id,
        name
      )
    `)
    .eq('wedding_id', weddingId)
    .order('expense_date', { ascending: false });

  if (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }

  return (data || []).map((exp) => ({
    id: exp.id,
    weddingId: exp.wedding_id,
    title: exp.title,
    category: exp.category,
    amount: Math.round(Number(exp.amount_paise) / 100),
    amountPaid: Math.round(Number(exp.amount_paid_paise) / 100),
    amountPaise: exp.amount_paise,
    amountPaidPaise: exp.amount_paid_paise,
    expenseDate: exp.expense_date,
    vendorName: exp.paid_to || '',
    functionId: exp.function_id,
    functionName: exp.function?.name || '',
    notes: exp.notes || '',
    createdAt: exp.created_at,
  }));
}

/**
 * Create a new expense
 */
export async function createExpense(weddingId, expenseData) {
  if (!isSupabaseConfigured) {
    const newExp = {
      id: `exp-${Date.now()}`,
      weddingId,
      ...expenseData,
      amount: Number(expenseData.amount) || 0,
      amountPaid: Number(expenseData.amountPaid) || 0,
      notes: expenseData.notes || '',
    };
    return newExp;
  }

  const { data: { user } } = await supabase.auth.getUser();

  const amountPaise = Math.round((Number(expenseData.amount) || 0) * 100);
  const amountPaidPaise = Math.round((Number(expenseData.amountPaid) || 0) * 100);

  let status = 'pending';
  if (amountPaidPaise >= amountPaise && amountPaise > 0) {
    status = 'paid';
  } else if (amountPaidPaise > 0) {
    status = 'partially_paid';
  }

  const { data, error } = await supabase
    .from('expenses')
    .insert([
      {
        wedding_id: weddingId,
        title: expenseData.title,
        category: expenseData.category || 'Other',
        amount_paise: amountPaise,
        amount_paid_paise: Math.min(amountPaidPaise, amountPaise),
        paid_to: expenseData.vendorName || null,
        function_id: expenseData.functionId || null,
        expense_date: expenseData.expenseDate || new Date().toISOString().split('T')[0],
        notes: expenseData.notes || null,
        payment_status: status,
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
    console.error('Error creating expense:', error);
    throw error;
  }

  return {
    id: data.id,
    weddingId: data.wedding_id,
    title: data.title,
    category: data.category,
    amount: Math.round(Number(data.amount_paise) / 100),
    amountPaid: Math.round(Number(data.amount_paid_paise) / 100),
    amountPaise: data.amount_paise,
    amountPaidPaise: data.amount_paid_paise,
    expenseDate: data.expense_date,
    vendorName: data.paid_to || '',
    functionId: data.function_id,
    functionName: data.function?.name || '',
    notes: data.notes || '',
  };
}

/**
 * Update an existing expense
 */
export async function updateExpense(id, updates) {
  if (!isSupabaseConfigured) {
    return { id, ...updates };
  }

  const dbUpdates = {};
  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.category !== undefined) dbUpdates.category = updates.category;
  if (updates.vendorName !== undefined) dbUpdates.paid_to = updates.vendorName;
  if (updates.functionId !== undefined) dbUpdates.function_id = updates.functionId || null;
  if (updates.expenseDate !== undefined) dbUpdates.expense_date = updates.expenseDate;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

  if (updates.amount !== undefined) {
    dbUpdates.amount_paise = Math.round(Number(updates.amount) * 100);
  }
  if (updates.amountPaid !== undefined) {
    dbUpdates.amount_paid_paise = Math.round(Number(updates.amountPaid) * 100);
  }

  if (dbUpdates.amount_paise !== undefined || dbUpdates.amount_paid_paise !== undefined) {
    const amt = dbUpdates.amount_paise ?? 0;
    const paid = dbUpdates.amount_paid_paise ?? 0;
    if (paid >= amt && amt > 0) dbUpdates.payment_status = 'paid';
    else if (paid > 0) dbUpdates.payment_status = 'partially_paid';
    else dbUpdates.payment_status = 'pending';
  }

  const { data, error } = await supabase
    .from('expenses')
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
    console.error('Error updating expense:', error);
    throw error;
  }

  return {
    id: data.id,
    weddingId: data.wedding_id,
    title: data.title,
    category: data.category,
    amount: Math.round(Number(data.amount_paise) / 100),
    amountPaid: Math.round(Number(data.amount_paid_paise) / 100),
    expenseDate: data.expense_date,
    vendorName: data.paid_to || '',
    functionId: data.function_id,
    functionName: data.function?.name || '',
    notes: data.notes || '',
  };
}

/**
 * Delete an expense
 */
export async function deleteExpense(id) {
  if (!isSupabaseConfigured) {
    return true;
  }

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }

  return true;
}
