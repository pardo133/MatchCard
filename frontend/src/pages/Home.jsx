import { useRef, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import axiosClient from '../api/axiosClient';

const CATEGORIES = [
  {
    emoji: '⚡', title: 'Pokémon',
    desc: 'Encuentra tu Pikachu, Charizard y los holográficos más raros. La colección que marcó una generación.',
    gradient: 'linear-gradient(160deg, #1e1b4b 0%, #3730a3 50%, #4f46e5 100%)',
  },
  {
    emoji: '⚽', title: 'Fútbol',
    desc: 'Cromos de Liga, Champions y Mundiales. Completa tu Panini con los mejores jugadores del planeta.',
    gradient: 'linear-gradient(160deg, #052e16 0%, #166534 50%, #16a34a 100%)',
  },
  {
    emoji: '🌸', title: 'Anime',
    desc: 'Dragon Ball, Naruto, One Piece y más. Las cartas de tus personajes favoritos en un solo lugar.',
    gradient: 'linear-gradient(160deg, #4a044e 0%, #86198f 50%, #d946ef 100%)',
  },
  {
    emoji: '⚾', title: 'Béisbol',
    desc: 'Las grandes estrellas de la MLB en formato cromo. Rookies, figuras y leyendas inmortales.',
    gradient: 'linear-gradient(160deg, #450a0a 0%, #991b1b 50%, #dc2626 100%)',
  },
];

function ChevronLeft() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24"
         stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}
function ChevronRight() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24"
         stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function CategoryCard({ emoji, title, desc, gradient }) {
  return (
    <div className="relative flex-shrink-0" style={{ width: 290 }}>
      <div className="absolute left-1/2 z-10 animate-float pointer-events-none select-none"
           style={{ top: -46, transform: 'translateX(-50%)' }}>
        <span style={{ fontSize: '5.8rem', lineHeight: 1, filter: 'drop-shadow(0 10px 28px rgba(0,0,0,0.55))', display: 'block' }}>
          {emoji}
        </span>
      </div>
      <div className="rounded-2xl overflow-hidden flex flex-col" style={{ background: gradient, height: 368 }}>
        <div style={{ flex: '0 0 40%' }} />
        <div className="flex-1 px-6 pb-6 pt-3 flex flex-col justify-between"
             style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.52))' }}>
          <div>
            <h3 className="font-black text-white text-xl leading-tight mb-2">{title}</h3>
            <p className="text-white/70 text-sm leading-relaxed">{desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Buscador del Hero ── */
function HeroBuscador({ usuario }) {
  const [query,    setQuery]    = useState('');
  const [results,  setResults]  = useState(null);
  const [loading,  setLoading]  = useState(false);
  const navigate   = useNavigate();
  const timerRef   = useRef(null);

  const buscar = useCallback(async (q) => {
    if (!q || q.trim().length < 2) { setResults(null); return; }
    setLoading(true);
    try {
      const { data } = await axiosClient.get('/cromos/buscar-publico', { params: { nombre: q.trim() } });
      setResults(data);
    } catch { setResults({ cromos: [], totalUsuarios: 0 }); }
    finally { setLoading(false); }
  }, []);

  const handleChange = e => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => buscar(val), 450);
  };

  const handleIrAlBuscador = () => {
    if (usuario) navigate('/buscador');
    else navigate('/register');
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto mt-8">
      {/* Input */}
      <div className="relative">
        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl pointer-events-none">🔍</span>
        <input
          type="text"
          placeholder="Busca un cromo… ej: Pikachu, Messi, Goku"
          value={query}
          onChange={handleChange}
          className="w-full pl-14 pr-36 py-4 rounded-2xl text-base font-semibold text-gray-800 placeholder-gray-400 outline-none transition-all shadow-xl"
          style={{ border: '2px solid #e0e7ff', background: 'rgba(255,255,255,0.97)',
                   boxShadow: '0 8px 40px rgba(67,56,202,0.18)' }}
          onFocus={e  => (e.target.style.borderColor = '#4338ca')}
          onBlur={e   => (e.target.style.borderColor = '#e0e7ff')}
        />
        <button
          onClick={handleIrAlBuscador}
          className="absolute right-2 top-1/2 -translate-y-1/2 font-black text-sm px-5 py-2.5 rounded-xl text-white transition-all hover:brightness-110 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #4338ca, #7c3aed)' }}>
          {usuario ? 'Buscar' : 'Ver todo →'}
        </button>
        {loading && (
          <span className="absolute right-36 top-1/2 -translate-y-1/2 text-mc-purple animate-spin">✦</span>
        )}
      </div>

      {/* Resultados preview */}
      {results !== null && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden z-50 shadow-2xl"
             style={{ background: 'white', border: '1px solid #e0e7ff' }}>
          {results.cromos?.length === 0 ? (
            <div className="px-5 py-4 text-center text-gray-500 text-sm">
              Sin resultados en el catálogo para "{query}"
            </div>
          ) : (
            <>
              <div className="px-4 pt-3 pb-2">
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider">
                  Cromos encontrados
                </p>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {results.cromos?.slice(0, 6).map(c => (
                  <div key={c._id} className="flex items-center justify-between px-4 py-2.5 hover:bg-indigo-50 transition-colors cursor-pointer"
                       onClick={handleIrAlBuscador}>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{c.nombre}</p>
                      <p className="text-xs text-gray-500">{c.expansion} · #{String(c.numero).padStart(3,'0')}</p>
                    </div>
                    {!usuario ? (
                      <span className="text-xs font-black px-2.5 py-1 rounded-full"
                            style={{ background: '#eef2ff', color: '#4338ca' }}>
                        Regístrate para ver
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                        Ver quién lo tiene →
                      </span>
                    )}
                  </div>
                ))}
              </div>
              {results.totalUsuarios > 0 && (
                <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between"
                     style={{ background: '#f9fafb' }}>
                  <p className="text-xs text-gray-500">
                    <strong className="text-indigo-600">{results.totalUsuarios}</strong> coleccionista{results.totalUsuarios !== 1 ? 's' : ''} tienen alguno de sobra
                  </p>
                  <button onClick={handleIrAlBuscador}
                    className="text-xs font-black text-indigo-600 hover:text-indigo-800 transition-colors">
                    {usuario ? 'Ver contactos →' : 'Regístrate gratis →'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ── HOME ── */
export default function Home() {
  const { user }  = useUserStore();
  const scrollRef = useRef(null);
  const scroll    = dir => scrollRef.current?.scrollBy({ left: dir * 314, behavior: 'smooth' });

  return (
    <div className="min-h-screen" style={{ background: '#fff' }}>

      {/* HERO */}
      <section style={{ background: 'linear-gradient(180deg, #fafafe 0%, #fff 100%)', paddingTop: '5rem', paddingBottom: '4rem' }}>
        <div className="max-w-4xl mx-auto px-6 text-center">

          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-8"
                style={{ color: '#4338ca', background: '#eef2ff' }}>
            ✦ La plataforma de intercambio de cromos
          </span>

          <h1 className="font-black leading-tight mb-5 text-gray-900"
              style={{ fontSize: 'clamp(2.4rem, 6vw, 4.2rem)', letterSpacing: '-0.03em' }}>
            Intercambia cromos.<br />
            <span style={{ color: '#4338ca' }}>Completa tu colección.</span>
          </h1>

          <p className="text-gray-500 leading-relaxed max-w-xl mx-auto mb-3"
             style={{ fontSize: '1.05rem' }}>
            Busca el cromo que te falta, descubre quién lo tiene de sobra
            y contacta directamente para hacer el intercambio.
          </p>

          {/* BUSCADOR */}
          <HeroBuscador usuario={user} />

          {!user && (
            <div className="flex flex-wrap gap-4 justify-center mt-10">
              <Link to="/register"
                className="font-black uppercase tracking-widest px-9 py-4 rounded-xl text-sm shadow-lg transition-all hover:brightness-110 active:scale-95"
                style={{ background: '#111827', color: '#fff' }}>
                Crear cuenta gratis
              </Link>
              <a href="#categorias"
                 className="font-bold px-9 py-4 rounded-xl text-sm border-2 border-gray-200 text-gray-700 hover:border-gray-400 transition-all">
                Ver categorías
              </a>
            </div>
          )}
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section id="categorias" style={{ background: '#111827', paddingBottom: '3.5rem' }}>
        <div className="max-w-7xl mx-auto px-6 pt-10 pb-6 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#6b7280' }}>Colecciones</p>
            <h2 className="font-black text-white text-2xl">Encuentra tu cromo</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={() => scroll(-1)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all hover:bg-white/15 active:scale-95"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)' }}>
              <ChevronLeft />
            </button>
            <button onClick={() => scroll(1)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all hover:bg-white/15 active:scale-95"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)' }}>
              <ChevronRight />
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="flex gap-5 slider-scroll"
             style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem', paddingTop: '3.25rem',
                      overflowX: 'auto', overflowY: 'visible' }}>
          {CATEGORIES.map(cat => <CategoryCard key={cat.title} {...cat} />)}
          <div style={{ flex: '0 0 1px' }} />
        </div>
      </section>

      {/* ¿POR QUÉ MATCHCARD? */}
      <section className="py-16 px-6" style={{ background: '#f9fafb' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-black text-gray-900 text-3xl mb-3 tracking-tight">¿Por qué MatchCard?</h2>
          <p className="text-gray-500 text-lg mb-12 max-w-xl mx-auto">
            La forma más sencilla de encontrar quién tiene lo que necesitas.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '🔍',
                title: 'Busca tu cromo',
                desc: 'Escribe el nombre del cromo que te falta y al momento ves qué coleccionistas lo tienen de sobra.',
              },
              {
                icon: '📞',
                title: 'Contacto directo',
                desc: 'Nada de mensajes intermedios. Ves el email y teléfono del coleccionista y te pones en contacto al instante.',
              },
              {
                icon: '🔄',
                title: 'Intercambio real',
                desc: 'Quedáis en persona o por correo, hacéis el trueque y completáis vuestras colecciones. Así de simple.',
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

      {/* CTA registro */}
      {!user && (
        <section className="py-16 px-6"
                 style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 60%, #6d28d9 100%)' }}>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-black text-white text-3xl mb-4 tracking-tight">Únete a MatchCard</h2>
            <p className="text-white/75 text-lg mb-10 leading-relaxed max-w-lg mx-auto">
              Regístrate gratis, sube tus repetidas y empieza a contactar con
              coleccionistas que tienen lo que necesitas.
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

      {/* Footer */}
      <footer style={{ background: '#0f0e1a', borderTop: '1px solid rgba(255,255,255,0.06)' }}
              className="py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
             className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                 style={{ background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                <rect x="2" y="2" width="20" height="20" rx="5.5" stroke="white" strokeWidth="2" fill="none"/>
                <circle cx="12" cy="12" r="4.8" stroke="white" strokeWidth="2" fill="none"/>
                <circle cx="17.6" cy="6.4" r="1.3" fill="white"/>
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-500 group-hover:text-white transition-colors">@matchcard_oficial</span>
          </a>
          <p className="text-gray-600 text-xs text-center">© 2026 MatchCard — Plataforma de Intercambio de Cromos</p>
          <div className="w-40 hidden sm:block" />
        </div>
      </footer>
    </div>
  );
}
