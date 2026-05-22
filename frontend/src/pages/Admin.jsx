import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { toast } from 'react-hot-toast';
import { useUserStore } from '../store/userStore';
import { Navigate } from 'react-router-dom';

const EMPTY_CROMO = { numero: '', nombre: '', expansion: 'Scarlet & Violet', rareza: 'common', imagenUrl: '' };

const STATS_ICONS = { usuarios: '👥', cromos: '🃏', matches: '⚡', ciudades: '📍' };

export default function Admin() {
  const { user }    = useUserStore();
  const [tab,       setTab]    = useState('cromos');
  const [stats,     setStats]  = useState({ usuarios: 0, cromos: 0, matches: 0, ciudades: 0 });
  const [cromos,    setCromos]  = useState([]);
  const [form,      setForm]    = useState(EMPTY_CROMO);
  const [saving,    setSaving]  = useState(false);
  const [loading,   setLoading] = useState(true);

  if (!user?.isAdmin) return <Navigate to="/" replace />;

  useEffect(() => {
    Promise.all([
      axiosClient.get('/admin/stats'),
      axiosClient.get('/cromos'),
    ])
      .then(([s, c]) => { setStats(s.data); setCromos(c.data.cromos || []); })
      .catch(() => toast.error('Error cargando datos del panel'))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await axiosClient.post('/cromos', form);
      setCromos(prev => [...prev, data.cromo]);
      setForm(EMPTY_CROMO);
      toast.success(`${data.cromo.nombre} añadido al álbum ✓`);
      setStats(s => ({ ...s, cromos: s.cromos + 1 }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al añadir cromo');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este cromo?')) return;
    try {
      await axiosClient.delete(`/cromos/${id}`);
      setCromos(prev => prev.filter(c => c._id !== id));
      toast.success('Cromo eliminado');
    } catch {
      toast.error('Error eliminando cromo');
    }
  };

  const TABS = [
    { key: 'stats',  label: 'Estadísticas', icon: '📊' },
    { key: 'cromos', label: 'Cromos',        icon: '🃏' },
    { key: 'users',  label: 'Usuarios',      icon: '👥' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <span className="text-3xl">🛡️</span>
        <div>
          <h1 className="text-3xl font-black text-white">Panel de Administración</h1>
          <p className="text-gray-400 text-sm">GotGotNeed — Gestión del sistema</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {TABS.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              tab === key
                ? 'bg-pokemon-yellow text-pokemon-dark'
                : 'border border-pokemon-border text-gray-400 hover:border-pokemon-yellow/50 hover:text-white'
            }`}
          >
            <span>{icon}</span>{label}
          </button>
        ))}
      </div>

      {/* Stats */}
      {tab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats).map(([key, value]) => (
              <div key={key} className="card-pokemon p-5 text-center">
                <div className="text-3xl mb-2">{STATS_ICONS[key] || '📈'}</div>
                <div className="text-3xl font-black text-pokemon-yellow">{value}</div>
                <div className="text-xs text-gray-400 capitalize mt-1">{key}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cromos */}
      {tab === 'cromos' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Formulario */}
          <div className="card-pokemon p-6">
            <h2 className="font-bold text-lg mb-4 text-pokemon-yellow">➕ Añadir cromo</h2>
            <form onSubmit={handleAdd} className="space-y-3">
              {[
                { name: 'numero',   label: 'Número', type: 'number', placeholder: '25' },
                { name: 'nombre',   label: 'Nombre',  type: 'text',   placeholder: 'Pikachu' },
                { name: 'imagenUrl',label: 'URL Imagen', type: 'text', placeholder: 'https://...' },
              ].map(({ name, label, type, placeholder }) => (
                <div key={name}>
                  <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={form[name]}
                    onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
                    required={name !== 'imagenUrl'}
                    className="input-pokemon text-sm"
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Expansión</label>
                  <select
                    value={form.expansion}
                    onChange={e => setForm(f => ({ ...f, expansion: e.target.value }))}
                    className="input-pokemon text-sm"
                  >
                    {['Scarlet & Violet', 'Base Set', 'Obsidian Flames', 'Paldea Evolved'].map(e => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Rareza</label>
                  <select
                    value={form.rareza}
                    onChange={e => setForm(f => ({ ...f, rareza: e.target.value }))}
                    className="input-pokemon text-sm"
                  >
                    {['common', 'uncommon', 'rare', 'ultra-rare', 'secret-rare'].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button type="submit" disabled={saving} className="btn-primary w-full py-2.5 disabled:opacity-50">
                {saving ? 'Guardando...' : 'Añadir cromo'}
              </button>
            </form>
          </div>

          {/* Lista de cromos */}
          <div className="card-pokemon p-6">
            <h2 className="font-bold text-lg mb-4 text-white">
              Cromos en BD <span className="text-gray-400 font-normal text-sm">({cromos.length})</span>
            </h2>
            <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
              {cromos.map(c => (
                <div key={c._id} className="flex items-center justify-between p-2.5 rounded-xl bg-pokemon-dark/50 border border-pokemon-border group">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs text-gray-500">#{String(c.numero).padStart(3,'0')}</span>
                    <div>
                      <p className="text-sm font-semibold text-white">{c.nombre}</p>
                      <p className="text-xs text-gray-500">{c.expansion} · {c.rareza}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(c._id)}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all text-xs px-2 py-1 rounded hover:bg-red-500/10"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {cromos.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-8">Sin cromos en la base de datos</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div className="card-pokemon p-6">
          <p className="text-gray-400 text-sm">Vista de usuarios — próximamente</p>
        </div>
      )}
    </div>
  );
}
