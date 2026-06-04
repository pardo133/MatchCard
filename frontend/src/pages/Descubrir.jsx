import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import CartaHex   from '../components/common/CartaHex';
import { toast }  from 'react-hot-toast';

const SWIPE_THRESHOLD = 85;
const PRIORIDAD_BADGE = {
  zona:          { label: 'En tu zona',    bg: '#dcfce7', text: '#166534', border: '#86efac' },
  provincial:    { label: 'Provincial',    bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
  internacional: { label: 'Internacional', bg: '#f3e8ff', text: '#6b21a8', border: '#d8b4fe' },
};

function BurstParticulas({ activo, color }) {
  const dots = useMemo(() => Array.from({ length: 12 }, (_, i) => ({
    angle: (i / 12) * 360,
    dist:  50 + (i % 4) * 20,
    size:  4 + (i % 3) * 2,
    color: i % 2 === 0 ? color : '#FFD700',
  })), [color]);

  if (!activo) return null;

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      {dots.map((d, i) => (
        <div key={i} className="absolute rounded-full"
             style={{
               width: d.size, height: d.size,
               background: d.color,
               transform: `rotate(${d.angle}deg) translateY(-${d.dist}px)`,
               animation: 'popIn 0.5s ease forwards',
               animationDelay: `${i * 0.03}s`,
               opacity: 0,
             }} />
      ))}
    </div>
  );
}

function TarjetaSwipe({ match, onPasar, onProponer, indice }) {
  const { usuario, distanciaKm, prioridad, cartasMeDa, cartasYoDoy, esBidireccional } = match;
  const badge = PRIORIDAD_BADGE[prioridad] || PRIORIDAD_BADGE.internacional;
  const cartaPrincipal = cartasMeDa[0];

  const dragRef      = useRef({ startX: 0, startY: 0, dx: 0 });
  const cardRef      = useRef(null);
  const [dx,  setDx] = useState(0);
  const [animating, setAnim] = useState(null);
  const [burst, setBurst]    = useState(null);

  const rotation = dx * 0.08;
  const opacity  = 1 - Math.abs(dx) / 350;

  const doSwipe = useCallback(async (dir) => {
    setAnim(dir);
    setBurst(dir);
    await new Promise(r => setTimeout(r, 420));
    setBurst(null);
    setDx(0);
    setAnim(null);
    if (dir === 'right') await onProponer();
    else onPasar();
  }, [onPasar, onProponer]);

  const onStart = (clientX) => { dragRef.current = { startX: clientX, dx: 0 }; };
  const onMove  = (clientX) => {
    const d = clientX - dragRef.current.startX;
    dragRef.current.dx = d;
    setDx(d);
  };
  const onEnd   = () => {
    const { dx: d } = dragRef.current;
    if      (d >  SWIPE_THRESHOLD) doSwipe('right');
    else if (d < -SWIPE_THRESHOLD) doSwipe('left');
    else setDx(0);
  };

  const swipingRight = dx >  SWIPE_THRESHOLD / 2;
  const swipingLeft  = dx < -SWIPE_THRESHOLD / 2;

  const transform = animating === 'right'
    ? 'translateX(160%) rotate(30deg)'
    : animating === 'left'
    ? 'translateX(-160%) rotate(-30deg)'
    : `translateX(${dx}px) rotate(${rotation}deg)`;

  return (
    <div className="relative select-none" style={{ zIndex: 10 - indice }}>
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <BurstParticulas activo={burst === 'right'} color="#22c55e" />
        <BurstParticulas activo={burst === 'left'}  color="#ef4444" />
      </div>

      
      {swipingRight && (
        <div className="absolute top-6 left-6 z-20 pop-in">
          <span className="font-black text-2xl px-4 py-2 rounded-xl border-4 border-green-500 text-green-500 uppercase tracking-widest"
                style={{ background: 'rgba(255,255,255,0.9)', transform: 'rotate(-15deg)', display: 'block' }}>
            MATCH ✓
          </span>
        </div>
      )}
      {swipingLeft && (
        <div className="absolute top-6 right-6 z-20 pop-in">
          <span className="font-black text-2xl px-4 py-2 rounded-xl border-4 border-red-500 text-red-500 uppercase tracking-widest"
                style={{ background: 'rgba(255,255,255,0.9)', transform: 'rotate(15deg)', display: 'block' }}>
            PASAR ✕
          </span>
        </div>
      )}

      
      <div
        ref={cardRef}
        onMouseDown={e => onStart(e.clientX)}
        onMouseMove={e => { if (e.buttons === 1) onMove(e.clientX); }}
        onMouseUp={onEnd}
        onMouseLeave={onEnd}
        onTouchStart={e => onStart(e.touches[0].clientX)}
        onTouchMove={e => onMove(e.touches[0].clientX)}
        onTouchEnd={onEnd}
        className="card-white rounded-3xl overflow-hidden shadow-2xl"
        style={{
          transform,
          transition: animating || Math.abs(dx) === 0 ? 'transform 0.45s cubic-bezier(.23,1,.32,1)' : 'none',
          opacity: animating ? 0 : opacity,
          cursor: Math.abs(dx) > 5 ? 'grabbing' : 'grab',
          touchAction: 'none',
        }}
      >
        
        {(swipingRight || swipingLeft) && (
          <div className="absolute inset-0 pointer-events-none z-10 transition-opacity"
               style={{ background: swipingRight ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)' }} />
        )}

        
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                 style={{ background: 'linear-gradient(135deg, #ede9fe, #c4b5fd)' }}>
              👤
            </div>
            <div>
              <p className="font-black text-mc-dark text-sm">@{usuario.username}</p>
              <p className="text-xs text-mc-muted">📍 {usuario.ciudad}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="badge border text-[10px]"
                  style={{ background: badge.bg, color: badge.text, borderColor: badge.border }}>
              {badge.label}
            </span>
            {distanciaKm !== null && (
              <span className="text-[10px] font-bold text-mc-muted">
                {distanciaKm < 1 ? '< 1 km' : `${distanciaKm} km`}
              </span>
            )}
          </div>
        </div>

        
        <div className="flex justify-center py-5"
             style={{ background: 'linear-gradient(to bottom, #f5f3ff, #ffffff)' }}>
          <CartaHex cromo={cartaPrincipal} size={170} glow />
        </div>

        
        <div className="px-5 pb-4 space-y-3">
          <div>
            <p className="text-[10px] font-black text-green-600 uppercase tracking-wider mb-2">
              📤 Me puede dar ({cartasMeDa.length})
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {cartasMeDa.map(c => (
                <div key={c._id} className="flex-shrink-0 text-center">
                  <CartaHex cromo={c} size={60} />
                  <p className="text-[8px] text-mc-muted mt-1 truncate" style={{ maxWidth: 60 }}>{c.nombre}</p>
                </div>
              ))}
            </div>
          </div>

          {cartasYoDoy.length > 0 && (
            <div>
              <p className="text-[10px] font-black text-mc-purple uppercase tracking-wider mb-2">
                📥 Yo le doy ({cartasYoDoy.length})
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {cartasYoDoy.map(c => (
                  <div key={c._id} className="flex-shrink-0 text-center">
                    <CartaHex cromo={c} size={60} />
                    <p className="text-[8px] text-mc-muted mt-1 truncate" style={{ maxWidth: 60 }}>{c.nombre}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {esBidireccional && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border"
                 style={{ background: '#f0fdf4', borderColor: '#86efac' }}>
              <span>🔄</span>
              <span className="text-xs font-black text-green-700">¡Intercambio bidireccional! Ambos ganáis.</span>
            </div>
          )}
        </div>

        
        <div className="px-5 pb-3 text-center">
          <p className="text-[10px] text-mc-muted">← Arrastra para pasar · Arrastra para proponer →</p>
        </div>
      </div>
    </div>
  );
}

function useGeolocalizacion(onOk) {
  const [estado, setEstado] = useState('idle');
  const solicitar = useCallback(() => {
    if (!navigator.geolocation) return setEstado('error');
    setEstado('loading');
    navigator.geolocation.getCurrentPosition(
      p => { onOk(p.coords.longitude, p.coords.latitude); setEstado('ok'); },
      () => setEstado('error'),
      { timeout: 8000 }
    );
  }, [onOk]);
  return { estado, solicitar };
}

export default function Descubrir() {
  const [matches,  setMatches]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [pasados,  setPasados]  = useState(new Set());
  const navigate = useNavigate();

  const guardarUbicacion = useCallback(async (lon, lat) => {
    try {
      await axiosClient.put('/users/ubicacion', { longitud: lon, latitud: lat });
      toast.success('📍 Ubicación actualizada', { duration: 2000 });
    } catch {  }
  }, []);

  const { estado: geoEstado, solicitar } = useGeolocalizacion(guardarUbicacion);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get('/matches/buscar');
      setMatches(data.matches || []);
      setPasados(new Set());
    } catch { toast.error('Error cargando matches'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { solicitar(); cargar(); }, []);

  const activos     = matches.filter((_, i) => !pasados.has(i));
  const matchActual = activos[0] ?? null;
  const siguiente   = activos[1] ?? null;

  const handlePasar = useCallback(() => {
    const idx = matches.indexOf(matchActual);
    setPasados(p => new Set([...p, idx]));
  }, [matches, matchActual]);

  const handleProponer = useCallback(async () => {
    if (!matchActual) return;
    setEnviando(true);
    try {
      await axiosClient.post('/matches/proponer', {
        userBId:        matchActual.usuario._id,
        cromosDeAparaB: matchActual.cartasYoDoy.map(c => c._id),
        cromosDeBparaA: matchActual.cartasMeDa.map(c => c._id),
        distanciaKm:    matchActual.distanciaKm,
        prioridad:      matchActual.prioridad,
      });
      toast.success(`¡Propuesta enviada a @${matchActual.usuario.username}! 🤝`);
      handlePasar();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al proponer');
    } finally { setEnviando(false); }
  }, [matchActual, handlePasar]);

  return (
    <div className="max-w-lg mx-auto px-4 py-6 min-h-[calc(100vh-4rem)]">
      
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-black text-mc-dark">Descubrir</h1>
          <p className="text-xs text-mc-muted mt-0.5">{activos.length} posibles matches</p>
        </div>
        <div className="flex gap-2">
          <button onClick={solicitar}
            className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors
              ${geoEstado === 'ok' ? 'bg-green-50 border-green-300 text-green-700'
              : geoEstado === 'loading' ? 'bg-yellow-50 border-yellow-300 text-yellow-700'
              : 'bg-gray-50 border-gray-300 text-gray-600 hover:border-mc-purple hover:text-mc-purple'}`}>
            {geoEstado === 'ok' ? '📍 GPS ✓' : geoEstado === 'loading' ? '🔍...' : '📍 GPS'}
          </button>
          <button onClick={cargar}
            className="w-8 h-8 rounded-full border border-mc-border flex items-center justify-center text-mc-muted hover:border-mc-purple hover:text-mc-purple transition-colors text-sm">
            ↻
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-24 gap-3">
          <div className="text-4xl animate-spin text-mc-purple">✦</div>
          <p className="text-mc-muted text-sm">Buscando matches...</p>
        </div>
      ) : !matchActual ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4 animate-float inline-block">🔍</div>
          <h3 className="text-xl font-black text-mc-dark mb-2">Sin matches por ahora</h3>
          <p className="text-mc-muted text-sm mb-6 max-w-xs mx-auto">
            Añade más cartas a tus faltas o activa el GPS para ampliar la búsqueda.
          </p>
          <div className="flex flex-col gap-2 items-center">
            <button onClick={cargar} className="btn-yellow text-sm">↻ Volver a buscar</button>
            <button onClick={() => navigate('/repes')} className="btn-outline text-sm">+ Añadir cartas</button>
          </div>
        </div>
      ) : (
        <div className="relative" style={{ minHeight: 600 }}>
          
          {siguiente && (
            <div className="absolute inset-0 pointer-events-none" style={{ transform: 'scale(0.94) translateY(16px)', opacity: 0.4, zIndex: 1 }}>
              <div className="card-white rounded-3xl h-full" />
            </div>
          )}

          
          <TarjetaSwipe
            key={matchActual.usuario._id}
            match={matchActual}
            onPasar={handlePasar}
            onProponer={handleProponer}
            indice={0}
          />

          
          <div className="flex gap-4 mt-5 justify-center">
            <button onClick={handlePasar} disabled={enviando}
              className="w-16 h-16 rounded-full flex flex-col items-center justify-center gap-0.5 font-black border-2 border-red-200 bg-white text-red-500 hover:bg-red-50 hover:border-red-400 active:scale-90 transition-all shadow-md disabled:opacity-50">
              <span className="text-2xl leading-none">✕</span>
              <span className="text-[9px]">Pasar</span>
            </button>

            <div className="flex flex-col items-center justify-center">
              <p className="text-[10px] text-mc-muted font-semibold">o arrastra</p>
            </div>

            <button onClick={handleProponer} disabled={enviando}
              className="w-16 h-16 rounded-full flex flex-col items-center justify-center gap-0.5 font-black border-2 border-green-300 active:scale-90 transition-all shadow-lg disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff',
                       boxShadow: '0 4px 20px rgba(34,197,94,0.4)' }}>
              {enviando
                ? <span className="animate-spin text-lg">✦</span>
                : <><span className="text-2xl leading-none">🤝</span><span className="text-[9px]">Match</span></>
              }
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
