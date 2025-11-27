// src/models/sessions.model.js
import { pool } from "../db/pool.js";

/**
 * Convierte una fila de la BD a la forma que espera el frontend
 * (con starts_at y ends_at en formato "YYYY-MM-DDTHH:mm:ss").
 */
function mapRowToSession(row) {
  const dateObj = row.session_date instanceof Date
    ? row.session_date
    : row.session_date
      ? new Date(row.session_date)
      : null;

  const dateStr = dateObj ? dateObj.toISOString().slice(0, 10) : null; // YYYY-MM-DD

  const buildDateTime = (time) => {
    if (!dateStr || !time) return null;
    // time suele venir como "HH:MM:SS"
    return `${dateStr}T${time.toString().slice(0, 8)}`; // yyyy-MM-dd'T'HH:mm:ss
  };

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    // Campos que consume el frontend Android
    starts_at: buildDateTime(row.start_time),
    ends_at: buildDateTime(row.end_time),
    youtube_video_id: null, // no se maneja en este backend
    user_id: row.user_id,
    location: row.location,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Parsea un string tipo "YYYY-MM-DDTHH:mm:ss"
 * y devuelve { date: 'YYYY-MM-DD', time: 'HH:MM:SS' }
 */
function splitIsoDateTime(iso) {
  if (!iso || typeof iso !== "string") return { date: null, time: null };
  const [d, t] = iso.split("T");
  if (!d) return { date: null, time: null };
  const time = t ? t.slice(0, 8) : null;
  return { date: d, time };
}

// =========================
//   CREATE
// =========================
export async function createSessionInDB(userId, payload) {
  const {
    title,
    description = null,
    starts_at,
    ends_at,
    location = null,
    // youtube_video_id lo ignoramos en este backend
  } = payload;

  if (!title) {
    throw new Error("title es obligatorio");
  }

  if (!starts_at) {
    throw new Error("starts_at es obligatorio");
  }

  const start = splitIsoDateTime(starts_at);
  const end = splitIsoDateTime(ends_at);

  const sessionDate = start.date; // NOT NULL en la BD

  const { rows } = await pool.query(
    `INSERT INTO sessions (
       user_id,
       title,
       session_date,
       start_time,
       end_time,
       location,
       description
     )
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *`,
    [
      userId,
      title,
      sessionDate,
      start.time,   // puede ser null si no mandas hora
      end.time,     // puede ser null
      location,
      description,
    ]
  );

  return mapRowToSession(rows[0]);
}

// =========================
//   READ (lista)
// =========================
export async function fetchSessionsFromDB(userId) {
  const { rows } = await pool.query(
    `SELECT *
       FROM sessions
      WHERE user_id = $1
      ORDER BY session_date DESC, created_at DESC`,
    [userId]
  );

  return rows.map(mapRowToSession);
}

/**
 * Alias que usa el controller: getSessionByUserId(userId)
 */
export async function getSessionByUserId(userId) {
  return fetchSessionsFromDB(userId);
}

// =========================
//   READ (por id)
// =========================
export async function fetchSessionByIdFromDB(userId, id) {
  const { rows } = await pool.query(
    `SELECT *
       FROM sessions
      WHERE id = $1
        AND user_id = $2`,
    [id, userId]
  );

  if (!rows.length) return null;
  return mapRowToSession(rows[0]);
}

// =========================
//   UPDATE
// =========================
export async function updateSessionInDB(userId, id, payload) {
  const {
    title,
    description,
    starts_at,
    ends_at,
    location,
  } = payload;

  const sets = [];
  const values = [id, userId];
  let idx = 3;

  if (title !== undefined) {
    sets.push(`title = $${idx}`);
    values.push(title);
    idx++;
  }

  if (description !== undefined) {
    sets.push(`description = $${idx}`);
    values.push(description);
    idx++;
  }

  if (location !== undefined) {
    sets.push(`location = $${idx}`);
    values.push(location);
    idx++;
  }

  // Si viene starts_at, actualizamos session_date y start_time
  if (starts_at !== undefined) {
    const start = splitIsoDateTime(starts_at);
    sets.push(`session_date = $${idx}`);
    values.push(start.date);
    idx++;

    sets.push(`start_time = $${idx}`);
    values.push(start.time);
    idx++;
  }

  // Si viene ends_at, actualizamos end_time
  if (ends_at !== undefined) {
    const end = splitIsoDateTime(ends_at);
    sets.push(`end_time = $${idx}`);
    values.push(end.time);
    idx++;
  }

  if (!sets.length) {
    // Nada que actualizar → devolvemos la sesión actual
    return await fetchSessionByIdFromDB(userId, id);
  }

  const query = `
    UPDATE sessions
       SET ${sets.join(", ")},
           updated_at = NOW()
     WHERE id = $1
       AND user_id = $2
     RETURNING *`;

  const { rows } = await pool.query(query, values);
  if (!rows.length) return null;
  return mapRowToSession(rows[0]);
}

// =========================
//   DELETE
// =========================
export async function deleteSessionFromDB(userId, id) {
  const { rowCount } = await pool.query(
    `DELETE FROM sessions
      WHERE id = $1
        AND user_id = $2`,
    [id, userId]
  );

  return rowCount > 0;
}
