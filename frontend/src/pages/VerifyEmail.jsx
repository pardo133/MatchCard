import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

export default function VerifyEmail() {
  const { token }          = useParams();
  const [status, setStatus] = useState('loading'); // 'loading' | 'ok' | 'error'
  const [msg,    setMsg]    = useState('');

  useEffect(() => {
    axiosClient.get(`/auth/verify-email/${token}`)
      .then(({ data }) => { setMsg(data.message); setStatus('ok'); })
      .catch(err => {
        setMsg(err.response?.data?.message || 'Error al verificar');
        setStatus('error');
      });
  }, [token]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="card-white p-10 rounded-2xl">
          {status === 'loading' && (
            <>
              <div className="text-5xl mb-4 animate-pulse">✉️</div>
              <p className="font-black text-mc-dark text-lg">Verificando tu email…</p>
            </>
          )}
          {status === 'ok' && (
            <>
              <div className="text-5xl mb-4 pop-in inline-block">✅</div>
              <h2 className="font-black text-mc-dark text-xl mb-2">¡Email verificado!</h2>
              <p className="text-mc-muted text-sm mb-6">{msg}</p>
              <Link to="/repes" className="btn-yellow inline-flex">
                Ir a Mis Repetidas →
              </Link>
            </>
          )}
          {status === 'error' && (
            <>
              <div className="text-5xl mb-4">❌</div>
              <h2 className="font-black text-mc-dark text-xl mb-2">Enlace inválido</h2>
              <p className="text-mc-muted text-sm mb-6">{msg}</p>
              <Link to="/login" className="btn-yellow inline-flex">
                Volver al login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
