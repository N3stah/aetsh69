import { useEffect, useState } from 'react';
import { Users, ShoppingBag, MessageSquare, TrendingUp, Shield, Brain } from 'lucide-react';
import api from '../../services/api';

interface Stats { total_users: number; total_orders: number; total_contacts: number; total_revenue_kes: number; }
interface User { id: string; email: string; full_name: string; role: string; is_verified: boolean; created_at: string; }
interface Contact { id: string; customer_name: string; customer_email: string; description: string; status: string; created_at: string; }
interface AiQuestion { question: string; context: string; provider: string; created_at: string; }

type Tab = 'overview' | 'users' | 'contacts' | 'ai';

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [aiQuestions, setAiQuestions] = useState<AiQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats').catch(() => ({ data: null })),
      api.get('/admin/users').catch(() => ({ data: [] })),
      api.get('/admin/contacts').catch(() => ({ data: [] })),
      api.get('/admin/ai-analytics').catch(() => ({ data: [] })),
    ]).then(([s, u, c, ai]) => {
      setStats(s.data);
      setUsers(u.data || []);
      setContacts(c.data || []);
      setAiQuestions(ai.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const updateRole = async (userId: string, role: string) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
    } catch { alert('Failed to update role'); }
  };

  const ROLES = ['free', 'builder', 'enterprise', 'admin'];

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-5 h-5 rounded-full border-2 border-rust border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Shield size={24} className="text-rust" />
        <h1 className="font-display text-2xl font-semibold text-ink">Admin Dashboard</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-line pb-3">
        {(['overview', 'users', 'contacts', 'ai'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`text-sm px-4 py-1.5 rounded-md capitalize transition-colors flex items-center gap-1.5 ${tab === t? 'bg-rust text-ink' : 'text-ink-muted hover:text-ink'}`}>
            {t === 'ai' ? <Brain size={14} /> : null}
            {t === 'ai' ? 'AI Questions' : t}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Users, label: 'Total Users', value: stats?.total_users ?? users.length, color: 'text-rust' },
            { icon: ShoppingBag, label: 'Orders', value: stats?.total_orders ?? 0, color: 'text-rust' },
            { icon: MessageSquare, label: 'Contacts', value: stats?.total_contacts ?? contacts.length, color: 'text-rust' },
            { icon: TrendingUp, label: 'Revenue (KES)', value: stats?.total_revenue_kes?.toLocaleString() ?? '0', color: 'text-rust' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="card">
              <Icon size={20} className={`${color} mb-3`} />
              <p className="text-2xl font-mono font-bold text-ink">{value}</p>
              <p className="text-ink-muted text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="pb-3 text-ink-muted font-medium">User</th>
                <th className="pb-3 text-ink-muted font-medium">Role</th>
                <th className="pb-3 text-ink-muted font-medium">Verified</th>
                <th className="pb-3 text-ink-muted font-medium">Joined</th>
                <th className="pb-3 text-ink-muted font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map(u => (
                <tr key={u.id} className="py-3">
                  <td className="py-3 pr-4">
                    <p className="text-ink font-medium">{u.full_name || '—'}</p>
                    <p className="text-ink-faint text-xs">{u.email}</p>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-xs px-2 py-0.5 rounded-full border border-line text-ink-muted font-mono">{u.role}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs ${u.is_verified ? 'text-green-500' : 'text-rust'}`}>
                      {u.is_verified ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-ink-faint text-xs">
                    {new Date(u.created_at).toLocaleDateString('en-KE')}
                  </td>
                  <td className="py-3">
                    <select value={u.role} onChange={e => updateRole(u.id, e.target.value)}
                      className="input-field text-xs py-1 px-2">
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <p className="text-ink-muted text-sm text-center py-8">No users found — admin API endpoint not yet built.</p>}
        </div>
      )}

      {/* Contacts */}
      {tab === 'contacts' && (
        <div className="space-y-4">
          {contacts.map((c: Contact) => (
            <div key={c.id} className="card">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-ink font-medium">{c.customer_name}</p>
                  <p className="text-ink-faint text-xs">{c.customer_email}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full border border-line text-ink-muted">{c.status}</span>
              </div>
              <p className="text-ink-muted text-sm">{c.description}</p>
              <p className="text-ink-faint text-xs mt-2">{new Date(c.created_at).toLocaleDateString('en-KE')}</p>
            </div>
          ))}
          {contacts.length === 0 && <p className="text-ink-muted text-sm text-center py-8">No contact submissions yet.</p>}
        </div>
      )}

      {/* AI Questions */}
      {tab === 'ai' && (
        <div className="space-y-4">
          {aiQuestions.map((q, i) => (
            <div key={i} className="card flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-ink font-medium mb-1">{q.question}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs px-2 py-0.5 rounded-full border border-line text-ink-muted font-mono">{q.provider}</span>
                  <span className="text-xs text-ink-faint">Context: {q.context}</span>
                </div>
              </div>
              <p className="text-ink-faint text-xs whitespace-nowrap">
                {new Date(q.created_at).toLocaleString('en-KE', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          ))}
          {aiQuestions.length === 0 && <p className="text-ink-muted text-sm text-center py-8">No AI questions logged yet.</p>}
        </div>
      )}
    </div>
  );
}
