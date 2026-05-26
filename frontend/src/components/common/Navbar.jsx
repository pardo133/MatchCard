import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';

const NAV_AUTH = [
  { to: '/album',    label: 'Mi Álbum'  },
  { to: '/repes',    label: 'Mis Repes' },
  { to: '/buscador', label: 'Buscador'  },
];

export default function Navbar() {
  const { user, logout } = useUserStore();
  const navigate         = useNavigate();
  const location         = useLocation();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav style={{ background: '#0f0e1a' }} className="sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex-shrink-0 select-none">
          <span className="font-black text-2xl tracking-tight" style={{ fontFamily: '"Nunito", sans-serif' }}>
            <span style={{
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Match</span>
            <span className="text-white">Card</span>
          </span>
        </Link>

        {/* Center links */}
        <div className="hidden md:flex items-center gap-1">
          {!user ? (
            <Link
              to="/quienes-somos"
              className="text-sm font-semibold text-white/60 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5">
              ¿Quiénes somos?
            </Link>
          ) : (
            NAV_AUTH.map(({ to, label }) => (
              <Link key={to} to={to}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-150 ${
                  location.pathname === to
                    ? 'text-white bg-white/10'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}>
                {label}
              </Link>
            ))
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden sm:block text-sm text-white/50 font-medium">{user.username}</span>
              <Link to="/profile"
                className={`text-sm font-bold px-4 py-2 rounded-lg border border-white/15 transition-all ${
                  location.pathname === '/profile' ? 'text-white bg-white/10' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}>
                Mi Perfil
              </Link>
              {user.isAdmin && (
                <Link to="/admin"
                  className="text-xs font-bold px-3 py-1.5 rounded-full border border-yellow-400/40 text-yellow-400 hover:bg-yellow-400/10 transition-colors">
                  Admin
                </Link>
              )}
              <button onClick={handleLogout}
                className="text-sm font-bold px-4 py-2 rounded-lg border border-white/15 text-white/60 hover:border-white/35 hover:text-white transition-all">
                Salir
              </button>
            </>
          ) : (
            <>
              <Link to="/login"
                className="text-sm font-bold px-5 py-2 rounded-lg border border-white/18 text-white/75 hover:text-white hover:border-white/35 transition-all">
                Login
              </Link>
              <Link to="/register"
                className="text-sm font-black px-5 py-2.5 rounded-lg transition-all hover:brightness-110 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: '#111' }}>
                Registro
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile nav — solo autenticado */}
      {user && (
        <div className="md:hidden flex" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {NAV_AUTH.map(({ to, label }) => (
            <Link key={to} to={to}
              className={`flex-1 text-center py-2.5 text-xs font-bold transition-colors ${
                location.pathname === to ? 'text-yellow-400' : 'text-white/40'
              }`}>
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
