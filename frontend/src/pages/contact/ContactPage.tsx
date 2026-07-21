import { useState } from 'react';
import { Send, Loader2, CheckCircle } from 'lucide-react';
import { contactService } from '../../services/contact';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: 'Enterprise Enquiry', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await contactService.send(form);
      setSent(true);
    } catch {
      setError('Something went wrong. Please email me directly at aetsh69.com@gmail.com');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-20">
      <p className="text-rust font-mono text-sm mb-2">Enterprise</p>
      <h1 className="font-display text-3xl font-semibold text-ink mb-2">Let's work together</h1>
      <p className="text-ink-muted mb-8">Tell me what you're building and I'll get back to you within 24 hours.</p>

      {sent ? (
        <div className="card text-center py-12 flex flex-col items-center gap-4">
          <CheckCircle size={40} className="text-rust" />
          <p className="text-ink font-semibold text-lg">Message sent!</p>
          <p className="text-ink-muted text-sm">I'll be in touch at {form.email}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="card border-err/30"><p className="text-err text-sm">{error}</p></div>}
          <div>
            <label className="block text-ink-muted text-sm font-medium mb-1.5">Name</label>
            <input className="input-field w-full" required value={form.name}
              onChange={e => setForm({...form, name: e.target.value})} placeholder="Your name" />
          </div>
          <div>
            <label className="block text-ink-muted text-sm font-medium mb-1.5">Email</label>
            <input className="input-field w-full" type="email" required value={form.email}
              onChange={e => setForm({...form, email: e.target.value})} placeholder="you@company.com" />
          </div>
          <div>
            <label className="block text-ink-muted text-sm font-medium mb-1.5">Subject</label>
            <input className="input-field w-full" value={form.subject}
              onChange={e => setForm({...form, subject: e.target.value})} placeholder="What's this about?" />
          </div>
          <div>
            <label className="block text-ink-muted text-sm font-medium mb-1.5">What are you looking for?</label>
            <textarea className="input-field w-full resize-none" rows={5} required value={form.message}
              onChange={e => setForm({...form, message: e.target.value})}
              placeholder="Describe your project or requirements..." />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Send Message
          </button>
        </form>
      )}
    </div>
  );
}
