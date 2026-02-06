# Binder — MVP Next.js

Aplicación web para gestionar tu colección de photocards K-pop.

## 🚀 Inicio rápido

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar base de datos MongoDB:**
   - Crea un archivo `.env` copiando `.env.example`
   - **Opción A: MongoDB Atlas (gratis en la nube):**
     - Crea cuenta en https://www.mongodb.com/cloud/atlas
     - Crea un cluster gratuito (M0)
     - Database Access → crea usuario con contraseña
     - Network Access → añade IP `0.0.0.0/0` (o tu IP específica)
     - Clusters → Connect → Connect your application → copia la URI
     - En `.env`: `DATABASE_URL="mongodb+srv://usuario:password@cluster.mongodb.net/binder?retryWrites=true&w=majority"`
   - **Opción B: MongoDB local (Docker):**
     ```bash
     docker run -d -p 27017:27017 --name binder-mongo mongo:7
     ```
     En `.env`: `DATABASE_URL="mongodb://localhost:27017/binder"`
   - Genera `NEXTAUTH_SECRET` con: `openssl rand -base64 32`

3. **Crear las colecciones en la base de datos (obligatorio una vez conectado):**
   ```bash
   npm run db:setup
   ```
   O por separado: `npx prisma db push` y `npx prisma generate`. Sin este paso el login falla.

4. **Ejecutar en desarrollo:**
   ```bash
   npm run dev
   ```

5. Abre [http://localhost:3000](http://localhost:3000)

## 📁 Estructura

- `app/` — Rutas y páginas (App Router)
- `app/api/` — API routes (REST)
- `lib/` — Utilidades (Prisma, auth)
- `prisma/` — Schema de Prisma
- `database/schema.sql` — Esquema SQL completo (referencia)

## 🔐 Autenticación

MVP usa Credentials (email). En producción añade OAuth (Google, Apple) en `lib/auth.ts`.

## 🎨 Estética

Tema pastel inspirado en álbumes K-pop. Colores en `app/globals.css` (variables CSS).

## 📝 Funcionalidades MVP

- ✅ Login/registro (email)
- ✅ Dashboard con estadísticas
- ✅ Binders (crear, ver, páginas)
- ✅ Photocards (añadir manualmente)
- ✅ Wishlist
- ⏳ Escaneo con cámara (fase 2)
- ⏳ Reconocimiento de imagen (fase 2)
- ⏳ Drag & drop en binder (fase 2)
- ⏳ Decoración de páginas (fase 3)

## 🗄️ Base de datos

Usa **MongoDB**. El schema está en `prisma/schema.prisma`. Para sincronizar el schema:

```bash
npx prisma db push
```

MongoDB con Prisma no usa migraciones tradicionales; `db push` sincroniza el schema directamente.

## 📚 Documentación

Ver `../DISENO_APLICACION_PHOTOCARDS.md` y `../GUIA_VISUAL_UX.md` para diseño completo.
