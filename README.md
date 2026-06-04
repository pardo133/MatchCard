# MatchCard

Plataforma web full-stack para el intercambio de cromos coleccionables. Los usuarios registran sus cromos repetidos y sus faltas; el sistema cruza ambas listas para encontrar matches entre coleccionistas y facilitar el intercambio directamente desde la app.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 18, React Router v6, Zustand, Tailwind CSS, Vite |
| Backend | Node.js, Express 5, MongoDB + Mongoose |
| Tiempo real | Socket.io |
| Autenticación | JWT + bcrypt |
| Email | Nodemailer (verificación de cuenta, reset de contraseña) |
| Pagos | Stripe (Checkout + Webhooks) |
| Subida de archivos | Multer |

---

## Características principales

### Gestión de inventario
- **Mis Repetidas**: el usuario añade los cromos que tiene de más, con foto opcional subida al servidor
- **Mi Álbum**: vista en carpetas acordeón organizadas por colección/sección, con estado de progreso

### Sistema de matches
- **Buscador**: búsqueda por nombre de cromo con filtro por categoría (Pokémon, Deportes, Anime, Otros). Muestra qué usuarios tienen ese cromo repetido y permite contactar por email, teléfono o chat interno
- **Descubrir**: vista tipo swipe para explorar matches automáticos cruzando el inventario propio con el de otros usuarios, con geolocalización y prioridad por cercanía (zona / provincial / internacional)
- **Matches bidireccionales**: detecta y destaca cuando el intercambio beneficia a ambas partes

### Chat integrado
- Chat en tiempo real mediante **Socket.io** dentro de cada match
- Historial de mensajes persistido en MongoDB
- Los usuarios coordinan el intercambio físico desde el chat
- Sistema de **confirmación doble**: ambos usuarios confirman haber realizado el intercambio, lo que actualiza automáticamente sus inventarios

### Autenticación completa
- Registro con verificación de email obligatoria
- Login bloqueado hasta verificar la cuenta
- Reenvío de email de verificación
- Recuperación de contraseña con token de expiración en 1 hora
- Validación de contraseña: mínimo 8 caracteres, 1 mayúscula, 1 símbolo

### Monetización (Stripe)
- **Plan gratuito**: 3 búsquedas diarias con datos de contacto visibles
- **Pase de Coleccionista (1,99€/mes)**: búsquedas ilimitadas
- Integración completa: Stripe Checkout → Webhook → activación de `isPremium` en base de datos
- Revocación automática del plan si la suscripción se cancela o el pago falla

---

## Estructura del proyecto

```
MatchCard/
├── backend/
│   └── src/
│       ├── config/         # Conexión a MongoDB
│       ├── controllers/    # Lógica de cada recurso
│       ├── middleware/     # Auth (JWT), manejo de errores
│       ├── models/         # Esquemas Mongoose
│       ├── routes/         # Definición de endpoints
│       ├── services/       # emailService (Nodemailer)
│       ├── socket/         # socket.handler.js (Socket.io)
│       └── app.js          # Express app
│   └── server.js           # HTTP server + init Socket.io
└── frontend/
    └── src/
        ├── api/            # axiosClient con interceptor JWT
        ├── components/
        │   ├── common/     # Navbar, CartaHex, CookieBanner, Badge...
        │   └── match/      # MatchCard
        ├── context/        # SocketContext (proveedor Socket.io)
        ├── hooks/          # useMatches
        ├── pages/          # Una página por ruta
        ├── store/          # userStore (Zustand)
        └── App.jsx         # Router principal
```

---

## Modelos de datos

### User
```
username, email, passwordHash, ciudad, telefono
isAdmin, isActive, isEmailVerified, emailVerifyToken
passwordResetToken, passwordResetExpires
isPremium, stripeCustomerId
searchesToday, lastSearchDate
inventario: { repetidos: [CromoId], faltas: [CromoId] }
```

### Cromo (catálogo compartido)
```
numero, nombre, expansion, imagenUrl
rareza: common | uncommon | rare | ultra-rare | secret-rare
categoria: Pokémon | Deportes | Anime | Otros
```

### Match
```
userA, userB
cromosDeAparaB: [CromoId]   // cartas que A da a B
cromosDeBparaA: [CromoId]   // cartas que B da a A
ciudad, distanciaKm, prioridad: zona | provincial | internacional
status: pending | accepted | rejected | completed
mensajes: [{ autor, texto, timestamp }]
confirmaciones: { userA: Boolean, userB: Boolean }
```

---

## API — Endpoints principales

### Auth `POST /api/auth/...`
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/register` | No | Registro + envío email verificación |
| POST | `/login` | No | Login → JWT |
| GET | `/me` | JWT | Datos del usuario autenticado |
| GET | `/verify-email/:token` | No | Verificar cuenta |
| POST | `/resend-verification` | No | Reenviar email de verificación |
| POST | `/forgot-password` | No | Solicitar reset de contraseña |
| POST | `/reset-password/:token` | No | Establecer nueva contraseña |

### Cromos `GET|POST|DELETE /api/cromos/...`
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/buscar-publico?nombre=X` | No | Búsqueda pública (hero de Home) |
| GET | `/buscar-match?nombre=X&categoria=Y` | JWT | Búsqueda con límite diario + datos de contacto |
| GET | `/` | No | Catálogo completo |
| POST | `/` | JWT | Crear cromo y añadir al inventario |
| DELETE | `/:id` | JWT | Eliminar cromo del catálogo |

### Usuarios `GET|PUT /api/users/...`
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/profile` | JWT | Perfil + inventario |
| PUT | `/profile` | JWT | Actualizar ciudad y teléfono |
| PUT | `/inventario` | JWT | Añadir/quitar cromos de repetidos o faltas |

### Matches `GET|POST|PUT /api/matches/...`
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/buscar` | JWT | Matchmaking automático por inventario y geolocalización |
| POST | `/proponer` | JWT | Proponer un match a otro usuario |
| GET | `/` | JWT | Mis matches (sin historial de mensajes) |
| GET | `/:id/mensajes` | JWT | Chat + datos del match |
| PUT | `/:id/status` | JWT | Aceptar o rechazar un match |
| POST | `/:id/confirmar` | JWT | Confirmar intercambio físico |

### Stripe `POST /api/stripe/...`
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/checkout` | JWT | Crear sesión de pago → devuelve URL |
| POST | `/webhook` | Stripe sig | Eventos: activar/revocar isPremium |

---

## Socket.io — Eventos

### Cliente → Servidor
| Evento | Payload | Descripción |
|---|---|---|
| `join_chat` | `{ matchId }` | Unirse a la sala del chat |
| `send_message` | `{ matchId, texto }` | Enviar mensaje |

### Servidor → Cliente
| Evento | Payload | Descripción |
|---|---|---|
| `new_message` | `{ _id, texto, timestamp, autor }` | Nuevo mensaje en el chat |
| `nuevo_match_propuesto` | `{ matchId, de, prioridad }` | Alguien propuso un match |
| `match_actualizado` | `{ matchId, status }` | Match aceptado o rechazado |
| `confirmacion_actualizada` | `{ matchId, confirmaciones }` | Uno de los dos confirmó |
| `intercambio_completado` | `{ matchId }` | Ambos confirmaron → inventarios actualizados |
| `inventario_actualizado` | — | El inventario cambió tras completar un intercambio |

---

## Instalación y puesta en marcha

### Requisitos
- Node.js 18+
- MongoDB (local o Atlas)
- Cuenta de Stripe (para pagos)
- Servidor SMTP (para emails)

### Variables de entorno

**`backend/.env`**
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/matchcard
JWT_SECRET=tu_secreto_jwt
CLIENT_URL=http://localhost:5173

SMTP_HOST=smtp.ejemplo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu@email.com
SMTP_PASS=tu_contraseña

STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Comandos

```bash
# Instalar dependencias (raíz, backend y frontend)
npm install
npm install --prefix backend
npm install --prefix frontend

# Desarrollo (arranca backend en :5001 y frontend en :5173)
npm run dev

# Solo backend
npm run dev:backend

# Solo frontend
npm run dev:frontend
```

---

## Páginas del frontend

| Ruta | Página | Auth |
|---|---|---|
| `/` | Home — buscador público y hero | No |
| `/register` | Registro | No |
| `/login` | Login | No |
| `/forgot-password` | Recuperar contraseña | No |
| `/reset-password/:token` | Nueva contraseña | No |
| `/verify-email/:token` | Verificar cuenta | No |
| `/verificar-email-pendiente` | Aviso de verificación pendiente | Sí |
| `/album` | Mi Álbum — colección por secciones | Sí |
| `/repes` | Mis Repetidas — gestión del inventario | Sí |
| `/buscador` | Buscador de faltas + contacto | Sí |
| `/descubrir` | Matchmaking tipo swipe | Sí |
| `/dashboard` | Mis Matches — pendientes, activos, historial | Sí |
| `/chat/:id` | Chat en tiempo real del match | Sí |
| `/profile` | Editar perfil | Sí |
| `/admin` | Panel de administración | Admin |
| `/quienes-somos` | Página informativa | No |
