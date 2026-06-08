const SIRV_API = 'https://api.sirv.com/v2';

// Token en memoria: evita pedir uno nuevo en cada subida
let _token      = null;
let _tokenExpAt = 0;   // timestamp ms en que expira
let _cdnUrl     = null; // https://usuario.sirv.com  (se obtiene una sola vez)

// ── Obtiene (o reutiliza) el Bearer token ───────────────────────────────────
async function getToken() {
  // Renueva si faltan menos de 60 s para que expire
  if (_token && Date.now() < _tokenExpAt - 60_000) return _token;

  const res = await fetch(`${SIRV_API}/token`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      clientId:     process.env.SIRV_CLIENT_ID,
      clientSecret: process.env.SIRV_CLIENT_SECRET,
    }),
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Sirv auth error ${res.status}: ${msg}`);
  }

  const { token, expiresIn } = await res.json();
  _token      = token;
  _tokenExpAt = Date.now() + expiresIn * 1000;
  return _token;
}

// ── Obtiene la URL pública del CDN (p.ej. https://miusuario.sirv.com) ───────
async function getCdnUrl() {
  if (_cdnUrl) return _cdnUrl;

  const token = await getToken();
  const res   = await fetch(`${SIRV_API}/account`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error(`Sirv account error ${res.status}`);

  const data = await res.json();
  // Sirv devuelve cdn_url o podemos construirlo con alias
  _cdnUrl = data.cdn_url ?? `https://${data.alias}.sirv.com`;
  return _cdnUrl;
}

// ── Sube un buffer en memoria a Sirv y devuelve la URL pública ───────────────
export async function uploadToSirv(buffer, mimetype, originalName) {
  const token  = await getToken();
  const cdnUrl = await getCdnUrl();

  // Nombre único: timestamp + sufijo aleatorio + extensión original
  const ext      = originalName.match(/\.[^.]+$/)?.[0].toLowerCase() ?? '.jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const sirvPath = `/matchcard/${filename}`;

  const res = await fetch(
    `${SIRV_API}/files/upload?filename=${encodeURIComponent(sirvPath)}`,
    {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${token}`,
        'Content-Type': mimetype,
      },
      body: buffer,
    },
  );

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Sirv upload error ${res.status}: ${msg}`);
  }

  return `${cdnUrl}${sirvPath}`;
}
