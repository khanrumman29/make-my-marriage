import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  Receipt,
  PiggyBank,
  AlertCircle,
  Plus,
  CalendarDays,
  UserPlus,
  Heart,
  TrendingUp,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { OverviewCard } from '../components/dashboard/OverviewCard';
import { BudgetProgress } from '../components/dashboard/BudgetProgress';
import { UpcomingFunctions } from '../components/dashboard/UpcomingFunctions';
import { RecentExpenses } from '../components/dashboard/RecentExpenses';
import { TaskChecklist } from '../components/dashboard/TaskChecklist';
import { Card, CardHeader } from '../components/ui/Card';
import { useWedding } from '../contexts/WeddingContext';
import { getExpenses } from '../services/expenses';
import { getFunctions } from '../services/functions';
import { getTasks } from '../services/tasks';
import { getAnnouncements } from '../services/announcements';
import { formatINR, formatDate } from '../utils/formatters';

export function Dashboard() {
  const navigate = useNavigate();
  const { currentWedding } = useWedding();

  const [expenses, setExpenses] = useState([]);
  const [functions, setFunctions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadDashboardData() {
      if (!currentWedding?.id) return;
      try {
        setLoading(true);
        const [expData, fnData, taskData, annData] = await Promise.all([
          getExpenses(currentWedding.id),
          getFunctions(currentWedding.id),
          getTasks(currentWedding.id),
          getAnnouncements(currentWedding.id),
        ]);
        if (isMounted) {
          setExpenses(expData || []);
          setFunctions(fnData || []);
          setTasks(taskData || []);
          setAnnouncements(annData || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, [currentWedding?.id]);

  // Financial calculations from live state
  const totalBudget = currentWedding?.budget || 0;
  const totalSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const remainingBudget = Math.max(totalBudget - totalSpent, 0);
  const totalOutstanding = expenses.reduce(
    (sum, e) => sum + Math.max((e.amount || 0) - (e.amountPaid || 0), 0),
    0
  );
  const spentPercent = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  // Days remaining calculation
  const today = new Date();
  const weddingDateStr = currentWedding?.weddingDate || '2026-12-18';
  const weddingDate = new Date(weddingDateStr);
  const diffTime = weddingDate - today;
  const daysToGo = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 0);

  const brideFirstName = currentWedding?.brideName ? currentWedding.brideName.split(' ')[0] : 'Bride';
  const groomFirstName = currentWedding?.groomName ? currentWedding.groomName.split(' ')[0] : 'Groom';

  return (
    <div className="space-y-6">
      {/* 1. Main Content Header matching Stitch */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-2">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">
              YOUR WEDDING
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
            <span className="text-xs text-muted font-medium">
              {brideFirstName} &amp; {groomFirstName} • {formatDate(weddingDateStr)}
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-ink tracking-tight font-normal">
            Your wedding, beautifully organized.
          </h1>
          <p className="text-sm text-muted">
            One place for your plans, people, and special moments.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="secondary"
            size="md"
            icon={CalendarDays}
            onClick={() => navigate('/functions')}
          >
            Add function
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => navigate('/expenses')}
          >
            Add expense
          </Button>
        </div>
      </header>

      {/* 2. Four Financial Overview Metric Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <OverviewCard
          title="Total budget"
          amount={formatINR(totalBudget)}
          subtitle="Your planned wedding budget"
          icon={Wallet}
          variant="forest"
        />
        <OverviewCard
          title="Spent so far"
          amount={formatINR(totalSpent)}
          subtitle={
            <span className="text-forest font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              {spentPercent}% of total budget
            </span>
          }
          icon={Receipt}
          variant="default"
        />
        <OverviewCard
          title="Remaining"
          amount={formatINR(remainingBudget)}
          subtitle="Available budget"
          icon={PiggyBank}
          variant="gold"
        />
        <OverviewCard
          title="Payments due"
          amount={formatINR(totalOutstanding)}
          subtitle="Awaiting payment"
          icon={AlertCircle}
          variant="warning"
        />
      </section>

      {/* 3. Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN (~65% on desktop) */}
        <div className="lg:col-span-8 flex flex-col gap-6 min-w-0">
          <BudgetProgress budget={totalBudget} spent={totalSpent} />
          <UpcomingFunctions functions={functions} />
          <RecentExpenses expenses={expenses} />
        </div>

        {/* RIGHT COLUMN (~35% on desktop) */}
        <div className="lg:col-span-4 flex flex-col gap-6 min-w-0">
          <TaskChecklist initialTasks={tasks} />

          {/* Family Activity Card */}
          <Card className="rounded-2xl p-6 shadow-sm">
            <CardHeader
              title="Family announcements"
              subtitle="Latest shared family updates"
              action={
                <button
                  type="button"
                  onClick={() => navigate('/family-settings')}
                  className="text-xs font-semibold text-forest hover:text-forest-hover flex items-center gap-1 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>View family</span>
                </button>
              }
            />

            <div className="space-y-4">
              {announcements.length > 0 ? (
                announcements.slice(0, 4).map((ann) => (
                  <div key={ann.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-forest-tint text-forest flex items-center justify-center font-bold text-xs shrink-0 border border-forest/10">
                      {ann.author ? ann.author.split(' ').map((n) => n[0]).join('') : 'F'}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-xs text-ink leading-relaxed">
                        <span className="font-semibold text-ink">{ann.author}</span>{' '}
                        <span className="text-muted">{ann.text || ann.title}</span>
                      </p>
                      <span className="text-[11px] text-muted/70 mt-0.5">
                        {ann.createdAt ? formatDate(ann.createdAt) : 'Recently'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted text-center py-4">
                  No announcements yet. Share an update in Family &amp; Settings!
                </p>
              )}
            </div>
          </Card>

          {/* Celebratory Editorial Quote & Countdown Card from Stitch */}
          <div className="relative overflow-hidden rounded-2xl bg-forest p-6 text-white shadow-elevated flex flex-col justify-between min-h-[190px]">
            <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />

            <div className="relative z-10 flex flex-col gap-2">
              <span className="text-[11px] uppercase tracking-widest text-gold-tint font-semibold">
                Milestone Countdown
              </span>
              <p className="font-serif text-2xl text-white font-normal leading-snug">
                “Together is a beautiful place to be.”
              </p>
            </div>

            <div className="relative z-10 pt-4 flex items-center justify-between border-t border-white/10 text-xs text-white/90">
              <span>{daysToGo} days until {formatDate(weddingDateStr)}</span>
              <Heart className="w-4 h-4 text-gold fill-current" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
