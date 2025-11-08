# Backend Asistencias (Node.js + Express + PostgreSQL)

API sencilla para una app de **asistencias**:
- Registro e inicio de sesión (JWT simple, sin verificación de correo)
- CRUD de **asistencias**
- Validación básica con Zod
- **Base de datos en la nube** (PostgreSQL con SSL)

---

## Requisitos
- Node.js 18+ (recomendado 20+)
- Conexión a Internet (DB en la nube)
- Archivo `.env` con la URL de la base de datos **(incluye sslmode=require)**

Ejemplo de `.env`:

PORT=4000
DATABASE_URL=postgresql://usuario:password@host.neon.tech/base?sslmode=require
JWT_SECRET=cambia-esto
JWT_EXPIRES_IN=1h


> No necesitas instalar PostgreSQL localmente.

---

## Instalación y ejecución

```bash
# 1) Instalar dependencias
npm install

# 2) Crear tablas en la base de datos (nube)
npm run db:init

# 3) Levantar el servidor en modo desarrollo
npm run dev
# Servirá en http://localhost:4000
