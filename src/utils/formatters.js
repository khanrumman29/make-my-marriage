/**
 * Format number into Indian Rupee currency format (e.g. ₹1,25,000)
 * @param {number|string} amount 
 * @returns {string}
 */
export function formatINR(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Format a date string into readable format (e.g. 18 Dec 2026)
 * @param {string|Date} dateStr 
 * @returns {string}
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format time (e.g. 18:30:00 -> 6:30 PM)
 * @param {string} timeStr 
 * @returns {string}
 */
export function formatTime(timeStr) {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  if (hours === undefined || minutes === undefined) return timeStr;
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

/**
 * Calculate payment status based on amount and amountPaid
 * @param {number} amount 
 * @param {number} amountPaid 
 * @returns {'paid' | 'partially_paid' | 'pending'}
 */
export function getPaymentStatus(amount, amountPaid) {
  const total = Number(amount) || 0;
  const paid = Number(amountPaid) || 0;
  if (paid >= total && total > 0) return 'paid';
  if (paid > 0 && paid < total) return 'partially_paid';
  return 'pending';
}

/**
 * Human-readable label for payment status
 */
export const PAYMENT_STATUS_LABELS = {
  paid: 'Paid',
  partially_paid: 'Partially Paid',
  pending: 'Pending',
};

/**
 * Standard expense categories from PRD
 */
export const EXPENSE_CATEGORIES = [
  'Venue',
  'Catering',
  'Decoration',
  'Clothing',
  'Jewellery',
  'Photography & Videography',
  'Makeup',
  'Transportation',
  'Gifts',
  'Invitations',
  'Accommodation',
  'Miscellaneous',
];
