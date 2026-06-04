import { useState, useCallback, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { toast }   from 'react-hot-toast';
import { useUserStore } from '../store/userStore';

const CATEGORIAS = ['Todos', 'Pokémon', 'Deportes', 'Anime', 'Otros'];
const ICONO_CAT  = { Todos: '🔍', 'Pokémon': '⚡', Deportes: '⚽', Anime: '🌸', Otros: '✨' };

const RAREZA_ESTILO = {
  'secret-rare': { bg: 'rgba(120,53,15,0.18)',  borde: '#92400e', texto: '#fde68a' },
  'ultra-rare':  { bg: 'rgba(76,29,149,0.18)',  borde: '#6d28d9', texto: '#ddd6fe' },
  'rare':        { bg: 'rgba(30,58,138,0.18)',  borde: '#1d4ed8', texto: '#bfdbfe' },
  'uncommon':    { bg: 'rgba(20,83,45,0.18)',   borde: '#15803d', texto: '#bbf7d0' },
  'common':      { bg: 'rgba(55,65,81,0.12)',   borde: '#4b5563', texto: '#d1d5db' },
};

const RAREZA_CARD = {
  'secret-rare': { borde: '#d97706', glow: 'rgba(217,119,6,0.65)',  bg: 'linear-gradient(160deg,#78350f,#d97706)', emoji: '✨' },
  'ultra-rare':  { borde: '#7c3aed', glow: 'rgba(124,58,237,0.6)',  bg: 'linear-gradient(160deg,#4c1d95,#7c3aed)', emoji: '🔮' },
  'rare':        { borde: '#2563eb', glow: 'rgba(37,99,235,0.5)',   bg: 'linear-gradient(160deg,#1e3a8a,#3b82f6)', emoji: '💎' },
  'uncommon':    { borde: '#16a34a', glow: 'rgba(22,163,74,0.5)',   bg: 'linear-gradient(160deg,#14532d,#22c55e)', emoji: '🌿' },
  'common':      { borde: '#6b7280', glow: 'rgba(107,114,128,0.4)', bg: 'linear-gradient(160deg,#1f2937,#4b5563)', emoji: '🃏' },
};

function ModalCartaGrande({ carta, usuario, onClose, onChatear }) {
  const [saliendo, setSaliendo] = useState(false);
  const [holoStyle, setHoloStyle] = useState({});
  const cardRef = useRef(null);

  const r = RAREZA_CARD[carta.rareza] ?? RAREZA_CARD.common;
  const W = 260;
  const H = Math.round(W * 1.4);

  const cerrar = useCallback(() => {
    setSaliendo(true);
    setTimeout(onClose, 280);
  }, [onClose]);

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') cerrar(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [cerrar]);

  const handleMouseMove = useCallback(e => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setHoloStyle({
      background: `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.22) 0%, rgba(167,139,250,0.1) 40%, transparent 65%)`,
    });
  }, []);

  const handleMouseLeave = useCallback(() => setHoloStyle({}), []);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.80)',
        backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'overlayFadeIn 0.25s ease',
        padding: '20px', overflowY: 'auto',
      }}
      onClick={cerrar}
    >
      <div
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
          animation: saliendo
            ? 'modalCardSalida 0.28s ease forwards'
            : 'modalCardEntrada 0.52s cubic-bezier(0.34,1.56,0.64,1) forwards',
          width: '100%', maxWidth: W + 48,
        }}
        onClick={e => e.stopPropagation()}
      >
        
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative holo-sweep overflow-hidden"
          style={{
            width: W, height: H, borderRadius: 16, flexShrink: 0,
            border: `3px solid ${r.borde}`,
            boxShadow: `0 0 48px ${r.glow}, 0 24px 64px rgba(0,0,0,0.5)`,
            background: carta.imagenUrl ? '#111' : r.bg,
          }}
        >
          {carta.imagenUrl ? (
            <>
              <img src={carta.imagenUrl} alt={carta.nombre}
                   style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                   onError={e => { e.target.style.display = 'none'; }} />
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'linear-gradient(transparent, rgba(0,0,0,0.92))',
                padding: '28px 14px 14px',
              }}>
                <p style={{ color: '#fff', fontSize: 15, fontWeight: 900, textAlign: 'center' }}>{carta.nombre}</p>
                {carta.expansion && (
                  <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10, textAlign: 'center', marginTop: 3 }}>
                    {carta.expansion}
                  </p>
                )}
              </div>
            </>
          ) : (
            <div style={{
              width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'space-between', padding: '24px 16px',
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '38%',
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.16), transparent)',
                pointerEvents: 'none',
              }} />
              <span style={{ fontSize: 80, lineHeight: 1, zIndex: 1, marginTop: 16 }}>{r.emoji}</span>
              <div style={{ textAlign: 'center', zIndex: 1 }}>
                <p style={{ color: '#fff', fontSize: 16, fontWeight: 900 }}>{carta.nombre}</p>
                {carta.expansion && (
                  <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, marginTop: 4 }}>{carta.expansion}</p>
                )}
              </div>
            </div>
          )}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 14,
            pointerEvents: 'none', transition: 'background 0.12s ease', ...holoStyle,
          }} />
        </div>

        
        <div style={{
          background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(14px)',
          border: '1px solid rgba(255,255,255,0.18)', borderRadius: 16,
          padding: '16px 20px', width: '100%', color: '#fff',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{
              width: 42, height: 42, borderRadius: '50%',
              background: 'linear-gradient(135deg, #ede9fe, #c4b5fd)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, flexShrink: 0,
            }}>👤</div>
            <div>
              <p style={{ fontWeight: 900, fontSize: 14, margin: 0 }}>@{usuario.username}</p>
              <p style={{ fontSize: 12, opacity: 0.65, margin: 0 }}>📍 {usuario.ciudad}</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <ContactLink href={`mailto:${usuario.email}`} icon="✉️" label={usuario.email}
              style={{ background: 'rgba(99,102,241,0.22)', border: '1px solid rgba(99,102,241,0.4)', color: '#c7d2fe' }} />
            {usuario.telefono && (
              <ContactLink href={`tel:${usuario.telefono}`} icon="📞" label={usuario.telefono}
                style={{ background: 'rgba(34,197,94,0.18)', border: '1px solid rgba(34,197,94,0.35)', color: '#86efac' }} />
            )}
            <button
              onClick={() => onChatear(usuario._id, [])}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 14px', borderRadius: 12,
                background: 'linear-gradient(135deg, #5b21b6, #7c3aed)',
                border: 'none', color: '#fff', fontSize: 13,
                fontWeight: 800, cursor: 'pointer',
              }}>
              💬 Chatear en MatchCard
            </button>
          </div>
        </div>

        <button onClick={cerrar}
          style={{
            background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)',
            color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            padding: '8px 28px', borderRadius: 30,
          }}>
          ✕ Cerrar
        </button>
      </div>
    </div>
  );
}

function ContactLink({ href, icon, label, style }) {
  const [countdown, setCountdown] = useState(null);

  const handleClick = e => {
    e.preventDefault();
    setCountdown(5);
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      setCountdown(null);
      window.open(href, '_blank', 'noopener');
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, href]);

  return (
    <>
      <a href={href} onClick={handleClick}
         style={{
           display: 'flex', alignItems: 'center', gap: 8,
           padding: '9px 14px', borderRadius: 10, textDecoration: 'none',
           fontSize: 12, fontWeight: 700, cursor: 'pointer', ...style,
         }}>
        <span>{icon}</span>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {label}
        </span>
      </a>

      
      {countdown !== null && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'overlayFadeIn 0.2s ease',
        }}>
          <div style={{
            background: '#1e1b4b', border: '1px solid #4c1d95',
            borderRadius: 20, padding: '36px 32px', textAlign: 'center',
            maxWidth: 340, width: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}>
            
            <div style={{
              background: 'linear-gradient(135deg, #2d1b69, #1e3a8a)',
              border: '1px dashed rgba(167,139,250,0.3)',
              borderRadius: 12, padding: '28px 16px', marginBottom: 24,
              color: 'rgba(167,139,250,0.5)', fontSize: 12,
            }}>
              <p style={{ margin: 0, fontWeight: 700 }}>📢 Espacio publicitario</p>
              <p style={{ margin: '4px 0 0', fontSize: 11, opacity: 0.7 }}>
                Aquí aparecerá un anuncio de Google AdMob
              </p>
            </div>

            <div style={{
              width: 64, height: 64, borderRadius: '50%', margin: '0 auto 16px',
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 900, color: '#1a1200',
              boxShadow: '0 0 24px rgba(255,165,0,0.4)',
            }}>
              {countdown}
            </div>
            <p style={{ color: '#fff', fontWeight: 900, fontSize: 15, margin: '0 0 6px' }}>
              Abriendo contacto…
            </p>
            <p style={{ color: 'rgba(167,139,250,0.7)', fontSize: 12, margin: 0 }}>
              Espera {countdown} segundo{countdown !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

function ModalUpgrade({ onClose }) {
  const [loading, setLoading] = useState(false);

  const handlePago = async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.post('/stripe/checkout');
      window.location.href = data.url;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al iniciar el pago');
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'overlayFadeIn 0.25s ease', padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white', borderRadius: 24,
          border: '2px solid #FFD700',
          boxShadow: '0 0 60px rgba(255,215,0,0.2), 0 24px 64px rgba(0,0,0,0.3)',
          padding: '36px 32px', maxWidth: 400, width: '100%', textAlign: 'center',
          animation: 'modalCardEntrada 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="badge-float inline-block text-5xl mb-4">🌟</div>
        <h2 style={{ fontWeight: 900, fontSize: 22, color: '#1e1b4b', margin: '0 0 8px' }}>
          Pase de Coleccionista
        </h2>
        <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.6, margin: '0 0 20px' }}>
          Has agotado tus <strong>3 búsquedas gratuitas</strong> de hoy.<br/>
          Con el Pase consigues búsquedas ilimitadas por menos que dos sobres.
        </p>

        
        <div style={{
          background: 'linear-gradient(135deg, #fef9c3, #fef3c7)',
          border: '2px solid #fcd34d', borderRadius: 16,
          padding: '16px 24px', marginBottom: 24,
        }}>
          <p style={{ fontSize: 36, fontWeight: 900, color: '#1a1200', margin: 0 }}>1,99€</p>
          <p style={{ fontSize: 12, color: '#78350f', margin: 0, fontWeight: 700 }}>
            / mes · cancela cuando quieras
          </p>
        </div>

        
        <ul style={{ textAlign: 'left', listStyle: 'none', padding: 0, margin: '0 0 24px', fontSize: 13, color: '#374151' }}>
          {[
            '✅ Búsquedas ilimitadas cada día',
            '✅ Contacto directo sin esperas',
            '✅ Insignia de Coleccionista en tu perfil',
            '✅ Sin anuncios entre búsquedas',
          ].map(b => (
            <li key={b} style={{ padding: '5px 0', fontWeight: 600 }}>{b}</li>
          ))}
        </ul>

        
        <button
          onClick={handlePago}
          disabled={loading}
          style={{
            width: '100%', padding: '14px', borderRadius: 50,
            background: loading
              ? 'linear-gradient(135deg, #d1d5db, #9ca3af)'
              : 'linear-gradient(135deg, #FFD700, #FFA500)',
            border: 'none', fontWeight: 900, fontSize: 15, color: '#1a1200',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 4px 20px rgba(255,165,0,0.4)',
            marginBottom: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          {loading
            ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg> Redirigiendo a Stripe…</>
            : '🌟 Obtener el Pase — 1,99€/mes'}
        </button>

        <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 12px' }}>
          🔒 Pago seguro procesado por Stripe · Tarjeta, Google Pay, Apple Pay
        </p>

        <button onClick={onClose}
          style={{
            background: 'none', border: 'none', color: '#9ca3af',
            fontSize: 13, cursor: 'pointer', fontWeight: 600,
          }}>
          Ahora no, seguir con la versión gratuita
        </button>
      </div>
    </div>
  );
}

function SeccionPro({ onUpgrade }) {
  return (
    <div className="relative overflow-hidden rounded-2xl"
         style={{
           background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
           border: '1px solid rgba(167,139,250,0.3)',
           boxShadow: '0 8px 40px rgba(76,29,149,0.25)',
         }}>

      
      <div style={{
        position: 'absolute', top: -40, right: -40,
        width: 180, height: 180, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(251,191,36,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -30, left: -20,
        width: 140, height: 140, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="relative p-6">
        
        <div className="flex items-start gap-4 mb-5">
          <div className="badge-float flex-shrink-0 text-4xl">🌟</div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 style={{ color: '#fde68a', fontWeight: 900, fontSize: 18, margin: 0 }}>
                Pase de Coleccionista
              </h2>
              <span style={{
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                color: '#1a1200', fontSize: 10, fontWeight: 900,
                padding: '2px 8px', borderRadius: 20,
              }}>PRO</span>
            </div>
            <p style={{ color: 'rgba(196,181,253,0.8)', fontSize: 13, margin: 0, lineHeight: 1.5 }}>
              La versión gratuita te permite hacer <strong style={{ color: '#c4b5fd' }}>3 búsquedas al día</strong>.
              Con el Pase de Coleccionista buscas sin límites y contactas con todos los
              coleccionistas que tienen tus faltas, sin esperas ni restricciones.
            </p>
          </div>
        </div>

        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
          {[
            { icon: '🔍', text: 'Búsquedas ilimitadas cada día' },
            { icon: '📞', text: 'Contacto directo sin esperas' },
            { icon: '🚫', text: 'Sin anuncios entre búsquedas' },
            { icon: '⚡', text: 'Acceso prioritario a resultados' },
          ].map(({ icon, text }) => (
            <div key={text} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(167,139,250,0.2)',
              borderRadius: 10, padding: '8px 12px',
            }}>
              <span style={{ fontSize: 16 }}>{icon}</span>
              <span style={{ color: '#e9d5ff', fontSize: 12, fontWeight: 600 }}>{text}</span>
            </div>
          ))}
        </div>

        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(251,191,36,0.35)',
            borderRadius: 14, padding: '10px 20px', textAlign: 'center', flexShrink: 0,
          }}>
            <p style={{ color: '#fde68a', fontSize: 26, fontWeight: 900, margin: 0, lineHeight: 1 }}>
              1,99€
            </p>
            <p style={{ color: 'rgba(253,230,138,0.6)', fontSize: 11, margin: 0, fontWeight: 700 }}>
              al mes · cancela cuando quieras
            </p>
          </div>

          <div className="flex-1 flex flex-col gap-2 w-full">
            <button
              onClick={onUpgrade}
              style={{
                width: '100%', padding: '13px', borderRadius: 50,
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                border: 'none', fontWeight: 900, fontSize: 14, color: '#1a1200',
                cursor: 'pointer', boxShadow: '0 4px 20px rgba(255,165,0,0.4)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(255,165,0,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(255,165,0,0.4)'; }}
            >
              🌟 Hacerse Pro ahora
            </button>
            <p style={{ color: 'rgba(167,139,250,0.55)', fontSize: 11, textAlign: 'center', margin: 0 }}>
              🔒 Pago seguro con Stripe · Tarjeta, Google Pay, Apple Pay
            </p>
          </div>
        </div>

        
        <div style={{
          marginTop: 20, paddingTop: 16,
          borderTop: '1px solid rgba(167,139,250,0.2)',
        }}>
          <p style={{ color: 'rgba(167,139,250,0.6)', fontSize: 11, fontWeight: 700, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            ¿Por qué merece la pena?
          </p>
          <p style={{ color: 'rgba(196,181,253,0.75)', fontSize: 12, margin: 0, lineHeight: 1.6 }}>
            Dos sobres de cromos cuestan en torno a <strong style={{ color: '#c4b5fd' }}>2€</strong> y
            te dan cartas al azar. Por <strong style={{ color: '#fde68a' }}>1,99€/mes</strong> puedes
            contactar directamente con la persona exacta que tiene el cromo que te falta,
            sin suerte, sin esperas y sin límites.
          </p>
        </div>
      </div>
    </div>
  );
}

function ChipCarta({ carta, onClick }) {
  const e = RAREZA_ESTILO[carta.rareza] ?? RAREZA_ESTILO.common;
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold transition-all duration-150 hover:scale-105 active:scale-95"
      style={{ background: e.bg, border: `1px solid ${e.borde}`, color: e.texto, cursor: 'pointer' }}
      title={`Ver ${carta.nombre} en grande`}
    >
      {carta.nombre}
      {carta.numero && (
        <span style={{ opacity: 0.55 }}>#{String(carta.numero).padStart(3, '0')}</span>
      )}
    </button>
  );
}

function TarjetaResultado({ resultado, onCartaClick, limitReached, onChatear }) {
  const { usuario, cartasMeDa, cantidadYoDoy, esBidireccional } = resultado;

  return (
    <div className="relative rounded-2xl overflow-hidden flex flex-col"
         style={{
           background: 'white',
           border: esBidireccional ? '2px solid #22c55e' : '1px solid #ddd6fe',
           boxShadow: esBidireccional
             ? '0 0 20px rgba(34,197,94,0.15), 0 4px 16px rgba(0,0,0,0.05)'
             : '0 4px 16px rgba(91,33,182,0.07)',
         }}>

      {esBidireccional && (
        <div className="absolute top-0 left-0 right-0 flex justify-center">
          <span className="text-[10px] font-black px-3 py-0.5 rounded-b-lg"
                style={{ background: '#22c55e', color: 'white' }}>
            🔄 ¡Coincidencia Doble!
          </span>
        </div>
      )}

      <div className={`flex items-center gap-3 px-4 pb-3 ${esBidireccional ? 'pt-7' : 'pt-4'}`}>
        <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0"
             style={{ background: 'linear-gradient(135deg, #ede9fe, #c4b5fd)' }}>👤</div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-mc-dark text-sm">@{usuario.username}</p>
          <p className="text-xs text-mc-muted">📍 {usuario.ciudad}</p>
        </div>
      </div>

      <div className="px-4 pb-3 flex-1">
        <p className="text-[10px] font-black text-green-700 uppercase tracking-wider mb-2">
          Tiene estas repetidas ({cartasMeDa.length}) — toca para verlas:
        </p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {cartasMeDa.map(c => (
            <ChipCarta key={c._id} carta={c} onClick={() => onCartaClick(c, usuario)} />
          ))}
        </div>

        {esBidireccional && (
          <p className="text-[10px] font-semibold mb-3" style={{ color: '#16a34a' }}>
            ✔ Tú también tienes {cantidadYoDoy} carta{cantidadYoDoy !== 1 ? 's' : ''} que le interesan
          </p>
        )}

        
        <div className="space-y-2 pt-3 border-t border-mc-border">
          <p className="text-[10px] font-black text-mc-muted uppercase tracking-wider mb-1">Contactar</p>

          {limitReached ? (
            <div style={{ position: 'relative' }}>
              
              <div style={{ filter: 'blur(5px)', pointerEvents: 'none', userSelect: 'none', opacity: 0.7 }}>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold mb-1.5"
                     style={{ background: '#eef2ff', color: '#4338ca', border: '1px solid #c7d2fe' }}>
                  <span>✉️</span><span>usuario@email.com</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold"
                     style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}>
                  <span>📞</span><span>+34 600 000 000</span>
                </div>
              </div>
              
              <div style={{
                position: 'absolute', inset: 0, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.5)',
                borderRadius: 8,
              }}>
                <span style={{ fontSize: 20 }}>🔒</span>
              </div>
            </div>
          ) : (
            <>
              <a href={`mailto:${usuario.email}`}
                 className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-80"
                 style={{ background: '#eef2ff', color: '#4338ca', border: '1px solid #c7d2fe' }}>
                <span>✉️</span>
                <span className="truncate">{usuario.email}</span>
              </a>
              {usuario.telefono ? (
                <a href={`tel:${usuario.telefono}`}
                   className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-80"
                   style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}>
                  <span>📞</span>
                  <span>{usuario.telefono}</span>
                </a>
              ) : (
                <p className="text-[10px] text-mc-muted px-1">Sin teléfono registrado</p>
              )}
              <button
                onClick={() => onChatear(usuario._id, cartasMeDa)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black transition-all hover:brightness-110 active:scale-95 text-white"
                style={{ background: 'linear-gradient(135deg, #5b21b6, #7c3aed)' }}>
                <span>💬</span>
                <span>Chat en MatchCard</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Buscador() {
  const [query,             setQuery]             = useState('');
  const [categoria,         setCategoria]         = useState('Todos');
  const [resultados,        setResultados]        = useState(null);
  const [cromasEncontrados, setCromasEncontrados] = useState([]);
  const [loading,           setLoading]           = useState(false);
  const [limitReached,      setLimitReached]      = useState(false);
  const [searchesLeft,      setSearchesLeft]      = useState(null);
  const [modalData,         setModalData]         = useState(null);
  const [showUpgrade,       setShowUpgrade]       = useState(false);

  const { user, setUser }   = useUserStore();
  const navigate            = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const timerRef = useRef(null);
  const inputRef = useRef(null);

  const [pagoExitoso, setPagoExitoso] = useState(false);

  useEffect(() => {
    if (searchParams.get('upgraded') === 'true') {
      setSearchParams({}, { replace: true });
      setLimitReached(false);
      axiosClient.get('/auth/me')
        .then(({ data }) => { setUser(data.user); setPagoExitoso(true); })
        .catch(() => { setPagoExitoso(true); });
    }
  }, []);

  const buscar = useCallback(async (nombre, cat) => {
    if (!nombre || nombre.trim().length < 2) {
      setResultados(null);
      setCromasEncontrados([]);
      return;
    }
    setLoading(true);
    try {
      const params = { nombre: nombre.trim() };
      if (cat && cat !== 'Todos') params.categoria = cat;
      const { data } = await axiosClient.get('/cromos/buscar-match', { params });
      setResultados(data.resultados || []);
      setCromasEncontrados(data.cromasEncontrados || []);
      setLimitReached(data.limitReached ?? false);
      setSearchesLeft(data.searchesLeft ?? null);
      if (data.limitReached) setShowUpgrade(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al buscar');
      setResultados([]);
    } finally { setLoading(false); }
  }, []);

  const handleQueryChange = e => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => buscar(val, categoria), 450);
  };

  const handleCategoria = cat => {
    setCategoria(cat);
    if (query.trim().length >= 2) buscar(query, cat);
  };

  const abrirModal = useCallback((carta, usuario) => {
    setModalData({ carta, usuario });
  }, []);

  const proponerYChatear = useCallback(async (userBId, cartasMeDa) => {
    try {
      const { data } = await axiosClient.post('/matches/proponer', {
        userBId,
        cromosDeAparaB: [],
        cromosDeBparaA: (cartasMeDa || []).map(c => c._id),
      });
      navigate(`/chat/${data.match._id}`);
    } catch (err) {
      if (err.response?.status === 409) {
        const matchId = err.response.data.matchId;
        navigate(matchId ? `/chat/${matchId}` : '/dashboard');
      } else {
        toast.error(err.response?.data?.message || 'Error al iniciar chat');
      }
    }
  }, [navigate]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 min-h-[calc(100vh-4rem)]">

      
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-mc-dark">Buscador de Faltas</h1>
          <p className="text-xs text-mc-muted mt-0.5">
            Busca la carta que te falta y contacta directamente con quien la tiene de sobra
          </p>
        </div>

        
        {searchesLeft !== null && !limitReached && (
          <div className="flex-shrink-0 text-right">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black"
                 style={{
                   background: searchesLeft <= 1 ? '#fef2f2' : '#f0fdf4',
                   border: `1px solid ${searchesLeft <= 1 ? '#fecaca' : '#bbf7d0'}`,
                   color: searchesLeft <= 1 ? '#dc2626' : '#16a34a',
                 }}>
              🔍 {searchesLeft} búsqueda{searchesLeft !== 1 ? 's' : ''} restante{searchesLeft !== 1 ? 's' : ''}
            </div>
            <p className="text-[10px] text-mc-muted mt-0.5">
              <button onClick={() => setShowUpgrade(true)}
                className="text-mc-purple font-bold hover:underline cursor-pointer bg-transparent border-0 p-0">
                Conseguir ilimitadas →
              </button>
            </p>
          </div>
        )}

        {limitReached && (
          <button onClick={() => setShowUpgrade(true)} className="flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              border: 'none', borderRadius: 30, padding: '8px 16px',
              fontWeight: 900, fontSize: 12, color: '#1a1200', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(255,165,0,0.35)',
            }}>
            🌟 Hacerse Premium
          </button>
        )}
      </div>

      
      {limitReached && (
        <div className="rounded-2xl p-4 mb-5 flex items-center gap-3"
             style={{ background: '#fef9c3', border: '1px solid #fcd34d' }}>
          <span className="text-2xl">⚠️</span>
          <div className="flex-1">
            <p className="font-black text-amber-900 text-sm">Has agotado tus 3 búsquedas gratuitas de hoy</p>
            <p className="text-amber-700 text-xs">Los datos de contacto están ocultos. Vuelven mañana o activa el Pase de Coleccionista.</p>
          </div>
          <button onClick={() => setShowUpgrade(true)}
            style={{
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              border: 'none', borderRadius: 20, padding: '6px 14px',
              fontWeight: 900, fontSize: 12, color: '#1a1200', cursor: 'pointer', flexShrink: 0,
            }}>
            Ver planes
          </button>
        </div>
      )}

      
      <div className="rounded-2xl p-5 mb-5"
           style={{ background: 'white', border: '1px solid #ddd6fe',
                    boxShadow: '0 4px 20px rgba(91,33,182,0.07)' }}>
        <div className="relative mb-4">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl pointer-events-none">🔍</span>
          <input
            ref={inputRef} type="text"
            placeholder="Escribe el nombre del cromo que te falta… (ej: Pikachu)"
            value={query} onChange={handleQueryChange}
            className="w-full pl-12 pr-10 py-3.5 rounded-xl text-sm font-semibold text-mc-dark placeholder-mc-muted/50 outline-none transition-all"
            style={{ background: '#f5f3ff', border: '2px solid #ddd6fe' }}
            onFocus={e  => (e.target.style.borderColor = '#5b21b6')}
            onBlur={e   => (e.target.style.borderColor = '#ddd6fe')}
          />
          {loading && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-mc-purple">✦</span>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {CATEGORIAS.map(cat => (
            <button key={cat} onClick={() => handleCategoria(cat)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black transition-all duration-200 active:scale-95"
              style={categoria === cat
                ? { background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: '#1a1200',
                    boxShadow: '0 4px 12px rgba(255,165,0,0.35)' }
                : { background: 'white', border: '1px solid #ddd6fe', color: '#6b7280' }}>
              {ICONO_CAT[cat]} {cat}
            </button>
          ))}
        </div>

        {cromasEncontrados.length > 0 && (
          <p className="text-[11px] text-mc-muted mt-3 pt-3 border-t border-mc-border">
            📚 {cromasEncontrados.length} coincidencia{cromasEncontrados.length !== 1 ? 's' : ''} en el catálogo
          </p>
        )}
      </div>

      
      {resultados === null && !loading && (
        <div className="space-y-8">
          <div className="text-center py-10">
            <div className="text-6xl mb-4 animate-float inline-block">🃏</div>
            <h3 className="text-lg font-black text-mc-dark mb-2">¿Qué cromo te falta?</h3>
            <p className="text-mc-muted text-sm max-w-sm mx-auto leading-relaxed">
              Escribe el nombre arriba y verás qué coleccionistas lo tienen de sobra,
              con su email y teléfono para contactar directamente.
            </p>
          </div>

          
          {!user?.isPremium && (
            <SeccionPro onUpgrade={() => setShowUpgrade(true)} />
          )}
        </div>
      )}

      
      {resultados !== null && resultados.length === 0 && !loading && (
        <div className="text-center py-16 rounded-2xl"
             style={{ background: 'white', border: '1px solid #ddd6fe' }}>
          <div className="text-5xl mb-3">😔</div>
          <h3 className="text-lg font-black text-mc-dark mb-2">Nadie lo tiene de sobra</h3>
          <p className="text-mc-muted text-sm max-w-xs mx-auto">
            {cromasEncontrados.length === 0
              ? 'Ese cromo tampoco aparece en el catálogo aún.'
              : 'El cromo existe, pero ningún usuario lo tiene como repetido todavía.'}
          </p>
        </div>
      )}

      
      {resultados !== null && resultados.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-black text-mc-dark">
              {resultados.length} coleccionista{resultados.length !== 1 ? 's' : ''} encontrado{resultados.length !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="text-xs text-mc-muted">Verde = Coincidencia Doble</span>
            </div>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {resultados.map(r => (
              <TarjetaResultado
                key={r.usuario._id}
                resultado={r}
                onCartaClick={abrirModal}
                limitReached={limitReached}
                onChatear={proponerYChatear}
              />
            ))}
          </div>

          
          {!user?.isPremium && (
            <div className="mt-8">
              <SeccionPro onUpgrade={() => setShowUpgrade(true)} />
            </div>
          )}
        </>
      )}

      
      {modalData && (
        <ModalCartaGrande
          carta={modalData.carta}
          usuario={modalData.usuario}
          onClose={() => setModalData(null)}
          onChatear={proponerYChatear}
        />
      )}
      {showUpgrade  && <ModalUpgrade     onClose={() => setShowUpgrade(false)} />}
      {pagoExitoso  && <ModalPagoExitoso onClose={() => setPagoExitoso(false)} />}
    </div>
  );
}

function ModalPagoExitoso({ onClose }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'overlayFadeIn 0.3s ease', padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(160deg, #1e1b4b 0%, #312e81 60%, #1a1200 100%)',
          border: '2px solid #FFD700',
          borderRadius: 28,
          boxShadow: '0 0 80px rgba(255,215,0,0.25), 0 32px 80px rgba(0,0,0,0.5)',
          padding: '48px 36px',
          maxWidth: 420, width: '100%',
          textAlign: 'center',
          animation: 'modalCardEntrada 0.55s cubic-bezier(0.34,1.56,0.64,1) forwards',
          position: 'relative', overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        
        <div style={{
          position: 'absolute', top: -60, right: -60,
          width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,215,0,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -40, left: -40,
          width: 160, height: 160, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(167,139,250,0.2) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        
        <div style={{ fontSize: 72, lineHeight: 1, marginBottom: 20 }} className="pop-in inline-block">
          👑
        </div>

        
        <h2 style={{
          fontWeight: 900, fontSize: 26, margin: '0 0 8px',
          background: 'linear-gradient(135deg, #FFD700, #FFA500)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          ¡Pago realizado!
        </h2>
        <p style={{ color: '#e9d5ff', fontSize: 15, margin: '0 0 28px', fontWeight: 700 }}>
          Ya eres Coleccionista Pro 🌟
        </p>

        
        <div style={{
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,215,0,0.2)',
          borderRadius: 16, padding: '16px 20px', marginBottom: 28, textAlign: 'left',
        }}>
          <p style={{ color: 'rgba(253,230,138,0.7)', fontSize: 11, fontWeight: 900, margin: '0 0 10px',
                      textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Desbloqueado
          </p>
          {[
            '🔍 Búsquedas ilimitadas cada día',
            '📞 Contacto directo sin esperas',
            '🚫 Sin anuncios entre búsquedas',
            '👑 Insignia Pro en tu perfil',
          ].map(b => (
            <div key={b} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '5px 0', color: '#c4b5fd', fontSize: 13, fontWeight: 600,
            }}>
              {b}
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%', padding: '14px', borderRadius: 50,
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            border: 'none', fontWeight: 900, fontSize: 15, color: '#1a1200',
            cursor: 'pointer', boxShadow: '0 4px 24px rgba(255,165,0,0.45)',
          }}
        >
          🚀 Empezar a buscar sin límites
        </button>
      </div>
    </div>
  );
}
