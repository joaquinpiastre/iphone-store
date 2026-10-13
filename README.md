# Web de iPhones — monorepo

| Carpeta | Qué es | Deploy |
|---|---|---|
| `web/` | Next.js 15 (App Router) + Tailwind + Framer Motion + GSAP + React Three Fiber | Vercel |
| `api/` | Fastify + Zod + Prisma + PostgreSQL | Railway |

Cada carpeta es un proyecto npm independiente (con su propio `package-lock.json`), así podés fijar el *Root Directory* en cada plataforma.

---

## 1. Correr en local

Requisitos: Node 20+, PostgreSQL (local, Docker o el de Railway).

```bash
npm run install:all

# Backend
cp api/.env.example api/.env        # completá DATABASE_URL y JWT_SECRET
cd api
npx prisma migrate deploy           # aplica la migración inicial
npx prisma db seed                  # 9 iPhones + tabla de canje + admin
npm run dev                         # http://localhost:4000/health

# Frontend (otra terminal)
cp web/.env.example web/.env.local
npm run dev:web                     # http://localhost:3000
```

- **Admin de prueba:** `admin@demo.com` / `admin1234` → http://localhost:3000/admin
  (cambialo con `ADMIN_EMAIL` / `ADMIN_PASSWORD` antes de hacer el seed o el primer arranque).
- Sin credenciales de Cloudinary, las fotos se guardan en `api/uploads/` (solo para desarrollo).
- Postgres rápido con Docker: `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=celular postgres:16`

## 2. Dónde cambiar cosas

- **Datos del negocio** (nombre, WhatsApp, redes, dirección, horarios, textos base): `web/src/config/site.ts`.
  El WhatsApp y el dólar también se pueden editar desde el panel (Configuración) y pisan los valores del archivo.
- **Precios de canje y descuentos:** panel → *Precios de canje* (o `api/src/lib/defaults.ts` para el seed inicial).
- **Testimonios / FAQ / beneficios:** `web/src/components/sections/`.

---

## 3. Deploy

### 3.1 Railway (API + Postgres)

1. Subí el repo a GitHub.
2. En Railway: **New Project → Deploy from GitHub repo** → elegí el repo.
3. En el servicio creado: **Settings → Root Directory = `api`**. Railway detecta el `Dockerfile` y `railway.json` (healthcheck `/health`, y al arrancar corre `prisma migrate deploy`).
4. **Add → Database → PostgreSQL**. Luego, en el servicio de la API → **Variables**:

   | Variable | Valor |
   |---|---|
   | `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (referencia al plugin) |
   | `JWT_SECRET` | string aleatorio de 48+ bytes (`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`) |
   | `FRONTEND_URL` | `https://tudominio.com` (o la URL de Vercel) |
   | `NODE_ENV` | `production` |
   | `ADMIN_EMAIL` / `ADMIN_PASSWORD` | credenciales del primer admin (se crea solo en el primer arranque) |
   | `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | desde tu cuenta de Cloudinary |

5. **Settings → Networking → Generate Domain**. Probá `https://<tu-api>.up.railway.app/health` → `{"status":"ok"}`.
6. Datos de ejemplo (opcional): con la CLI de Railway `railway run --service api npx prisma db seed`
   Si preferís arrancar vacío, cargá todo desde el panel: la tabla de canje se completa en *Precios de canje*.

> Importante: sin Cloudinary, el disco de Railway es efímero y las fotos se pierden en cada deploy. En producción configurá Cloudinary.

### 3.2 Vercel (front)

1. **Add New → Project** → importá el mismo repo.
2. **Root Directory = `web`** (Framework: Next.js, se detecta solo).
3. **Environment Variables:**

   | Variable | Valor |
   |---|---|
   | `API_URL` | URL pública de Railway, sin `/` final (`https://<tu-api>.up.railway.app`) |
   | `NEXT_PUBLIC_SITE_URL` | `https://tudominio.com` |
   | `NEXT_PUBLIC_GA_ID` | (opcional) ID de Google Analytics |

4. Deploy. El front proxea `/api/*` hacia Railway con `rewrites`, así la cookie de sesión queda *same-origin* (sin CORS ni cookies de terceros).

### 3.3 Dominio

1. Vercel → Project → **Settings → Domains** → agregá `tudominio.com` y `www.tudominio.com`; creá en tu DNS los registros que indica (A/CNAME).
2. Actualizá en Railway `FRONTEND_URL=https://tudominio.com` y en Vercel `NEXT_PUBLIC_SITE_URL=https://tudominio.com`; redeploy de ambos.
3. (Opcional) Dominio propio para la API (`api.tudominio.com`) en Railway → Networking → Custom Domain; después actualizá `API_URL`.

### 3.4 Checklist post-deploy

- [ ] `/health` de la API responde `ok`.
- [ ] Entrás a `/admin` con el admin y **cambiás la contraseña inicial** (o definís una fuerte desde el principio).
- [ ] En *Configuración* cargás dólar y WhatsApp reales.
- [ ] Completás `web/src/config/site.ts` con los datos reales y reemplazás los testimonios.
- [ ] Cargás fotos reales de los equipos.
- [ ] Probás un canje de punta a punta y verificás que aparece en *Solicitudes*.

---

## 4. API (resumen)

Público (solo lectura de equipos disponibles + crear solicitudes):

- `GET /health`
- `GET /api/phones` — filtros: `model, storage, color, condition, minPrice, maxPrice, minBattery, featured, sort, page, limit` (separados por coma para múltiples valores)
- `GET /api/phones/:slug`
- `GET /api/tradein/options` · `POST /api/tradein/quote` · `POST /api/tradein/requests` (rate limit 5 / 10 min)
- `GET /api/settings/public`

Auth: `POST /api/auth/login` (rate limit 8 / 10 min, cookie httpOnly) · `POST /api/auth/logout` · `GET /api/auth/me`

Admin (requiere sesión): `/api/admin/{dashboard, phones, uploads, tradein/prices, tradein/modifiers, tradein/requests, settings}`

### Cómo se calcula la cotización

`precio = base(modelo, almacenamiento) × (1 − Σ descuentos%)` con tope de 90%, redondeado a US$ 5. Los descuentos (pantalla, carcasa, batería, no enciende, Face ID, sin caja, sin cargador) se editan en el panel. El cálculo es siempre en el servidor.

## 5. Seguridad

- Contraseñas con bcrypt (12 rondas), JWT en cookie `httpOnly` + `secure` en producción + `sameSite=lax`.
- `helmet`, CORS restringido a `FRONTEND_URL`, rate limiting en login y solicitudes de canje, honeypot anti-bots.
- Validación de todos los inputs con Zod; el público nunca recibe costo ni IMEI.
- `middleware.ts` protege `/admin/*` en el front y la API revalida el JWT en cada request.
