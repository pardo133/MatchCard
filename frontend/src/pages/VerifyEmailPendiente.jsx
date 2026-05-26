import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import axiosClient from '../api/axiosClient';
import { toast } from 'react-hot-toast';

export default function VerifyEmailPendiente() {
  const { user, logout }     = useUserStore();
  const [resending, setRes]  = useState(false);
  const navigate             = useNavigate();

  const handleResend = async () => {
    setRes(true);
    try {
      await axiosClient.post('/auth/resend-verification', { email: user?.email });
      toast.success('¡Correo reenviado! Revisa tu bandeja de entrada');
    } catch {
      toast.error('Error al reenviar. Inténtalo más tarde');
    } finally {
      setRes(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="card-white p-10 rounded-2xl">
          <div className="text-6xl mb-5 inline-block badge-float">📧</div>
          <h1 className="font-black text-2xl text-mc-dark mb-3">Verifica tu email</h1>
          <p className="text-mc-muted text-sm leading-relaxed mb-2">
            Hemos enviado un enlace de confirmación a:
          </p>
          <p className="font-black text-mc-purple text-base mb-6">
            {user?.email || 'tu correo electrónico'}
          </p>
          <p className="text-mc-muted text-sm leading-relaxed mb-8">
            Haz clic en el enlace del correo para activar tu cuenta y poder
            iniciar sesión. Revisa también la carpeta de spam.
          </p>

          <div className="space-y-3">
            <button
              onClick={handleResend}
              disabled={resending}
              className="btn-yellow w-full disabled:opacity-50"
            >
              {resending ? 'Enviando…' : '🔁 Reenviar correo de verificación'}
            </button>

            <button
              onClick={handleLogout}
              className="btn-outline w-full"
            >
              ← Volver al inicio de sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
