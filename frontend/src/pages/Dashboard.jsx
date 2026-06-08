import { useEffect, useState } from 'react';
import { Link }        from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { useSocket }    from '../context/SocketContext';
import axiosClient      from '../api/axiosClient';
import CartaHex         from '../components/common/CartaHex';
import { toast }        from 'react-hot-toast';

const STATUS_BADGE = {
  pending:   'bg-yellow-50 border-yellow-300 text-yellow-700',
  accepted:  'bg-blue-50 border-blue-300 text-blue-700',
  rejected:  'bg-red-50 border-red-300 text-red-400',
  completed: 'bg-green-50 border-green-300 text-green-700',
};
const STATUS_LABEL = {
  pending: 'Pendiente', accepted: 'Aceptado', rejected: 'Rechazado', completed: 'Completado',
};

function FilaMatch({ match, userId, onUpdate }) {
  const soyA      = match.userA._id === userId;
  const otro      = soyA ? match.userB : match.userA;
  const misCartas = soyA ? match.cromosDeAparaB : match.cromosDeBparaA;
  const susCartas = soyA ? match.cromosDeBparaA : match.cromosDeAparaB;

  return (
    <div className="card-white rounded-2xl p-4 border border-mc-border/50 hover:border-mc-purple/30 transition-all">
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-mc-light border border-mc-border flex items-center justify-center text-sm">👤</div>
          <div>
            <p className="font-black text-mc-dark text-sm">@{otro?.username}</p>
            <p className="text-xs text-mc-muted">📍 {otro?.ciudad}
              {match.distanciaKm && ` · ${match.distanciaKm} km`}
            </p>
          </div>
        </div>
        <span className={`badge border text-[10px] ${STATUS_BADGE[match.status]}`}>
          {STATUS_LABEL[match.status]}
        </span>
      </div>

      
      <div className="flex gap-4 mb-3 overflow-x-auto pb-1">
        <div>
          <p className="text-[10px] font-bold text-green-600 mb-1">📤 Yo doy</p>
          <div className="flex gap-1.5">
            {misCartas?.slice(0, 3).map(c => <CartaHex key={c._id} cromo={c} size={80} />)}
            {misCartas?.length > 3 && <span className="text-xs text-mc-muted self-center">+{misCartas.length - 3}</span>}
          </div>
        </div>
        <div className="flex items-center text-mc-muted text-lg pt-4">⇄</div>
        <div>
          <p className="text-[10px] font-bold text-mc-purple mb-1">📥 Recibo</p>
          <div className="flex gap-1.5">
            {susCartas?.slice(0, 3).map(c => <CartaHex key={c._id} cromo={c} size={80} />)}
            {susCartas?.length > 3 && <span className="text-xs text-mc-muted self-center">+{susCartas.length - 3}</span>}
          </div>
        </div>
      </div>

      
      <div className="flex gap-2">
        {match.status === 'pending' && !soyA && (
          <>
            <button onClick={() => onUpdate(match._id, 'accepted')}
              className="flex-1 py-2 rounded-xl text-xs font-black bg-green-50 border border-green-300 text-green-700 hover:bg-green-100 transition-colors">
              ✓ Aceptar
            </button>
            <button onClick={() => onUpdate(match._id, 'rejected')}
              className="flex-1 py-2 rounded-xl text-xs font-black bg-red-50 border border-red-300 text-red-500 hover:bg-red-100 transition-colors">
              ✕ Rechazar
            </button>
          </>
        )}
        {match.status === 'accepted' && (
          <Link to={`/chat/${match._id}`}
            className="flex-1 py-2 rounded-xl text-xs font-black text-center text-white transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #5b21b6, #7c3aed)' }}>
            💬 Abrir Chat
          </Link>
        )}
        {match.status === 'pending' && soyA && (
          <p className="flex-1 text-center text-xs text-mc-muted py-2">
            ⏳ Esperando respuesta de @{otro?.username}
          </p>
        )}
        {match.status === 'completed' && (
          <p className="flex-1 text-center text-xs text-green-600 font-bold py-2">
            🎉 Intercambio realizado
          </p>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useUserStore();
  const socket   = useSocket();
  const [matches,  setMatches]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [activeTab, setTab]     = useState('pendientes');

  const cargar = async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get('/matches');
      setMatches(data.matches || []);
    } catch { toast.error('Error cargando matches'); }
    finally  { setLoading(false); }
  };

  useEffect(() => { cargar(); }, []);

  useEffect(() => {
    if (!socket) return;
    const recargar = () => cargar();
    socket.on('nuevo_match_propuesto', () => { cargar(); toast('¡Nueva propuesta de match! 🤝'); });
    socket.on('match_actualizado',     recargar);
    socket.on('inventario_actualizado', recargar);
    return () => {
      socket.off('nuevo_match_propuesto');
      socket.off('match_actualizado');
      socket.off('inventario_actualizado');
    };
  }, [socket]);

  const actualizar = async (id, status) => {
    try {
      await axiosClient.put(`/matches/${id}/status`, { status });
      setMatches(prev => prev.map(m => m._id === id ? { ...m, status } : m));
      toast.success(status === 'accepted' ? '¡Match aceptado! Entra al chat. 💬' : 'Match rechazado');
    } catch { toast.error('Error actualizando'); }
  };

  const pendientes  = matches.filter(m => m.status === 'pending');
  const aceptados   = matches.filter(m => m.status === 'accepted');
  const historial   = matches.filter(m => ['rejected', 'completed'].includes(m.status));

  const TABS = [
    { id: 'pendientes', label: 'Pendientes', n: pendientes.length,  color: 'text-yellow-600' },
    { id: 'aceptados',  label: 'Activos',    n: aceptados.length,   color: 'text-blue-600'   },
    { id: 'historial',  label: 'Historial',  n: historial.length,   color: 'text-mc-muted'   },
  ];

  const tabData = { pendientes, aceptados, historial };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-mc-dark">Mis Matches</h1>
          <p className="text-mc-muted text-sm mt-0.5">{matches.length} match{matches.length !== 1 ? 'es' : ''} en total</p>
        </div>
        <Link to="/descubrir"
          className="btn-yellow text-sm flex items-center gap-2">
          <span>🔍</span> Descubrir
        </Link>
      </div>

      
      <div className="flex gap-1 bg-mc-light p-1 rounded-xl mb-6">
        {TABS.map(({ id, label, n, color }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 py-2.5 rounded-lg text-xs font-black transition-all duration-200
              ${activeTab === id ? 'bg-white shadow-sm text-mc-dark' : `${color} hover:text-mc-dark`}`}>
            {label}
            {n > 0 && (
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black
                ${activeTab === id ? 'bg-mc-light' : 'bg-white/60'}`}>
                {n}
              </span>
            )}
          </button>
        ))}
      </div>

      
      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin text-3xl text-mc-purple">✦</div></div>
      ) : tabData[activeTab].length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3 animate-float inline-block">
            {activeTab === 'pendientes' ? '⏳' : activeTab === 'aceptados' ? '💬' : '📋'}
          </div>
          <p className="font-bold text-mc-dark mb-1">
            {activeTab === 'pendientes' ? 'Sin propuestas pendientes' :
             activeTab === 'aceptados'  ? 'Sin matches activos'       : 'Sin historial todavía'}
          </p>
          <p className="text-mc-muted text-sm mb-4">
            {activeTab === 'pendientes' ? 'Ve a Descubrir para proponer un intercambio.' : ''}
          </p>
          {activeTab === 'pendientes' && (
            <Link to="/descubrir" className="btn-yellow text-sm inline-flex">🔍 Ir a Descubrir</Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {tabData[activeTab].map(m => (
            <FilaMatch key={m._id} match={m} userId={user?._id} onUpdate={actualizar} />
          ))}
        </div>
      )}
    </div>
  );
}
