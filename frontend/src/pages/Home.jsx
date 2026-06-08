import { useRef, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import axiosClient from '../api/axiosClient';

const CHARACTER_ANIMATIONS = `
  @keyframes floatY {
    0%,100% { transform: translateY(0px); }
    50%      { transform: translateY(-10px); }
  }
  @keyframes floatSway {
    0%,100% { transform: translateY(0px) rotate(-2deg); }
    50%      { transform: translateY(-9px) rotate(2deg); }
  }
  @keyframes batSwing {
    0%,100% { transform: rotate(0deg); }
    40%     { transform: rotate(-28deg); }
    55%     { transform: rotate(8deg); }
    70%     { transform: rotate(-6deg); }
  }
  @keyframes ballFly {
    0%,60%,100% { transform: translate(0,0) scale(1); opacity:1; }
    80%         { transform: translate(22px,-18px) scale(0.8); opacity:0.6; }
  }
`;

function PikachuSVG() {
  return (
    <svg width="120" height="138" viewBox="0 0 120 138" fill="none"
         style={{ filter: 'drop-shadow(0 14px 28px rgba(250,204,21,0.7))' }}>
      <g style={{ animation: 'floatSway 2.6s ease-in-out infinite' }}>
        {/* Orejas */}
        <path d="M30 46 L18 4 L50 28 Z" fill="#FFCB05"/>
        <path d="M32 44 L22 8 L48 28 Z" fill="#1a1a1a"/>
        <path d="M90 46 L102 4 L70 28 Z" fill="#FFCB05"/>
        <path d="M88 44 L98 8 L72 28 Z" fill="#1a1a1a"/>

        {/* Cabeza */}
        <ellipse cx="60" cy="58" rx="38" ry="36" fill="#FFCB05"/>

        {/* Ojos */}
        <ellipse cx="44" cy="52" rx="7.5" ry="8" fill="#1a1a1a"/>
        <ellipse cx="76" cy="52" rx="7.5" ry="8" fill="#1a1a1a"/>
        <circle cx="41.5" cy="49" r="2.8" fill="white"/>
        <circle cx="73.5" cy="49" r="2.8" fill="white"/>

        {/* Nariz */}
        <ellipse cx="60" cy="63" rx="2.5" ry="1.8" fill="#8B4513"/>

        {/* Boca */}
        <path d="M50 67 Q55 74 60 70 Q65 66 70 67" stroke="#1a1a1a" strokeWidth="2.2" strokeLinecap="round" fill="none"/>

        {/* Mejillas rojas */}
        <ellipse cx="26" cy="70" rx="12" ry="9.5" fill="#FF3333" opacity="0.88"/>
        <ellipse cx="94" cy="70" rx="12" ry="9.5" fill="#FF3333" opacity="0.88"/>

        {/* Cuerpo */}
        <ellipse cx="58" cy="107" rx="34" ry="27" fill="#FFCB05"/>

        {/* Barriga blanca */}
        <ellipse cx="58" cy="111" rx="22" ry="17" fill="#FFF5A0"/>

        {/* Rayas marrones */}
        <path d="M30 90 Q58 84 86 90" stroke="#B8620A" strokeWidth="5" strokeLinecap="round" fill="none"/>
        <path d="M28 102 Q58 96 88 102" stroke="#B8620A" strokeWidth="5" strokeLinecap="round" fill="none"/>

        {/* Brazos */}
        <ellipse cx="27" cy="104" rx="9" ry="13" fill="#FFCB05" transform="rotate(-15 27 104)"/>
        <ellipse cx="89" cy="104" rx="9" ry="13" fill="#FFCB05" transform="rotate(15 89 104)"/>

        {/* Patas */}
        <ellipse cx="44" cy="130" rx="12" ry="7" fill="#FFCB05"/>
        <ellipse cx="72" cy="130" rx="12" ry="7" fill="#FFCB05"/>
        <ellipse cx="43" cy="134" rx="13" ry="5.5" fill="#B8620A"/>
        <ellipse cx="73" cy="134" rx="13" ry="5.5" fill="#B8620A"/>

        {/* Cola rayo */}
        <path d="M88 96 L106 72 L97 68 L114 44 L95 62 L104 65 L86 89 Z"
              fill="#FFCB05" stroke="#B8620A" strokeWidth="1.8" strokeLinejoin="round"/>
        <path d="M106 72 L114 44 L95 62 L104 65 Z" fill="#B8620A"/>
      </g>
    </svg>
  );
}

function ChampionsSVG() {
  const stars8 = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
    const r = 46;
    return { cx: 60 + Math.cos(angle) * r, cy: 58 + Math.sin(angle) * r };
  });

  function Star({ cx, cy, r = 8 }) {
    const pts = Array.from({ length: 5 }, (_, i) => {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      const ai = a + Math.PI / 5;
      return `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r} ${cx + Math.cos(ai) * (r * 0.4)},${cy + Math.sin(ai) * (r * 0.4)}`;
    }).join(' ');
    return <polygon points={pts} fill="white"/>;
  }

  return (
    <svg width="120" height="120" viewBox="0 0 120 116" fill="none"
         style={{ filter: 'drop-shadow(0 12px 28px rgba(250,204,21,0.65))' }}>
      <g style={{ animation: 'floatY 2.8s ease-in-out infinite' }}>
        {/* Estrellas exteriores */}
        {stars8.map((s, i) => <Star key={i} cx={s.cx} cy={s.cy} r={7} />)}

        {/* Balón base */}
        <circle cx="60" cy="58" r="24" fill="#0a1628"/>
        <circle cx="60" cy="58" r="24" fill="none" stroke="white" strokeWidth="1.5"/>

        {/* Patrón balón — hexágono central */}
        <polygon points="60,38 75,47 75,65 60,74 45,65 45,47"
                 fill="none" stroke="white" strokeWidth="1.2" opacity="0.5"/>
        <polygon points="60,42 72,49.5 72,64.5 60,72 48,64.5 48,49.5"
                 fill="white" opacity="0.12"/>

        {/* Pentágonos laterales sugeridos */}
        <line x1="60" y1="38" x2="60" y2="34" stroke="white" strokeWidth="1" opacity="0.4"/>
        <line x1="75" y1="47" x2="79" y2="44" stroke="white" strokeWidth="1" opacity="0.4"/>
        <line x1="75" y1="65" x2="79" y2="68" stroke="white" strokeWidth="1" opacity="0.4"/>
        <line x1="60" y1="74" x2="60" y2="78" stroke="white" strokeWidth="1" opacity="0.4"/>
        <line x1="45" y1="65" x2="41" y2="68" stroke="white" strokeWidth="1" opacity="0.4"/>
        <line x1="45" y1="47" x2="41" y2="44" stroke="white" strokeWidth="1" opacity="0.4"/>

        {/* Brillo */}
        <ellipse cx="52" cy="48" rx="8" ry="5" fill="white" opacity="0.18" transform="rotate(-30 52 48)"/>

        {/* Texto UEFA */}
        <text x="60" y="57" textAnchor="middle" fontSize="6" fontWeight="900"
              fill="white" letterSpacing="1" opacity="0.85">UEFA</text>
        <text x="60" y="66" textAnchor="middle" fontSize="4.5" fontWeight="700"
              fill="white" letterSpacing="0.5" opacity="0.7">CHAMPIONS</text>

        {/* Arco inferior con "LEAGUE" */}
        <path d="M38 96 Q60 106 82 96" stroke="white" strokeWidth="1" fill="none" opacity="0.5"/>
        <text x="60" y="108" textAnchor="middle" fontSize="7.5" fontWeight="900"
              fill="white" letterSpacing="1.5">LEAGUE</text>
      </g>
    </svg>
  );
}

function OnePieceSVG() {
  return (
    <svg width="118" height="128" viewBox="0 0 118 128" fill="none"
         style={{ filter: 'drop-shadow(0 12px 28px rgba(239,68,68,0.6))' }}>
      <g style={{ animation: 'floatY 3s ease-in-out infinite' }}>
        {/* Sombrero de paja — ala */}
        <ellipse cx="59" cy="36" rx="52" ry="14" fill="#E8C84A"/>
        <ellipse cx="59" cy="33" rx="52" ry="13" fill="#F5D654"/>
        <ellipse cx="59" cy="30" rx="52" ry="11" fill="#E8C84A"/>

        {/* Sombrero — copa */}
        <ellipse cx="59" cy="26" rx="28" ry="10" fill="#F5D654"/>
        <path d="M31 26 Q31 4 59 4 Q87 4 87 26" fill="#F5D654"/>
        <ellipse cx="59" cy="4" rx="28" ry="8" fill="#E8C84A"/>

        {/* Banda roja del sombrero */}
        <path d="M10 32 Q59 42 108 32 Q108 38 59 48 Q10 38 10 32Z" fill="#DC2626"/>
        <path d="M10 32 Q59 37 108 32" stroke="#B91C1C" strokeWidth="1" fill="none"/>
        <path d="M10 38 Q59 43 108 38" stroke="#B91C1C" strokeWidth="0.8" fill="none"/>

        {/* Calavera — cráneo */}
        <ellipse cx="59" cy="82" rx="32" ry="30" fill="white"/>
        <ellipse cx="59" cy="78" rx="32" ry="27" fill="white"/>

        {/* Sombra en calavera */}
        <ellipse cx="59" cy="90" rx="26" ry="14" fill="#e8e8e8"/>

        {/* Ojos de calavera */}
        <ellipse cx="44" cy="76" rx="11" ry="13" fill="#1a1a1a"/>
        <ellipse cx="74" cy="76" rx="11" ry="13" fill="#1a1a1a"/>
        <ellipse cx="44" cy="75" rx="7" ry="8" fill="#2a2a2a"/>
        <ellipse cx="74" cy="75" rx="7" ry="8" fill="#2a2a2a"/>
        <circle cx="41" cy="72" r="3" fill="white" opacity="0.5"/>
        <circle cx="71" cy="72" r="3" fill="white" opacity="0.5"/>

        {/* Nariz calavera */}
        <path d="M54 88 L59 94 L64 88 Q59 85 54 88Z" fill="#d0d0d0"/>

        {/* Dientes */}
        <rect x="44" y="96" width="30" height="12" rx="2" fill="#1a1a1a"/>
        <line x1="49" y1="96" x2="49" y2="108" stroke="white" strokeWidth="1.5"/>
        <line x1="54" y1="96" x2="54" y2="108" stroke="white" strokeWidth="1.5"/>
        <line x1="59" y1="96" x2="59" y2="108" stroke="white" strokeWidth="1.5"/>
        <line x1="64" y1="96" x2="64" y2="108" stroke="white" strokeWidth="1.5"/>
        <line x1="69" y1="96" x2="69" y2="108" stroke="white" strokeWidth="1.5"/>

        {/* Huesos cruzados */}
        <path d="M8 115 Q20 108 30 115 L88 68 Q82 62 88 58 Q96 52 100 58 Q106 64 100 70 Q94 76 88 70 L30 117 Q32 123 28 126 Q20 130 14 124 Q8 118 14 112 Q20 106 26 112Z"
              fill="white" stroke="#ddd" strokeWidth="0.8"/>
        <path d="M110 115 Q98 108 88 115 L30 68 Q36 62 30 58 Q22 52 18 58 Q12 64 18 70 Q24 76 30 70 L88 117 Q86 123 90 126 Q98 130 104 124 Q110 118 104 112 Q98 106 92 112Z"
              fill="white" stroke="#ddd" strokeWidth="0.8"/>
      </g>
    </svg>
  );
}

function BeisbolSVG() {
  return (
    <svg width="118" height="118" viewBox="0 0 118 118" fill="none"
         style={{ filter: 'drop-shadow(0 12px 26px rgba(220,38,38,0.55))' }}>
      <style>{`
        @keyframes batSwingAnim {
          0%,100% { transform-origin:92px 95px; transform: rotate(0deg); }
          35%      { transform-origin:92px 95px; transform: rotate(-32deg); }
          55%      { transform-origin:92px 95px; transform: rotate(10deg); }
          70%      { transform-origin:92px 95px; transform: rotate(-4deg); }
        }
        @keyframes ballFlyAnim {
          0%,50%   { transform: translate(0,0); opacity:1; }
          100%     { transform: translate(-42px,-36px); opacity:0.4; }
        }
      `}</style>

      {/* Líneas de movimiento */}
      <line x1="38" y1="24" x2="12" y2="14" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
      <line x1="42" y1="30" x2="14" y2="26" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.45"/>
      <line x1="44" y1="37" x2="18" y2="37" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.3"/>

      {/* Pelota con animación */}
      <g style={{ animation: 'ballFlyAnim 1.8s ease-in-out infinite' }}>
        <circle cx="36" cy="30" r="14" fill="white" stroke="#e5e7eb" strokeWidth="1"/>
        {/* Costuras pelota */}
        <path d="M26 26 Q28 30 26 34" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" fill="none"/>
        <path d="M46 26 Q44 30 46 34" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" fill="none"/>
        <path d="M27 26 Q32 24 36 26 Q40 28 41 26" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <path d="M27 34 Q32 36 36 34 Q40 32 41 34" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      </g>

      {/* Bate con animación de swing */}
      <g style={{ animation: 'batSwingAnim 2s ease-in-out infinite' }}>
        {/* Mango */}
        <rect x="85" y="90" width="11" height="36" rx="5.5" fill="#92400e"
              transform="rotate(-42 90 108)"/>
        {/* Cuerpo del bate */}
        <path d="M50 36 Q42 34 40 40 Q38 48 44 54 Q52 60 62 64 Q78 70 88 78 Q96 85 94 92 Q92 98 88 96 Q82 92 70 84 Q58 76 48 70 Q36 63 32 54 Q28 44 34 38 Q40 32 50 36Z"
              fill="#A16207"/>
        {/* Grano de madera */}
        <path d="M50 38 Q48 46 52 58 Q56 68 64 74" stroke="#854D0E" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6"/>
        <path d="M54 36 Q53 44 57 56 Q61 66 68 72" stroke="#854D0E" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.4"/>
        {/* Parte ancha */}
        <ellipse cx="44" cy="46" rx="8" ry="10" fill="#CA8A04" opacity="0.5" transform="rotate(-42 44 46)"/>
        {/* Brillo */}
        <path d="M48 38 Q44 50 46 60" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.3"/>
      </g>

      {/* Impacto — destellos */}
      <g style={{ animation: 'floatY 1.8s ease-in-out infinite' }}>
        <path d="M52 52 L56 46 L58 52 L64 50 L60 56 L66 58 L58 58 L56 66 L54 58 L46 58 L52 54Z"
              fill="#FCD34D" opacity="0.85"/>
      </g>
    </svg>
  );
}

const CATEGORIES = [
  {
    Character: PikachuSVG,
    title: 'Pokémon',
    desc: 'Encuentra tu Pikachu, Charizard y los holográficos más raros. La colección que marcó una generación.',
    gradient: 'linear-gradient(160deg, #1e1b4b 0%, #3730a3 50%, #4f46e5 100%)',
  },
  {
    Character: ChampionsSVG,
    title: 'Fútbol',
    desc: 'Cromos de Liga, Champions y Mundiales. Completa tu Panini con los mejores jugadores del planeta.',
    gradient: 'linear-gradient(160deg, #052e16 0%, #166534 50%, #16a34a 100%)',
  },
  {
    Character: OnePieceSVG,
    title: 'Anime',
    desc: 'Dragon Ball, Naruto, One Piece y más. Las cartas de tus personajes favoritos en un solo lugar.',
    gradient: 'linear-gradient(160deg, #4a044e 0%, #86198f 50%, #d946ef 100%)',
  },
  {
    Character: BeisbolSVG,
    title: 'Béisbol',
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

function CategoryCard({ Character, title, desc, gradient }) {
  return (
    <div className="relative flex-shrink-0" style={{ width: 290 }}>
      <div className="absolute left-1/2 z-10 pointer-events-none select-none"
           style={{ top: -56, transform: 'translateX(-50%)' }}>
        <Character />
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

function HeroBuscador({ usuario }) {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate  = useNavigate();
  const timerRef  = useRef(null);

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
          onFocus={e => (e.target.style.borderColor = '#4338ca')}
          onBlur={e  => (e.target.style.borderColor = '#e0e7ff')}
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
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider">Cromos encontrados</p>
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

export default function Home() {
  const { user }  = useUserStore();
  const scrollRef = useRef(null);
  const scroll    = dir => scrollRef.current?.scrollBy({ left: dir * 314, behavior: 'smooth' });

  return (
    <div className="min-h-screen" style={{ background: '#fff' }}>
      <style>{CHARACTER_ANIMATIONS}</style>

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
          <p className="text-gray-500 leading-relaxed max-w-xl mx-auto mb-3" style={{ fontSize: '1.05rem' }}>
            Busca el cromo que te falta, descubre quién lo tiene de sobra
            y contacta directamente para hacer el intercambio.
          </p>
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
             style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem', paddingTop: '3.75rem',
                      overflowX: 'auto', overflowY: 'visible' }}>
          {CATEGORIES.map(cat => <CategoryCard key={cat.title} {...cat} />)}
          <div style={{ flex: '0 0 1px' }} />
        </div>
      </section>

      <section className="py-16 px-6" style={{ background: '#f9fafb' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-black text-gray-900 text-3xl mb-3 tracking-tight">¿Por qué MatchCard?</h2>
          <p className="text-gray-500 text-lg mb-12 max-w-xl mx-auto">
            La forma más sencilla de encontrar quién tiene lo que necesitas.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '🔍', title: 'Busca tu cromo', desc: 'Escribe el nombre del cromo que te falta y al momento ves qué coleccionistas lo tienen de sobra.' },
              { icon: '💬', title: 'Contacto directo', desc: 'Chatea dentro de MatchCard o usa email y teléfono. Sin intermediarios.' },
              { icon: '🔄', title: 'Intercambio real', desc: 'Quedáis en persona o por correo, hacéis el trueque y completáis vuestras colecciones. Así de simple.' },
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

      {!user && (
        <section className="py-16 px-6"
                 style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 60%, #6d28d9 100%)' }}>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-black text-white text-3xl mb-4 tracking-tight">Únete a MatchCard</h2>
            <p className="text-white/75 text-lg mb-10 leading-relaxed max-w-lg mx-auto">
              Regístrate gratis, sube tus repetidas y empieza a contactar con coleccionistas que tienen lo que necesitas.
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

      <footer style={{ background: '#0f0e1a', borderTop: '1px solid rgba(255,255,255,0.06)' }} className="py-6 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <p className="text-gray-600 text-xs text-center">© 2026 MatchCard — Plataforma de Intercambio de Cromos</p>
        </div>
      </footer>
    </div>
  );
}
