import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useUserStore } from '../store/userStore';

/* ── Datos de categorías ── */
const CATEGORIES = [
  {
    emoji: '⚡',
    title: 'Pokémon',
    desc: 'Encuentra tu Pikachu, Charizard y los holográficos más raros. La colección que marcó una generación.',
    gradient: 'linear-gradient(160deg, #1e1b4b 0%, #3730a3 50%, #4f46e5 100%)',
  },
  {
    emoji: '⚽',
    title: 'Fútbol',
    desc: 'Cromos de Liga, Champions y Mundiales. Completa tu Panini con los mejores jugadores del planeta.',
    gradient: 'linear-gradient(160deg, #052e16 0%, #166534 50%, #16a34a 100%)',
  },
  {
    emoji: '⚾',
    title: 'Béisbol',
    desc: 'Las grandes estrellas de la MLB en formato cromo. Rookies, figuras y leyendas inmortales.',
    gradient: 'linear-gradient(160deg, #450a0a 0%, #991b1b 50%, #dc2626 100%)',
  },
  {
    emoji: '🏀',
    title: 'Baloncesto',
    desc: 'Los dioses del parqué en tus manos. LeBron, Jordan, Curry — las cartas más codiciadas de la NBA.',
    gradient: 'linear-gradient(160deg, #431407 0%, #c2410c 50%, #ea580c 100%)',
  },
];

/* ── Icono flecha izquierda ── */
function ChevronLeft() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24"
         stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

/* ── Icono flecha derecha ── */
function ChevronRight() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24"
         stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

/* ── Tarjeta de categoría ── */
function CategoryCard({ emoji, title, desc, gradient }) {
  return (
    <div className="relative flex-shrink-0" style={{ width: 290 }}>

      {/* Elemento que "salta" por encima de la tarjeta */}
      <div
        className="absolute left-1/2 z-10 animate-float pointer-events-none select-none"
        style={{ top: -46, transform: 'translateX(-50%)' }}>
        <span style={{
          fontSize: '5.8rem',
          lineHeight: 1,
          filter: 'drop-shadow(0 10px 28px rgba(0,0,0,0.55))',
          display: 'block',
        }}>
          {emoji}
        </span>
      </div>

      {/* Cuerpo de la tarjeta */}
      <div className="rounded-2xl overflow-hidden flex flex-col"
           style={{ background: gradient, height: 368 }}>

        {/* Zona superior — fondo donde "apoya" el emoji */}
        <div style={{ flex: '0 0 40%' }} />

        {/* Zona de contenido inferior */}
        <div
          className="flex-1 px-6 pb-6 pt-3 flex flex-col justify-between"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.52))' }}>
          <div>
            <h3 className="font-black text-white text-xl leading-tight mb-2">{title}</h3>
            <p className="text-white/70 text-sm leading-relaxed">{desc}</p>
          </div>
          <button
            className="mt-4 self-start px-6 py-2.5 rounded-full font-bold text-sm text-white transition-all hover:bg-white/25 active:scale-95"
            style={{ background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.28)' }}>
            Ver más
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── HOME ── */
export default function Home() {
  const { user } = useUserStore();
  const scrollRef = useRef(null);

  const scroll = (dir) =>
    scrollRef.current?.scrollBy({ left: dir * 314, behavior: 'smooth' });

  return (
    <div className="min-h-screen" style={{ background: '#fff' }}>

      {/* ════════════════════════════════
          HERO
      ════════════════════════════════ */}
      <section style={{ background: '#fff', paddingTop: '6rem', paddingBottom: '5rem' }}>
        <div className="max-w-4xl mx-auto px-6 text-center">

          {/* Chip */}
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-8"
                style={{ color: '#4338ca', background: '#eef2ff' }}>
            ✦ La plataforma de intercambio de cromos
          </span>

          {/* Titular */}
          <h1 className="font-black leading-tight mb-6 text-gray-900"
              style={{ fontSize: 'clamp(2.6rem, 6vw, 4.4rem)', letterSpacing: '-0.03em' }}>
            Intercambia cromos.
            <br />
            <span style={{ color: '#4338ca' }}>Completa.</span>
          </h1>

          {/* Subtítulo */}
          <p className="text-gray-500 leading-relaxed max-w-xl mx-auto mb-10"
             style={{ fontSize: '1.1rem' }}>
            Conecta con coleccionistas, intercambia tus duplicados y completa tus álbumes
            más rápido que nunca. MatchCard es tu compañero inteligente.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to={user ? '/repes' : '/register'}
              className="font-black uppercase tracking-widest px-9 py-4 rounded-xl text-sm shadow-lg transition-all hover:brightness-110 active:scale-95"
              style={{ background: '#111827', color: '#fff' }}>
              Empieza gratis
            </Link>
            <a href="#categorias"
               className="font-bold px-9 py-4 rounded-xl text-sm border-2 border-gray-200 text-gray-700 hover:border-gray-400 transition-all">
              Ver categorías
            </a>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════
          CATEGORÍAS SLIDER
      ════════════════════════════════ */}
      <section id="categorias" style={{ background: '#111827', paddingBottom: '3.5rem' }}>

        {/* Encabezado + flechas */}
        <div className="max-w-7xl mx-auto px-6 pt-10 pb-6 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#6b7280' }}>
              Colecciones
            </p>
            <h2 className="font-black text-white text-2xl">Encuentra tu cromo</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => scroll(-1)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all hover:bg-white/15 active:scale-95"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)' }}
              aria-label="Anterior">
              <ChevronLeft />
            </button>
            <button
              onClick={() => scroll(1)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all hover:bg-white/15 active:scale-95"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)' }}
              aria-label="Siguiente">
              <ChevronRight />
            </button>
          </div>
        </div>

        {/* Track desplazable — paddingTop 52px > 46px offset del emoji = nunca se corta */}
        <div
          ref={scrollRef}
          className="flex gap-5 slider-scroll"
          style={{
            paddingLeft: '1.5rem',
            paddingRight: '1.5rem',
            paddingTop: '3.25rem',
            overflowX: 'auto',
            overflowY: 'visible',
          }}>
          {CATEGORIES.map((cat) => (
            <CategoryCard key={cat.title} {...cat} />
          ))}
          {/* Spacer final para que la última carta no quede pegada al borde */}
          <div style={{ flex: '0 0 1px' }} />
        </div>
      </section>

      {/* ════════════════════════════════
          ¿POR QUÉ MATCHCARD?
      ════════════════════════════════ */}
      <section className="py-16 px-6" style={{ background: '#f9fafb' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-black text-gray-900 text-3xl mb-3 tracking-tight">
            ¿Por qué MatchCard?
          </h2>
          <p className="text-gray-500 text-lg mb-12 max-w-xl mx-auto">
            La forma más inteligente de completar tus colecciones de cromos.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '⚡',
                title: 'Matches automáticos',
                desc: 'Nuestro algoritmo conecta tus duplicados con las faltas de otros coleccionistas al instante.',
              },
              {
                icon: '📍',
                title: 'Coleccionistas cercanos',
                desc: 'Encuentra intercambios en tu ciudad para quedar en persona y estrechar la comunidad.',
              },
              {
                icon: '🔄',
                title: 'Sin dinero de por medio',
                desc: 'Solo intercambios directos. Un cromo por otro, sin complicaciones ni comisiones.',
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="rounded-2xl p-8 text-center"
                   style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 24px rgba(0,0,0,0.04)' }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto"
                     style={{ background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)' }}>
                  {icon}
                </div>
                <h3 className="font-black text-gray-900 text-base mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          ÚNETE / QUIÉNES SOMOS
      ════════════════════════════════ */}
      {!user && (
        <section id="quienes-somos" className="py-16 px-6"
                 style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 60%, #6d28d9 100%)' }}>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-black text-white text-3xl mb-4 tracking-tight">Únete a MatchCard</h2>
            <p className="text-white/75 text-lg mb-10 leading-relaxed max-w-lg mx-auto">
              Miles de coleccionistas ya intercambian sus cromos. Regístrate gratis
              y encuentra tu match hoy mismo.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/register"
                className="font-black uppercase tracking-widest px-9 py-4 rounded-xl text-sm text-gray-900 shadow-xl transition-all hover:brightness-105 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)' }}>
                Crear cuenta gratis
              </Link>
              <Link to="/login"
                className="font-black uppercase tracking-widest px-9 py-4 rounded-xl text-sm text-white border border-white/30 hover:bg-white/10 transition-all">
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════
          FOOTER
      ════════════════════════════════ */}
      <footer style={{ background: '#0f0e1a', borderTop: '1px solid rgba(255,255,255,0.06)' }}
              className="py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">

          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
             className="flex items-center gap-2 group" aria-label="Instagram">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                 style={{ background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                <rect x="2" y="2" width="20" height="20" rx="5.5" stroke="white" strokeWidth="2" fill="none"/>
                <circle cx="12" cy="12" r="4.8" stroke="white" strokeWidth="2" fill="none"/>
                <circle cx="17.6" cy="6.4" r="1.3" fill="white"/>
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-500 group-hover:text-white transition-colors">
              @matchcard_oficial
            </span>
          </a>

          <p className="text-gray-600 text-xs text-center">
            © 2026 MatchCard — Plataforma de Intercambio de Cromos Coleccionables
          </p>

          <div className="w-40 hidden sm:block" />
        </div>
      </footer>
    </div>
  );
}
