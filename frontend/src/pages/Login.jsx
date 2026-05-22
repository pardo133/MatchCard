import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useUserStore } from '../store/userStore';
import { toast } from 'react-hot-toast';

export default function Login() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { setAuth }           = useUserStore();
  const navigate              = useNavigate();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axiosClient.post('/auth/login', form);
      setAuth(data.token, data.user);
      toast.success(`¡Bienvenido, ${data.user.username}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Credenciales incorrectas');
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
          <p className="text-mc-muted text-sm">Inicia sesión en tu cuenta de Entrenador</p>
        </div>

        <div className="card-white p-8 rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-mc-dark mb-1.5">Email</label>
              <input name="email" type="email" placeholder="entrenador@pokemon.com"
                required onChange={handleChange} className="input-light" />
            </div>
            <div>
              <label className="block text-sm font-bold text-mc-dark mb-1.5">Contraseña</label>
              <input name="password" type="password" placeholder="••••••••"
                required onChange={handleChange} className="input-light" />
            </div>
            <button type="submit" disabled={loading}
              className="btn-yellow w-full py-3 mt-2 uppercase tracking-wide disabled:opacity-50">
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Entrando...
                  </span>
                : 'Iniciar Sesión →'}
            </button>
          </form>

          <p className="text-center text-sm text-mc-muted mt-6">
            ¿Sin cuenta aún?{' '}
            <Link to="/register" className="text-mc-purple font-black hover:underline">
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
