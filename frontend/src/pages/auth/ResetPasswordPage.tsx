import { useState } from 'react'; // Removed useEffect and FormEvent
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/auth';

interface ApiErrorResponse {
  response?: {
    data?: {
      detail?: string;
    };
  };
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // 1. Derive token directly from URL params during render. 
  // This completely eliminates the need for useState and useEffect for the token!
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  // 2. Use React.FormEvent directly to avoid the 'verbatimModuleSyntax' import error
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');
    
    try {
      const res = await authService.resetPassword(token, password);
      setMessage(res.message || 'Password updated! Redirecting...');
      setTimeout(() => navigate('/login'), 3000);
      
    } catch (err: unknown) { 
      let errorMessage = 'Failed to reset password.';
      
      const apiError = err as ApiErrorResponse;
      if (typeof apiError?.response?.data?.detail === 'string') {
        errorMessage = apiError.response.data.detail;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-canvas">
      <div className="max-w-md w-full card p-8">
        <h1 className="font-display text-2xl font-semibold text-ink mb-2">Set New Password</h1>
        <p className="text-ink-muted text-sm mb-6">Enter your new password below.</p>

        {message && (
          <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm mb-4">{message}</div>
        )}
        
        {/* We can show the missing token error directly based on the URL parameter */}
        {!token && !message && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
            Missing reset token. Please check your email link.
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-ink-muted text-sm font-medium mb-1.5">New Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field w-full"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-ink-muted text-sm font-medium mb-1.5">Confirm Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field w-full"
              placeholder="••••••••"
            />
          </div>
          <button type="submit" disabled={loading || !token} className="btn-primary w-full text-sm">
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}