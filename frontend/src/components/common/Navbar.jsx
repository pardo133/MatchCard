import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';

const NAV_AUTH = [
  { to: '/album',     label: 'Álbum'     },
  { to: '/repes',     label: 'Mis Repes' },
  { to: '/descubrir', label: 'Descubrir' },
  { to: '/dashboard', label: 'Matches'   },
];

export default function Navbar() {
  const { user, logout } = useUserStore();
  const navigate          = useNavigate();
  const location          = useLocation();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex-shrink-0 select-none">
          <span className="font-black text-2xl tracking-tight" style={{ fontFamily: '"Nunito", sans-serif' }}>
            <span style={{
              background: 'linear-gradient(135deg, #d97706, #f59e0b)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>Match</span>
            <span className="text-mc-dark">Card</span>
          </span>
        </Link>

        {/* Links autenticado */}
        {user && (
          <div className="hidden md:flex items-center gap-1">
            {NAV_AUTH.map(({ to, label }) => (
              <Link key={to} to={to}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-150
                  ${location.pathname === to
                    ? 'bg-mc-light text-mc-purple'
                    : 'text-mc-muted hover:text-mc-dark hover:bg-gray-50'}`}>
                {label}
              </Link>
            ))}
          </div>
        )}

        {/* Acciones */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden sm:block text-sm text-mc-muted font-medium">{user.username}</span>
              {user.isAdmin && (
                <Link to="/admin"
                  className="text-xs font-bold px-3 py-1.5 rounded-full border border-mc-purple/40 text-mc-purple hover:bg-mc-light transition-colors">
                  Admin
                </Link>
              )}
              <button onClick={handleLogout}
                className="text-sm font-bold border border-gray-200 text-mc-muted hover:border-gray-300 hover:text-mc-dark px-4 py-2 rounded-lg transition-colors">
                Salir
              </button>
            </>
          ) : (
            <>
              <Link to="/register"
                className="text-sm font-black px-5 py-2 rounded-lg border-2 border-mc-dark text-mc-dark hover:bg-mc-dark hover:text-white transition-all duration-200 tracking-wide uppercase">
                Registro
              </Link>
              <Link to="/login"
                className="text-sm font-black px-5 py-2 rounded-lg border-2 border-mc-dark text-mc-dark hover:bg-mc-dark hover:text-white transition-all duration-200 tracking-wide uppercase">
                Iniciar Sesión
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile nav — solo si autenticado */}
      {user && (
        <div className="md:hidden flex border-t border-gray-100">
          {NAV_AUTH.map(({ to, label }) => (
            <Link key={to} to={to}
              className={`flex-1 text-center py-2.5 text-xs font-bold transition-colors
                ${location.pathname === to ? 'text-mc-purple' : 'text-mc-muted'}`}>
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
