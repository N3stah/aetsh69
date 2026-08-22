import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import api from '../../services/api';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get('token');

  // 1. Initialize state smartly. If there is no token in the URL, 
  // start directly in the 'error' state. This completely eliminates 
  // the cascading render error!
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    token ? 'loading' : 'error'
  );
  const [message, setMessage] = useState<string>(
    token ? '' : 'No verification token found.'
  );

  useEffect(() => {
    // If no token exists, bail out immediately. 
    // State is already set to 'error' from initialization.
    if (!token) return;

    api.get(`/auth/verify-email?token=${token}`)
      .then(() => {
        setStatus('success');
      })
      .catch((err: any) => {
        setStatus('error');
        setMessage(err?.response?.data?.detail || 'Verification failed.');
      });
      
  // 2. Add 'token' to the dependency array to satisfy ESLint
  }, [token]);

  return (
    <div className="max-w-md mx-auto px-6 py-20 text-center">
      {status === 'loading' && <Loader2 size={32} className="animate-spin text-rust mx-auto mb-4" />}
      
      {status === 'success' && (
        <>
          <CheckCircle size={40} className="text-rust mx-auto mb-4" />
          <h1 className="font-display text-2xl font-semibold text-ink mb-2">Email verified!</h1>
          <p className="text-ink-muted mb-6">Your account is now fully activated.</p>
          <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
        </>
      )}
      
      {status === 'error' && (
        <>
          <XCircle size={40} className="text-err mx-auto mb-4" />
          <h1 className="font-display text-2xl font-semibold text-ink mb-2">Verification failed</h1>
          <p className="text-ink-muted mb-6">{message}</p>
          <Link to="/dashboard" className="btn-secondary">Back to Dashboard</Link>
        </>
      )}
    </div>
  );
}