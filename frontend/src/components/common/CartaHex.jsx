const CLIP = 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)';

const RAREZA_BG = {
  'common':      'linear-gradient(160deg, #374151 0%, #4b5563 100%)',
  'uncommon':    'linear-gradient(160deg, #14532d 0%, #16a34a 100%)',
  'rare':        'linear-gradient(160deg, #1e3a8a 0%, #2563eb 100%)',
  'ultra-rare':  'linear-gradient(160deg, #4c1d95 0%, #7c3aed 100%)',
  'secret-rare': 'linear-gradient(160deg, #78350f 0%, #d97706 100%)',
};

const RAREZA_GLOW = {
  'common':      'rgba(75,85,99,0.5)',
  'uncommon':    'rgba(22,163,74,0.5)',
  'rare':        'rgba(37,99,235,0.5)',
  'ultra-rare':  'rgba(124,58,237,0.6)',
  'secret-rare': 'rgba(217,119,6,0.6)',
};

const EMOJI_RAREZA = {
  'common':      '🃏',
  'uncommon':    '🌿',
  'rare':        '💎',
  'ultra-rare':  '🔮',
  'secret-rare': '✨',
};

export default function CartaHex({ cromo, size = 130, glow = false, className = '' }) {
  if (!cromo) return null;

  const border  = Math.round(size * 0.055);
  const rareza  = cromo.rareza || 'common';
  const bg      = RAREZA_BG[rareza] || RAREZA_BG.common;
  const glowClr = RAREZA_GLOW[rareza] || RAREZA_GLOW.common;
  const emoji   = EMOJI_RAREZA[rareza] || '🃏';

  return (
    <div
      className={`flex-shrink-0 transition-transform duration-300 hover:-translate-y-1 ${className}`}
      style={{ width: size }}
    >
      <div
        style={{
          clipPath:    CLIP,
          background:  '#1c0a00',
          padding:     border,
          aspectRatio: '1 / 1.15',
          boxShadow:   glow ? `0 0 28px ${glowClr}, 0 0 60px ${glowClr}40` : 'none',
        }}
      >
        <div
          style={{
            clipPath:   CLIP,
            background: bg,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10% 8%',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '40%',
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.18), transparent)',
            pointerEvents: 'none',
          }} />

          
          <div className="flex justify-between w-full">
            <span style={{ fontSize: size * 0.08, color: 'rgba(255,255,255,0.6)', fontWeight: 700, fontFamily: 'monospace' }}>
              #{String(cromo.numero).padStart(3, '0')}
            </span>
            <span style={{ fontSize: size * 0.075, color: 'rgba(255,255,255,0.5)' }}>◆</span>
          </div>

          
          <div className="flex items-center justify-center flex-1 py-1">
            {cromo.imagenUrl ? (
              <img
                src={cromo.imagenUrl}
                alt={cromo.nombre}
                style={{ maxWidth: '80%', maxHeight: '65%', objectFit: 'contain',
                         filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.6))' }}
                onError={e => { e.target.style.display = 'none'; }}
              />
            ) : (
              <span style={{ fontSize: size * 0.32, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))' }}>
                {emoji}
              </span>
            )}
          </div>

          
          <div className="w-full text-center">
            <p style={{
              fontSize: size * 0.09,
              fontWeight: 900,
              color: '#fff',
              textShadow: '0 1px 4px rgba(0,0,0,0.8)',
              lineHeight: 1.1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '100%',
            }}>
              {cromo.nombre}
            </p>
            <p style={{ fontSize: size * 0.07, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>
              {cromo.expansion}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
