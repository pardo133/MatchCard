import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { toast } from 'react-hot-toast';

const RAREZA_CARD = {
  'secret-rare': { borde: '#d97706', glow: 'rgba(217,119,6,0.55)',  bg: 'linear-gradient(160deg,#78350f,#d97706)', emoji: '✨' },
  'ultra-rare':  { borde: '#7c3aed', glow: 'rgba(124,58,237,0.5)', bg: 'linear-gradient(160deg,#4c1d95,#7c3aed)', emoji: '🔮' },
  'rare':        { borde: '#2563eb', glow: 'rgba(37,99,235,0.45)',  bg: 'linear-gradient(160deg,#1e3a8a,#3b82f6)', emoji: '💎' },
  'uncommon':    { borde: '#16a34a', glow: 'rgba(22,163,74,0.45)',  bg: 'linear-gradient(160deg,#14532d,#22c55e)', emoji: '🌿' },
  'common':      { borde: '#6b7280', glow: 'rgba(107,114,128,0.35)',bg: 'linear-gradient(160deg,#1f2937,#4b5563)', emoji: '🃏' },
};

function CartaAlbum({ cromo }) {
  const [flipped, setFlipped] = useState(false);
  const r = RAREZA_CARD[cromo.rareza] || RAREZA_CARD.common;
  const W = 80;
  const H = Math.round(W * 1.4);

  return (
    <div style={{ perspective: '700px', width: W, cursor: 'pointer', flexShrink: 0 }}
         onClick={() => setFlipped(f => !f)}
         title={cromo.nombre}>
      <div style={{ width: W, height: H, position: 'relative', transformStyle: 'preserve-3d',
                    transition: 'transform 0.5s', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0)' }}>

        {/* Frente */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 8, overflow: 'hidden', backfaceVisibility: 'hidden',
          border: `2px solid ${r.borde}70`,
          boxShadow: `0 3px 12px ${r.glow}50`,
          background: cromo.imagenUrl ? '#111' : r.bg,
          transition: 'transform 0.2s',
        }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.06) translateY(-3px)')}
          onMouseLeave={e => (e.currentTarget.style.transform = '')}>
          {cromo.imagenUrl ? (
            <>
              <img src={cromo.imagenUrl} alt={cromo.nombre}
                   style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                   onError={e => { e.target.style.display = 'none'; }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0,
                            background: 'linear-gradient(transparent,rgba(0,0,0,0.85))', padding: '12px 4px 4px' }}>
                <p style={{ color: '#fff', fontSize: 8, fontWeight: 900, textAlign: 'center',
                             overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {cromo.nombre}
                </p>
              </div>
            </>
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
                          alignItems: 'center', justifyContent: 'space-between', padding: '6px 4px' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '38%',
                            background: 'linear-gradient(to bottom,rgba(255,255,255,0.14),transparent)', pointerEvents: 'none' }} />
              <span style={{ fontSize: W * 0.28, lineHeight: 1, zIndex: 1 }}>{r.emoji}</span>
              <p style={{ color: '#fff', fontSize: 7.5, fontWeight: 900, textAlign: 'center', zIndex: 1,
                           overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                {cromo.nombre}
              </p>
            </div>
          )}
          {/* Badge ✓ */}
          <div style={{ position: 'absolute', top: 3, right: 3, width: 14, height: 14, borderRadius: '50%',
                        background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontSize: 7, fontWeight: 900 }}>✓</span>
          </div>
        </div>

        {/* Reverso */}
        <div style={{ position: 'absolute', inset: 0, borderRadius: 8, backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)', background: '#ede9fe', border: '2px solid #ddd6fe',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      padding: 6, textAlign: 'center', gap: 3 }}>
          <p style={{ fontSize: 9, fontWeight: 900, color: '#1e1b4b', lineHeight: 1.2 }}>{cromo.nombre}</p>
          <p style={{ fontSize: 7.5, color: '#6b7280' }}>{cromo.expansion}</p>
          <span style={{ fontSize: 7, background: '#dcfce7', color: '#166534', borderRadius: 20, padding: '2px 6px', fontWeight: 700 }}>
            🔄 De sobra
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Carpeta de sección (acordeón) ── */
function Carpeta({ seccion, cartas }) {
  const [abierta, setAbierta] = useState(true);

  return (
    <section className="mb-6">
      {/* Header carpeta */}
      <button
        onClick={() => setAbierta(a => !a)}
        className="w-full flex items-center gap-3 mb-3 group text-left"
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-transform group-hover:scale-110"
             style={{ background: 'linear-gradient(135deg, #ede9fe, #c4b5fd)' }}>
          📁
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-black text-mc-dark text-base truncate">{seccion}</h2>
            <span className="text-xs font-bold text-mc-purple bg-mc-light px-2.5 py-0.5 rounded-full flex-shrink-0">
              {cartas.length} cromo{cartas.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <span className="text-mc-muted text-sm transition-transform"
              style={{ transform: abierta ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          ▼
        </span>
      </button>

      {abierta && (
        <div className="flex flex-wrap gap-3">
          {cartas
            .sort((a, b) => a.numero - b.numero)
            .map(cromo => <CartaAlbum key={cromo._id} cromo={cromo} />)}
        </div>
      )}
    </section>
  );
}

export default function Album() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    axiosClient.get('/users/profile')
      .then(({ data }) => setProfile(data.user))
      .catch(() => toast.error('Error cargando el álbum'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-wrap gap-3">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-mc-light animate-pulse flex-shrink-0" style={{ width: 80, height: 112 }} />
        ))}
      </div>
    </div>
  );

  const misRepes = profile?.inventario.repetidos || [];

  // Filtrar por búsqueda
  const filtradas = busqueda.trim()
    ? misRepes.filter(c =>
        c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.expansion?.toLowerCase().includes(busqueda.toLowerCase()) ||
        String(c.numero).includes(busqueda)
      )
    : misRepes;

  // Agrupar por sección (expansion)
  const porSeccion = filtradas.reduce((acc, cromo) => {
    const sec = cromo.expansion || 'Sin sección';
    if (!acc[sec]) acc[sec] = [];
    acc[sec].push(cromo);
    return acc;
  }, {});

  const secciones = Object.entries(porSeccion).sort(([a], [b]) => a.localeCompare(b));

  if (misRepes.length === 0) return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <div className="text-6xl mb-4 animate-float inline-block">📖</div>
      <h2 className="text-2xl font-black text-mc-dark mb-3">Tu álbum está vacío</h2>
      <p className="text-mc-muted mb-6 max-w-md mx-auto">
        Ve a <strong>Mis Repes</strong> y añade tus repetidas. Aquí las verás organizadas por secciones.
      </p>
      <Link to="/repes" className="btn-yellow inline-flex">
        ➕ Añadir mis repetidas
      </Link>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-black text-mc-dark mb-1">Mi Álbum Virtual</h1>
          <p className="text-mc-muted text-sm">
            {misRepes.length} cromos repetidos · {secciones.length} sección{secciones.length !== 1 ? 'es' : ''}
            · Haz clic en una carta para voltearla
          </p>
        </div>

        {/* Buscador */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-mc-muted">🔍</span>
          <input
            type="text"
            placeholder="Buscar cromo…"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="pl-9 pr-4 py-2.5 rounded-xl text-sm text-mc-dark outline-none transition-all"
            style={{ background: '#f5f3ff', border: '2px solid #ddd6fe', width: 220 }}
            onFocus={e  => (e.target.style.borderColor = '#5b21b6')}
            onBlur={e   => (e.target.style.borderColor = '#ddd6fe')}
          />
        </div>
      </div>

      {/* Sin resultados de búsqueda */}
      {busqueda && filtradas.length === 0 && (
        <div className="text-center py-12">
          <p className="text-mc-muted">No hay cromos que coincidan con "{busqueda}"</p>
        </div>
      )}

      {/* Carpetas por sección */}
      {secciones.map(([seccion, cartas]) => (
        <Carpeta key={seccion} seccion={seccion} cartas={cartas} />
      ))}
    </div>
  );
}
