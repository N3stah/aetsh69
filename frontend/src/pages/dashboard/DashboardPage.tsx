import { useState, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Link } from 'react-router-dom';
import {
  LayoutGrid, PenLine, ShoppingBag, Bot, FileText,
  CalendarDays, Lock, ArrowRight, AlertCircle,
  CheckCircle, Pencil, Camera
} from 'lucide-react';
import api from '../../services/api';
import { profileService } from '../../services/profile';

const TIER_LABELS: Record<string, string> = {
  free: 'Explorer tier',
  builder: 'Builder tier',
  enterprise: 'Enterprise tier',
  admin: 'Admin',
  supporter: 'Supporter',
  pro: 'Pro',
  vip: 'VIP',
};

const accessCards = [
  { title: 'Portfolio', desc: "Browse Mark's projects", icon: LayoutGrid, to: '/portfolio', tier: 'free' },
  { title: 'Blog', desc: 'Articles and writeups', icon: PenLine, to: '/blog', tier: 'free' },
  { title: 'Shop', desc: 'Tools, kits, packages', icon: ShoppingBag, to: '/shop', tier: 'free' },
  { title: 'AETSH-69', desc: 'AI concierge — general mode', icon: Bot, to: null, tier: 'free' },
  { title: 'Exclusive tutorials', desc: 'Builder-only deep dives', icon: FileText, to: null, tier: 'builder' },
  { title: 'Monthly Q&A', desc: 'Live calls with Mark', icon: CalendarDays, to: null, tier: 'builder' },
];

const TIER_ORDER: Record<string, number> = {
  free: 0, supporter: 0, builder: 1, pro: 1, enterprise: 2, vip: 2, admin: 99,
};

function hasAccess(userRole: string, requiredTier: string): boolean {
  return (TIER_ORDER[userRole] ?? 0) >= (TIER_ORDER[requiredTier] ?? 0);
}

function getInitials(name: string | null, email: string): string {
  if (name) {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export default function DashboardPage() {
  const { user, setAuth, accessToken, refreshToken } = useAuthStore();
  const [editOpen, setEditOpen] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const role = user.role || 'free';
  const initials = getInitials(user.full_name, user.email);
  const joinedDate = new Date(user.created_at || new Date()).toLocaleDateString('en-KE', {
    month: 'short',
    year: 'numeric',
  });

  const profileSteps = [
    { label: 'Verify email', done: user.is_verified ?? false },
    { label: 'Set username', done: !!user.username },
    { label: 'Add avatar', done: !!user.avatar_url },
    { label: 'Place first order', done: false },
    { label: 'Upgrade tier', done: role !== 'free' },
  ];
  const completedSteps = profileSteps.filter(s => s.done).length;
  const progressPct = Math.round((completedSteps / profileSteps.length) * 100);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await profileService.update({
        full_name: fullName,
        username: username || undefined,
        avatar: avatarFile || undefined,
      });
      setAuth(updated, accessToken!, refreshToken!);
      setEditOpen(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setSaveError(detail || 'Failed to save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      await api.post('/auth/send-verification');
      alert('Verification email sent! Check your inbox at ' + user.email);
    } catch {
      alert('Failed to send email. Please try again.');
    }
  };

  // Avatar source – works even if avatar_url is null
  const avatarSrc = avatarPreview || user.avatar_url || '';

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">

      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-full bg-rust-muted flex items-center justify-center text-ink font-semibold text-sm flex-shrink-0">
            {avatarSrc ? (
              <img src={avatarSrc} alt="avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-lg">{initials}</span>
            )}
            <button
              onClick={() => setEditOpen(true)}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-rust flex items-center justify-center"
            >
              <Camera size={12} className="text-ink" />
            </button>
          </div>
          <div>
            <h1 className="font-display text-xl font-semibold text-ink">{user.full_name || user.email}</h1>
            <p className="text-ink-muted text-sm">{user.email} · member since {joinedDate}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs px-3 py-1 rounded-full border border-line text-ink-muted font-mono">
            {TIER_LABELS[role] || role}
          </span>
          <button onClick={() => setEditOpen(true)} className="btn-secondary text-xs flex items-center gap-1.5">
            <Pencil size={12} /> Edit profile
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-canvas-raised border border-line rounded-lg w-full max-w-md p-6">
            <h2 className="font-display text-lg font-semibold text-ink mb-6">Edit Profile</h2>

            {/* Avatar upload */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-rust-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                {avatarPreview || user.avatar_url ? (
                  <img
                    src={avatarPreview || user.avatar_url || ''}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-semibold text-ink">{initials}</span>
                )}
              </div>
              <div>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="btn-secondary text-xs flex items-center gap-1.5 mb-1"
                >
                  <Camera size={12} /> {avatarFile ? 'Change photo' : 'Upload photo'}
                </button>
                <p className="text-ink-faint text-xs">JPG, PNG or WebP. Max 5MB.</p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-ink-muted text-sm font-medium mb-1.5">Full Name</label>
                <input
                  className="input-field w-full"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Mark Manoti Ndege"
                />
              </div>
              <div>
                <label className="block text-ink-muted text-sm font-medium mb-1.5">Username</label>
                <input
                  className="input-field w-full"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="markmanoti"
                />
                <p className="text-ink-faint text-xs mt-1">Shown publicly on your profile</p>
              </div>
            </div>

            {saveError && <p className="text-err text-sm mt-3">{saveError}</p>}

            <div className="flex gap-3 mt-6">
              <button onClick={handleSaveProfile} disabled={saving} className="btn-primary flex-1 text-sm">
                {saving ? 'Saving...' : 'Save changes'}
              </button>
              <button
                onClick={() => {
                  setEditOpen(false);
                  setAvatarPreview(null);
                  setAvatarFile(null);
                }}
                className="btn-secondary flex-1 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email verification warning */}
      {!user.is_verified && (
        <div className="flex items-center gap-3 bg-rust-muted/20 border border-rust/20 rounded-md px-4 py-3 mb-8">
          <AlertCircle size={16} className="text-rust flex-shrink-0" />
          <p className="text-ink-muted text-sm flex-1">Email not verified — check your inbox to unlock full access.</p>
          <button onClick={handleResendVerification} className="btn-secondary text-xs whitespace-nowrap">
            Resend
          </button>
        </div>
      )}

      {/* Access cards */}
      <h2 className="text-xs text-ink-faint uppercase tracking-widest mb-4">Your ecosystem access</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {accessCards.map(card => {
          const accessible = hasAccess(role, card.tier);
          const Icon = card.icon;
          return (
            <div key={card.title} className={`card flex flex-col gap-2 ${accessible ? 'card-hover' : 'opacity-50'}`}>
              <Icon size={20} className="text-ink-muted" />
              <div>
                <p className="font-semibold text-ink text-sm">{card.title}</p>
                <p className="text-ink-muted text-xs mt-0.5">{card.desc}</p>
              </div>
              {accessible && card.to ? (
                <Link to={card.to} className="text-rust text-xs flex items-center gap-1 mt-auto">
                  Open <ArrowRight size={12} />
                </Link>
              ) : accessible ? (
                <span className="text-ink-faint text-xs mt-auto">Available in chat widget</span>
              ) : (
                <span className="text-ink-faint text-xs flex items-center gap-1 mt-auto">
                  <Lock size={11} /> {card.tier === 'builder' ? 'Builder tier required' : 'Enterprise only'}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div>
          <h2 className="text-xs text-ink-faint uppercase tracking-widest mb-4">Account</h2>
          <div className="card space-y-3">
            {[
              { label: 'Full name', value: user.full_name || <span className="text-ink-faint">Not set</span> },
              { label: 'Email', value: user.email },
              { label: 'Username', value: user.username || <span className="text-ink-faint">Not set</span> },
              { label: 'Role', value: role },
              {
                label: 'Verified',
                value: user.is_verified ? (
                  <span className="flex items-center gap-1"><CheckCircle size={12} className="text-rust" /> Yes</span>
                ) : (
                  <span className="text-rust">No</span>
                ),
              },
            ].map((row, i) => (
              <div
                key={i}
                className="flex justify-between items-center text-sm border-b border-line pb-3 last:border-0 last:pb-0"
              >
                <span className="text-ink-muted">{row.label}</span>
                <span className="text-ink font-medium text-right">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xs text-ink-faint uppercase tracking-widest mb-4">Profile completion</h2>
          <div className="card">
            <div className="flex justify-between items-center mb-2">
              <span className="text-ink text-sm font-semibold">{progressPct}% complete</span>
              <span className="text-ink-faint text-xs">{profileSteps.length - completedSteps} steps left</span>
            </div>
            <div className="w-full h-1.5 bg-canvas-overlay rounded-full mb-4">
              <div className="h-1.5 bg-rust rounded-full transition-all" style={{ width: `${progressPct}%` }} />
            </div>
            <ul className="space-y-2">
              {profileSteps.map(step => (
                <li key={step.label} className="flex items-center gap-2 text-sm">
                  {step.done ? (
                    <CheckCircle size={14} className="text-rust flex-shrink-0" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-line flex-shrink-0" />
                  )}
                  <span className={step.done ? 'text-ink-muted line-through' : 'text-ink-muted'}>
                    {step.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {role === 'admin' && (
        <div className="card border-rust/20 flex items-center justify-between gap-4 flex-wrap mb-4">
          <div>
            <p className="font-semibold text-ink text-sm mb-1">Admin Panel</p>
            <p className="text-ink-muted text-sm">Manage users, contacts, and platform stats</p>
          </div>
          <a href="/admin" className="btn-secondary text-sm whitespace-nowrap">Open Admin ↗</a>
        </div>
      )}
      {role === 'free' && (
        <div className="card border-rust/20 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="font-semibold text-ink text-sm mb-1">Upgrade to Builder — KES 1,500/mo</p>
            <p className="text-ink-muted text-sm">Priority AETSH-69, exclusive tutorials, early access & monthly Q&A</p>
          </div>
          <Link to="/upgrade" className="btn-primary text-sm whitespace-nowrap">Upgrade tier</Link>
        </div>
      )}

    </div>
  );
}