import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import ProgressBar from '../components/common/ProgressBar';
import { toast } from 'react-hot-toast';

const RAREZA_COLOR = {
  'common':      'ring-gray-300 bg-gray-50',
  'uncommon':    'ring-green-300 bg-green-50',
  'rare':        'ring-blue-300 bg-blue-50',
  'ultra-rare':  'ring-purple-300 bg-purple-50',
  'secret-rare': 'ring-amber-300 bg-amber-50',
};

/* ── Carta individual del álbum ── */
function CartaAlbum({ cromo, estado }) {
  const [flipped, setFlipped] = useState(false);
  const color = RAREZA_COLOR[cromo.rareza] || RAREZA_COLOR.common;
  const tengo = estado === 'repetidos';

  return (
    <div
      className="cursor-pointer"
      style={{ perspective: '600px' }}
      onClick={() => setFlipped(f => !f)}
      title={`${cromo.nombre} — ${tengo ? '¡La tengo!' : 'Me falta'}`}
    >
      <div
        className="relative transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          aspectRatio: '2/3',
        }}
      >
        {/* Frente */}
        <div
          className={`absolute inset-0 rounded-xl border-2 overflow-hidden flex flex-col
            ${tengo ? `ring-2 ${color}` : 'ring-0 border-dashed border-gray-200 opacity-45'}
            transition-all duration-300 hover:scale-105`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {cromo.imagenUrl ? (
            <img src={cromo.imagenUrl} alt={cromo.nombre}
                 className="w-full h-full object-cover"
                 onError={e => { e.target.style.display = 'none'; }} />
          ) : (
            <div className={`w-full h-full flex flex-col items-center justify-center gap-1 p-1
              ${tengo ? 'bg-gradient-to-br from-mc-light to-white' : 'bg-gray-100'}`}>
              <span className="text-2xl">{tengo ? '🃏' : '❓'}</span>
              <p className="text-[9px] font-bold text-center text-mc-dark leading-tight px-1 truncate w-full text-center">
                {tengo ? cromo.nombre : '???'}
              </p>
            </div>
          )}

          {/* Número */}
          <div className="absolute top-1 left-1 bg-black/50 text-white text-[8px] font-mono px-1 rounded">
            #{String(cromo.numero).padStart(3, '0')}
          </div>

          {/* Badge estado */}
          {tengo && (
            <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
              <span className="text-white text-[8px] font-black">✓</span>
            </div>
          )}
        </div>

        {/* Reverso */}
        <div
          className="absolute inset-0 rounded-xl bg-mc-light border-2 border-mc-border flex flex-col items-center justify-center p-2 text-center"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <p className="text-xs font-black text-mc-dark leading-tight mb-1">{cromo.nombre}</p>
          <p className="text-[10px] text-mc-muted mb-1">{cromo.expansion}</p>
          <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold
            ${tengo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {tengo ? '¡La tengo!' : 'Me falta'}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Álbum principal ── */
export default function Album() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosClient.get('/users/profile')
      .then(({ data }) => setProfile(data.user))
      .catch(() => toast.error('Error cargando el álbum'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-mc-light animate-pulse" style={{ aspectRatio: '2/3' }} />
          ))}
        </div>
      </div>
    );
  }

  const repetidos = profile?.inventario.repetidos || [];
  const faltas    = profile?.inventario.faltas    || [];

  // Todas las cartas del usuario (sin duplicados)
  const todasMap = new Map();
  repetidos.forEach(c => todasMap.set(c._id, { cromo: c, estado: 'repetidos' }));
  faltas.forEach(c => {
    if (!todasMap.has(c._id)) todasMap.set(c._id, { cromo: c, estado: 'faltas' });
  });
  const todas = [...todasMap.values()];

  // Agrupar por colección (expansion)
  const porColeccion = todas.reduce((acc, { cromo, estado }) => {
    const col = cromo.expansion || 'Sin colección';
    if (!acc[col]) acc[col] = [];
    acc[col].push({ cromo, estado });
    return acc;
  }, {});

  const colecciones = Object.entries(porColeccion).sort(([a], [b]) => a.localeCompare(b));
  const totalCartas = todas.length;
  const cartasTengo = repetidos.length;

  // Empty state
  if (totalCartas === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4 animate-float inline-block">📖</div>
        <h2 className="text-2xl font-black text-mc-dark mb-3">Tu álbum está vacío</h2>
        <p className="text-mc-muted mb-6 max-w-md mx-auto">
          Ve a <strong>Mis Repes</strong> y añade tus primeras cartas. Las podrás ver aquí agrupadas por colección.
        </p>
        <a href="/repes" className="btn-yellow inline-flex">
          <span>➕</span> Añadir mis primeras cartas
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-mc-dark mb-1">Mi Álbum Virtual</h1>
        <p className="text-mc-muted text-sm mb-5">
          Haz clic en una carta para voltearla · Verde = la tengo · Gris = me falta
        </p>

        {/* Progreso global */}
        <div className="card-white p-5">
          <ProgressBar
            current={cartasTengo}
            total={totalCartas}
            label={`Cartas conseguidas de ${colecciones.length} colección${colecciones.length !== 1 ? 'es' : ''}`}
          />
          {cartasTengo === totalCartas && totalCartas > 0 && (
            <div className="mt-3 flex items-center gap-2 text-amber-600 animate-badge-pop">
              <span>🏆</span>
              <span className="font-black">¡Tienes todas las cartas de tu colección!</span>
            </div>
          )}
        </div>
      </div>

      {/* Una sección por colección */}
      {colecciones.map(([coleccion, cartas]) => {
        const tengo    = cartas.filter(c => c.estado === 'repetidos').length;
        const total    = cartas.length;
        const completa = tengo === total;

        return (
          <section key={coleccion} className="mb-10">
            {/* Header de colección */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-black text-lg text-mc-dark">{coleccion}</h2>
                  {completa && (
                    <span className="badge bg-amber-100 text-amber-700 border border-amber-200 animate-badge-pop">
                      🏆 Completa
                    </span>
                  )}
                </div>
                <ProgressBar current={tengo} total={total} label={`${tengo} de ${total} cartas`} />
              </div>
            </div>

            {/* Grid de cartas */}
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
              {cartas
                .sort((a, b) => a.cromo.numero - b.cromo.numero)
                .map(({ cromo, estado }) => (
                  <CartaAlbum key={cromo._id} cromo={cromo} estado={estado} />
                ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
