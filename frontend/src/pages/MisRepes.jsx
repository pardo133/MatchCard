import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import { toast }   from 'react-hot-toast';

/* ─── Paleta por rareza ─────────────────────────────────────────── */
const RAREZA = {
  'secret-rare': { borde: '#d97706', glow: 'rgba(217,119,6,0.65)',  bg: 'linear-gradient(160deg,#78350f,#d97706)', emoji: '✨', label: 'Secret Rare' },
  'ultra-rare':  { borde: '#7c3aed', glow: 'rgba(124,58,237,0.6)',  bg: 'linear-gradient(160deg,#4c1d95,#7c3aed)', emoji: '🔮', label: 'Ultra Rare'  },
  'rare':        { borde: '#2563eb', glow: 'rgba(37,99,235,0.5)',   bg: 'linear-gradient(160deg,#1e3a8a,#3b82f6)', emoji: '💎', label: 'Rare'        },
  'uncommon':    { borde: '#16a34a', glow: 'rgba(22,163,74,0.5)',   bg: 'linear-gradient(160deg,#14532d,#22c55e)', emoji: '🌿', label: 'Uncommon'    },
  'common':      { borde: '#6b7280', glow: 'rgba(107,114,128,0.4)', bg: 'linear-gradient(160deg,#1f2937,#4b5563)', emoji: '🃏', label: 'Common'      },
};
const rz = (r) => RAREZA[r] || RAREZA.common;

/* ─── Partículas de fondo ─────────────────────────────────────── */
function FondoGalactico() {
  const dots = useMemo(() => Array.from({ length: 18 }, (_, i) => ({
    left: `${(i * 43 + 11) % 100}%`, top: `${(i * 71 + 19) % 100}%`,
    size: 1 + (i % 3), opacity: 0.07 + (i % 5) * 0.03,
    dur: `${4 + (i % 6)}s`, delay: `${-(i * 0.8)}s`,
  })), []);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {dots.map((d, i) => (
        <div key={i} className="absolute rounded-full bg-white"
             style={{ left: d.left, top: d.top, width: d.size, height: d.size,
                      opacity: d.opacity, animation: `particleFloat ${d.dur} ease-in-out infinite`,
                      animationDelay: d.delay }} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CARTA VISUAL — diseño de cromo real (rectangular)
═══════════════════════════════════════════════════════════ */
function CartaCromo({ cromo, seleccionada, esNueva, onSelect, width = 95 }) {
  const r     = rz(cromo.rareza);
  const tieneImg = !!cromo.imagenUrl;
  const height   = Math.round(width * 1.4);

  const borderColor = seleccionada ? '#FFD700' : `${r.borde}70`;
  const shadow = seleccionada
    ? `0 0 0 2px #FFD700, 0 6px 24px rgba(255,215,0,0.55)`
    : `0 4px 14px ${r.glow}50`;
  const scale = seleccionada ? 'scale(1.1) translateY(-5px)' : undefined;

  return (
    <div className="relative cursor-pointer flex flex-col items-center"
         style={{ width, flexShrink: 0 }}
         onClick={() => onSelect(cromo)}>

      
      {esNueva && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <span className="bg-green-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-lg whitespace-nowrap">
            ✓ Nueva
          </span>
        </div>
      )}

      
      <div className="overflow-hidden transition-all duration-300 hover:scale-105 hover:-translate-y-1"
           style={{
             width,
             height,
             borderRadius: Math.round(width * 0.09),
             border: `2px solid ${borderColor}`,
             boxShadow: shadow,
             transform: scale,
             background: tieneImg ? '#111' : r.bg,
             position: 'relative',
           }}>

        {tieneImg ? (
          /* ── Con foto ── */
          <>
            <img
              src={cromo.imagenUrl}
              alt={cromo.nombre}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              onError={e => { e.target.style.display = 'none'; }}
            />
            
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.88))',
              padding: '14px 5px 5px',
            }}>
              <p style={{
                color: '#fff', fontSize: Math.round(width * 0.095), fontWeight: 900,
                textAlign: 'center', lineHeight: 1.1,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                textShadow: '0 1px 4px rgba(0,0,0,0.9)',
              }}>{cromo.nombre}</p>
            </div>
            
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '35%',
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.12), transparent)',
              pointerEvents: 'none',
            }} />
          </>
        ) : (
          /* ── Sin foto: diseño tipo carta ── */
          <div style={{
            width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'space-between', padding: '8px 6px',
            position: 'relative',
          }}>
            
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '40%',
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.15), transparent)',
              pointerEvents: 'none', borderRadius: `${Math.round(width * 0.09)}px ${Math.round(width * 0.09)}px 0 0`,
            }} />
            
            {cromo.numero > 0 && (
              <span style={{ fontSize: Math.round(width * 0.08), color: 'rgba(255,255,255,0.5)', fontWeight: 700, fontFamily: 'monospace', alignSelf: 'flex-start', zIndex: 1 }}>
                #{String(cromo.numero).padStart(3,'0')}
              </span>
            )}
            
            <span style={{ fontSize: Math.round(width * 0.35), filter: 'drop-shadow(0 3px 10px rgba(0,0,0,0.5))', zIndex: 1, lineHeight: 1 }}>
              {r.emoji}
            </span>
            
            <div style={{ width: '100%', textAlign: 'center', zIndex: 1 }}>
              <p style={{
                color: '#fff', fontSize: Math.round(width * 0.095), fontWeight: 900,
                lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                textShadow: '0 1px 4px rgba(0,0,0,0.8)',
              }}>{cromo.nombre}</p>
              {cromo.expansion && (
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: Math.round(width * 0.07), marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {cromo.expansion}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PANEL DETALLE — carta seleccionada
═══════════════════════════════════════════════════════════ */
function PanelDetalle({ cromo, onGestionar, onDeselect }) {
  const [holoPos, setHoloPos] = useState({ x: 50, y: 50 });
  const cardRef = useRef(null);
  const r = rz(cromo.rareza);

  return (
    <div className="h-full flex flex-col">
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/50">🔄 Tengo repetida</p>
          <h2 className="text-lg font-black text-white leading-tight truncate">{cromo.nombre}</h2>
          <p className="text-xs text-white/50 truncate">{cromo.expansion}</p>
        </div>
        <button onClick={onDeselect}
          className="w-8 h-8 flex-shrink-0 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors text-sm">
          ✕
        </button>
      </div>

      
      <div className="flex justify-center mb-4"
           ref={cardRef}
           onMouseMove={e => {
             const rect = cardRef.current?.getBoundingClientRect();
             if (rect) setHoloPos({
               x: Math.round(((e.clientX - rect.left) / rect.width) * 100),
               y: Math.round(((e.clientY - rect.top) / rect.height) * 100),
             });
           }}
           style={{ cursor: 'crosshair' }}>
        <div className="relative" style={{ userSelect: 'none' }}>
          
          <div style={{
            width: 160, height: 224,
            borderRadius: 14,
            border: `2px solid ${r.borde}`,
            boxShadow: `0 0 28px ${r.glow}, 0 8px 32px rgba(0,0,0,0.5)`,
            overflow: 'hidden',
            background: cromo.imagenUrl ? '#111' : r.bg,
            position: 'relative',
          }}>
            {cromo.imagenUrl ? (
              <>
                <img src={cromo.imagenUrl} alt={cromo.nombre}
                     style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.88))',
                  padding: '20px 8px 8px', textAlign: 'center',
                }}>
                  <p style={{ color: '#fff', fontSize: 13, fontWeight: 900, textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
                    {cromo.nombre}
                  </p>
                </div>
              </>
            ) : (
              <div style={{
                width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'space-between', padding: '12px 10px',
              }}>
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '40%',
                  background: 'linear-gradient(to bottom, rgba(255,255,255,0.18), transparent)',
                  pointerEvents: 'none',
                }} />
                {cromo.numero > 0 && (
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 700, fontFamily: 'monospace', alignSelf: 'flex-start', zIndex: 1 }}>
                    #{String(cromo.numero).padStart(3,'0')}
                  </span>
                )}
                <span style={{ fontSize: 52, filter: 'drop-shadow(0 3px 12px rgba(0,0,0,0.5))', zIndex: 1 }}>
                  {r.emoji}
                </span>
                <div style={{ width: '100%', textAlign: 'center', zIndex: 1 }}>
                  <p style={{ color: '#fff', fontSize: 13, fontWeight: 900, lineHeight: 1.15, textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                    {cromo.nombre}
                  </p>
                  {cromo.expansion && (
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 9.5, marginTop: 2 }}>
                      {cromo.expansion}
                    </p>
                  )}
                </div>
              </div>
            )}

            
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: `radial-gradient(circle at ${holoPos.x}% ${holoPos.y}%, rgba(255,215,0,0.28) 0%, rgba(167,139,250,0.2) 35%, rgba(0,229,255,0.1) 60%, transparent 80%)`,
              transition: 'background 0.08s',
              borderRadius: 14,
            }} />
          </div>
        </div>
      </div>

      
      <div className="flex justify-center mb-4">
        <span className="text-[10px] font-black px-3 py-1 rounded-full"
              style={{ background: `${r.borde}22`, border: `1px solid ${r.borde}60`, color: r.borde }}>
          {r.label}
        </span>
      </div>

      
      <button onClick={() => onGestionar(cromo)}
        className="mt-auto w-full py-2.5 rounded-xl font-black text-sm uppercase tracking-wide transition-all active:scale-95"
        style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: '#1a1200',
                 boxShadow: '0 4px 16px rgba(255,165,0,0.4)' }}>
        📸 Cambiar foto
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   FORMULARIO AÑADIR REPETIDA
═══════════════════════════════════════════════════════════ */
const FORM_VACIO = { nombre: '', seccion: '', numero: '', rareza: 'common', categoria: 'Otros' };

function FormAnadir({ form, setF, onSubmit, loading, fotoPreview, fotoRef, onFoto, seccionesExistentes }) {
  return (
    <div className="h-full flex flex-col">
      <p className="font-black text-base text-white/90 uppercase tracking-wide mb-3">
        ➕ Añadir repetida
      </p>

      <div className="flex-1 overflow-y-auto pr-1 space-y-3">
        
        <div>
          <label className="block text-xs font-bold text-white/60 mb-1">Sección / Colección <span className="text-red-400">*</span></label>
          <input list="sec-list" placeholder="Ej: Pokémon TCG, LaLiga 2024…"
            value={form.seccion} onChange={e => setF('seccion', e.target.value)}
            className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-yellow-400/40 transition-all"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }} />
          <datalist id="sec-list">
            {seccionesExistentes.map(s => <option key={s} value={s} />)}
          </datalist>
        </div>

        
        <div>
          <label className="block text-xs font-bold text-white/60 mb-1">Nombre del cromo <span className="text-red-400">*</span></label>
          <input placeholder="Ej: Pikachu, Messi, Goku…"
            value={form.nombre} onChange={e => setF('nombre', e.target.value)}
            className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-yellow-400/40 transition-all"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }} />
        </div>

        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-bold text-white/60 mb-1">Número <span className="text-white/30">(opcional)</span></label>
            <input type="number" min="1" placeholder="025"
              value={form.numero} onChange={e => setF('numero', e.target.value)}
              className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }} />
          </div>
          <div>
            <label className="block text-xs font-bold text-white/60 mb-1">Rareza <span className="text-white/30">(opcional)</span></label>
            <select value={form.rareza} onChange={e => setF('rareza', e.target.value)}
              className="w-full rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"
              style={{ background: 'rgba(30,20,60,0.9)', border: '1px solid rgba(255,255,255,0.12)' }}>
              {['common','uncommon','rare','ultra-rare','secret-rare'].map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        
        <div>
          <label className="block text-xs font-bold text-white/60 mb-1">Categoría</label>
          <div className="grid grid-cols-2 gap-1.5">
            {[['Pokémon','⚡'],['Deportes','⚽'],['Anime','🌸'],['Otros','✨']].map(([c, ic]) => (
              <button key={c} type="button" onClick={() => setF('categoria', c)}
                className="py-2 rounded-xl text-xs font-black transition-all duration-200"
                style={form.categoria === c
                  ? { background: 'rgba(255,215,0,0.2)', border: '1.5px solid #FFD700', color: '#FFD700' }
                  : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.45)' }}>
                {ic} {c}
              </button>
            ))}
          </div>
        </div>

        
        <div onClick={() => fotoRef.current?.click()}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-white/10 transition-all"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px dashed rgba(255,255,255,0.18)' }}>
          {fotoPreview
            ? <img src={fotoPreview} alt="prev" className="w-10 rounded-lg flex-shrink-0 object-cover" style={{ height: 52 }} />
            : <div className="w-10 flex-shrink-0 flex items-center justify-center text-xl" style={{ height: 52 }}>📸</div>
          }
          <div>
            <p className="text-xs font-bold text-white/80">{fotoPreview ? 'Cambiar foto' : 'Añadir foto'}</p>
            <p className="text-[10px] text-white/40">JPG, PNG · máx 8 MB</p>
          </div>
          <input ref={fotoRef} type="file" accept="image/*" className="hidden"
            onChange={e => { const f = e.target.files[0]; if (f) onFoto(f); }} />
        </div>

        <button onClick={onSubmit} disabled={loading}
          className="w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: '#1a1200',
                   boxShadow: '0 4px 16px rgba(255,165,0,0.4)' }}>
          {loading ? '⏳ Añadiendo...' : '➕ Añadir cromo'}
        </button>
      </div>
    </div>
  );
}

/* ─── Modal subida de foto ─────────────────────────────────────── */
function ModalFoto({ cromo, onClose, onUploaded }) {
  const [preview, setPreview] = useState(null);
  const [file,    setFile]    = useState(null);
  const [uploading, setUp]    = useState(false);
  const ref = useRef();

  const upload = async () => {
    if (!file) return;
    setUp(true);
    const fd = new FormData();
    fd.append('photo', file);
    try {
      const { data } = await axiosClient.post('/uploads/card-photo', fd,
        { headers: { 'Content-Type': 'multipart/form-data' } });
      onUploaded(cromo._id, data.url);
      toast.success('Foto actualizada ✓');
      onClose();
    } catch { toast.error('Error subiendo foto'); }
    finally  { setUp(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
         onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-2xl"
           onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black text-mc-dark">Foto de "{cromo.nombre}"</h3>
          <button onClick={onClose} className="text-mc-muted hover:text-mc-dark">✕</button>
        </div>
        <div onClick={() => ref.current?.click()}
          className="border-2 border-dashed border-mc-border rounded-xl p-5 text-center cursor-pointer hover:border-mc-purple transition-colors mb-4">
          {preview
            ? <img src={preview} alt="prev" className="max-h-48 mx-auto object-contain rounded-lg" />
            : <div className="text-4xl mb-2">📸</div>}
          <p className="text-xs text-mc-muted">{preview ? 'Cambiar imagen' : 'Haz clic para seleccionar'}</p>
          <input ref={ref} type="file" accept="image/*" className="hidden"
            onChange={e => { const f = e.target.files[0]; if (f) { setFile(f); setPreview(URL.createObjectURL(f)); } }} />
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-mc-border text-mc-muted text-sm font-bold">Cancelar</button>
          <button onClick={upload} disabled={!file || uploading}
            className="flex-1 btn-yellow py-2 text-sm disabled:opacity-50">
            {uploading ? '...' : 'Subir foto'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PÁGINA PRINCIPAL — MIS REPETIDAS
═══════════════════════════════════════════════════════════ */
export default function MisRepes() {
  const [profile,       setProfile]       = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [seccion,       setSeccion]       = useState('Todas');
  const [busqueda,      setBusqueda]      = useState('');
  const [seleccionada,  setSel]           = useState(null);
  const [fotoModal,     setFotoModal]     = useState(null);
  const [fotosMap,      setFotosMap]      = useState({});
  const [form,          setForm]          = useState(FORM_VACIO);
  const [fotoFile,      setFotoFile]      = useState(null);
  const [fotoPreview,   setFotoPreview]   = useState(null);
  const [recientes,     setRecientes]     = useState(new Set());
  const fotoRef = useRef();

  const cargar = useCallback(async () => {
    try {
      const { data } = await axiosClient.get('/users/profile');
      setProfile(data.user);
    } catch { toast.error('Error cargando el perfil'); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleFoto = (file) => {
    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.nombre.trim() || !form.seccion.trim())
      return toast.error('El nombre y la sección son obligatorios');
    setSaving(true);
    try {
      let imagenUrl = '';
      if (fotoFile) {
        const fd = new FormData();
        fd.append('photo', fotoFile);
        const { data: up } = await axiosClient.post('/uploads/card-photo', fd,
          { headers: { 'Content-Type': 'multipart/form-data' } });
        imagenUrl = up.url;
      }
      const { data } = await axiosClient.post('/cromos', {
        nombre: form.nombre, coleccion: form.seccion,
        numero: form.numero || undefined,
        rareza: form.rareza,
        categoria: form.categoria,
        imagenUrl,
        addTo: 'repetidos',
      });
      await cargar();
      setRecientes(prev => new Set([...prev, data.cromo._id]));
      setTimeout(() => setRecientes(prev => { const s = new Set(prev); s.delete(data.cromo._id); return s; }), 8000);
      toast.success(`"${data.cromo.nombre}" añadida ✓`);
      setForm(FORM_VACIO);
      setFotoFile(null);
      setFotoPreview(null);
      if (fotoRef.current) fotoRef.current.value = '';
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al añadir');
    } finally { setSaving(false); }
  };

  const removeCromo = async (cromoId) => {
    const rep  = profile.inventario.repetidos.map(c => c._id).filter(id => id !== cromoId);
    const falt = profile.inventario.faltas.map(c => c._id);
    try {
      const { data } = await axiosClient.put('/users/inventario', { repetidos: rep, faltas: falt });
      setProfile(data.user);
      if (seleccionada?._id === cromoId) setSel(null);
      toast.success('Cromo eliminado de tus repetidas');
    } catch { toast.error('Error actualizando inventario'); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="text-4xl animate-spin text-mc-purple">✦</div>
    </div>
  );

  const misRepes = profile?.inventario.repetidos || [];
  const seccionesUnicas = [...new Set(misRepes.map(c => c.expansion).filter(Boolean))].sort();
  const secciones = ['Todas', ...seccionesUnicas];

  const filtrados = misRepes.filter(c => {
    const matchTexto = c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.expansion?.toLowerCase().includes(busqueda.toLowerCase());
    const matchSec = seccion === 'Todas' || c.expansion === seccion;
    return matchTexto && matchSec;
  });

  const nivel    = Math.floor(misRepes.length / 10) + 1;
  const xpActual = (misRepes.length % 10) * 10;

  return (
    <>
      {fotoModal && (
        <ModalFoto cromo={fotoModal} onClose={() => setFotoModal(null)}
          onUploaded={(id, url) => setFotosMap(p => ({ ...p, [id]: url }))} />
      )}

      <div className="flex flex-col h-[calc(100vh-4rem)] max-w-7xl mx-auto">

        
        <div className="px-6 pt-6 pb-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-mc-dark">Mis Repetidas</h1>
              <p className="text-xs text-mc-muted mt-0.5">Cromos de sobra disponibles para intercambio</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-mc-dark">Nivel {nivel}</p>
                <div className="w-28 h-1.5 bg-mc-light rounded-full mt-1 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                       style={{ width: `${xpActual}%`, background: 'linear-gradient(90deg, #7c3aed, #FFD700)' }} />
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-md"
                   style={{ background: 'linear-gradient(135deg, #5b21b6, #7c3aed)', color: '#FFD700',
                            boxShadow: '0 0 20px rgba(91,33,182,0.4)' }}>
                {nivel}
              </div>
            </div>
          </div>

          
          <div className="flex gap-3 mt-3">
            {[
              { n: misRepes.length,        l: 'Repetidas',  c: 'text-green-600'  },
              { n: seccionesUnicas.length, l: 'Secciones',  c: 'text-mc-purple'  },
            ].map(({ n, l, c }) => (
              <div key={l} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-mc-border shadow-sm">
                <span className={`font-black text-base ${c}`}>{n}</span>
                <span className="text-xs text-mc-muted">{l}</span>
              </div>
            ))}
          </div>
        </div>

        
        <div className="flex flex-1 gap-0 overflow-hidden px-6 pb-6">

          
          <div className="flex-1 rounded-2xl overflow-hidden relative flex flex-col"
               style={{ background: 'linear-gradient(145deg, #1e0a3c 0%, #2d1263 40%, #1a0a4e 100%)', minWidth: 0 }}>
            <div className="absolute inset-0 grid-energy-bg opacity-60 pointer-events-none" />
            <FondoGalactico />

            
            <div className="relative z-10 px-4 pt-4 pb-3 flex-shrink-0">
              
              <div className="flex gap-1.5 overflow-x-auto pb-1.5 mb-2.5" style={{ scrollbarWidth: 'none' }}>
                {secciones.map(sec => (
                  <button key={sec}
                    onClick={() => { setSeccion(sec); setSel(null); }}
                    className="flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black transition-all duration-200"
                    style={seccion === sec
                      ? { background: 'linear-gradient(135deg,#FFD700,#FFA500)', color: '#1a1200',
                          boxShadow: '0 2px 10px rgba(255,165,0,0.4)' }
                      : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)',
                          border: '1px solid rgba(255,255,255,0.12)' }}>
                    {sec === 'Todas' ? '🃏' : '📁'} {sec}
                    {sec !== 'Todas' && (
                      <span className="ml-1 opacity-60">
                        ({misRepes.filter(c => c.expansion === sec).length})
                      </span>
                    )}
                  </button>
                ))}
              </div>

              
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">🔍</span>
                <input placeholder="Buscar cromo..."
                  value={busqueda} onChange={e => setBusqueda(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl text-xs text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-yellow-400/30"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
            </div>

            
            <div className="flex-1 overflow-y-auto px-4 pb-4 relative z-10">
              {filtrados.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="text-5xl mb-3 animate-float inline-block">🔄</div>
                  <p className="font-black text-white/60 text-sm mb-1">
                    {busqueda ? 'Sin resultados' : seccion !== 'Todas' ? `Sin cromos en "${seccion}"` : 'Todavía no tienes repetidas'}
                  </p>
                  <p className="text-white/30 text-xs">Usa el panel de la derecha para añadir</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3 pt-2">
                  {filtrados.map(cromo => {
                    const cromoFinal = fotosMap[cromo._id] ? { ...cromo, imagenUrl: fotosMap[cromo._id] } : cromo;
                    return (
                      <CartaCromo
                        key={cromo._id}
                        cromo={cromoFinal}
                        seleccionada={seleccionada?._id === cromo._id}
                        esNueva={recientes.has(cromo._id)}
                        onSelect={setSel}
                        width={95}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          
          <div className="w-72 ml-4 flex-shrink-0 rounded-2xl relative overflow-hidden flex flex-col p-5"
               style={{ background: 'linear-gradient(160deg, #2d1263 0%, #1e0a3c 100%)',
                        border: '1px solid rgba(167,139,250,0.2)' }}>
            <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
                 style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }} />
            <div className="absolute inset-0 grid-energy-bg opacity-20 pointer-events-none" />

            <div className="relative z-10 flex-1 overflow-y-auto">
              {seleccionada ? (
                <PanelDetalle
                  cromo={fotosMap[seleccionada._id] ? { ...seleccionada, imagenUrl: fotosMap[seleccionada._id] } : seleccionada}
                  onGestionar={c => setFotoModal(c)}
                  onDeselect={() => setSel(null)}
                />
              ) : (
                <FormAnadir
                  form={form} setF={setF}
                  onSubmit={handleSubmit} loading={saving}
                  fotoPreview={fotoPreview} fotoRef={fotoRef} onFoto={handleFoto}
                  seccionesExistentes={seccionesUnicas}
                />
              )}
            </div>

            {seleccionada && (
              <div className="relative z-10 mt-3 pt-3 border-t border-white/10">
                <button onClick={() => removeCromo(seleccionada._id)}
                  className="w-full py-2 rounded-xl text-xs font-black border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">
                  🗑 Quitar de mis repetidas
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
