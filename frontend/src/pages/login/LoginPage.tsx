import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Loader2 } from 'lucide-react';
import { authService } from '../../services/auth';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((s) => s.setAuth);

  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setIsLoading(true);

  try {
    const response = await authService.login({ email, password });
    // Pass token explicitly — don't rely on interceptor race
    const { data: user } = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${response.access_token}` }
    });
    setAuth(user, response.access_token, response.refresh_token);
    navigate(from, { replace: true });
  } catch (err: unknown) {
    setError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Invalid email or password');
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-md bg-rust-muted flex items-center justify-center text-ink mx-auto mb-4">
          <Shield size={24} />
        </div>
        <h1 className="font-display text-3xl font-semibold text-ink">Welcome Back</h1>
        <p className="text-ink-muted text-sm mt-2">Sign in to access your membership and saved preferences.</p>
      </div>

      {error && (
        <div className="card border-err/30 mb-6">
          <p className="text-err text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-ink-muted text-sm font-medium mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="input-field w-full"
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="block text-ink-muted text-sm font-medium mb-1.5">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="input-field w-full"
            required
            disabled={isLoading}
          />
        </div>
          <div className="text-right mb-4">
            <Link to="/forgot-password" className="text-rust text-sm hover:underline">Forgot password?</Link>
          </div>
        <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={isLoading}>
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
          Sign In
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-ink-faint text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-rust hover:underline">
            Join the ecosystem
          </Link>
        </p>
      </div>
    </div>
  );
}
