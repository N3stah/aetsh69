import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, ShoppingBag, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import SearchBar from '../search/SearchBar';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Portfolio', path: '/portfolio' },
  { label: 'Blog', path: '/blog' },
  { label: 'Services', path: '/services' },
  { label: 'Shop', path: '/shop' },
  { label: 'Hobbies', path: '/hobbies' },
  { label: 'Arcade', path: '/arcade' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [isLight, setIsLight] = useState(() => {
    try { return localStorage.getItem('aetsh69-theme') === 'light'; } catch { return false; }
  });
  const navigate = useNavigate();
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const { itemCount, openCart } = useCartStore();

  useEffect(() => {
    const root = document.documentElement;
    if (isLight) {
      root.classList.add('light');
      localStorage.setItem('aetsh69-theme', 'light');
    } else {
      root.classList.remove('light');
      localStorage.setItem('aetsh69-theme', 'dark');
    }
  }, [isLight]);

  const handleLogout = () => {
    clearAuth();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-canvas/95 backdrop-blur-sm border-b border-line">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/Aetshlogo.png" alt="AETSH-69 Logo" className="h-14 w-auto rounded-md" />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <button 
            onClick={() => setIsLight(!isLight)} 
            className="text-ink-muted hover:text-ink transition-colors p-2 rounded-md hover:bg-canvas-raised"
            aria-label="Toggle theme"
          >
            {isLight ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <SearchBar />
          <button onClick={openCart} className="relative text-ink-muted hover:text-ink transition-colors mr-1">
            <ShoppingBag size={18} />
            {itemCount() > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rust text-ink text-[10px] font-bold rounded-full flex items-center justify-center">{itemCount()}</span>
            )}
          </button>
          
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="text-ink-muted text-sm flex items-center gap-1.5 hover:text-ink transition-colors">
                <User size={14} />
                {user?.full_name || user?.email}
              </Link>
              <button onClick={handleLogout} className="btn-ghost text-sm flex items-center gap-1.5">
                <LogOut size={14} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/membership" className="btn-ghost text-sm">Membership</Link>
              <Link to="/login" className="btn-secondary text-sm">Sign in</Link>
            </>
          )}
        </div>

        <button
          className="md:hidden text-ink-muted"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <nav className="md:hidden border-t border-line px-6 py-4 flex flex-col gap-3 bg-canvas">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
          <div className="pt-3 mt-1 flex flex-col gap-2">
            <button 
              onClick={() => setIsLight(!isLight)} 
              className="nav-link flex items-center gap-2 text-left"
            >
              {isLight ? <Moon size={16} /> : <Sun size={16} />}
              Toggle {isLight ? 'Dark' : 'Light'} Mode
            </button>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" onClick={() => setOpen(false)} className="text-ink-muted text-sm flex items-center gap-1.5">
                  <User size={14} />
                  {user?.full_name || user?.email}
                </Link>
                <button onClick={() => { handleLogout(); setOpen(false); }} className="nav-link text-left">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/membership" onClick={() => setOpen(false)} className="nav-link">Membership</Link>
                <Link to="/login" onClick={() => setOpen(false)} className="btn-secondary text-sm text-center">Sign in</Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
