import { Link } from 'react-router-dom';
import { useUserStore } from '../store/userStore';

/* ─────────────────────────────────────────────
   SECCIÓN HERO — ilustración CSS de dos personas
───────────────────────────────────────────── */
function IlustracionHero() {
  return (
    <div className="relative flex items-end justify-center"
         style={{ width: 380, height: 280, flexShrink: 0 }}>

      {/* Fondo cálido circular */}
      <div className="absolute inset-0 rounded-full opacity-40 pointer-events-none"
           style={{
             background: 'radial-gradient(ellipse at 60% 60%, #f59e0b 0%, #d97706 40%, transparent 70%)',
             transform: 'scale(1.1)',
           }} />

      {/* Cartas flotantes */}
      <div className="absolute animate-float" style={{ top: 10, left: '30%', animationDelay: '0s' }}>
        <div className="w-14 h-20 rounded-lg shadow-xl flex items-center justify-center text-2xl"
             style={{ background: 'linear-gradient(135deg, #7c3aed, #4338ca)',
                      border: '2px solid rgba(255,255,255,0.4)',
                      boxShadow: '0 0 20px rgba(124,58,237,0.6)' }}>
          💎
        </div>
      </div>
      <div className="absolute animate-float" style={{ top: 30, left: '50%', animationDelay: '0.7s' }}>
        <div className="w-10 h-14 rounded-lg shadow-lg flex items-center justify-center text-xl"
             style={{ background: 'linear-gradient(135deg, #5b21b6, #7c3aed)',
                      border: '2px solid rgba(255,255,255,0.3)',
                      boxShadow: '0 0 14px rgba(91,33,182,0.5)' }}>
          ✨
        </div>
      </div>
      <div className="absolute animate-float" style={{ top: 15, right: '22%', animationDelay: '1.3s' }}>
        <div className="w-11 h-16 rounded-lg shadow-lg flex items-center justify-center text-xl"
             style={{ background: 'linear-gradient(135deg, #4338ca, #2563eb)',
                      border: '2px solid rgba(255,255,255,0.3)',
                      boxShadow: '0 0 14px rgba(67,56,202,0.5)' }}>
          🔮
        </div>
      </div>

      {/* Persona 1 — mujer */}
      <div className="relative flex flex-col items-center z-10 mr-[-20px]">
        <div className="text-6xl mb-0.5 select-none" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }}>
          👩🏽
        </div>
        <div className="w-24 h-36 rounded-t-3xl"
             style={{ background: 'linear-gradient(180deg, #6d28d9 0%, #5b21b6 100%)' }} />
        {/* Carta en mano */}
        <div className="absolute bottom-20 -left-6 w-12 h-16 rounded-lg flex items-center justify-center text-xl shadow-lg"
             style={{ background: 'linear-gradient(135deg, #7c3aed, #4338ca)',
                      border: '1.5px solid rgba(255,255,255,0.4)',
                      transform: 'rotate(-12deg)',
                      boxShadow: '0 0 16px rgba(124,58,237,0.5)' }}>
          💎
        </div>
      </div>

      {/* Persona 2 — hombre */}
      <div className="relative flex flex-col items-center z-10">
        <div className="text-6xl mb-0.5 select-none" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }}>
          👨🏿
        </div>
        <div className="w-24 h-36 rounded-t-3xl"
             style={{ background: 'linear-gradient(180deg, #0369a1 0%, #0c4a6e 100%)' }} />
        {/* Cartas en mano */}
        <div className="absolute bottom-20 -right-8 flex gap-0.5">
          {['🐉','⚡','🌿'].map((e, i) => (
            <div key={i} className="w-9 h-12 rounded-md flex items-center justify-center text-sm shadow-md"
                 style={{ background: 'linear-gradient(135deg, #1d4ed8, #1e40af)',
                          border: '1.5px solid rgba(255,255,255,0.3)',
                          transform: `rotate(${(i - 1) * 9}deg)` }}>
              {e}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CARTA OCTAGONAL
───────────────────────────────────────────── */
const CLIP = 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)';

const CARTAS_PREVIEW = [
  {
    nombre:      'Chimera',
    numero:      '006',
    emoji:       '🐉',
    bg:          'linear-gradient(160deg, #92400e 0%, #b45309 50%, #d97706 100%)',
    iconoColor:  '#fbbf24',
    coincidencia: true,
    categoria:   'elite',
    flipped:     true,
  },
  {
    nombre:      'Cristal',
    numero:      '014',
    emoji:       '💎',
    bg:          'linear-gradient(160deg, #1e3a8a 0%, #2563eb 60%, #38bdf8 100%)',
    iconoColor:  '#7dd3fc',
    coincidencia: true,
    categoria:   'elite',
  },
  {
    nombre:      'Elfa Guardiana',
    numero:      '023',
    emoji:       '🧝',
    bg:          'linear-gradient(160deg, #14532d 0%, #16a34a 60%, #86efac 100%)',
    iconoColor:  '#86efac',
    coincidencia: true,
    categoria:   'comun',
  },
  {
    nombre:      'Torre Antigua',
    numero:      '037',
    emoji:       '🏰',
    bg:          'linear-gradient(160deg, #78350f 0%, #d97706 50%, #fde68a 100%)',
    iconoColor:  '#fde68a',
    coincidencia: false,
    categoria:   'comun',
  },
  {
    nombre:      'Espíritu Agua',
    numero:      '041',
    emoji:       '🔮',
    bg:          'linear-gradient(160deg, #1e3a8a 0%, #0284c7 50%, #67e8f9 100%)',
    iconoColor:  '#67e8f9',
    coincidencia: false,
    categoria:   'comun',
  },
];

function CartaOctagonal({ carta, size = 130 }) {
  const border = Math.round(size * 0.055);

  if (carta.flipped) {
    // Cara info
    return (
      <div className="relative flex-shrink-0" style={{ width: size }}>
        <div style={{
          clipPath: CLIP,
          background: '#1c0f00',
          padding: border,
          aspectRatio: '1 / 1.15',
        }}>
          <div style={{
            clipPath: CLIP,
            background: '#fff9f0',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            padding: 8,
          }}>
            <p className="font-mono text-xs text-gray-500 font-bold">Nº {carta.numero}</p>
            <p className="font-black text-sm text-mc-dark text-center leading-tight">{carta.nombre}</p>
            {carta.coincidencia && (
              <span className="flex items-center gap-1 bg-green-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow">
                <span>✓</span> ¡Coincidencia!
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-shrink-0 group" style={{ width: size }}>
      {/* Badge coincidencia */}
      {carta.coincidencia && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap">
          <span className="flex items-center gap-1 bg-green-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg">
            <span>✓</span> ¡Coincidencia!
          </span>
        </div>
      )}

      {/* Marco exterior oscuro */}
      <div className="transition-transform duration-300 group-hover:-translate-y-2 group-hover:scale-105"
           style={{
             clipPath: CLIP,
             background: '#1c0f00',
             padding: border,
             aspectRatio: '1 / 1.15',
           }}>
        {/* Interior */}
        <div style={{
          clipPath: CLIP,
          background: carta.bg,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 6px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Brillo superior */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '40%',
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.18), transparent)',
            pointerEvents: 'none',
          }} />

          {/* Icono superior */}
          <div className="flex justify-between w-full">
            <span style={{ fontSize: 10, color: carta.iconoColor, fontWeight: 900 }}>◆</span>
            <span style={{ fontSize: 10, color: carta.iconoColor, fontWeight: 900 }}>◆</span>
          </div>

          {/* Arte central */}
          <div className="flex items-center justify-center flex-1">
            <span style={{ fontSize: size * 0.32, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))' }}>
              {carta.emoji}
            </span>
          </div>

          {/* Nombre + iconos inferiores */}
          <div className="w-full">
            <p className="text-center font-black text-white leading-none truncate"
               style={{ fontSize: size * 0.09, textShadow: '0 1px 4px rgba(0,0,0,0.7)' }}>
              {carta.nombre}
            </p>
            <div className="flex justify-between mt-1">
              <span style={{ fontSize: 9, color: carta.iconoColor }}>◆</span>
              <span style={{ fontSize: 9, color: carta.iconoColor }}>◆</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   HOME PAGE
───────────────────────────────────────────── */
export default function Home() {
  const { user } = useUserStore();

  const elite  = CARTAS_PREVIEW.filter(c => c.categoria === 'elite');
  const comun  = CARTAS_PREVIEW.filter(c => c.categoria === 'comun');

  return (
    <div className="min-h-screen" style={{ background: '#f8f7ff' }}>

      {/* ════════════════════════════════
          HERO
      ════════════════════════════════ */}
      <section style={{
        background: 'linear-gradient(120deg, #5b21b6 0%, #7c3aed 40%, #d97706 100%)',
        minHeight: 340,
      }}>
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row items-center justify-between gap-8">

          {/* Texto */}
          <div className="flex-1 max-w-xl">
            <h1 className="font-black text-white leading-tight mb-5 uppercase"
                style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', letterSpacing: '-0.01em',
                         textShadow: '0 2px 16px rgba(0,0,0,0.25)' }}>
              Intercambia con propósito,<br />completa tus colecciones.
            </h1>

            <p className="text-white/85 leading-relaxed mb-8"
               style={{ fontSize: '1rem', maxWidth: 480 }}>
              Transformamos el caos en eficiencia. Conecta con coleccionistas
              locales, intercambia duplicados y completa tus álbumes más rápido.
              MatchCard es tu compañero inteligente.
            </p>

            <Link
              to={user ? '/repes' : '/register'}
              className="inline-flex items-center gap-2 font-black uppercase tracking-widest px-8 py-3.5 rounded-xl transition-all duration-200 hover:brightness-110 active:scale-95 shadow-lg"
              style={{ background: '#111827', color: '#fff', fontSize: '0.85rem',
                       boxShadow: '0 4px 20px rgba(0,0,0,0.35)' }}
            >
              Comenzar ahora
            </Link>
          </div>

          {/* Ilustración */}
          <div className="hidden lg:flex items-end justify-center flex-shrink-0">
            <IlustracionHero />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          SECCIÓN CARTAS
      ════════════════════════════════ */}
      <section className="py-14 px-6" style={{ background: '#f0eef8' }}>
        <div className="max-w-7xl mx-auto">

          {/* Categorías + cartas */}
          <div className="flex flex-col md:flex-row items-start gap-10 justify-center">

            {/* ÉLITE */}
            <div>
              <h2 className="font-black text-mc-dark text-sm tracking-widest uppercase mb-6">
                Colecciones de Élite
              </h2>
              <div className="flex items-end gap-4">
                {elite.map((carta, i) => (
                  <CartaOctagonal key={i} carta={carta} size={carta.flipped ? 120 : 128} />
                ))}
              </div>
            </div>

            {/* Separador vertical */}
            <div className="hidden md:block w-px bg-gray-300 self-stretch mx-4" />

            {/* COMUNES */}
            <div>
              <h2 className="font-black text-mc-dark text-sm tracking-widest uppercase mb-6">
                Cromos Comunes
              </h2>
              <div className="flex items-end gap-4">
                {comun.map((carta, i) => (
                  <CartaOctagonal key={i} carta={carta} size={128} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          ÚNETE A LA COMUNIDAD
      ════════════════════════════════ */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-black text-mc-dark text-3xl mb-4 uppercase tracking-tight">
            Únete a la Comunidad
          </h2>
          <p className="text-mc-muted text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            Miles de coleccionistas ya intercambian sus cartas en MatchCard.
            Regístrate gratis y encuentra tu match hoy.
          </p>

          <div className="flex flex-wrap gap-6 justify-center mb-10">
            {[
              { icon: '⚡', label: 'Matches automáticos',    desc: 'Algoritmo inteligente que conecta tus repes con las faltas de otros.' },
              { icon: '📍', label: 'Por ciudad',             desc: 'Intercambia con coleccionistas de tu zona para quedar en persona.' },
              { icon: '🔄', label: 'Sin dinero de por medio', desc: 'Solo intercambios directos de cartas duplicadas.' },
            ].map(({ icon, label, desc }) => (
              <div key={label} className="flex flex-col items-center text-center max-w-[200px]">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-3 shadow-sm"
                     style={{ background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)' }}>
                  {icon}
                </div>
                <p className="font-black text-mc-dark text-sm mb-1">{label}</p>
                <p className="text-mc-muted text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {!user && (
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/register"
                className="font-black uppercase tracking-widest px-8 py-3.5 rounded-xl transition-all duration-200 hover:brightness-110 active:scale-95 shadow-md text-sm"
                style={{ background: '#111827', color: '#fff' }}>
                Crear cuenta gratis
              </Link>
              <Link to="/login"
                className="font-black uppercase tracking-widest px-8 py-3.5 rounded-xl border-2 border-mc-dark text-mc-dark hover:bg-mc-dark hover:text-white transition-all duration-200 text-sm">
                Ya tengo cuenta
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════
          FOOTER — Instagram + copyright
      ════════════════════════════════ */}
      <footer className="border-t border-gray-100 py-6 px-6 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">

          {/* Instagram con logo real */}
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 group"
            aria-label="Instagram"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:-translate-y-0.5"
                 style={{ background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                <rect x="2" y="2" width="20" height="20" rx="5.5" stroke="white" strokeWidth="2" fill="none"/>
                <circle cx="12" cy="12" r="4.8" stroke="white" strokeWidth="2" fill="none"/>
                <circle cx="17.6" cy="6.4" r="1.3" fill="white"/>
              </svg>
            </div>
            <span className="text-sm font-semibold text-mc-muted group-hover:text-mc-purple transition-colors">
              @matchcard_oficial
            </span>
          </a>

          <p className="text-mc-muted text-xs text-center">
            © 2026 MatchCard — Plataforma de Intercambio de Cartas Coleccionables
          </p>

          {/* Spacer para centrar el copyright en desktop */}
          <div className="w-40 hidden sm:block" />
        </div>
      </footer>
    </div>
  );
}
