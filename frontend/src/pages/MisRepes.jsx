import { useEffect, useState, useRef } from 'react';
import axiosClient from '../api/axiosClient';
import { toast } from 'react-hot-toast';

/* ── Modal de subida de foto ── */
function ModalFoto({ cromo, onClose, onUploaded }) {
  const [preview,   setPreview]   = useState(null);
  const [file,      setFile]      = useState(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();

  const handleFile = e => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append('photo', file);
    try {
      const { data } = await axiosClient.post('/uploads/card-photo', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onUploaded(cromo._id, data.url);
      toast.success('Foto subida ✓');
      onClose();
    } catch {
      toast.error('Error al subir la foto');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
         onClick={onClose}>
      <div className="card-white p-6 rounded-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-mc-dark">Foto de "{cromo.nombre}"</h3>
          <button onClick={onClose} className="text-mc-muted hover:text-mc-dark w-8 h-8 rounded-lg flex items-center justify-center hover:bg-mc-light transition-colors">✕</button>
        </div>

        <div
          className="border-2 border-dashed border-mc-border rounded-xl p-6 text-center cursor-pointer hover:border-mc-purple hover:bg-mc-light transition-all mb-4"
          onClick={() => inputRef.current?.click()}
        >
          {preview
            ? <img src={preview} alt="preview" className="w-full max-h-48 object-contain rounded-lg mx-auto" />
            : <div className="space-y-2">
                <div className="text-4xl">📸</div>
                <p className="text-sm font-semibold text-mc-dark">Haz clic o arrastra tu foto aquí</p>
                <p className="text-xs text-mc-muted">JPG, PNG, WEBP · Máx. 8MB</p>
              </div>
          }
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-mc-border text-mc-muted font-semibold text-sm hover:border-mc-purple transition-colors">
            Cancelar
          </button>
          <button onClick={handleUpload} disabled={!file || uploading}
            className="flex-1 btn-yellow py-2.5 text-sm disabled:opacity-50">
            {uploading ? 'Subiendo...' : 'Subir foto'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Fila de carta en inventario ── */
function FilaCarta({ cromo, tipo, onRemove, onFoto, fotoUrl }) {
  const isRep = tipo === 'repetidos';
  return (
    <div className={`flex items-center gap-3 p-2.5 rounded-xl border mb-2 border-l-4 group transition-all
      ${isRep ? 'border-l-green-400 bg-green-50 border-green-100' : 'border-l-purple-400 bg-purple-50 border-purple-100'}`}>

      {/* Miniatura / botón de foto */}
      <div onClick={() => onFoto(cromo)}
           className="w-10 h-14 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer border-2 border-dashed border-mc-border hover:border-mc-purple transition-colors relative group/foto">
        {fotoUrl
          ? <img src={fotoUrl} alt={cromo.nombre} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center bg-white text-lg opacity-40">📷</div>
        }
        <div className="absolute inset-0 bg-mc-purple/30 opacity-0 group-hover/foto:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-white text-[9px] font-bold">foto</span>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-mc-dark truncate">{cromo.nombre}</p>
        <p className="text-xs text-mc-muted truncate">{cromo.expansion}</p>
      </div>
      <span className="font-mono text-[10px] text-mc-muted/60 flex-shrink-0">#{String(cromo.numero).padStart(3,'0')}</span>

      {/* Quitar */}
      <button onClick={() => onRemove(cromo._id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-500 w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-sm flex-shrink-0">
        ✕
      </button>
    </div>
  );
}

/* ── Formulario de nueva carta ── */
function FormNuevaCarta({ onAdded, coleccionesExistentes }) {
  const vacío = { nombre: '', coleccion: '', numero: '', addTo: 'repetidos', rareza: 'common' };
  const [form,    setForm]    = useState(vacío);
  const [loading, setLoading] = useState(false);
  const [fotoFile,  setFotoFile]  = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const fotoRef = useRef();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleFoto = e => {
    const f = e.target.files[0];
    if (!f) return;
    setFotoFile(f);
    setFotoPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.nombre || !form.coleccion || !form.numero) {
      return toast.error('Nombre, colección y número son obligatorios');
    }
    setLoading(true);
    try {
      let imagenUrl = '';

      // Subir foto primero si la hay
      if (fotoFile) {
        const fd = new FormData();
        fd.append('photo', fotoFile);
        const { data } = await axiosClient.post('/uploads/card-photo', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        imagenUrl = data.url;
      }

      const { data } = await axiosClient.post('/cromos', {
        nombre:    form.nombre,
        coleccion: form.coleccion,
        numero:    form.numero,
        rareza:    form.rareza,
        addTo:     form.addTo,
        imagenUrl,
      });

      toast.success(`"${data.cromo.nombre}" añadida a ${form.addTo} ✓`);
      onAdded(data.cromo, form.addTo);
      setForm(vacío);
      setFotoFile(null);
      setFotoPreview(null);
      if (fotoRef.current) fotoRef.current.value = '';
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al añadir la carta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-white p-5 rounded-2xl">
      <h3 className="font-black text-mc-dark mb-4 flex items-center gap-2">
        <span className="w-7 h-7 rounded-lg bg-mc-purple flex items-center justify-center text-white text-sm">+</span>
        Nueva carta
      </h3>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Colección */}
        <div>
          <label className="block text-xs font-bold text-mc-dark mb-1">Colección *</label>
          <input
            list="colecciones-list"
            placeholder="Ej: Panini Liga 23/24, Pokémon Base Set..."
            value={form.coleccion}
            onChange={e => set('coleccion', e.target.value)}
            className="input-light"
            required
          />
          <datalist id="colecciones-list">
            {coleccionesExistentes.map(c => <option key={c} value={c} />)}
          </datalist>
        </div>

        {/* Nombre */}
        <div>
          <label className="block text-xs font-bold text-mc-dark mb-1">Nombre de la carta *</label>
          <input
            placeholder="Ej: Messi, Pikachu, Dark Magician..."
            value={form.nombre}
            onChange={e => set('nombre', e.target.value)}
            className="input-light"
            required
          />
        </div>

        {/* Número + Rareza */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-bold text-mc-dark mb-1">Número *</label>
            <input
              type="number" min="1" placeholder="156"
              value={form.numero}
              onChange={e => set('numero', e.target.value)}
              className="input-light"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-mc-dark mb-1">Rareza</label>
            <select value={form.rareza} onChange={e => set('rareza', e.target.value)} className="input-light">
              <option value="common">Común</option>
              <option value="uncommon">Infrecuente</option>
              <option value="rare">Rara</option>
              <option value="ultra-rare">Ultra Rara</option>
              <option value="secret-rare">Secreta</option>
            </select>
          </div>
        </div>

        {/* Foto */}
        <div>
          <label className="block text-xs font-bold text-mc-dark mb-1">Foto de la carta (opcional)</label>
          <div
            onClick={() => fotoRef.current?.click()}
            className="border-2 border-dashed border-mc-border rounded-xl p-4 cursor-pointer hover:border-mc-purple hover:bg-mc-light transition-all flex items-center gap-3"
          >
            {fotoPreview
              ? <img src={fotoPreview} alt="preview" className="w-12 h-16 object-cover rounded-lg flex-shrink-0" />
              : <div className="w-12 h-16 bg-mc-light rounded-lg flex items-center justify-center text-2xl flex-shrink-0">📸</div>
            }
            <div>
              <p className="text-sm font-semibold text-mc-dark">{fotoPreview ? 'Cambiar foto' : 'Subir foto'}</p>
              <p className="text-xs text-mc-muted">JPG, PNG, WEBP · Máx. 8MB</p>
            </div>
            <input ref={fotoRef} type="file" accept="image/*" className="hidden" onChange={handleFoto} />
          </div>
        </div>

        {/* Añadir a */}
        <div>
          <label className="block text-xs font-bold text-mc-dark mb-1">¿La tengo o me falta?</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { val: 'repetidos', label: '🔄 La tengo (repetida)',   active: 'bg-green-500 text-white border-green-500' },
              { val: 'faltas',    label: '⭐ Me falta',               active: 'bg-mc-purple text-white border-mc-purple' },
            ].map(({ val, label, active }) => (
              <button key={val} type="button"
                onClick={() => set('addTo', val)}
                className={`py-2.5 px-3 rounded-xl border-2 text-xs font-bold transition-all duration-200
                  ${form.addTo === val ? active : 'border-mc-border text-mc-muted hover:border-mc-purple hover:text-mc-purple bg-white'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="btn-yellow w-full py-3 text-sm disabled:opacity-50 mt-1">
          {loading
            ? <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Añadiendo...
              </span>
            : '➕ Añadir carta'}
        </button>
      </form>
    </div>
  );
}

/* ── Página principal ── */
export default function MisRepes() {
  const [profile,  setProfile]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [activeTab, setTab]     = useState('repetidos');
  const [fotoModal, setFotoModal] = useState(null);
  const [fotosMap,  setFotosMap]  = useState({});

  useEffect(() => {
    axiosClient.get('/users/profile')
      .then(({ data }) => setProfile(data.user))
      .catch(() => toast.error('Error cargando el perfil'))
      .finally(() => setLoading(false));
  }, []);

  const removeCromo = async (cromoId) => {
    setSaving(true);
    try {
      const rep   = profile.inventario.repetidos.map(c => c._id).filter(id => id !== cromoId);
      const falt  = profile.inventario.faltas.map(c => c._id).filter(id => id !== cromoId);
      const { data } = await axiosClient.put('/users/inventario', { repetidos: rep, faltas: falt });
      setProfile(data.user);
      toast.success('Carta quitada del inventario');
    } catch {
      toast.error('Error actualizando inventario');
    } finally {
      setSaving(false);
    }
  };

  // Cuando el formulario añade una carta exitosamente, recargamos el perfil
  const handleAdded = async () => {
    const { data } = await axiosClient.get('/users/profile');
    setProfile(data.user);
  };

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-16 flex items-center justify-center">
      <div className="text-mc-purple animate-spin text-3xl">✦</div>
    </div>
  );

  const listRep   = profile?.inventario.repetidos || [];
  const listFalt  = profile?.inventario.faltas    || [];
  const activeList = activeTab === 'repetidos' ? listRep : listFalt;

  // Colecciones ya existentes para el autocomplete
  const coleccionesExistentes = [...new Set(
    [...listRep, ...listFalt].map(c => c.expansion).filter(Boolean)
  )].sort();

  const stats = [
    { label: 'Tengo (repetidas)',  count: listRep.length,  color: 'text-green-600',  bg: 'bg-green-50 border-green-200',  icon: '🔄' },
    { label: 'Me faltan',          count: listFalt.length,  color: 'text-mc-purple',  bg: 'bg-purple-50 border-purple-200', icon: '⭐' },
    { label: 'Total en colección', count: listRep.length + listFalt.length, color: 'text-mc-blue', bg: 'bg-blue-50 border-blue-200', icon: '📦' },
  ];

  return (
    <>
      {fotoModal && (
        <ModalFoto
          cromo={fotoModal}
          onClose={() => setFotoModal(null)}
          onUploaded={(id, url) => setFotosMap(prev => ({ ...prev, [id]: url }))}
        />
      )}

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-mc-dark mb-1">Mis Repes</h1>
          <p className="text-mc-muted text-sm">Añade tus cartas, marca las que tienes y las que te faltan</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {stats.map(({ label, count, color, bg, icon }) => (
            <div key={label} className={`card-white p-4 text-center border ${bg}`}>
              <div className="text-xl mb-1">{icon}</div>
              <div className={`text-2xl font-black ${color}`}>{count}</div>
              <div className="text-xs text-mc-muted leading-tight mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Columna izquierda: inventario */}
          <div className="card-white p-5 rounded-2xl">
            {/* Tabs */}
            <div className="flex mb-4 bg-mc-light rounded-xl p-1">
              {[
                { val: 'repetidos', label: '🔄 Tengo',    n: listRep.length  },
                { val: 'faltas',    label: '⭐ Me falta',  n: listFalt.length },
              ].map(({ val, label, n }) => (
                <button key={val} onClick={() => setTab(val)}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all duration-200
                    ${activeTab === val
                      ? val === 'repetidos'
                        ? 'bg-white text-green-600 shadow-sm border border-green-200'
                        : 'bg-white text-mc-purple shadow-sm border border-purple-200'
                      : 'text-mc-muted hover:text-mc-dark'
                    }`}>
                  {label} <span className="opacity-60 text-xs">({n})</span>
                </button>
              ))}
            </div>

            <div className="max-h-[480px] overflow-y-auto pr-1">
              {activeList.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-3xl mb-2">{activeTab === 'repetidos' ? '🔄' : '⭐'}</div>
                  <p className="text-mc-muted text-sm font-semibold">
                    {activeTab === 'repetidos' ? 'Sin cartas repetidas todavía' : 'Sin cartas en tu lista de faltas'}
                  </p>
                  <p className="text-mc-muted text-xs mt-1">Usa el formulario de la derecha para añadir cartas</p>
                </div>
              ) : (
                activeList.map(cromo => (
                  <FilaCarta
                    key={cromo._id}
                    cromo={cromo}
                    tipo={activeTab}
                    onRemove={removeCromo}
                    onFoto={setFotoModal}
                    fotoUrl={fotosMap[cromo._id]}
                  />
                ))
              )}
            </div>
          </div>

          {/* Columna derecha: formulario de alta */}
          <FormNuevaCarta
            onAdded={handleAdded}
            coleccionesExistentes={coleccionesExistentes}
          />
        </div>
      </div>
    </>
  );
}
