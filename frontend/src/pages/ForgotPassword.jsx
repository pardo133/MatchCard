import { useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { toast } from 'react-hot-toast';

export default function ForgotPassword() {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosClient.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {
      toast.error('Error al enviar el correo. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg"
                 style={{ background: 'linear-gradient(135deg, #7c3aed, #4338ca)' }}>M</div>
            <span className="font-black text-2xl text-mc-dark">Match<span className="text-mc-purple">Card</span></span>
          </div>
          <h1 className="font-black text-xl text-mc-dark">Recuperar contraseña</h1>
          <p className="text-mc-muted text-sm mt-1">
            Te enviaremos un enlace para restablecerla
          </p>
        </div>

        <div className="card-white p-8 rounded-2xl">
          {sent ? (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">✉️</div>
              <h2 className="font-black text-mc-dark text-lg mb-2">¡Revisa tu correo!</h2>
              <p className="text-mc-muted text-sm mb-6 leading-relaxed">
                Si el email existe en MatchCard, recibirás un enlace para
                restablecer tu contraseña en los próximos minutos.
              </p>
              <Link to="/login" className="btn-yellow inline-flex text-sm">
                ← Volver al login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-mc-dark mb-1.5">
                  Email de tu cuenta
                </label>
                <input
                  type="email"
                  required
                  placeholder="entrenador@pokemon.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-light"
                />
              </div>

              <button type="submit" disabled={loading}
                className="btn-yellow w-full py-3 mt-2 uppercase tracking-wide disabled:opacity-50">
                {loading
                  ? <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Enviando...
                    </span>
                  : 'Enviar enlace de recuperación →'}
              </button>

              <p className="text-center text-sm text-mc-muted mt-4">
                <Link to="/login" className="text-mc-purple font-bold hover:underline">
                  ← Volver al login
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
