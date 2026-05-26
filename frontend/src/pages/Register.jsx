import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useUserStore } from '../store/userStore';
import { toast } from 'react-hot-toast';

/* Mismas reglas que el backend */
function checkPassword(pw) {
  return {
    length:    pw.length >= 8,
    uppercase: /[A-Z]/.test(pw),
    symbol:    /[!@#$%^&*()\-_=+[\]{};:'"\\|,.<>/?`~]/.test(pw),
  };
}

function PasswordStrength({ password }) {
  const rules = useMemo(() => checkPassword(password), [password]);
  if (!password) return null;

  const items = [
    { key: 'length',    label: 'Mínimo 8 caracteres' },
    { key: 'uppercase', label: 'Una letra mayúscula (A-Z)' },
    { key: 'symbol',    label: 'Un símbolo (!@#$%…)' },
  ];

  return (
    <ul className="mt-2 space-y-1">
      {items.map(({ key, label }) => (
        <li key={key} className="flex items-center gap-1.5 text-xs"
            style={{ color: rules[key] ? '#16a34a' : '#9ca3af' }}>
          <span>{rules[key] ? '✅' : '⬜'}</span>
          {label}
        </li>
      ))}
    </ul>
  );
}

export default function Register() {
  const [form, setForm]       = useState({ username: '', email: '', password: '', ciudad: '', telefono: '' });
  const [loading, setLoading] = useState(false);
  const { setAuth }           = useUserStore();
  const navigate              = useNavigate();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const passwordOk = useMemo(() => {
    const r = checkPassword(form.password);
    return r.length && r.uppercase && r.symbol;
  }, [form.password]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!passwordOk) {
      toast.error('La contraseña no cumple los requisitos');
      return;
    }
    setLoading(true);
    try {
      const { data } = await axiosClient.post('/auth/register', form);
      setAuth(data.token, data.user);
      toast.success('¡Cuenta creada! Revisa tu email para verificarla 📧', { duration: 6000 });
      navigate('/verificar-email-pendiente');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg"
                 style={{ background: 'linear-gradient(135deg, #7c3aed, #4338ca)' }}>M</div>
            <span className="font-black text-2xl text-mc-dark">Match<span className="text-mc-purple">Card</span></span>
          </div>
          <h1 className="font-black text-xl text-mc-dark">Únete a MatchCard</h1>
          <p className="text-mc-muted text-sm mt-1">Crea tu cuenta de Entrenador</p>
        </div>

        <div className="card-white p-8 rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Username */}
            <div>
              <label className="block text-sm font-bold text-mc-dark mb-1.5">Nombre de usuario</label>
              <input name="username" type="text" placeholder="AshKetchum"
                required onChange={handleChange} className="input-light" />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-mc-dark mb-1.5">Email</label>
              <input name="email" type="email" placeholder="ash@pokemon.com"
                required onChange={handleChange} className="input-light" />
              <p className="text-[11px] text-mc-muted mt-1">
                📧 Recibirás un correo para verificar tu cuenta
              </p>
            </div>

            {/* Contraseña + indicador */}
            <div>
              <label className="block text-sm font-bold text-mc-dark mb-1.5">Contraseña</label>
              <input name="password" type="password" placeholder="Mín. 8 chars, 1 mayúscula, 1 símbolo"
                required onChange={handleChange} className="input-light" />
              <PasswordStrength password={form.password} />
            </div>

            {/* Ciudad */}
            <div>
              <label className="block text-sm font-bold text-mc-dark mb-1.5">Ciudad</label>
              <input name="ciudad" type="text" placeholder="Madrid, Barcelona…"
                required onChange={handleChange} className="input-light" />
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-bold text-mc-dark mb-1.5">Teléfono (opcional)</label>
              <input name="telefono" type="tel" placeholder="+34 600 000 000"
                onChange={handleChange} className="input-light" />
            </div>

            <button type="submit" disabled={loading || !passwordOk}
              className="btn-yellow w-full py-3 mt-2 uppercase tracking-wide disabled:opacity-50">
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Creando cuenta...
                  </span>
                : 'Registrarse Gratis →'}
            </button>
          </form>

          <p className="text-center text-sm text-mc-muted mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-mc-purple font-black hover:underline">Iniciar sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
