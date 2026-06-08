import { Resend } from 'resend';

let _resend = null;
function getResend() {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const FROM = 'MatchCard <onboarding@resend.dev>';

const base = (content) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
</head>
<body style="margin:0;padding:0;background:#ede9fe;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:32px 16px;">
      <table width="100%" style="max-width:520px;background:#ffffff;border-radius:20px;
             border:1px solid #ddd6fe;box-shadow:0 8px 32px rgba(91,33,182,0.10);">
        <tr>
          <td style="background:linear-gradient(135deg,#7c3aed,#4338ca);
                     border-radius:20px 20px 0 0;padding:28px 32px;text-align:center;">
            <span style="font-size:28px;font-weight:900;color:#fff;letter-spacing:-1px;">
              Match<span style="color:#fde68a;">Card</span>
            </span>
          </td>
        </tr>
        <tr><td style="padding:36px 32px 28px;">${content}</td></tr>
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #f3f0ff;
                     text-align:center;color:#a78bfa;font-size:12px;">
            © 2025 MatchCard · Intercambio de cromos
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

export async function sendVerificationEmail(to, token) {
  const url = `${process.env.CLIENT_URL}/verify-email/${token}`;

  await getResend().emails.send({
    from:    FROM,
    to:      [to],
    subject: '✉️ Confirma tu cuenta en MatchCard',
    html: base(`
      <h2 style="margin:0 0 12px;color:#1e1b4b;font-size:22px;font-weight:900;">
        ¡Ya casi estás! 🎴
      </h2>
      <p style="color:#4b5563;font-size:15px;line-height:1.6;margin:0 0 28px;">
        Haz clic en el botón de abajo para confirmar tu dirección de correo y
        activar todas las funciones de tu cuenta de Entrenador.
      </p>
      <div style="text-align:center;margin-bottom:28px;">
        <a href="${url}"
           style="display:inline-block;background:linear-gradient(135deg,#FFD700,#FFA500);
                  color:#1a1200;font-weight:900;font-size:15px;padding:14px 36px;
                  border-radius:50px;text-decoration:none;
                  box-shadow:0 4px 16px rgba(255,165,0,0.4);">
          ✅ Confirmar mi cuenta
        </a>
      </div>
      <p style="color:#9ca3af;font-size:13px;text-align:center;margin:0;">
        El enlace caduca en 24 horas. Si no creaste esta cuenta, ignora este correo.
      </p>`),
  });
}

export async function sendPasswordResetEmail(to, token) {
  const url = `${process.env.CLIENT_URL}/reset-password/${token}`;

  await getResend().emails.send({
    from:    FROM,
    to:      [to],
    subject: '🔐 Recupera tu contraseña de MatchCard',
    html: base(`
      <h2 style="margin:0 0 12px;color:#1e1b4b;font-size:22px;font-weight:900;">
        Recupera tu acceso 🔑
      </h2>
      <p style="color:#4b5563;font-size:15px;line-height:1.6;margin:0 0 28px;">
        Recibimos una solicitud para restablecer la contraseña de tu cuenta.
        Si fuiste tú, haz clic abajo. Si no, ignora este correo.
      </p>
      <div style="text-align:center;margin-bottom:28px;">
        <a href="${url}"
           style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#4338ca);
                  color:#fff;font-weight:900;font-size:15px;padding:14px 36px;
                  border-radius:50px;text-decoration:none;
                  box-shadow:0 4px 16px rgba(124,58,237,0.4);">
          🔐 Restablecer contraseña
        </a>
      </div>
      <p style="color:#9ca3af;font-size:13px;text-align:center;margin:0;">
        Este enlace expira en 1 hora.
      </p>`),
  });
}
