import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUserStore } from '../store/userStore';

/* ── Decoraciones holográficas ── */
const HOLO_DECOS = [
  { top: '10%', left: '1%',   w: 44, h: 62, rot: -25, delay: '0s'   },
  { top: '18%', left: '7%',   w: 34, h: 48, rot:  15, delay: '1s'   },
  { top: '45%', left: '0%',   w: 40, h: 56, rot:  -8, delay: '1.8s' },
  { top: '65%', left: '4%',   w: 32, h: 46, rot:  22, delay: '0.5s' },
  { top: '6%',  right: '2%',  w: 42, h: 60, rot:  18, delay: '1.3s' },
  { top: '28%', right: '0%',  w: 36, h: 52, rot: -14, delay: '0.2s' },
  { top: '55%', right: '3%',  w: 38, h: 54, rot:   8, delay: '2s'   },
  { top: '78%', right: '1%',  w: 30, h: 44, rot: -20, delay: '0.7s' },
];

/* ── Imágenes reales de cartas ── */
const CATEGORIAS = [
  {
    titulo: 'CARTAS DE FÚTBOL',
    tipo: 'futbol',
    cartas: [
      {
        nombre: 'Erling Haaland',
        equipo: 'Manchester City',
        rating: 91,
        posicion: 'DC',
        img: 'https://resources.premierleague.com/premierleague/photos/players/250x250/p223094.png',
        color1: '#1C2C5B', color2: '#98C5E9',
      },
      {
        nombre: 'Mohamed Salah',
        equipo: 'Liverpool FC',
        rating: 89,
        posicion: 'ED',
        img: 'https://resources.premierleague.com/premierleague/photos/players/250x250/p118748.png',
        color1: '#C8102E', color2: '#F6EB61',
      },
      {
        nombre: 'Kevin De Bruyne',
        equipo: 'Manchester City',
        rating: 91,
        posicion: 'MC',
        img: 'https://resources.premierleague.com/premierleague/photos/players/250x250/p61366.png',
        color1: '#1C2C5B', color2: '#98C5E9',
      },
    ],
  },
  {
    titulo: 'CARTAS POKÉMON',
    tipo: 'pokemon',
    cartas: [
      {
        nombre: 'Charizard',
        img: 'https://images.pokemontcg.io/base1/4.png',
      },
      {
        nombre: 'Pikachu',
        img: 'https://images.pokemontcg.io/base1/58.png',
      },
      {
        nombre: 'Mewtwo',
        img: 'https://images.pokemontcg.io/base1/10.png',
      },
    ],
  },
  {
    titulo: 'CARTAS YU-GI-OH',
    tipo: 'yugioh',
    cartas: [
      {
        nombre: 'Blue-Eyes White Dragon',
        img: 'https://storage.googleapis.com/ygoprodeck.com/pics/89631139.jpg',
      },
      {
        nombre: 'Dark Magician',
        img: 'https://storage.googleapis.com/ygoprodeck.com/pics/46986414.jpg',
      },
      {
        nombre: 'Dark Magician Girl',
        img: 'https://storage.googleapis.com/ygoprodeck.com/pics/38033121.jpg',
      },
    ],
  },
];

/* ── Carta de fútbol estilo Panini Prizm ── */
function CartaFutbol({ carta }) {
  return (
    <div
      className="relative overflow-hidden rounded-xl cursor-pointer group"
      style={{
        width: 118,
        aspectRatio: '63/88',
        background: `linear-gradient(160deg, ${carta.color1} 0%, ${carta.color2}44 100%)`,
        boxShadow: '0 8px 28px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
        border: '1px solid rgba(255,255,255,0.2)',
      }}
    >
      {/* Brillo diagonal */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
           style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%)' }} />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center px-2 pt-1.5">
        <span className="text-[8px] font-black text-white/80 uppercase">{carta.posicion}</span>
        <span className="text-[10px] font-black text-white" style={{ textShadow: '0 0 8px rgba(255,215,0,0.8)' }}>
          {carta.rating}
        </span>
      </div>

      {/* Foto del jugador */}
      <div className="absolute bottom-0 left-0 right-0 top-4 flex items-end justify-center overflow-hidden">
        <img
          src={carta.img}
          alt={carta.nombre}
          className="h-full object-contain object-bottom transition-transform duration-300 group-hover:scale-105"
          style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
          onError={e => { e.target.style.display = 'none'; }}
        />
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 px-1.5 pb-1.5 pt-4"
           style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)' }}>
        <p className="text-[8px] font-black text-white leading-none truncate">{carta.nombre}</p>
        <p className="text-[7px] text-white/60 truncate">{carta.equipo}</p>
      </div>

      {/* Borde dorado en hover */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
           style={{ boxShadow: 'inset 0 0 0 1.5px rgba(255,215,0,0.5)' }} />
    </div>
  );
}

/* ── Carta Pokémon / Yu-Gi-Oh (imagen real completa) ── */
function CartaImagen({ carta }) {
  return (
    <div
      className="relative overflow-hidden rounded-xl cursor-pointer group"
      style={{
        width: 118,
        aspectRatio: '63/88',
        boxShadow: '0 8px 28px rgba(0,0,0,0.4)',
      }}
    >
      <img
        src={carta.img}
        alt={carta.nombre}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        onError={e => { e.target.src = ''; e.target.style.display = 'none'; }}
      />
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
           style={{ boxShadow: 'inset 0 0 0 2px rgba(255,215,0,0.6)' }} />
    </div>
  );
}

/* ── Sección de categoría ── */
function SeccionCategoria({ categoria, indice }) {
  const [activa, setActiva] = useState(0);
  const carta = categoria.cartas[activa];

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <span className="category-title">{categoria.titulo}</span>
        <button className="w-6 h-6 rounded-full border border-mc-border flex items-center justify-center text-mc-muted hover:border-mc-purple hover:text-mc-purple transition-colors text-xs font-bold">›</button>
      </div>

      <div className="podium group" style={{ minHeight: 210 }}>
        <div className="absolute inset-0 rounded-2xl pointer-events-none"
             style={{ background: 'radial-gradient(ellipse at 50% 25%, rgba(99,102,241,0.3) 0%, transparent 65%)' }} />

        <div className="relative z-10 mt-2"
             style={{ animation: `float ${3.5 + indice * 0.7}s ease-in-out infinite` }}>
          {categoria.tipo === 'futbol'
            ? <CartaFutbol carta={carta} />
            : <CartaImagen carta={carta} />
          }
        </div>

        <div className="flex gap-1.5 mt-4 relative z-10">
          {categoria.cartas.map((_, i) => (
            <button key={i} onClick={() => setActiva(i)}
              className="rounded-full transition-all duration-200"
              style={{
                width:  i === activa ? 18 : 6,
                height: 6,
                background: i === activa ? '#FFD700' : 'rgba(255,255,255,0.3)',
              }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Binder animado ── */
function Binder() {
  return (
    <div className="relative flex-shrink-0" style={{ width: 360, height: 250 }}>
      <div className="absolute inset-0 rounded-2xl overflow-hidden"
           style={{ background: 'linear-gradient(135deg, #3730a3, #4338ca)',
                    boxShadow: '0 20px 60px rgba(67,56,202,0.4)' }}>
        {/* Anillas */}
        <div className="absolute left-8 top-0 bottom-0 flex flex-col justify-evenly py-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-4 h-4 rounded-full border-[3px] border-white/30"
                 style={{ background: 'linear-gradient(135deg, #d1d5db, #9ca3af)' }} />
          ))}
        </div>
        {/* Páginas */}
        <div className="absolute left-16 right-4 top-4 bottom-4 grid grid-cols-2 gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-white/15 flex items-center justify-center"
                 style={{ background: i === 0 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)' }}>
              {i === 0 && (
                <img
                  src="https://images.pokemontcg.io/base1/58.png"
                  alt="Pikachu"
                  className="w-full h-full object-contain p-1"
                />
              )}
              {i !== 0 && (
                <div className="w-7 h-7 rounded-full border border-white/15"
                     style={{ background: 'rgba(255,255,255,0.06)' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Carta volando */}
      <div className="absolute animate-float" style={{ top: -24, right: 28, width: 68, height: 96, animationDelay: '0.6s' }}>
        <div className="w-full h-full rounded-xl overflow-hidden"
             style={{ boxShadow: '0 0 24px rgba(255,215,0,0.5), 0 8px 24px rgba(0,0,0,0.4)',
                      border: '2px solid rgba(255,215,0,0.4)' }}>
          <img src="https://images.pokemontcg.io/base1/4.png" alt="Charizard" className="w-full h-full object-cover" />
        </div>
        <div className="absolute bottom-[-14px] left-1/2 -translate-x-1/2 text-xl font-black"
             style={{ color: '#06b6d4', filter: 'drop-shadow(0 0 6px rgba(6,182,212,0.8))' }}>↘</div>
      </div>

      {/* Badge match */}
      <div className="absolute bottom-[-18px] right-4 flex items-center gap-2 px-3 py-2 rounded-xl animate-badge-pop"
           style={{ background: 'linear-gradient(135deg, #065f46, #059669)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                    border: '1px solid rgba(16,185,129,0.5)' }}>
        <div className="w-7 h-7 rounded-full bg-emerald-200 flex items-center justify-center text-sm font-black text-gray-800">A</div>
        <div>
          <p className="text-[11px] font-black text-emerald-200 uppercase tracking-wide">¡Match con Alejandro!</p>
          <p className="text-[10px] text-white/60">3 cartas encontradas.</p>
        </div>
      </div>
    </div>
  );
}

/* ── Ilustración personas ── */
function IlustracionPersonas() {
  return (
    <div className="relative flex items-end justify-center" style={{ height: 240 }}>
      <div className="flex flex-col items-center mr-[-16px] z-10 relative">
        <div className="text-5xl mb-1">👩🏽</div>
        <div className="w-20 h-28 rounded-t-3xl" style={{ background: 'linear-gradient(180deg, #7c3aed, #5b21b6)' }} />
        <div className="absolute bottom-12 -left-3 rounded-lg overflow-hidden"
             style={{ width: 44, height: 60, transform: 'rotate(-18deg)',
                      boxShadow: '0 0 12px rgba(124,58,237,0.5)' }}>
          <img src="https://images.pokemontcg.io/base1/58.png" alt="carta" className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="flex flex-col items-center relative">
        <div className="text-5xl mb-1">👨🏿</div>
        <div className="w-20 h-28 rounded-t-3xl" style={{ background: 'linear-gradient(180deg, #0369a1, #0c4a6e)' }} />
        <div className="absolute bottom-4 -right-6 flex gap-0.5">
          {[
            'https://storage.googleapis.com/ygoprodeck.com/pics/89631139.jpg',
            'https://images.pokemontcg.io/base1/4.png',
            'https://resources.premierleague.com/premierleague/photos/players/250x250/p223094.png',
          ].map((src, i) => (
            <div key={i} className="rounded-md overflow-hidden"
                 style={{ width: 34, height: 48, border: '1px solid rgba(255,255,255,0.3)',
                          transform: `rotate(${(i - 1) * 10}deg)` }}>
              <img src={src} alt="carta" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Home principal ── */
export default function Home() {
  const { user } = useUserStore();

  return (
    <div className="relative overflow-hidden min-h-screen">

      {/* Decoraciones */}
      {HOLO_DECOS.map((d, i) => (
        <div key={i} className="holo-deco pointer-events-none"
             style={{
               position: 'fixed', top: d.top, left: d.left, right: d.right,
               width: d.w, height: d.h,
               transform: `rotate(${d.rot}deg)`,
               animation: `float ${4 + (i % 3)}s ease-in-out infinite`,
               animationDelay: d.delay, opacity: 0.5,
             }} />
      ))}

      {/* ── HERO ── */}
      <section className="relative max-w-7xl mx-auto px-6 pt-14 pb-10 flex flex-col lg:flex-row items-center justify-between gap-10">
        <div className="flex-1 max-w-xl animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-mc-border text-mc-purple text-xs font-bold mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-mc-purple animate-pulse" />
            MVP disponible — Pokémon, Fútbol y Yu-Gi-Oh
          </div>

          <h1 className="font-black leading-tight mb-4 text-mc-dark"
              style={{ fontSize: 'clamp(2.2rem, 5vw, 3.4rem)' }}>
            El Tinder de las<br />
            <span className="text-mc-purple">Cartas Coleccionables</span>
          </h1>

          <p className="text-mc-muted text-lg mb-8 leading-relaxed">
            ¡Tengo, Tengo, <span className="text-mc-purple font-black">Me Falta!</span> Deja de comprar, empieza a intercambiar.
            Tus colecciones, conectadas.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link to={user ? '/repes' : '/register'} className="btn-yellow uppercase tracking-wide">
              <span>📷</span> Subir Mis Repes
            </Link>
            <Link to="/album" className="btn-outline uppercase tracking-wide">
              <span>🔍</span> Explorar Álbumes
            </Link>
          </div>
        </div>

        <div className="hidden lg:block">
          <Binder />
        </div>
      </section>

      {/* ── CATEGORÍAS ── */}
      <section className="relative max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {CATEGORIAS.map((cat, i) => (
            <SeccionCategoria key={cat.titulo} categoria={cat} indice={i} />
          ))}
          <div className="hidden lg:flex justify-center items-end">
            <IlustracionPersonas />
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-mc-border/50 py-6 px-6 bg-white/60">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">

          {/* Solo Instagram con logo real */}
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 group"
            aria-label="Instagram"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:-translate-y-0.5"
                 style={{ background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="20" height="20" rx="5.5" ry="5.5" stroke="white" strokeWidth="2" fill="none"/>
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

          <div /> {/* spacer para centrar el copyright */}
        </div>
      </footer>
    </div>
  );
}
