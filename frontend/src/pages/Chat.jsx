import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient  from '../api/axiosClient';
import { useSocket } from '../context/SocketContext';
import { useUserStore } from '../store/userStore';
import CartaHex      from '../components/common/CartaHex';
import { toast }     from 'react-hot-toast';

function PropuestaIntercambio({ match, userId, confirmaciones, onConfirmar, confirmando }) {
  const soyA      = match.userA._id === userId;
  const misCartas = soyA ? match.cromosDeAparaB : match.cromosDeBparaA;
  const susCartas = soyA ? match.cromosDeBparaA : match.cromosDeAparaB;

  const yoConfirme   = soyA ? confirmaciones?.userA : confirmaciones?.userB;
  const elConfirmo   = soyA ? confirmaciones?.userB : confirmaciones?.userA;
  const ambosConfirm = confirmaciones?.userA && confirmaciones?.userB;

  if (match.status === 'completed') {
    return (
      <div className="bg-green-50 border-b border-green-200 px-4 py-4 text-center">
        <div className="text-3xl mb-1">🎉</div>
        <p className="font-black text-green-700 text-sm">¡Intercambio completado!</p>
        <p className="text-xs text-green-600 mt-0.5">Las cartas se han actualizado en vuestros inventarios.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border-b border-mc-border shadow-sm px-4 py-3">
      <p className="text-xs font-black text-mc-muted uppercase tracking-wider mb-3 text-center">
        🤝 Propuesta de Intercambio
      </p>

      
      <div className="flex items-center justify-center gap-3 mb-3">
        
        <div className="flex flex-col items-center gap-1">
          <p className="text-[10px] font-bold text-mc-muted">Yo doy</p>
          <div className="flex gap-1">
            {misCartas.slice(0, 2).map(c => (
              <div key={c._id} className="flex flex-col items-center">
                <CartaHex cromo={c} size={72} />
                <p className="text-[8px] text-mc-muted mt-0.5 truncate" style={{ maxWidth: 72 }}>{c.nombre}</p>
              </div>
            ))}
            {misCartas.length > 2 && (
              <div className="w-16 flex items-center justify-center text-xs text-mc-muted font-bold">
                +{misCartas.length - 2}
              </div>
            )}
          </div>
        </div>

        
        <div className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full bg-mc-light border-2 border-mc-border flex items-center justify-center text-lg">
            ⇄
          </div>
        </div>

        
        <div className="flex flex-col items-center gap-1">
          <p className="text-[10px] font-bold text-mc-muted">Recibo</p>
          <div className="flex gap-1">
            {susCartas.slice(0, 2).map(c => (
              <div key={c._id} className="flex flex-col items-center">
                <CartaHex cromo={c} size={72} />
                <p className="text-[8px] text-mc-muted mt-0.5 truncate" style={{ maxWidth: 72 }}>{c.nombre}</p>
              </div>
            ))}
            {susCartas.length > 2 && (
              <div className="w-16 flex items-center justify-center text-xs text-mc-muted font-bold">
                +{susCartas.length - 2}
              </div>
            )}
          </div>
        </div>
      </div>

      
      <div className="flex items-center gap-2 mb-2">
        {[
          { label: 'Tú',   ok: yoConfirme },
          { label: 'Él/Ella', ok: elConfirmo },
        ].map(({ label, ok }) => (
          <div key={label} className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-lg border text-xs font-bold transition-colors
            ${ok ? 'bg-green-50 border-green-300 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
            <span>{ok ? '✓' : '○'}</span> {label}
          </div>
        ))}
      </div>

      <button
        onClick={onConfirmar}
        disabled={confirmando || yoConfirme || ambosConfirm}
        className={`w-full py-2.5 rounded-xl font-black text-sm transition-all duration-200 active:scale-95
          ${yoConfirme
            ? 'bg-green-50 border border-green-300 text-green-700 cursor-default'
            : 'text-white shadow-md hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed'
          }`}
        style={!yoConfirme ? { background: 'linear-gradient(135deg, #1c1c1c, #374151)' } : {}}
      >
        {confirmando         ? '⏳ Confirmando...'           :
         yoConfirme          ? '✓ Tu confirmación enviada'   :
                               '📦 Confirmar Intercambio Físico'}
      </button>
    </div>
  );
}

function Mensaje({ msg, esMio }) {
  const hora = new Date(msg.timestamp).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  return (
    <div className={`flex ${esMio ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
        ${esMio
          ? 'rounded-br-sm text-white'
          : 'rounded-bl-sm bg-white border border-mc-border text-mc-dark'
        }`}
        style={esMio ? { background: 'linear-gradient(135deg, #5b21b6, #7c3aed)' } : {}}>
        {!esMio && (
          <p className="text-[10px] font-black text-mc-purple mb-0.5">@{msg.autor?.username}</p>
        )}
        <p>{msg.texto}</p>
        <p className={`text-[10px] mt-1 ${esMio ? 'text-white/60 text-right' : 'text-mc-muted'}`}>{hora}</p>
      </div>
    </div>
  );
}

export default function Chat() {
  const { id: matchId } = useParams();
  const navigate        = useNavigate();
  const { user }        = useUserStore();
  const socket          = useSocket();

  const [match,        setMatch]        = useState(null);
  const [mensajes,     setMensajes]     = useState([]);
  const [texto,        setTexto]        = useState('');
  const [loading,      setLoading]      = useState(true);
  const [confirmando,  setConfirmando]  = useState(false);
  const [confirmaciones, setConfirmaciones] = useState({ userA: false, userB: false });
  const [enviando,     setEnviando]     = useState(false);

  const listRef   = useRef(null);
  const inputRef  = useRef(null);

  const scrollAbajo = () => {
    setTimeout(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }); }, 50);
  };

  useEffect(() => {
    axiosClient.get(`/matches/${matchId}/mensajes`)
      .then(({ data }) => {
        setMatch(data.match);
        setMensajes(data.match.mensajes || []);
        setConfirmaciones(data.match.confirmaciones || { userA: false, userB: false });
        scrollAbajo();
      })
      .catch(() => toast.error('Error cargando el chat'))
      .finally(() => setLoading(false));
  }, [matchId]);

  useEffect(() => {
    if (!socket) return;
    socket.emit('join_chat', { matchId });

    socket.on('new_message', msg => {
      setMensajes(prev => [...prev, msg]);
      scrollAbajo();
    });
    socket.on('confirmacion_actualizada', ({ confirmaciones: c }) => {
      setConfirmaciones(c);
    });
    socket.on('intercambio_completado', () => {
      setMatch(prev => ({ ...prev, status: 'completed' }));
      toast.success('🎉 ¡Intercambio completado! Inventarios actualizados.', { duration: 5000 });
    });

    return () => {
      socket.off('new_message');
      socket.off('confirmacion_actualizada');
      socket.off('intercambio_completado');
    };
  }, [socket, matchId]);

  const enviarMensaje = useCallback(() => {
    if (!texto.trim() || !socket) return;
    setEnviando(true);
    socket.emit('send_message', { matchId, texto: texto.trim() });
    setTexto('');
    setEnviando(false);
    inputRef.current?.focus();
  }, [texto, socket, matchId]);

  const handleConfirmar = async () => {
    setConfirmando(true);
    try {
      const { data } = await axiosClient.post(`/matches/${matchId}/confirmar`);
      setConfirmaciones(data.confirmaciones);
      if (data.completado) setMatch(prev => ({ ...prev, status: 'completed' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al confirmar');
    } finally {
      setConfirmando(false);
    }
  };

  const otro = match
    ? (match.userA._id === user?._id ? match.userB : match.userA)
    : null;

  if (loading) return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="text-3xl animate-spin text-mc-purple">✦</div>
    </div>
  );

  if (!match) return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] gap-4">
      <div className="text-5xl">⚠️</div>
      <p className="text-mc-muted">Chat no encontrado</p>
      <button onClick={() => navigate('/dashboard')} className="btn-yellow text-sm">Volver</button>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-2xl mx-auto">

      
      <div className="bg-white border-b border-mc-border px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={() => navigate('/dashboard')}
          className="w-8 h-8 rounded-full hover:bg-mc-light flex items-center justify-center text-mc-muted hover:text-mc-dark transition-colors text-lg">
          ←
        </button>
        <div className="w-9 h-9 rounded-full bg-mc-light border border-mc-border flex items-center justify-center text-base">
          👤
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-mc-dark text-sm truncate">@{otro?.username}</p>
          <p className="text-xs text-mc-muted truncate">📍 {otro?.ciudad}
            {match.distanciaKm && ` · ${match.distanciaKm} km`}
          </p>
        </div>
        <span className={`badge border text-[10px]
          ${match.status === 'completed' ? 'bg-green-50 border-green-300 text-green-700'  :
            match.status === 'accepted'  ? 'bg-blue-50 border-blue-300 text-blue-700'     :
                                           'bg-yellow-50 border-yellow-300 text-yellow-700'}`}>
          {match.status === 'completed' ? '✓ Completado' :
           match.status === 'accepted'  ? 'Aceptado'     : match.status}
        </span>
      </div>

      
      <div className="flex-shrink-0">
        <PropuestaIntercambio
          match={match}
          userId={user?._id}
          confirmaciones={confirmaciones}
          onConfirmar={handleConfirmar}
          confirmando={confirmando}
        />
      </div>

      
      <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
           style={{ background: '#f8f7ff' }}>
        {mensajes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-12">
            <div className="text-4xl animate-float">💬</div>
            <p className="text-mc-muted text-sm font-semibold">Sé el primero en escribir</p>
            <p className="text-mc-muted text-xs max-w-xs">Coordina el intercambio, acordad lugar y hora.</p>
          </div>
        ) : (
          mensajes.map((msg, i) => (
            <Mensaje
              key={msg._id || i}
              msg={msg}
              esMio={msg.autor?._id === user?._id || msg.autor === user?._id}
            />
          ))
        )}
      </div>

      
      {match.status !== 'completed' && (
        <div className="bg-white border-t border-mc-border px-4 py-3 flex gap-2 flex-shrink-0">
          <input
            ref={inputRef}
            type="text"
            value={texto}
            onChange={e => setTexto(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && enviarMensaje()}
            placeholder="Escribe un mensaje..."
            className="flex-1 input-light py-2.5 text-sm"
          />
          <button
            onClick={enviarMensaje}
            disabled={!texto.trim() || enviando}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black transition-all active:scale-95 disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #5b21b6, #7c3aed)' }}
          >
            ➤
          </button>
        </div>
      )}
    </div>
  );
}
