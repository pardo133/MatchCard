import { useEffect, useState } from 'react';
import { useMatches } from '../hooks/useMatches';
import { useUserStore } from '../store/userStore';
import { useSocket } from '../context/SocketContext';
import MatchCard from '../components/match/MatchCard';
import { toast } from 'react-hot-toast';

export default function Dashboard() {
  const { user }    = useUserStore();
  const socket      = useSocket();
  const { matches, loading, error, fetchMatches, findMatches, updateStatus } = useMatches();
  const [searching, setSearching] = useState(false);

  useEffect(() => { fetchMatches(); }, [fetchMatches]);

  useEffect(() => {
    if (!socket) return;
    socket.on('new_match', () => fetchMatches());
    return () => socket.off('new_match');
  }, [socket, fetchMatches]);

  const handleFind = async () => {
    setSearching(true);
    const found = await findMatches();
    setSearching(false);
    if (found?.length) toast.success(`¡${found.length} match(es) encontrado(s)! ⚡`);
    else toast('Sin nuevos matches en tu ciudad por ahora', { icon: '🔍' });
  };

  const pending   = matches.filter(m => m.status === 'pending');
  const others    = matches.filter(m => m.status !== 'pending');

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white">Mis Matches</h1>
          <p className="text-gray-400 text-sm mt-1">
            {matches.length} match{matches.length !== 1 ? 'es' : ''} encontrado{matches.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={handleFind}
          disabled={loading || searching}
          className="btn-primary flex items-center gap-2 disabled:opacity-50"
        >
          {searching ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Buscando...
            </>
          ) : (
            <><span>⚡</span> Buscar Matches</>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Pendientes */}
      {pending.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-pokemon-yellow uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-pokemon-yellow animate-pulse" />
            Pendientes ({pending.length})
          </h2>
          <div className="space-y-3">
            {pending.map(m => (
              <MatchCard
                key={m._id}
                match={m}
                currentUserId={user?._id}
                onAccept={id => updateStatus(id, 'accepted')}
                onReject={id => updateStatus(id, 'rejected')}
              />
            ))}
          </div>
        </section>
      )}

      {/* Historial */}
      {others.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Historial ({others.length})
          </h2>
          <div className="space-y-3 opacity-75">
            {others.map(m => (
              <MatchCard
                key={m._id}
                match={m}
                currentUserId={user?._id}
                onAccept={id => updateStatus(id, 'accepted')}
                onReject={id => updateStatus(id, 'rejected')}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {!loading && matches.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4 animate-float inline-block">🔍</div>
          <h3 className="text-xl font-bold text-white mb-2">Sin matches todavía</h3>
          <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">
            Añade tus cromos repetidos y tus faltas en el perfil, luego pulsa "Buscar Matches".
          </p>
          <button onClick={handleFind} className="btn-primary">
            Buscar ahora ⚡
          </button>
        </div>
      )}
    </div>
  );
}
