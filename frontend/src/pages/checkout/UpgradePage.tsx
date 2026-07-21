import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { paymentsService } from '../../services/payments';
import { authService } from '../../services/auth';
import { Check, Loader2, Smartphone, ArrowLeft, Star } from 'lucide-react';

const TIERS = [
  {
    name: 'Explorer',
    role: 'free',
    price: 'Free',
    desc: 'Browse the ecosystem, read public posts, and chat with AETSH-69.',
    features: ['Public blog access', 'AETSH-69 chat (general)', 'Portfolio browsing', 'Shop access'],
    current: true,
  },
  {
    name: 'Builder',
    role: 'builder',
    price: 'KES 1,500/mo',
    desc: 'Priority support, exclusive content, and early access to new tools.',
    features: ['Everything in Explorer', 'Priority AETSH-69 responses', 'Exclusive tutorials', 'Early product access', 'Monthly Q&A calls'],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    role: 'enterprise',
    price: 'Custom',
    desc: 'Dedicated consulting, custom builds, and direct engineering support.',
    features: ['Everything in Builder', 'Dedicated Slack channel', 'Custom development', 'On-site support (Nairobi)', 'SLA guarantee'],
  },
];

type Step = 'select' | 'pay' | 'pending' | 'success' | 'error';

export default function UpgradePage() {
  const { user, setAuth, accessToken, refreshToken } = useAuthStore();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('select');
  const [selectedTier, setSelectedTier] = useState<string>('builder');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setPaymentId] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);

  const currentRole = user?.role || 'free';

  const handleProceed = () => {
    if (selectedTier === 'enterprise') {
      navigate('/contact');
      return;
    }
    setStep('pay');
  };

  const handleStkPush = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await paymentsService.mpesaStkPush(phone, selectedTier);
      setPaymentId(res.payment_id);
      setStep('pending');
      pollPaymentStatus(res.payment_id);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed to initiate payment. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const pollPaymentStatus = (pid: string) => {
    let count = 0;
    const interval = setInterval(async () => {
      count++;
      setPollCount(count);
      try {
        const status = await paymentsService.getStatus(pid);
        if (status.status === 'success') {
          clearInterval(interval);
          // Refresh user role
          const updatedUser = await authService.me();
          setAuth(updatedUser, accessToken!, refreshToken!);
          setStep('success');
        }
        if (status.status === 'failed') {
          clearInterval(interval);
          setError('Payment was cancelled or failed. Please try again.');
          setStep('error');
        }
      } catch {
        // keep polling
      }
      if (count >= 40) {
        clearInterval(interval);
        setError('Payment timed out. If you completed the payment, contact support.');
        setStep('error');
      }
    }, 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">

      <button onClick={() => step === 'pay' ? setStep('select') : navigate('/dashboard')}
        className="flex items-center gap-2 text-ink-muted text-sm mb-8 hover:text-ink transition-colors">
        <ArrowLeft size={16} /> {step === 'pay' ? 'Back to tiers' : 'Back to dashboard'}
      </button>

      {/* SELECT TIER */}
      {step === 'select' && (
        <>
          <div className="mb-10">
            <p className="text-rust font-mono text-sm mb-2">Upgrade</p>
            <h1 className="font-display text-3xl font-semibold text-ink mb-2">Choose your tier</h1>
            <p className="text-ink-muted">You are currently on the <span className="text-ink font-medium capitalize">{currentRole}</span> tier.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {TIERS.map(tier => {
              const isCurrentTier = tier.role === currentRole;
              const isSelected = tier.name.toLowerCase() === selectedTier;
              return (
                <div key={tier.name}
                  onClick={() => !isCurrentTier && setSelectedTier(tier.name.toLowerCase())}
                  className={`card flex flex-col cursor-pointer transition-all ${
                    isCurrentTier ? 'opacity-50 cursor-not-allowed' :
                    isSelected ? 'border-rust/60 shadow-[0_0_0_1px_#B8552F]' : 'card-hover'
                  }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="font-display text-xl font-semibold text-ink">{tier.name}</h2>
                    {tier.highlighted && <Star size={14} className="text-rust" />}
                    {isCurrentTier && <span className="text-xs px-2 py-0.5 rounded-full bg-rust/10 text-rust">Current</span>}
                  </div>
                  <p className="font-mono text-2xl text-ink mb-2">{tier.price}</p>
                  <p className="text-ink-muted text-sm leading-relaxed mb-4">{tier.desc}</p>
                  <ul className="space-y-2 mb-6 flex-1">
                    {tier.features.map(f => (
                      <li key={f} className="text-ink-muted text-sm flex items-start gap-2">
                        <Check size={14} className="text-rust shrink-0 mt-0.5" />{f}
                      </li>
                    ))}
                  </ul>
                  {!isCurrentTier && (
                    <div className={`w-5 h-5 rounded-full border-2 mx-auto ${isSelected ? 'border-rust bg-rust' : 'border-line'}`} />
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-end">
            <button onClick={handleProceed}
              disabled={selectedTier === currentRole}
              className="btn-primary px-8">
              {selectedTier === 'enterprise' ? 'Contact for Enterprise' : `Upgrade to ${selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)}`}
            </button>
          </div>
        </>
      )}

      {/* PAY WITH M-PESA */}
      {step === 'pay' && (
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-full bg-rust-muted flex items-center justify-center mx-auto mb-4">
              <Smartphone size={24} className="text-rust" />
            </div>
            <h1 className="font-display text-2xl font-semibold text-ink mb-2">Pay with M-Pesa</h1>
            <p className="text-ink-muted text-sm">
              Builder membership — <span className="text-ink font-medium">KES 1,500</span>
            </p>
          </div>

          <div className="card mb-6">
            <label className="block text-ink-muted text-sm font-medium mb-1.5">M-Pesa Phone Number</label>
            <input
              className="input-field w-full"
              placeholder="0712 345 678 or 254712345678"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
            <p className="text-ink-faint text-xs mt-2">Enter the phone number registered with M-Pesa</p>
          </div>

          {error && <div className="card border-rust/30 mb-4"><p className="text-rust text-sm">{error}</p></div>}

          <button onClick={handleStkPush} disabled={loading || !phone.trim()} className="btn-primary w-full flex items-center justify-center gap-2 mb-3">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Smartphone size={16} />}
            Send STK Push
          </button>
          <p className="text-ink-faint text-xs text-center">
            You'll receive a prompt on your phone to enter your M-Pesa PIN
          </p>
        </div>
      )}

      {/* PENDING */}
      {step === 'pending' && (
        <div className="max-w-md mx-auto text-center py-12">
          <Loader2 size={40} className="animate-spin text-rust mx-auto mb-6" />
          <h2 className="font-display text-2xl font-semibold text-ink mb-2">Waiting for payment</h2>
          <p className="text-ink-muted mb-2">Check your phone and enter your M-Pesa PIN to complete the payment.</p>
          <p className="text-ink-faint text-xs">Checking status... ({pollCount * 3}s elapsed)</p>
        </div>
      )}

      {/* SUCCESS */}
      {step === 'success' && (
        <div className="max-w-md mx-auto text-center py-12">
          <div className="w-16 h-16 rounded-full bg-rust-muted flex items-center justify-center mx-auto mb-6">
            <Check size={32} className="text-rust" />
          </div>
          <h2 className="font-display text-2xl font-semibold text-ink mb-2">Welcome to Builder! 🎉</h2>
          <p className="text-ink-muted mb-8">Your membership has been activated. You now have access to exclusive tutorials, priority AETSH-69, and monthly Q&A calls.</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary px-8">Go to Dashboard</button>
        </div>
      )}

      {/* ERROR */}
      {step === 'error' && (
        <div className="max-w-md mx-auto text-center py-12">
          <div className="w-16 h-16 rounded-full bg-rust/10 flex items-center justify-center mx-auto mb-6">
            <span className="text-rust text-2xl">✕</span>
          </div>
          <h2 className="font-display text-2xl font-semibold text-ink mb-2">Payment failed</h2>
          <p className="text-ink-muted mb-8">{error}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { setStep('pay'); setError(null); }} className="btn-primary">Try again</button>
            <button onClick={() => navigate('/dashboard')} className="btn-secondary">Back to dashboard</button>
          </div>
        </div>
      )}

    </div>
  );
}
