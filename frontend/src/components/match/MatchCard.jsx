const RARITY_STYLE = {
  'common':      'bg-gray-700/50 text-gray-300',
  'uncommon':    'bg-green-900/50 text-green-300',
  'rare':        'bg-blue-900/50 text-blue-300',
  'ultra-rare':  'bg-purple-900/50 text-purple-300',
  'secret-rare': 'bg-amber-900/50 text-amber-300',
};

const STATUS_STYLE = {
  pending:   'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  accepted:  'bg-green-500/10 text-green-400 border-green-500/30',
  rejected:  'bg-red-500/10 text-red-400 border-red-500/30',
  completed: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
};

function CromoChip({ cromo }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs border border-pokemon-border ${RARITY_STYLE[cromo.rareza] || RARITY_STYLE.common}`}>
      <span className="font-mono">#{cromo.numero}</span>
      <span>{cromo.nombre}</span>
    </span>
  );
}

export default function MatchCard({ match, currentUserId, onAccept, onReject }) {
  const isUserA     = String(match.userA?._id) === String(currentUserId);
  const counterpart = isUserA ? match.userB : match.userA;
  const iGive       = isUserA ? match.cromosDeAparaB : match.cromosDeBparaA;
  const iGet        = isUserA ? match.cromosDeBparaA : match.cromosDeAparaB;

  return (
    <div className="card-pokemon p-5 animate-slide-in group">
      
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-pokemon-blue/20 border border-pokemon-blue/30 flex items-center justify-center text-lg">
            👤
          </div>
          <div>
            <p className="font-bold text-white">{counterpart?.username}</p>
            <p className="text-xs text-gray-400">📍 {match.ciudad}</p>
          </div>
        </div>
        <span className={`badge border ${STATUS_STYLE[match.status]}`}>
          {match.status}
        </span>
      </div>

      
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-pokemon-dark/60 rounded-xl p-3 border border-pokemon-border">
          <p className="text-xs font-semibold text-green-400 mb-2 flex items-center gap-1">
            <span>📤</span> Yo doy ({iGive?.length})
          </p>
          <div className="flex flex-wrap gap-1">
            {iGive?.map(c => <CromoChip key={c._id} cromo={c} />)}
          </div>
        </div>
        <div className="bg-pokemon-dark/60 rounded-xl p-3 border border-pokemon-border">
          <p className="text-xs font-semibold text-pokemon-yellow mb-2 flex items-center gap-1">
            <span>📥</span> Yo recibo ({iGet?.length})
          </p>
          <div className="flex flex-wrap gap-1">
            {iGet?.map(c => <CromoChip key={c._id} cromo={c} />)}
          </div>
        </div>
      </div>

      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500">Compatibilidad</span>
          {Array.from({ length: Math.min(5, (iGive?.length || 0) + (iGet?.length || 0)) }).map((_, i) => (
            <span key={i} className="text-pokemon-yellow text-xs">⭐</span>
          ))}
        </div>
        {match.status === 'pending' && (
          <div className="flex gap-2">
            <button
              onClick={() => onReject(match._id)}
              className="px-4 py-1.5 rounded-lg text-sm border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
            >
              Rechazar
            </button>
            <button
              onClick={() => onAccept(match._id)}
              className="px-4 py-1.5 rounded-lg text-sm bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 transition-colors font-semibold"
            >
              Aceptar ✓
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
