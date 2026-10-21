import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  Receipt,
  Download,
  Trash2,
  Calendar,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';
import { Input, Select } from '../components/ui/Input';
import { useWedding } from '../contexts/WeddingContext';
import { getExpenses, createExpense, deleteExpense } from '../services/expenses';
import { getFunctions } from '../services/functions';
import {
  formatINR,
  formatDate,
  getPaymentStatus,
  EXPENSE_CATEGORIES,
} from '../utils/formatters';

export function Expenses() {
  const { currentWedding, userRole } = useWedding();
  const [expenses, setExpenses] = useState([]);
  const [functionsList, setFunctionsList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const canEdit = userRole !== 'viewer';

  // New Expense form state
  const [formData, setFormData] = useState({
    title: '',
    category: 'Venue',
    amount: '',
    amountPaid: '',
    expenseDate: new Date().toISOString().split('T')[0],
    vendorName: '',
    functionId: '',
    notes: '',
  });

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      if (!currentWedding?.id) return;
      try {
        setLoading(true);
        const [exp, fns] = await Promise.all([
          getExpenses(currentWedding.id),
          getFunctions(currentWedding.id),
        ]);
        if (isMounted) {
          setExpenses(exp || []);
          setFunctionsList(fns || []);
        }
      } catch (err) {
        console.error('Failed to load expenses:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [currentWedding?.id]);

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const matchesSearch =
        exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (exp.vendorName && exp.vendorName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'All' || exp.category === selectedCategory;

      const status = getPaymentStatus(exp.amount, exp.amountPaid);
      const matchesStatus =
        selectedStatus === 'All' || status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [expenses, searchQuery, selectedCategory, selectedStatus]);

  // Summaries
  const totalAmount = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalPaid = filteredExpenses.reduce((sum, e) => sum + (e.amountPaid || 0), 0);
  const totalOutstanding = Math.max(totalAmount - totalPaid, 0);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) return;
    setError('');
    setSubmitting(true);

    try {
      const created = await createExpense(currentWedding.id, formData);
      setExpenses([created, ...expenses]);
      setIsModalOpen(false);
      setFormData({
        title: '',
        category: 'Venue',
        amount: '',
        amountPaid: '',
        expenseDate: new Date().toISOString().split('T')[0],
        vendorName: '',
        functionId: '',
        notes: '',
      });
    } catch (err) {
      console.error('Error adding expense:', err);
      setError(err.message || 'Failed to save expense. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await deleteExpense(id);
      setExpenses(expenses.filter((e) => e.id !== id));
    } catch (err) {
      console.error('Error deleting expense:', err);
      alert('Could not delete expense: ' + (err.message || 'Permission denied'));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Wedding Expenses"
        subtitle="Track vendor payments, wedding ceremony purchases, and outstanding obligations."
        actions={
          canEdit && (
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={() => setIsModalOpen(true)}
            >
              Add Expense
            </Button>
          )
        }
      />

      {/* Summary Stat Strips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider block">Total Recorded</span>
          <span className="font-serif text-xl sm:text-2xl text-ink font-normal block mt-1">{formatINR(totalAmount)}</span>
          <span className="text-[11px] text-muted mt-0.5 block">{filteredExpenses.length} entries</span>
        </Card>
        <Card className="p-4">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider block">Total Paid</span>
          <span className="font-serif text-xl sm:text-2xl text-forest font-normal block mt-1">{formatINR(totalPaid)}</span>
          <span className="text-[11px] text-muted mt-0.5 block">{Math.round((totalPaid / (totalAmount || 1)) * 100)}% settled</span>
        </Card>
        <Card className="p-4">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider block">Outstanding Due</span>
          <span className="font-serif text-xl sm:text-2xl text-warning font-normal block mt-1">{formatINR(totalOutstanding)}</span>
          <span className="text-[11px] text-muted mt-0.5 block">Pending vendor settlement</span>
        </Card>
        <Card className="p-4">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider block">Allocated Budget</span>
          <span className="font-serif text-xl sm:text-2xl text-ink font-normal block mt-1">{formatINR(currentWedding?.budget || 0)}</span>
          <span className="text-[11px] text-muted mt-0.5 block">{Math.max((currentWedding?.budget || 0) - totalAmount, 0) > 0 ? `${formatINR(Math.max((currentWedding?.budget || 0) - totalAmount, 0))} headroom` : 'Budget reached'}</span>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search expenses by title or vendor name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-border bg-canvas/60 text-xs text-ink placeholder:text-muted focus:outline-none focus:border-forest focus:bg-surface transition-all"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-10 px-3 rounded-xl border border-border bg-surface text-xs text-ink font-medium focus:outline-none focus:border-forest"
            >
              <option value="All">All Categories</option>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-10 px-3 rounded-xl border border-border bg-surface text-xs text-ink font-medium focus:outline-none focus:border-forest"
            >
              <option value="All">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Expenses Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-muted">
            <Loader2 className="w-6 h-6 animate-spin text-forest mb-2" />
            <span className="text-xs">Loading expenses...</span>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="p-12 text-center text-muted">
            <Receipt className="w-10 h-10 mx-auto text-muted/40 mb-3" />
            <p className="font-serif text-lg text-ink">No expenses found</p>
            <p className="text-xs text-muted mt-1">
              {searchQuery || selectedCategory !== 'All' || selectedStatus !== 'All'
                ? 'Try adjusting your filters or search query.'
                : 'Get started by recording your first wedding expense.'}
            </p>
            {canEdit && (
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={() => setIsModalOpen(true)}
                className="mt-4"
              >
                Add First Expense
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border/80 bg-surface-soft/50 text-muted uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-3 px-4">Expense Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Ceremony/Event</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Paid</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  {canEdit && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredExpenses.map((exp) => {
                  const status = getPaymentStatus(exp.amount, exp.amountPaid);
                  return (
                    <tr key={exp.id} className="hover:bg-canvas/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-ink block text-xs">{exp.title}</span>
                        {exp.vendorName && (
                          <span className="text-[11px] text-muted block mt-0.5">Paid to: {exp.vendorName}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-muted">{exp.category}</td>
                      <td className="py-3.5 px-4 text-muted">{exp.functionName || 'General'}</td>
                      <td className="py-3.5 px-4 font-semibold text-ink">{formatINR(exp.amount)}</td>
                      <td className="py-3.5 px-4 font-medium text-forest">{formatINR(exp.amountPaid)}</td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={status} />
                      </td>
                      <td className="py-3.5 px-4 text-muted whitespace-nowrap">{formatDate(exp.expenseDate)}</td>
                      {canEdit && (
                        <td className="py-3.5 px-4 text-right">
                          <button
                            title="Delete Expense"
                            onClick={() => handleDeleteExpense(exp.id)}
                            className="p-1.5 text-muted hover:text-danger rounded-control hover:bg-danger-tint transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Record New Expense"
        >
          {error && (
            <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-control flex items-start gap-2 text-xs text-danger">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAddExpense} className="space-y-4">
            <Input
              label="Expense Title *"
              required
              placeholder="e.g. Catering Advance or Bridal Lehenga"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Category *"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Select>

              <Select
                label="Linked Ceremony / Event"
                value={formData.functionId}
                onChange={(e) => setFormData({ ...formData, functionId: e.target.value })}
              >
                <option value="">General (No Ceremony)</option>
                {functionsList.map((fn) => (
                  <option key={fn.id} value={fn.id}>{fn.name}</option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Total Cost (₹) *"
                type="number"
                min="1"
                required
                placeholder="e.g. 50000"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />

              <Input
                label="Amount Paid So Far (₹)"
                type="number"
                min="0"
                placeholder="e.g. 20000"
                value={formData.amountPaid}
                onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Vendor or Beneficiary"
                placeholder="e.g. Royal Decorators"
                value={formData.vendorName}
                onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
              />

              <Input
                label="Date of Payment / Incurred *"
                type="date"
                required
                value={formData.expenseDate}
                onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
              />
            </div>

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
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </span>
                ) : (
                  'Save Expense'
                )}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
