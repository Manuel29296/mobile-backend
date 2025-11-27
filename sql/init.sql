-- ============================================
--  EXTENSIÓN PARA UUID
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
--  1) TABLA DE USUARIOS
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username      VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  fullname      VARCHAR(120) NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================
--  2) SESIONES DE AUTENTICACIÓN (REFRESH TOKENS)
--     Antes tu tabla 'sessions' hacía esto; ahora
--     la renombramos lógicamente a 'auth_sessions'
-- ============================================
CREATE TABLE IF NOT EXISTS auth_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token TEXT,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  revoked_at    TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_user
  ON auth_sessions(user_id);

-- ============================================
--  3) SESIONES ACADÉMICAS / DE ASISTENCIA
--     Estas son las que verá la app en:
--     GET /api/sessions
-- ============================================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Dueño / creador de la sesión (docente)
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Datos básicos de la sesión
  title        VARCHAR(120) NOT NULL,   -- nombre de la sesión (ej. "Clase Redes 01")
  session_date DATE NOT NULL,           -- fecha de la sesión
  start_time   TIME,                    -- hora inicio (opcional)
  end_time     TIME,                    -- hora fin (opcional)
  location     VARCHAR(120),            -- salón / lugar (opcional)
  description  TEXT,                    -- descripción (opcional)

  created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user
  ON sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_sessions_date
  ON sessions(session_date);

-- ============================================
--  4) ASISTENCIAS POR SESIÓN
--     Cada fila = 1 persona en 1 sesión
--     Estado sugerido: 'PRESENTE' | 'AUSENTE' | 'TARDANZA'
-- ============================================
CREATE TABLE IF NOT EXISTS asistencias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relación con la sesión académica
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,

  -- Identificador de la persona:
  -- puede ser documento, código QR, código de estudiante, etc.
  person_id VARCHAR(120) NOT NULL,

  -- Estado de asistencia
  estado VARCHAR(20) NOT NULL DEFAULT 'PRESENTE',  -- PRESENTE | AUSENTE | TARDANZA

  -- Opcional: rating / feedback por persona en la sesión
  rating INT,

  observacion TEXT,

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Evita que la misma persona se registre dos veces
  -- en la misma sesión
  UNIQUE (session_id, person_id)
);

CREATE INDEX IF NOT EXISTS idx_asist_session
  ON asistencias(session_id);

CREATE INDEX IF NOT EXISTS idx_asist_person
  ON asistencias(person_id);
