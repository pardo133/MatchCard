import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { toast } from 'react-hot-toast';

export default function ResetPassword() {
  const { token }             = useParams();
  const navigate              = useNavigate();
  const [password, setPass]   = useState('');
  const [confirm,  setConf]   = useState('');
  const [loading,  setLoad]   = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (password.length < 8) {
      return toast.error('La contraseña debe tener al menos 8 caracteres');
    }
    if (password !== confirm) {
      return toast.error('Las contraseñas no coinciden');
    }
    setLoad(true);
    try {
      await axiosClient.post(`/auth/reset-password/${token}`, { password });
      toast.success('¡Contraseña actualizada! Ya puedes iniciar sesión');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enlace inválido o caducado');
    } finally {
      setLoad(false);
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
          <h1 className="font-black text-xl text-mc-dark">Nueva contraseña</h1>
          <p className="text-mc-muted text-sm mt-1">Elige una contraseña segura</p>
        </div>

        <div className="card-white p-8 rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-mc-dark mb-1.5">
                Nueva contraseña
              </label>
              <input type="password" required placeholder="Mínimo 8 caracteres"
                value={password} onChange={e => setPass(e.target.value)}
                className="input-light" />
            </div>
            <div>
              <label className="block text-sm font-bold text-mc-dark mb-1.5">
                Confirmar contraseña
              </label>
              <input type="password" required placeholder="Repite la contraseña"
                value={confirm} onChange={e => setConf(e.target.value)}
                className="input-light" />
            </div>

            <button type="submit" disabled={loading}
              className="btn-yellow w-full py-3 mt-2 uppercase tracking-wide disabled:opacity-50">
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Guardando...
                  </span>
                : 'Guardar nueva contraseña →'}
            </button>

            <p className="text-center text-sm text-mc-muted mt-2">
              <Link to="/login" className="text-mc-purple font-bold hover:underline">
                ← Volver al login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
