import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { paymentsService } from '../../services/payments';
import { Loader2, ShoppingBag, Check, Smartphone, ArrowLeft, Trash2 } from 'lucide-react';

type Step = 'review' | 'pay' | 'pending' | 'success' | 'error';

export default function CheckoutPage() {
  const { items, total, clearCart, removeItem } = useCartStore();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('review');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);

  if (items.length === 0 && step === 'review') {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <ShoppingBag size={40} className="text-ink-faint mx-auto mb-4" />
        <h1 className="font-display text-2xl font-semibold text-ink mb-2">Your cart is empty</h1>
        <p className="text-ink-muted mb-6">Add some products before checking out.</p>
        <Link to="/shop" className="btn-primary">Browse Shop</Link>
      </div>
    );
  }

  const handlePayment = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await paymentsService.donate(phone, total(), 'Shop Order');
      setStep('pending');
      pollStatus(res.payment_id);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Payment failed. Try again.');
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
        if (status.status === 'success') {
          clearInterval(interval);
          clearCart();
          setStep('success');
        }
        if (status.status === 'failed') {
          clearInterval(interval);
          setError('Payment failed. Please try again.');
          setStep('error');
        }
      } catch { /* keep polling */ }
      if (count >= 40) { clearInterval(interval); setStep('error'); setError('Payment timed out.'); }
    }, 3000);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <button onClick={() => step === 'pay' ? setStep('review') : navigate('/shop')}
        className="flex items-center gap-2 text-ink-muted text-sm mb-8 hover:text-ink transition-colors">
        <ArrowLeft size={16} /> {step === 'pay' ? 'Back to review' : 'Back to shop'}
      </button>

      {step === 'review' && (
        <>
          <h1 className="font-display text-2xl font-semibold text-ink mb-8">Review Order</h1>
          <div className="card mb-6 divide-y divide-line">
            {items.map(item => (
              <div key={item.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                <div className="w-12 h-12 bg-canvas-overlay rounded border border-line flex items-center justify-center flex-shrink-0">
                  {item.image_url
                    ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover rounded" />
                    : <ShoppingBag size={16} className="text-ink-faint" />
                  }
                </div>
                <div className="flex-1">
                  <p className="text-ink text-sm font-medium">{item.name}</p>
                  <p className="text-ink-muted text-xs">Qty: {item.quantity}</p>
                </div>
                <span className="text-ink font-mono text-sm">KES {(item.price * item.quantity).toLocaleString()}</span>
                <button onClick={() => removeItem(item.id)} className="text-ink-faint hover:text-rust ml-2">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mb-6 px-1">
            <span className="text-ink-muted">Total</span>
            <span className="text-ink font-mono font-semibold text-xl">KES {total().toLocaleString()}</span>
          </div>

          <button onClick={() => setStep('pay')} className="btn-primary w-full">
            Proceed to Payment
          </button>
        </>
      )}

      {step === 'pay' && (
        <>
          <h1 className="font-display text-2xl font-semibold text-ink mb-2">Pay with M-Pesa</h1>
          <p className="text-ink-muted text-sm mb-8">Total: <span className="text-ink font-mono font-semibold">KES {total().toLocaleString()}</span></p>

          <div className="card mb-6">
            <label className="block text-ink-muted text-sm font-medium mb-1.5">M-Pesa Phone Number</label>
            <input className="input-field w-full" placeholder="0712 345 678 or 254712345678"
              value={phone} onChange={e => setPhone(e.target.value)} />
            <p className="text-ink-faint text-xs mt-2">You'll receive an STK Push prompt on this number</p>
          </div>

          {error && <div className="card border-rust/30 mb-4"><p className="text-rust text-sm">{error}</p></div>}

          <button onClick={handlePayment} disabled={loading || !phone.trim()} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Smartphone size={16} />}
            Pay KES {total().toLocaleString()}
          </button>
        </>
      )}

      {step === 'pending' && (
        <div className="text-center py-16">
          <Loader2 size={40} className="animate-spin text-rust mx-auto mb-6" />
          <h2 className="font-display text-2xl font-semibold text-ink mb-2">Waiting for payment</h2>
          <p className="text-ink-muted mb-2">Check your phone and enter your M-Pesa PIN</p>
          <p className="text-ink-faint text-xs">{pollCount * 3}s elapsed</p>
        </div>
      )}

      {step === 'success' && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-rust/10 flex items-center justify-center mx-auto mb-6">
            <Check size={32} className="text-rust" />
          </div>
          <h2 className="font-display text-2xl font-semibold text-ink mb-2">Order confirmed! 🎉</h2>
          <p className="text-ink-muted mb-8">Thank you for your purchase. You'll hear from Mark shortly.</p>
          <div className="flex gap-3 justify-center">
            <Link to="/shop" className="btn-primary">Continue Shopping</Link>
            <Link to="/dashboard" className="btn-secondary">Dashboard</Link>
          </div>
        </div>
      )}

      {step === 'error' && (
        <div className="text-center py-16">
          <p className="text-rust text-lg mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { setStep('pay'); setError(null); }} className="btn-primary">Try Again</button>
            <Link to="/shop" className="btn-secondary">Back to Shop</Link>
          </div>
        </div>
      )}
    </div>
  );
}
