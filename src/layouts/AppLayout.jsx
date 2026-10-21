import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  CalendarDays,
  Send,
  Users2,
  Menu,
  X,
  Plus,
  Sparkles,
  LogOut,
  Search,
  Hourglass,
  Bell,
  Database,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWedding } from '../contexts/WeddingContext';
import { Button } from '../components/ui/Button';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Expenses', path: '/expenses', icon: Receipt },
  { name: 'Functions', path: '/functions', icon: CalendarDays },
  { name: 'Invitations', path: '/invitations', icon: Send },
  { name: 'Family & Settings', path: '/family-settings', icon: Users2 },
];

export function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { user, profile, signOut, isConfigured } = useAuth();
  const { currentWedding, userRole } = useWedding();

  const currentNav = navItems.find((item) =>
    location.pathname.startsWith(item.path) || (item.path === '/dashboard' && location.pathname === '/')
  );
  const pageTitle = currentNav ? currentNav.name : 'Make My Marriage';

  // Days countdown calculation
  const today = new Date();
  const weddingDateStr = currentWedding?.weddingDate || '2026-12-18';
  const weddingDate = new Date(weddingDateStr);
  const diffTime = weddingDate - today;
  const daysToGo = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 0);

  // User display info
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'MM';

  const roleLabels = {
    admin: 'Admin / Lead Planner',
    family_member: 'Family Member',
    viewer: 'Guest / Viewer',
  };

  const weddingLabel = currentWedding?.weddingName || "Ayesha & Rumman's Wedding";

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col md:flex-row">
      {/* =========================================================================
          DESKTOP SIDEBAR (248px fixed) - Matched with Google Stitch Design
          ========================================================================= */}
      <aside className="hidden md:flex flex-col w-[248px] shrink-0 min-h-screen bg-surface border-r border-border fixed left-0 top-0 bottom-0 z-30 shadow-[0_1px_8px_rgba(36,72,63,0.04)] justify-between">
        <div className="flex flex-col">
          {/* Brand Header */}
          <div className="h-16 px-5 flex items-center gap-3 border-b border-border/70">
            <div className="w-8 h-8 rounded-control bg-forest text-gold-tint flex items-center justify-center shrink-0 shadow-subtle">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-serif text-base font-medium tracking-tight text-forest block leading-tight">
              Make My Marriage
            </span>
          </div>

          {/* Section Subheader */}
          <div className="px-5 pt-5 pb-2">
            <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">
              Workspace Menu
            </span>
          </div>

          {/* Five Primary Navigation Items */}
          <nav className="flex flex-col gap-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname.startsWith(item.path) ||
                (item.path === '/dashboard' && location.pathname === '/');

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 select-none ${
                    isActive
                      ? 'bg-forest-tint text-forest font-semibold shadow-[0_2px_8px_rgba(36,72,63,0.04)]'
                      : 'text-muted hover:bg-canvas hover:text-ink'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-forest stroke-[2.25]' : 'text-muted'}`} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Active Wedding Card & User Profile */}
        <div className="p-3 border-t border-border/70 bg-surface-soft/40 flex flex-col gap-3">
          {/* Supabase Status indicator */}
          {!isConfigured && (
            <div className="px-2.5 py-1.5 rounded-lg bg-gold-tint/60 border border-gold/30 text-[11px] text-ink flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-gold shrink-0" />
              <span className="truncate">Demo Mode (Mock data)</span>
            </div>
          )}

          {/* Wedding Card */}
          <div className="bg-surface p-3.5 rounded-xl border border-border shadow-subtle">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-xs text-ink truncate">
                {weddingLabel}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gold-tint text-gold-hover">
                Active
              </span>
            </div>
            <p className="text-[11px] text-muted truncate">
              {currentWedding?.venue || 'Winter Wedding'}
            </p>
          </div>

          {/* User Row */}
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2.5 min-w-0">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={displayName}
                  className="w-8 h-8 rounded-full object-cover shrink-0 border border-border"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-forest text-white flex items-center justify-center font-semibold text-xs shrink-0 shadow-sm">
                  {initials}
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-ink truncate">{displayName}</span>
                <span className="text-[10px] text-muted truncate capitalize">
                  {roleLabels[userRole] || userRole}
                </span>
              </div>
            </div>

            <button
              title="Log Out"
              onClick={handleLogout}
              className="p-1.5 text-muted hover:text-danger rounded-control hover:bg-danger-tint transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          MAIN CONTENT WRAPPER
          ========================================================================= */}
      <div className="flex-1 md:ml-[248px] flex flex-col min-w-0 pb-16 md:pb-0">
        {/* Top Header Bar matching Stitch */}
        <header className="h-16 bg-surface/90 backdrop-blur-md border-b border-border sticky top-0 z-20 px-4 sm:px-8 flex items-center justify-between shadow-[0_1px_8px_rgba(36,72,63,0.03)]">
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-ink rounded-control hover:bg-canvas"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Search Input from Stitch Design */}
            <div className="hidden sm:flex relative items-center">
              <Search className="w-4 h-4 text-muted absolute left-3" />
              <input
                type="text"
                placeholder="Search wedding workspace..."
                className="w-64 sm:w-72 h-9 pl-9 pr-4 rounded-lg border border-border bg-canvas/80 text-xs text-ink placeholder:text-muted focus:outline-none focus:border-forest focus:bg-surface transition-all"
              />
            </div>

            <span className="sm:hidden font-serif text-base font-normal text-ink">
              {pageTitle}
            </span>
          </div>

          {/* Right Header Badges & Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Days countdown pill from Stitch */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold-tint text-gold-hover border border-gold/30">
              <Hourglass className="w-3.5 h-3.5 text-gold shrink-0" />
              <span className="text-xs font-semibold tracking-tight">{daysToGo} days to go</span>
            </div>

            <div className="h-4 w-px bg-border hidden sm:block" />

            <button
              aria-label="Notifications"
              className="relative p-2 rounded-lg text-muted hover:text-ink hover:bg-surface-soft transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gold" />
            </button>

            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => navigate('/expenses')}
              className="text-xs"
            >
              <span className="hidden xs:inline">Add Expense</span>
              <span className="xs:hidden">Add</span>
            </Button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
            <div
              className="w-[280px] bg-surface h-full p-4 flex flex-col border-r border-border shadow-elevated"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <span className="font-serif text-base font-normal">Make My Marriage</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-control hover:bg-canvas">
                  <X className="w-5 h-5 text-muted" />
                </button>
              </div>

              <nav className="py-4 space-y-1 flex-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-control text-sm font-medium ${
                        isActive ? 'bg-forest-tint text-forest font-semibold' : 'text-muted hover:bg-canvas'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <div className="text-xs">
                  <p className="font-medium text-ink">{displayName}</p>
                  <p className="text-muted text-[11px] capitalize">{roleLabels[userRole] || userRole}</p>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="text-xs text-danger font-medium"
                >
                  Log out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
