import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';

export default function Navbar() {
  const { user, logout } = useUserStore();
  const navigate          = useNavigate();
  const location          = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  const links = [
    { to: '/album',     label: 'Álbum' },
    { to: '/repes',     label: 'Mis Repes' },
    { to: '/dashboard', label: 'Comunidad' },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-mc-border/50 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">

        {/* Logo */}
        <Link to="/" className="flex-shrink-0 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-black"
               style={{ background: 'linear-gradient(135deg, #7c3aed, #4338ca)' }}>
            M
          </div>
          <span className="font-black text-xl tracking-tight text-mc-dark">
            Match<span className="text-mc-purple">Card</span>
          </span>
        </Link>

        {/* Links centro */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`nav-link ${location.pathname === to ? 'text-mc-purple bg-mc-purple/5' : ''}`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Auth */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden sm:block text-sm font-semibold text-mc-muted">{user.username}</span>
              {user.isAdmin && (
                <Link to="/admin"
                  className="text-xs font-bold px-3 py-1.5 rounded-full border border-mc-purple/40 text-mc-purple hover:bg-mc-purple/10 transition-colors">
                  Admin
                </Link>
              )}
              <button onClick={handleLogout}
                className="text-sm font-bold text-mc-muted hover:text-mc-dark transition-colors border border-mc-border px-4 py-2 rounded-full hover:border-mc-purple/40">
                Salir
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Entrar</Link>
              <Link to="/register" className="btn-outline-yellow">
                Registrarse Gratis
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden flex border-t border-mc-border/40">
        {links.map(({ to, label }) => (
          <Link key={to} to={to}
            className={`flex-1 text-center py-2.5 text-xs font-bold transition-colors
              ${location.pathname === to ? 'text-mc-purple' : 'text-mc-muted'}`}>
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
