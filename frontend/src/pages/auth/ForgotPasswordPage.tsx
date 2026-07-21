import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/auth';

// 1. Define the expected shapes of the error responses
interface ValidationError {
  msg: string;
}

interface ApiErrorResponse {
  response?: {
    data?: {
      detail?: string | ValidationError[] | { message: string };
    };
  };
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  console.log('📧 Submitting email:', email); // ← DEBUG
  setLoading(true);
  setMessage('');
  setError('');
  try {
    const res = await authService.requestPasswordReset(email);
    setMessage(res.message || 'Check your email for reset instructions.');
  } catch (err: unknown) {
    let errorMessage = 'Something went wrong.';
    const apiError = err as ApiErrorResponse;
    if (apiError?.response?.data?.detail) {
      const detail = apiError.response.data.detail;
      if (Array.isArray(detail)) {
        errorMessage = detail.map((e) => e.msg).join(', ');
      } else if (typeof detail === 'string') {
        errorMessage = detail;
      } else if (typeof detail === 'object' && detail !== null && 'message' in detail) {
        errorMessage = detail.message as string;
      }
    }
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-canvas">
      <div className="max-w-md w-full card p-8">
        <h1 className="font-display text-2xl font-semibold text-ink mb-2">Reset Password</h1>
        <p className="text-ink-muted text-sm mb-6">Enter your email to receive a password reset link.</p>

        {message && (
          <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm mb-4">{message}</div>
        )}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-ink-muted text-sm font-medium mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field w-full"
              placeholder="you@example.com"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full text-sm">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="text-ink-muted text-sm mt-6 text-center">
          Remember your password?{' '}
          <Link to="/login" className="text-rust hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}