import { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('mc_cookie_consent')) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('mc_cookie_consent', 'accepted');
    setVisible(false);
  };

  const reject = () => {
    localStorage.setItem('mc_cookie_consent', 'rejected');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 2000,
        padding: '16px',
        animation: 'navSlideIn 0.35s ease forwards',
      }}
    >
      <div style={{
        maxWidth: 720,
        margin: '0 auto',
        background: 'rgba(30,27,75,0.97)',
        backdropFilter: 'blur(12px)',
        borderRadius: 16,
        border: '1px solid rgba(167,139,250,0.25)',
        boxShadow: '0 -4px 32px rgba(0,0,0,0.25)',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <p style={{ color: '#fff', fontWeight: 900, fontSize: 14, margin: '0 0 4px' }}>
            🍪 Usamos cookies
          </p>
          <p style={{ color: 'rgba(196,181,253,0.85)', fontSize: 12, margin: 0, lineHeight: 1.5 }}>
            MatchCard utiliza cookies esenciales para mantener tu sesión activa y cookies
            analíticas para mejorar el servicio. Puedes aceptarlas todas o solo las esenciales.
            Consulta nuestra{' '}
            <a href="/privacidad" style={{ color: '#a78bfa', fontWeight: 700, textDecoration: 'none' }}>
              política de privacidad
            </a>.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          <button
            onClick={reject}
            style={{
              padding: '9px 18px', borderRadius: 30,
              background: 'transparent',
              border: '1px solid rgba(167,139,250,0.4)',
              color: '#c4b5fd', fontSize: 13, fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Solo esenciales
          </button>
          <button
            onClick={accept}
            style={{
              padding: '9px 22px', borderRadius: 30,
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              border: 'none',
              color: '#1a1200', fontSize: 13, fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(255,165,0,0.35)',
            }}
          >
            Aceptar todas
          </button>
        </div>
      </div>
    </div>
  );
}
