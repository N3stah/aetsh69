import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { useAuthStore } from './store/authStore'
import { authService } from './services/auth'

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { accessToken, refreshToken, setAuth, clearAuth, setLoading } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      if (accessToken) {
        try {
          // Try with current token first
          const user = await authService.me();
          setAuth(user, accessToken, refreshToken || '');
        } catch {
          // Token expired — try refresh
          if (refreshToken) {
            try {
              const newTokens = await authService.refresh(refreshToken);
              const user = await authService.me();
              setAuth(user, newTokens.access_token, newTokens.refresh_token);
            } catch {
              // Refresh also failed — clear auth
              clearAuth();
            }
          } else {
            clearAuth();
          }
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  return <>{children}</>;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthInitializer>
        <App />
      </AuthInitializer>
    </BrowserRouter>
  </StrictMode>,
)
