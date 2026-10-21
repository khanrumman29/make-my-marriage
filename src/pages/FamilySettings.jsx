import React, { useState, useEffect } from 'react';
import {
  Users,
  Settings as SettingsIcon,
  UserPlus,
  Send,
  Shield,
  MessageSquare,
  Sparkles,
  Save,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardHeader } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';
import { Input, Select } from '../components/ui/Input';
import { useWedding } from '../contexts/WeddingContext';
import { useAuth } from '../contexts/AuthContext';
import { getWeddingMembers, updateWedding, addWeddingMember } from '../services/weddings';
import { getAnnouncements, createAnnouncement } from '../services/announcements';
import { formatDate } from '../utils/formatters';

export function FamilySettings() {
  const { currentWedding, userRole, refreshWeddings, updateWeddingState } = useWedding();
  const { user, profile } = useAuth();

  const [activeTab, setActiveTab] = useState('family'); // 'family' | 'settings'
  const [members, setMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [error, setError] = useState('');

  const isAdmin = userRole === 'admin';

  const [inviteData, setInviteData] = useState({
    name: '',
    email: '',
    role: 'family_member',
    relation: '',
  });

  // Wedding Settings form state
  const [weddingDetails, setWeddingDetails] = useState(() => ({
    weddingName: currentWedding?.weddingName || currentWedding?.name || "Ayesha & Rumman's Wedding",
    brideName: currentWedding?.brideName || 'Ayesha Khan',
    groomName: currentWedding?.groomName || 'Rumman Siddiqui',
    weddingDate: currentWedding?.weddingDate ? currentWedding.weddingDate.split('T')[0] : '2026-12-18',
    budget: String(currentWedding?.budget ?? '2500000'),
    venue: currentWedding?.venue || 'Taj West End, Bengaluru',
  }));

  useEffect(() => {
    if (currentWedding && !savingSettings) {
      setWeddingDetails({
        weddingName: currentWedding.weddingName || currentWedding.name || '',
        brideName: currentWedding.brideName || '',
        groomName: currentWedding.groomName || '',
        weddingDate: currentWedding.weddingDate ? currentWedding.weddingDate.split('T')[0] : '',
        budget: currentWedding.budget !== undefined ? String(currentWedding.budget) : '',
        venue: currentWedding.venue || '',
      });
    }
  }, [currentWedding, savingSettings]);

  useEffect(() => {
    let isMounted = true;
    async function loadFamilyData() {
      if (!currentWedding?.id) return;
      try {
        setLoading(true);
        const [mems, msgs] = await Promise.all([
          getWeddingMembers(currentWedding.id),
          getAnnouncements(currentWedding.id),
        ]);
        if (isMounted) {
          setMembers(mems || []);
          setMessages(msgs || []);
        }
      } catch (err) {
        console.error('Failed to load family data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadFamilyData();
    return () => {
      isMounted = false;
    };
  }, [currentWedding?.id]);

  // Invite Member Handler
  const handleInviteMember = async (e) => {
    e.preventDefault();
    if (!inviteData.name || !inviteData.email) return;
    setError('');

    try {
      const newMember = {
        id: `usr-${Date.now()}`,
        name: inviteData.name,
        email: inviteData.email,
        role: inviteData.role,
        relation: inviteData.relation || 'Collaborator',
        status: 'active',
      };

      setMembers([...members, newMember]);
      setIsInviteModalOpen(false);
      setInviteData({ name: '', email: '', role: 'family_member', relation: '' });
    } catch (err) {
      console.error('Failed to invite member:', err);
      setError(err.message || 'Failed to add member.');
    }
  };

  // Send Family Message Handler
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    try {
      const created = await createAnnouncement(currentWedding.id, {
        title: 'Update',
        message: newMessageText.trim(),
      });
      setMessages([created, ...messages]);
      setNewMessageText('');
    } catch (err) {
      console.error('Failed to post message:', err);
    }
  };

  // Save Settings Handler
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    setSavingSettings(true);
    setError('');

    try {
      const budgetNum = parseFloat(weddingDetails.budget) || 0;
      const bride = (weddingDetails.brideName || '').trim();
      const groom = (weddingDetails.groomName || '').trim();
      const coupleNames = bride && groom ? `${bride} & ${groom}` : (weddingDetails.weddingName || 'Wedding');

      const payload = {
        name: weddingDetails.weddingName,
        weddingName: weddingDetails.weddingName,
        coupleNames,
        brideName: bride,
        groomName: groom,
        weddingDate: weddingDetails.weddingDate,
        venue: weddingDetails.venue,
        budget: budgetNum,
        totalBudgetPaise: Math.round(budgetNum * 100),
      };

      // 1. Immediately update context so that Sidebar, Header, Dashboard, etc. update instantly
      if (updateWeddingState) {
        updateWeddingState(payload);
      }

      // 2. Persist to storage & backend
      await updateWedding(currentWedding?.id, payload);

      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save wedding settings:', err);
      setError(err.message || 'Failed to save configuration.');
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Family & Settings"
        subtitle="Manage wedding collaborators, roles, private family messaging, and workspace configuration."
      />

      {/* Two Internal Navigation Tabs */}
      <div className="flex border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab('family')}
          className={`flex items-center gap-2 py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'family'
              ? 'border-forest text-forest bg-forest-tint/30'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Family & Collaborators</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-forest-tint text-forest ml-1">
            {members.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'settings'
              ? 'border-forest text-forest bg-forest-tint/30'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <SettingsIcon className="w-4 h-4" />
          <span>Wedding Configuration</span>
        </button>
      </div>

      {/* TAB 1: FAMILY & COLLABORATORS */}
      {activeTab === 'family' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif text-lg text-ink font-normal">Wedding Circle</h3>
              <p className="text-xs text-muted">Members collaborating on tasks, expenses, and preparations.</p>
            </div>
            {isAdmin && (
              <Button
                variant="primary"
                size="sm"
                icon={UserPlus}
                onClick={() => setIsInviteModalOpen(true)}
              >
                Invite Member
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Members List (7 cols on lg) */}
            <div className="lg:col-span-7 space-y-3">
              {loading ? (
                <div className="p-8 text-center text-muted">
                  <Loader2 className="w-6 h-6 animate-spin text-forest mx-auto mb-2" />
                  <span className="text-xs">Loading collaborators...</span>
                </div>
              ) : members.length === 0 ? (
                <Card className="p-8 text-center text-muted">
                  <Users className="w-8 h-8 text-muted/40 mx-auto mb-2" />
                  <p className="font-serif text-base text-ink">No family members added yet</p>
                  <p className="text-xs text-muted mt-1">Invite parents, siblings, or wedding coordinators.</p>
                </Card>
              ) : (
                members.map((member) => (
                  <Card key={member.id} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-forest-tint text-forest flex items-center justify-center font-semibold text-sm shrink-0 border border-forest/10">
                        {member.name ? member.name.split(' ').map((n) => n[0]).join('') : 'F'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-ink truncate">{member.name}</h4>
                          {member.relation && (
                            <span className="text-xs text-muted font-normal">({member.relation})</span>
                          )}
                        </div>
                        <p className="text-xs text-muted truncate">{member.email || 'Workspace Member'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={member.role} />
                    </div>
                  </Card>
                ))
              )}
            </div>

            {/* Family Conversation / Group Chat (5 cols on lg) */}
            <div className="lg:col-span-5">
              <Card className="flex flex-col h-[460px]">
                <CardHeader
                  title="Family Message Board"
                  subtitle="Private coordination for your wedding"
                />

                <div className="flex-1 overflow-y-auto space-y-3 pr-1 divide-y-0">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted text-xs p-6 text-center">
                      <MessageSquare className="w-8 h-8 text-muted/40 mb-2" />
                      <span>No messages yet. Post an announcement or note for your family!</span>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className="p-3 rounded-control text-xs bg-canvas text-ink border border-border/60"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-semibold text-[11px] text-forest">
                            {msg.author || msg.senderName}
                          </span>
                          <span className="text-[10px] text-muted">
                            {msg.createdAt ? formatDate(msg.createdAt) : msg.time || 'Recently'}
                          </span>
                        </div>
                        <p className="leading-relaxed">{msg.text}</p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleSendMessage} className="pt-3 mt-3 border-t border-border flex gap-2">
                  <input
                    type="text"
                    placeholder="Type an announcement or family update..."
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    className="flex-1 h-10 px-3 bg-canvas border border-border rounded-control text-xs text-ink placeholder:text-muted focus:outline-none focus:border-forest"
                  />
                  <Button type="submit" variant="primary" size="sm" icon={Send} className="h-10 px-3">
                    Send
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WEDDING CONFIGURATION */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl">
          <Card>
            <CardHeader
              title="Wedding Profile & Budget"
              subtitle="Update the core configuration of your wedding workspace"
            />

            {error && (
              <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-control flex items-start gap-2 text-xs text-danger">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {!isAdmin && (
              <div className="p-3 mb-4 bg-gold-tint/50 border border-gold/30 rounded-control text-xs text-ink">
                <strong>View Only:</strong> Only wedding admins can update workspace configuration.
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <Input
                label="Wedding Workspace Name"
                disabled={!isAdmin}
                value={weddingDetails.weddingName}
                onChange={(e) =>
                  setWeddingDetails({ ...weddingDetails, weddingName: e.target.value })
                }
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Bride's Full Name"
                  disabled={!isAdmin}
                  value={weddingDetails.brideName}
                  onChange={(e) =>
                    setWeddingDetails({ ...weddingDetails, brideName: e.target.value })
                  }
                />
                <Input
                  label="Groom's Full Name"
                  disabled={!isAdmin}
                  value={weddingDetails.groomName}
                  onChange={(e) =>
                    setWeddingDetails({ ...weddingDetails, groomName: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Wedding Date"
                  type="date"
                  disabled={!isAdmin}
                  value={weddingDetails.weddingDate}
                  onChange={(e) =>
                    setWeddingDetails({ ...weddingDetails, weddingDate: e.target.value })
                  }
                />
                <Input
                  label="Total Estimated Budget (₹)"
                  type="number"
                  disabled={!isAdmin}
                  value={weddingDetails.budget}
                  onChange={(e) =>
                    setWeddingDetails({ ...weddingDetails, budget: e.target.value })
                  }
                />
              </div>

              <Input
                label="Primary Venue"
                disabled={!isAdmin}
                value={weddingDetails.venue}
                onChange={(e) =>
                  setWeddingDetails({ ...weddingDetails, venue: e.target.value })
                }
              />

              <div className="flex justify-between items-center pt-4 border-t border-border">
                {settingsSaved ? (
                  <span className="text-xs text-success font-medium flex items-center gap-1">
                    <Check className="w-4 h-4" /> Changes saved successfully!
                  </span>
                ) : (
                  <span className="text-xs text-muted">Currency: INR (₹)</span>
                )}
                {isAdmin && (
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    icon={Save}
                    disabled={savingSettings}
                  >
                    {savingSettings ? 'Saving...' : 'Save Settings'}
                  </Button>
                )}
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Invite Member Modal Dialog */}
      {isInviteModalOpen && (
        <Modal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          title="Invite Family Collaborator"
          subtitle="Send an invitation to join your personal wedding workspace."
        >
          <form onSubmit={handleInviteMember} className="space-y-4">
            <Input
              label="Full Name *"
              required
              placeholder="e.g. Tariq Khan"
              value={inviteData.name}
              onChange={(e) => setInviteData({ ...inviteData, name: e.target.value })}
            />

            <Input
              label="Email Address *"
              type="email"
              required
              placeholder="e.g. tariq.k@example.com"
              value={inviteData.email}
              onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Role *"
                value={inviteData.role}
                onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
              >
                <option value="admin">Admin (Manage details & expenses)</option>
                <option value="family_member">Family Member (Manage tasks & expenses)</option>
                <option value="viewer">Viewer (Read-only access)</option>
              </Select>

              <Input
                label="Family Relation"
                placeholder="e.g. Bride's Father, Cousin"
                value={inviteData.relation}
                onChange={(e) => setInviteData({ ...inviteData, relation: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-border">
              <Button variant="secondary" size="md" onClick={() => setIsInviteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="md" type="submit">
                Add to Workspace
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
