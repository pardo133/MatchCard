import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import CartaHex   from '../components/common/CartaHex';
import { toast }  from 'react-hot-toast';

const CLIP = 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)';

/* ══════════════════════════════════════════════
   FONDO GALÁCTICO con partículas
══════════════════════════════════════════════ */
function FondoGalactico() {
  const dots = useMemo(() => Array.from({ length: 22 }, (_, i) => ({
    left:    `${(i * 43 + 11) % 100}%`,
    top:     `${(i * 71 + 19) % 100}%`,
    size:    1 + (i % 3),
    opacity: 0.08 + (i % 5) * 0.04,
    dur:     `${4 + (i % 6)}s`,
    delay:   `${-(i * 0.8)}s`,
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

/* ══════════════════════════════════════════════
   CARTA EN GRID (con badge y hover glow)
══════════════════════════════════════════════ */
function CartaGrid({ cromo, seleccionada, esNueva, onSelect }) {
  return (
    <div
      className="relative cursor-pointer group"
      style={{ width: '100%', maxWidth: 110 }}
      onClick={() => onSelect(cromo)}
    >
      {/* Ring de selección */}
      {seleccionada && (
        <>
          <div className="absolute inset-[-6px] rounded-full pointer-events-none"
               style={{ clipPath: CLIP, background: 'rgba(255,215,0,0.25)',
                        animation: 'pulseRing 1.2s ease-out infinite' }} />
          <div className="absolute inset-[-3px] pointer-events-none"
               style={{ clipPath: CLIP, boxShadow: '0 0 0 2px #FFD700' }} />
        </>
      )}

      {/* Carta */}
      <div className={`transition-all duration-300 ${seleccionada ? 'scale-110' : 'group-hover:scale-105 group-hover:-translate-y-1'}`}
           style={{ filter: seleccionada ? 'drop-shadow(0 0 16px rgba(255,215,0,0.6))' : 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))' }}>
        <CartaHex cromo={cromo} size={100} />
      </div>

      {/* Badge nueva / coincidencia */}
      {esNueva && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 badge-float">
          <span className="bg-green-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg whitespace-nowrap"
                style={{ boxShadow: '0 0 10px rgba(34,197,94,0.6)' }}>
            ✓ ¡Nueva!
          </span>
        </div>
      )}

      {/* Nombre bajo la carta */}
      <p className="text-center text-[10px] font-bold text-white/80 mt-1.5 truncate leading-tight px-1">
        {cromo.nombre}
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════
   HERO PANEL: carta seleccionada con holo
══════════════════════════════════════════════ */
function HeroPanel({ cromo, tipo, onGestionar, onDeselect }) {
  const [holoPos, setHoloPos] = useState({ x: 50, y: 50 });
  const cardRef = useRef(null);

  const handleMove = (e) => {
    if (!cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    setHoloPos({
      x: Math.round(((e.clientX - r.left) / r.width) * 100),
      y: Math.round(((e.clientY - r.top) / r.height) * 100),
    });
  };

  return (
    <div className="h-full flex flex-col card-hex-selected" key={cromo._id}>
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/50">
            {tipo === 'repetidos' ? '🔄 Tengo (repetida)' : '⭐ Me falta'}
          </p>
          <h2 className="text-xl font-black text-white leading-tight">{cromo.nombre}</h2>
          <p className="text-xs text-white/60">{cromo.expansion} · #{String(cromo.numero).padStart(3, '0')}</p>
        </div>
        <button onClick={onDeselect}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors text-sm">
          ✕
        </button>
      </div>

      {/* Carta holo grande */}
      <div className="flex justify-center mb-5"
           ref={cardRef} onMouseMove={handleMove}
           style={{ cursor: 'crosshair' }}>
        <div className="relative" style={{ userSelect: 'none' }}>
          <CartaHex cromo={cromo} size={180} glow />

          {/* Overlay holográfico reactivo al ratón */}
          <div className="absolute inset-0 pointer-events-none transition-all duration-100"
               style={{
                 clipPath: CLIP,
                 background: `radial-gradient(circle at ${holoPos.x}% ${holoPos.y}%,
                   rgba(255,215,0,0.28) 0%,
                   rgba(167,139,250,0.22) 30%,
                   rgba(0,229,255,0.12) 55%,
                   transparent 75%)`,
               }} />

          {/* Sweep permanente */}
          <div className="absolute inset-0 pointer-events-none holo-sweep overflow-hidden"
               style={{ clipPath: CLIP }} />
        </div>
      </div>

      {/* Rareza badge */}
      <div className="flex justify-center mb-4">
        <span className={`badge border text-xs
          ${ cromo.rareza === 'secret-rare' ? 'bg-amber-900/60 border-amber-400/50 text-amber-300'  :
             cromo.rareza === 'ultra-rare'  ? 'bg-purple-900/60 border-purple-400/50 text-purple-300':
             cromo.rareza === 'rare'        ? 'bg-blue-900/60 border-blue-400/50 text-blue-300'      :
             cromo.rareza === 'uncommon'    ? 'bg-green-900/60 border-green-400/50 text-green-300'   :
                                              'bg-gray-700/60 border-gray-500/50 text-gray-300' }`}>
          {cromo.rareza}
        </span>
      </div>

      {/* Eslogan */}
      <div className="flex-1 border-t border-white/10 pt-4 space-y-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">
          Colecciones de Élite
        </p>
        <p className="text-xs text-white/70 leading-relaxed">
          <span className="font-black text-white">INTERCAMBIA CON PROPÓSITO.</span> Conecta con
          coleccionistas locales, intercambia duplicados y completa tus álbumes más rápido.
        </p>
      </div>

      {/* Botón acción */}
      <button onClick={() => onGestionar(cromo)}
        className="mt-4 w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all duration-200 active:scale-95"
        style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: '#1a1200',
                 boxShadow: '0 4px 20px rgba(255,165,0,0.4)' }}>
        Gestionar Cromo
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════
   PANEL VACÍO (sin carta seleccionada)
══════════════════════════════════════════════ */
function PanelVacio({ activeTab, onTabChange, form, onFormChange, onSubmit, loading,
                      fotoFile, onFoto, fotoPreview, fotoRef, coleccionesExistentes }) {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-5">
        <p className="shimmer-text font-black text-lg uppercase tracking-wide mb-1">
          Colecciones de Élite
        </p>
        <p className="text-xs text-white/60 leading-relaxed">
          Selecciona una carta del álbum para ver sus detalles, o añade una nueva carta
          a tu colección usando el formulario de abajo.
        </p>
      </div>

      {/* Form añadir */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-3">
        <p className="text-xs font-black text-white/40 uppercase tracking-widest">➕ Añadir carta</p>

        <div>
          <label className="block text-xs font-bold text-white/60 mb-1">Colección</label>
          <input list="col-list" placeholder="Ej: Panini Liga 23/24"
            value={form.coleccion} onChange={e => onFormChange('coleccion', e.target.value)}
            className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-yellow-400/40 transition-all"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }} />
          <datalist id="col-list">
            {coleccionesExistentes.map(c => <option key={c} value={c} />)}
          </datalist>
        </div>

        <div>
          <label className="block text-xs font-bold text-white/60 mb-1">Nombre</label>
          <input placeholder="Ej: Messi, Pikachu..."
            value={form.nombre} onChange={e => onFormChange('nombre', e.target.value)}
            className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-yellow-400/40 transition-all"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-bold text-white/60 mb-1">Número</label>
            <input type="number" min="1" placeholder="025"
              value={form.numero} onChange={e => onFormChange('numero', e.target.value)}
              className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }} />
          </div>
          <div>
            <label className="block text-xs font-bold text-white/60 mb-1">Rareza</label>
            <select value={form.rareza} onChange={e => onFormChange('rareza', e.target.value)}
              className="w-full rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
              style={{ background: 'rgba(30,20,60,0.9)', border: '1px solid rgba(255,255,255,0.12)' }}>
              {['common','uncommon','rare','ultra-rare','secret-rare'].map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Foto */}
        <div onClick={() => fotoRef.current?.click()}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer transition-all hover:bg-white/10"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px dashed rgba(255,255,255,0.15)' }}>
          {fotoPreview
            ? <img src={fotoPreview} alt="prev" className="w-10 h-13 object-cover rounded-lg flex-shrink-0" style={{ height: 52 }} />
            : <div className="w-10 flex-shrink-0 flex items-center justify-center text-xl" style={{ height: 52 }}>📸</div>
          }
          <div>
            <p className="text-xs font-bold text-white/80">{fotoPreview ? 'Cambiar foto' : 'Añadir foto'}</p>
            <p className="text-[10px] text-white/40">JPG, PNG · máx 8MB</p>
          </div>
          <input ref={fotoRef} type="file" accept="image/*" className="hidden"
            onChange={e => { const f = e.target.files[0]; if (f) onFoto(f); }} />
        </div>

        {/* Tipo */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { val: 'repetidos', label: '🔄 La tengo' },
            { val: 'faltas',    label: '⭐ Me falta' },
          ].map(({ val, label }) => (
            <button key={val} type="button"
              onClick={() => onFormChange('addTo', val)}
              className={`py-2 rounded-xl text-xs font-black transition-all duration-200
                ${form.addTo === val
                  ? val === 'repetidos'
                    ? 'bg-green-500/30 border-2 border-green-400 text-green-300'
                    : 'bg-purple-500/30 border-2 border-purple-400 text-purple-300'
                  : 'border border-white/15 text-white/50 hover:border-white/30'}`}>
              {label}
            </button>
          ))}
        </div>

        <button onClick={onSubmit} disabled={loading}
          className="w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all duration-200 active:scale-95 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: '#1a1200',
                   boxShadow: '0 4px 16px rgba(255,165,0,0.4)' }}>
          {loading ? '⏳ Añadiendo...' : '➕ Añadir carta'}
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MODAL FOTO
══════════════════════════════════════════════ */
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
      toast.success('Foto subida ✓');
      onClose();
    } catch { toast.error('Error subiendo foto'); }
    finally  { setUp(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
         onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-2xl pop-in"
           onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black text-mc-dark">Foto de "{cromo.nombre}"</h3>
          <button onClick={onClose} className="text-mc-muted hover:text-mc-dark">✕</button>
        </div>
        <div onClick={() => ref.current?.click()}
          className="border-2 border-dashed border-mc-border rounded-xl p-5 text-center cursor-pointer hover:border-mc-purple transition-colors mb-4">
          {preview
            ? <img src={preview} alt="prev" className="max-h-40 mx-auto object-contain rounded-lg" />
            : <div className="text-4xl mb-2">📸</div>}
          <p className="text-xs text-mc-muted">{preview ? 'Cambiar' : 'Haz clic para seleccionar'}</p>
          <input ref={ref} type="file" accept="image/*" className="hidden"
            onChange={e => { const f = e.target.files[0]; if (f) { setFile(f); setPreview(URL.createObjectURL(f)); } }} />
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-mc-border text-mc-muted text-sm font-bold">
            Cancelar
          </button>
          <button onClick={upload} disabled={!file || uploading}
            className="flex-1 btn-yellow py-2 text-sm disabled:opacity-50">
            {uploading ? '...' : 'Subir'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   PÁGINA PRINCIPAL
══════════════════════════════════════════════ */
const EMPTY_FORM = { nombre: '', coleccion: '', numero: '', rareza: 'common', addTo: 'repetidos' };

export default function MisRepes() {
  const [profile,    setProfile]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [activeTab,  setTab]        = useState('repetidos');
  const [busqueda,   setBusqueda]   = useState('');
  const [seleccionada, setSel]      = useState(null);  // carta seleccionada
  const [fotoModal,  setFotoModal]  = useState(null);
  const [fotosMap,   setFotosMap]   = useState({});
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [fotoFile,   setFotoFile]   = useState(null);
  const [fotoPreview,setFotoPreview]= useState(null);
  const [recientes,  setRecientes]  = useState(new Set()); // IDs de cartas nuevas
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
    if (!form.nombre || !form.coleccion || !form.numero)
      return toast.error('Nombre, colección y número son obligatorios');
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
      const { data } = await axiosClient.post('/cromos', { ...form, coleccion: form.coleccion, imagenUrl });
      await cargar();
      setRecientes(prev => new Set([...prev, data.cromo._id]));
      setTimeout(() => setRecientes(prev => { const s = new Set(prev); s.delete(data.cromo._id); return s; }), 8000);
      toast.success(`"${data.cromo.nombre}" añadida ✓`);
      setForm(EMPTY_FORM);
      setFotoFile(null);
      setFotoPreview(null);
      if (fotoRef.current) fotoRef.current.value = '';
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al añadir');
    } finally { setSaving(false); }
  };

  const removeCromo = async (cromoId) => {
    const rep  = profile.inventario.repetidos.map(c => c._id).filter(id => id !== cromoId);
    const falt = profile.inventario.faltas.map(c => c._id).filter(id => id !== cromoId);
    try {
      const { data } = await axiosClient.put('/users/inventario', { repetidos: rep, faltas: falt });
      setProfile(data.user);
      if (seleccionada?._id === cromoId) setSel(null);
      toast.success('Carta eliminada del inventario');
    } catch { toast.error('Error actualizando'); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="text-4xl animate-spin text-mc-purple">✦</div>
    </div>
  );

  const listRep  = profile?.inventario.repetidos || [];
  const listFalt = profile?.inventario.faltas    || [];
  const activos  = activeTab === 'repetidos' ? listRep : listFalt;

  const filtrados = activos.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.expansion?.toLowerCase().includes(busqueda.toLowerCase()) ||
    String(c.numero).includes(busqueda)
  );

  const coleccionesExistentes = [...new Set(
    [...listRep, ...listFalt].map(c => c.expansion).filter(Boolean)
  )].sort();

  // Stats gamificadas
  const totalCartas = listRep.length + listFalt.length;
  const nivel = Math.floor(totalCartas / 10) + 1;
  const xpActual = (totalCartas % 10) * 10;

  return (
    <>
      {fotoModal && (
        <ModalFoto cromo={fotoModal} onClose={() => setFotoModal(null)}
          onUploaded={(id, url) => setFotosMap(p => ({ ...p, [id]: url }))} />
      )}

      <div className="flex flex-col h-[calc(100vh-4rem)] max-w-7xl mx-auto">

        {/* ── HEADER ── */}
        <div className="px-6 pt-6 pb-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-mc-dark">Mis Repes</h1>
              <p className="text-xs text-mc-muted mt-0.5">Tu álbum de cartas coleccionables</p>
            </div>

            {/* Level badge gamificado */}
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

          {/* Stats rápidas */}
          <div className="flex gap-3 mt-3">
            {[
              { n: listRep.length,  l: 'Tengo',    c: 'text-green-600' },
              { n: listFalt.length, l: 'Me faltan', c: 'text-mc-purple' },
              { n: totalCartas,     l: 'Total',     c: 'text-mc-dark'   },
            ].map(({ n, l, c }) => (
              <div key={l} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-mc-border shadow-sm">
                <span className={`font-black text-base ${c}`}>{n}</span>
                <span className="text-xs text-mc-muted">{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── CUERPO PRINCIPAL ── */}
        <div className="flex flex-1 gap-0 overflow-hidden px-6 pb-6">

          {/* ── GRID GALÁCTICO (izquierda) ── */}
          <div className="flex-1 rounded-2xl overflow-hidden relative flex flex-col"
               style={{ background: 'linear-gradient(145deg, #1e0a3c 0%, #2d1263 40%, #1a0a4e 100%)',
                        minWidth: 0 }}>
            {/* Grid de energía animado */}
            <div className="absolute inset-0 grid-energy-bg opacity-60 pointer-events-none" />
            <FondoGalactico />

            {/* Controls */}
            <div className="relative z-10 px-4 pt-4 pb-3 flex-shrink-0">
              {/* Tabs */}
              <div className="flex gap-1 p-1 rounded-xl mb-3"
                   style={{ background: 'rgba(255,255,255,0.06)' }}>
                {[
                  { val: 'repetidos', label: '🔄 Tengo', n: listRep.length },
                  { val: 'faltas',    label: '⭐ Me falta', n: listFalt.length },
                ].map(({ val, label, n }) => (
                  <button key={val} onClick={() => { setTab(val); setSel(null); }}
                    className={`flex-1 py-2 rounded-lg text-xs font-black transition-all duration-200
                      ${activeTab === val
                        ? val === 'repetidos'
                          ? 'bg-green-500/30 text-green-300 border border-green-500/40'
                          : 'bg-purple-500/30 text-purple-300 border border-purple-500/40'
                        : 'text-white/40 hover:text-white/60'}`}>
                    {label} ({n})
                  </button>
                ))}
              </div>

              {/* Búsqueda */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">🔍</span>
                <input placeholder="Buscar carta..."
                  value={busqueda} onChange={e => setBusqueda(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl text-xs text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-yellow-400/30"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
            </div>

            {/* Grid de cartas */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 relative z-10">
              {filtrados.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="text-5xl mb-3 animate-float inline-block">
                    {activeTab === 'repetidos' ? '🔄' : '⭐'}
                  </div>
                  <p className="font-black text-white/60 text-sm mb-1">
                    {busqueda ? 'Sin resultados' : activeTab === 'repetidos' ? 'Sin repetidas todavía' : 'Sin cartas en faltas'}
                  </p>
                  <p className="text-white/30 text-xs">Usa el panel de la derecha para añadir cartas</p>
                </div>
              ) : (
                <div className="grid gap-4 justify-items-center"
                     style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))' }}>
                  {filtrados.map(cromo => (
                    <CartaGrid
                      key={cromo._id}
                      cromo={fotosMap[cromo._id] ? { ...cromo, imagenUrl: fotosMap[cromo._id] } : cromo}
                      seleccionada={seleccionada?._id === cromo._id}
                      esNueva={recientes.has(cromo._id)}
                      onSelect={setSel}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── PANEL LATERAL DERECHO ── */}
          <div className="w-72 ml-4 flex-shrink-0 rounded-2xl relative overflow-hidden flex flex-col p-5"
               style={{ background: 'linear-gradient(160deg, #2d1263 0%, #1e0a3c 100%)',
                        border: '1px solid rgba(167,139,250,0.2)' }}>
            {/* Brillo superior */}
            <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
                 style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }} />
            <div className="absolute inset-0 grid-energy-bg opacity-20 pointer-events-none" />

            <div className="relative z-10 flex-1 overflow-y-auto">
              {seleccionada ? (
                <HeroPanel
                  cromo={fotosMap[seleccionada._id] ? { ...seleccionada, imagenUrl: fotosMap[seleccionada._id] } : seleccionada}
                  tipo={activeTab}
                  onGestionar={(c) => setFotoModal(c)}
                  onDeselect={() => setSel(null)}
                />
              ) : (
                <PanelVacio
                  activeTab={activeTab}
                  onTabChange={setTab}
                  form={form}
                  onFormChange={setF}
                  onSubmit={handleSubmit}
                  loading={saving}
                  fotoFile={fotoFile}
                  onFoto={handleFoto}
                  fotoPreview={fotoPreview}
                  fotoRef={fotoRef}
                  coleccionesExistentes={coleccionesExistentes}
                />
              )}
            </div>

            {/* Quitar carta seleccionada del inventario */}
            {seleccionada && (
              <div className="relative z-10 mt-3 pt-3 border-t border-white/10">
                <button onClick={() => removeCromo(seleccionada._id)}
                  className="w-full py-2 rounded-xl text-xs font-black border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">
                  🗑 Quitar del inventario
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
