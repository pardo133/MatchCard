import { useEffect, useState } from 'react';
import { Navigate }     from 'react-router-dom';
import axiosClient       from '../api/axiosClient';
import CartaHex          from '../components/common/CartaHex';
import { useUserStore }  from '../store/userStore';
import { toast }         from 'react-hot-toast';

const EMPTY_CROMO = { numero: '', nombre: '', coleccion: '', rareza: 'common', imagenUrl: '' };

/* ══ STATS CARD ══ */
function StatCard({ icon, label, value, color }) {
  return (
    <div className="card-white p-5 rounded-2xl text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <div className={`text-3xl font-black ${color}`}>{value}</div>
      <div className="text-xs text-mc-muted mt-1">{label}</div>
    </div>
  );
}

/* ══ FILA USUARIO ══ */
function FilaUsuario({ usuario, onToggleAdmin, onToggleActivo }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all
      ${usuario.isActive ? 'border-mc-border/50 bg-white' : 'border-red-200 bg-red-50 opacity-70'}`}>
      <div className="w-9 h-9 rounded-full bg-mc-light border border-mc-border flex items-center justify-center text-sm flex-shrink-0">
        {usuario.isAdmin ? '🛡️' : '👤'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="font-black text-mc-dark text-sm truncate">{usuario.username}</p>
          {usuario.isAdmin && (
            <span className="badge bg-mc-purple/10 text-mc-purple border border-mc-purple/20 text-[9px]">Admin</span>
          )}
          {!usuario.isActive && (
            <span className="badge bg-red-100 text-red-600 border border-red-200 text-[9px]">Suspendido</span>
          )}
        </div>
        <p className="text-xs text-mc-muted truncate">{usuario.email} · {usuario.ciudad}</p>
        <p className="text-[10px] text-mc-muted/60">{usuario.totalCartas} cartas</p>
      </div>
      <div className="flex gap-1.5 flex-shrink-0">
        <button onClick={() => onToggleAdmin(usuario._id, usuario.isAdmin)}
          className={`text-[10px] font-black px-2.5 py-1 rounded-lg border transition-colors
            ${usuario.isAdmin
              ? 'bg-mc-purple/10 border-mc-purple/30 text-mc-purple hover:bg-mc-purple/20'
              : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-mc-purple hover:text-mc-purple'}`}>
          {usuario.isAdmin ? '↓ Admin' : '↑ Admin'}
        </button>
        <button onClick={() => onToggleActivo(usuario._id, usuario.isActive)}
          className={`text-[10px] font-black px-2.5 py-1 rounded-lg border transition-colors
            ${usuario.isActive
              ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100'
              : 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100'}`}>
          {usuario.isActive ? 'Suspender' : 'Activar'}
        </button>
      </div>
    </div>
  );
}

/* ══ PÁGINA ADMIN ══ */
export default function Admin() {
  const { user }     = useUserStore();
  const [tab, setTab] = useState('stats');
  const [stats,   setStats]   = useState(null);
  const [cromos,  setCromos]  = useState([]);
  const [usuarios,setUsuarios]= useState([]);
  const [total,   setTotal]   = useState(0);
  const [busqueda,setBusqueda]= useState('');
  const [form,    setForm]    = useState(EMPTY_CROMO);
  const [saving,  setSaving]  = useState(false);
  const [loading, setLoading] = useState(true);

  if (!user?.isAdmin) return <Navigate to="/" replace />;

  const cargar = async () => {
    setLoading(true);
    try {
      const [sRes, cRes] = await Promise.all([
        axiosClient.get('/admin/stats'),
        axiosClient.get('/cromos'),
      ]);
      setStats(sRes.data);
      setCromos(cRes.data.cromos || []);
    } catch { toast.error('Error cargando datos'); }
    finally  { setLoading(false); }
  };

  const cargarUsuarios = async (q = '') => {
    try {
      const { data } = await axiosClient.get(`/admin/usuarios?search=${q}&limit=30`);
      setUsuarios(data.usuarios);
      setTotal(data.total);
    } catch { toast.error('Error cargando usuarios'); }
  };

  useEffect(() => { cargar(); }, []);
  useEffect(() => {
    if (tab === 'usuarios') cargarUsuarios(busqueda);
  }, [tab, busqueda]);

  const handleAddCromo = async e => {
    e.preventDefault();
    if (!form.nombre || !form.coleccion || !form.numero)
      return toast.error('Nombre, colección y número obligatorios');
    setSaving(true);
    try {
      const { data } = await axiosClient.post('/cromos', { ...form });
      setCromos(p => [...p, data.cromo]);
      setStats(s => s ? { ...s, cromos: s.cromos + 1 } : s);
      setForm(EMPTY_CROMO);
      toast.success(`${data.cromo.nombre} añadida ✓`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al añadir');
    } finally { setSaving(false); }
  };

  const handleDeleteCromo = async id => {
    if (!confirm('¿Eliminar esta carta?')) return;
    try {
      await axiosClient.delete(`/cromos/${id}`);
      setCromos(p => p.filter(c => c._id !== id));
      toast.success('Carta eliminada');
    } catch { toast.error('Error eliminando'); }
  };

  const handleToggleAdmin  = async (id, actual) => {
    try {
      await axiosClient.put(`/admin/usuarios/${id}/admin`);
      setUsuarios(p => p.map(u => u._id === id ? { ...u, isAdmin: !actual } : u));
      toast.success(actual ? 'Admin quitado' : 'Admin asignado');
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleToggleActivo = async (id, actual) => {
    try {
      await axiosClient.put(`/admin/usuarios/${id}/activo`);
      setUsuarios(p => p.map(u => u._id === id ? { ...u, isActive: !actual } : u));
      toast.success(actual ? 'Usuario suspendido' : 'Usuario activado');
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const TABS = [
    { id: 'stats',    label: '📊 Stats'   },
    { id: 'cartas',   label: '🃏 Cartas'  },
    { id: 'usuarios', label: '👥 Usuarios' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
             style={{ background: 'linear-gradient(135deg, #5b21b6, #7c3aed)' }}>
          🛡️
        </div>
        <div>
          <h1 className="text-2xl font-black text-mc-dark">Panel de Administración</h1>
          <p className="text-mc-muted text-xs">MatchCard — Sistema de gestión</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-mc-light p-1 rounded-xl">
        {TABS.map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-black transition-all duration-200
              ${tab === id ? 'bg-white shadow-sm text-mc-dark' : 'text-mc-muted hover:text-mc-dark'}`}>
            {label}
          </button>
        ))}
      </div>

      {loading && tab === 'stats' ? (
        <div className="flex justify-center py-12"><div className="animate-spin text-3xl text-mc-purple">✦</div></div>
      ) : (

        /* ── STATS ── */
        tab === 'stats' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <StatCard icon="👥" label="Usuarios"      value={stats.usuarios}   color="text-mc-purple" />
              <StatCard icon="🃏" label="Cartas"        value={stats.cromos}     color="text-mc-blue"   />
              <StatCard icon="⚡" label="Matches"       value={stats.matches}    color="text-amber-600" />
              <StatCard icon="✅" label="Completados"   value={stats.completados} color="text-green-600" />
              <StatCard icon="📍" label="Ciudades"      value={stats.ciudades}   color="text-pink-600"  />
            </div>

            {/* Info del sistema */}
            <div className="card-white p-6 rounded-2xl">
              <h2 className="font-black text-mc-dark mb-4">Sistema</h2>
              <div className="space-y-2">
                {[
                  { label: 'Tasa de éxito',     value: stats.matches > 0 ? `${Math.round((stats.completados / stats.matches) * 100)}%` : '0%' },
                  { label: 'Matches por ciudad', value: stats.ciudades > 0 ? `~${(stats.matches / stats.ciudades).toFixed(1)}` : '0' },
                  { label: 'Cartas por usuario', value: stats.usuarios > 0 ? `~${(stats.cromos / stats.usuarios).toFixed(1)}` : '0' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-2 border-b border-mc-border/40 last:border-0">
                    <span className="text-sm text-mc-muted">{label}</span>
                    <span className="font-black text-mc-dark text-sm">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      )}

      {/* ── CARTAS ── */}
      {tab === 'cartas' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Formulario */}
          <div className="card-white p-6 rounded-2xl">
            <h2 className="font-black text-mc-dark mb-4">➕ Añadir carta al catálogo</h2>
            <form onSubmit={handleAddCromo} className="space-y-3">
              {[
                { key: 'nombre',    label: 'Nombre',     placeholder: 'Pikachu' },
                { key: 'coleccion', label: 'Colección',  placeholder: 'Pokémon Base Set' },
                { key: 'imagenUrl', label: 'URL imagen', placeholder: 'https://...' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-bold text-mc-muted mb-1">{label}</label>
                  <input placeholder={placeholder} value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    required={key !== 'imagenUrl'}
                    className="input-light" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-mc-muted mb-1">Número</label>
                  <input type="number" min="1" placeholder="025" value={form.numero}
                    onChange={e => setForm(f => ({ ...f, numero: e.target.value }))} required
                    className="input-light" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-mc-muted mb-1">Rareza</label>
                  <select value={form.rareza} onChange={e => setForm(f => ({ ...f, rareza: e.target.value }))}
                    className="input-light">
                    {['common','uncommon','rare','ultra-rare','secret-rare'].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button type="submit" disabled={saving}
                className="btn-yellow w-full py-3 text-sm disabled:opacity-50 mt-1">
                {saving ? 'Guardando...' : 'Añadir al catálogo'}
              </button>
            </form>
          </div>

          {/* Lista */}
          <div className="card-white p-6 rounded-2xl">
            <h2 className="font-black text-mc-dark mb-4">
              Catálogo <span className="text-mc-muted font-normal text-sm">({cromos.length})</span>
            </h2>
            <div className="max-h-[500px] overflow-y-auto space-y-2 pr-1">
              {cromos.map(c => (
                <div key={c._id} className="flex items-center gap-3 p-2.5 rounded-xl bg-mc-light border border-mc-border/40 group">
                  <CartaHex cromo={c} size={44} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-mc-dark truncate">{c.nombre}</p>
                    <p className="text-xs text-mc-muted truncate">#{String(c.numero).padStart(3,'0')} · {c.expansion} · {c.rareza}</p>
                  </div>
                  <button onClick={() => handleDeleteCromo(c._id)}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all text-sm w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50">
                    ✕
                  </button>
                </div>
              ))}
              {cromos.length === 0 && (
                <p className="text-mc-muted text-sm text-center py-8">Sin cartas en el catálogo</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── USUARIOS ── */}
      {tab === 'usuarios' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-mc-muted text-sm">🔍</span>
              <input placeholder="Buscar usuario o email..."
                value={busqueda} onChange={e => setBusqueda(e.target.value)}
                className="input-light pl-9" />
            </div>
            <span className="text-sm text-mc-muted font-semibold">{total} usuarios</span>
          </div>

          <div className="space-y-2">
            {usuarios.map(u => (
              <FilaUsuario key={u._id} usuario={u}
                onToggleAdmin={handleToggleAdmin}
                onToggleActivo={handleToggleActivo} />
            ))}
            {usuarios.length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-2">👥</div>
                <p className="text-mc-muted text-sm">Sin usuarios que mostrar</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
