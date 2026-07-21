import { useState } from 'react';
import { Heart, X, Loader2, Check, Smartphone } from 'lucide-react';
import { paymentsService } from '../../services/payments';

type Step = 'idle' | 'open' | 'pending' | 'success' | 'error';
const PRESET_AMOUNTS = [50, 100, 250, 500, 1000];

export default function DonationWidget() {
  const [step, setStep] = useState<Step>('idle');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);

  const finalAmount = customAmount ? parseInt(customAmount) : amount;

  const handleDonate = async () => {
    if (!phone.trim()) { setError('Please enter your M-Pesa phone number'); return; }
    if (!finalAmount || finalAmount < 10) { setError('Minimum donation is KES 10'); return; }
    setError(null);
    setLoading(true);
    try {
      const res = await paymentsService.donate(phone, finalAmount, name || 'Anonymous');
      setStep('pending');
      pollStatus(res.payment_id);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Could not initiate payment.');
    } finally {
      setLoading(false);
    }
  };

  const pollStatus = (pid: string) => {
    let count = 0;
    const interval = setInterval(async () => {
      count++;
      setPollCount(count);
      try {
        const status = await paymentsService.getStatus(pid);
        if (status.status === 'success') { clearInterval(interval); setStep('success'); }
        if (status.status === 'failed') { clearInterval(interval); setError('Payment failed.'); setStep('error'); }
      } catch { /* keep polling */ }
      if (count >= 40) { clearInterval(interval); setStep('error'); setError('Payment timed out.'); }
    }, 3000);
  };

  const reset = () => { setStep('idle'); setPhone(''); setAmount(100); setCustomAmount(''); setName(''); setError(null); setPollCount(0); };

  if (step === 'idle') return (
    <button onClick={() => setStep('open')}
      className="fixed bottom-24 left-6 z-40 flex items-center gap-2 bg-canvas-raised border border-line rounded-full px-4 py-2.5 text-sm text-ink-muted hover:text-ink hover:border-rust/40 transition-all shadow-lg">
      <Heart size={14} className="text-rust" /> Support my work
    </button>
  );

  return (
    <div className="fixed bottom-24 left-6 z-40 w-[320px] bg-canvas-raised border border-line rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-line">
        <div className="flex items-center gap-2">
          <Heart size={14} className="text-rust" />
          <span className="text-sm font-semibold text-ink">Support AETSH-69</span>
        </div>
        <button onClick={reset}><X size={16} className="text-ink-faint" /></button>
      </div>

      {step === 'open' && (
        <div className="p-4 space-y-4">
          <p className="text-ink-muted text-xs leading-relaxed">Support Mark's work as a CS student building open tools from Nairobi.</p>
          <div>
            <label className="block text-ink-muted text-xs font-medium mb-1.5">Your name (optional)</label>
            <input className="input-field w-full text-sm" placeholder="Anonymous" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-ink-muted text-xs font-medium mb-2">Amount (KES)</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {PRESET_AMOUNTS.map(a => (
                <button key={a} onClick={() => { setAmount(a); setCustomAmount(''); }}
                  className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${amount === a && !customAmount ? 'border-rust text-rust bg-rust/5' : 'border-line text-ink-muted'}`}>
                  {a}
                </button>
              ))}
            </div>
            <input className="input-field w-full text-sm" placeholder="Custom amount" type="number" min="10"
              value={customAmount} onChange={e => setCustomAmount(e.target.value)} />
          </div>
          <div>
            <label className="block text-ink-muted text-xs font-medium mb-1.5">M-Pesa Phone</label>
            <input className="input-field w-full text-sm" placeholder="0712 345 678" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          {error && <p className="text-rust text-xs">{error}</p>}
          <button onClick={handleDonate} disabled={loading}
            className="btn-primary w-full text-sm flex items-center justify-center gap-2">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Smartphone size={14} />}
            Donate KES {finalAmount || '—'}
          </button>
        </div>
      )}

      {step === 'pending' && (
        <div className="p-6 text-center">
          <Loader2 size={28} className="animate-spin text-rust mx-auto mb-3" />
          <p className="text-ink text-sm font-medium mb-1">Check your phone</p>
          <p className="text-ink-muted text-xs">Enter your M-Pesa PIN to complete</p>
          <p className="text-ink-faint text-xs mt-2">{pollCount * 3}s elapsed</p>
        </div>
      )}

      {step === 'success' && (
        <div className="p-6 text-center">
          <div className="w-10 h-10 rounded-full bg-rust/10 flex items-center justify-center mx-auto mb-3">
            <Check size={20} className="text-rust" />
          </div>
          <p className="text-ink font-semibold text-sm mb-1">Thank you! 🙏</p>
          <p className="text-ink-muted text-xs mb-4">Asante sana!</p>
          <button onClick={reset} className="btn-secondary text-xs">Close</button>
        </div>
      )}

      {step === 'error' && (
        <div className="p-4 text-center">
          <p className="text-rust text-sm mb-3">{error}</p>
          <div className="flex gap-2 justify-center">
            <button onClick={() => setStep('open')} className="btn-primary text-xs">Try again</button>
            <button onClick={reset} className="btn-secondary text-xs">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
