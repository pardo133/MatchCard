import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { useUserStore } from '../store/userStore';
import { toast } from 'react-hot-toast';

export default function Profile() {
  const { user, setUser }       = useUserStore();
  const [profile,  setProfile]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [form,     setForm]     = useState({ ciudad: '', telefono: '' });

  useEffect(() => {
    axiosClient.get('/users/profile')
      .then(({ data }) => {
        setProfile(data.user);
        setForm({ ciudad: data.user.ciudad || '', telefono: data.user.telefono || '' });
      })
      .catch(() => toast.error('Error cargando perfil'))
      .finally(() => setLoading(false));
  }, []);

  const handleGuardar = async () => {
    setSaving(true);
    try {
      const { data } = await axiosClient.put('/users/profile', form);
      setProfile(data.user);
      setUser({ ...user, ciudad: data.user.ciudad });
      setEditMode(false);
      toast.success('Perfil actualizado ✓');
    } catch { toast.error('Error al guardar'); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="text-4xl animate-spin text-mc-purple">✦</div>
    </div>
  );
  if (!profile) return null;

  const totalRepes = profile.inventario.repetidos.length;
  const secciones  = [...new Set(profile.inventario.repetidos.map(c => c.expansion).filter(Boolean))];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      {/* Header tarjeta */}
      <div className="rounded-2xl p-6 mb-4"
           style={{ background: 'linear-gradient(135deg, #1e0a3c 0%, #2d1263 100%)',
                    border: '1px solid rgba(167,139,250,0.2)' }}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
               style={{ background: 'linear-gradient(135deg, #5b21b6, #7c3aed)',
                        boxShadow: '0 0 24px rgba(91,33,182,0.5)' }}>
            👤
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">@{profile.username}</h1>
            <p className="text-white/60 text-sm">📍 {profile.ciudad}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-3 mt-5">
          {[
            { n: totalRepes,      l: 'Repetidas',  c: '#FFD700'  },
            { n: secciones.length, l: 'Secciones', c: '#c4b5fd'  },
          ].map(({ n, l, c }) => (
            <div key={l} className="flex-1 rounded-xl px-4 py-3 text-center"
                 style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p className="text-2xl font-black" style={{ color: c }}>{n}</p>
              <p className="text-xs text-white/50 mt-0.5">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Datos de contacto */}
      <div className="rounded-2xl p-6 mb-4"
           style={{ background: 'white', border: '1px solid #ddd6fe',
                    boxShadow: '0 4px 20px rgba(91,33,182,0.07)' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-black text-mc-dark text-lg">Datos de contacto</h2>
          {!editMode ? (
            <button onClick={() => setEditMode(true)}
              className="text-xs font-black px-4 py-2 rounded-xl border border-mc-border text-mc-muted hover:border-mc-purple hover:text-mc-purple transition-colors">
              ✏️ Editar
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setEditMode(false)}
                className="text-xs font-bold px-3 py-1.5 rounded-xl border border-mc-border text-mc-muted">
                Cancelar
              </button>
              <button onClick={handleGuardar} disabled={saving}
                className="text-xs font-black px-4 py-1.5 rounded-xl text-white transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #5b21b6, #7c3aed)' }}>
                {saving ? '...' : 'Guardar'}
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Email (solo lectura) */}
          <div>
            <label className="block text-xs font-bold text-mc-muted mb-1.5 uppercase tracking-wider">
              ✉️ Email (visible para otros usuarios)
            </label>
            <div className="px-4 py-3 rounded-xl text-sm font-semibold text-mc-dark"
                 style={{ background: '#f5f3ff', border: '1px solid #ddd6fe' }}>
              {profile.email}
            </div>
            <p className="text-[11px] text-mc-muted mt-1">
              Tu email es visible para usuarios registrados que buscan un cromo que tú tienes.
            </p>
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-xs font-bold text-mc-muted mb-1.5 uppercase tracking-wider">
              📞 Teléfono (opcional)
            </label>
            {editMode ? (
              <input
                type="tel"
                placeholder="+34 600 000 000"
                value={form.telefono}
                onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-mc-dark outline-none transition-all"
                style={{ background: '#f5f3ff', border: '2px solid #ddd6fe' }}
                onFocus={e  => (e.target.style.borderColor = '#5b21b6')}
                onBlur={e   => (e.target.style.borderColor = '#ddd6fe')}
              />
            ) : (
              <div className="px-4 py-3 rounded-xl text-sm font-semibold"
                   style={{ background: '#f5f3ff', border: '1px solid #ddd6fe',
                            color: profile.telefono ? '#1e1b4b' : '#9ca3af' }}>
                {profile.telefono || 'Sin teléfono — haz clic en Editar para añadir'}
              </div>
            )}
          </div>

          {/* Ciudad */}
          <div>
            <label className="block text-xs font-bold text-mc-muted mb-1.5 uppercase tracking-wider">
              📍 Ciudad
            </label>
            {editMode ? (
              <input
                type="text"
                placeholder="Tu ciudad"
                value={form.ciudad}
                onChange={e => setForm(f => ({ ...f, ciudad: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-mc-dark outline-none transition-all"
                style={{ background: '#f5f3ff', border: '2px solid #ddd6fe' }}
                onFocus={e  => (e.target.style.borderColor = '#5b21b6')}
                onBlur={e   => (e.target.style.borderColor = '#ddd6fe')}
              />
            ) : (
              <div className="px-4 py-3 rounded-xl text-sm font-semibold text-mc-dark"
                   style={{ background: '#f5f3ff', border: '1px solid #ddd6fe' }}>
                {profile.ciudad}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Secciones del usuario */}
      {secciones.length > 0 && (
        <div className="rounded-2xl p-6"
             style={{ background: 'white', border: '1px solid #ddd6fe',
                      boxShadow: '0 4px 20px rgba(91,33,182,0.07)' }}>
          <h2 className="font-black text-mc-dark text-lg mb-4">Mis secciones</h2>
          <div className="space-y-2">
            {secciones.map(sec => {
              const n = profile.inventario.repetidos.filter(c => c.expansion === sec).length;
              return (
                <div key={sec} className="flex items-center justify-between px-4 py-3 rounded-xl"
                     style={{ background: '#f5f3ff', border: '1px solid #ddd6fe' }}>
                  <div className="flex items-center gap-2">
                    <span>📁</span>
                    <span className="text-sm font-bold text-mc-dark">{sec}</span>
                  </div>
                  <span className="text-xs font-black text-mc-purple bg-mc-light px-2.5 py-1 rounded-full">
                    {n} repetida{n !== 1 ? 's' : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
