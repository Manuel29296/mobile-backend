import { pool } from "../db/pool.js";

export async function createAsistencia(
  userId,
  { sessionId, personId, estado = "PRESENTE", observacion = null }
) {
  const { rows } = await pool.query(
    `INSERT INTO asistencias (user_id, session_id, person_id, estado, observacion)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, sessionId, personId, estado, observacion]
  );
  return rows[0];
}



export async function listAsistencias(userId, { sessionId, personId }) {
  const conds = ["user_id = $1"];
  const vals = [userId];
  let i = 2;

  if (sessionId) { conds.push(`session_id = $${i++}`); vals.push(sessionId); }
  if (personId)  { conds.push(`person_id = $${i++}`);  vals.push(personId); }

  const where = `WHERE ${conds.join(" AND ")}`;
  const { rows } = await pool.query(
    `SELECT * FROM asistencias ${where} ORDER BY created_at DESC`,
    vals
  );
  return rows;
}

export async function getAsistencia(userId, id) {
  const { rows } = await pool.query(
    "SELECT * FROM asistencias WHERE id=$1 AND user_id=$2",
    [id, userId]
  );
  return rows[0] || null;
}

export async function updateAsistencia(userId, id, fields) {
  const keys = Object.keys(fields);
  if (!keys.length) return getAsistencia(userId, id);
  const sets = keys.map((k, i) => `${k} = $${i + 3}`).join(", ");
  const values = [id, userId, ...keys.map(k => fields[k])];
  const { rows } = await pool.query(
    `UPDATE asistencias SET ${sets}, updated_at = NOW()
     WHERE id=$1 AND user_id=$2
     RETURNING *`,
    values
  );
  return rows[0] || null;
}

export async function deleteAsistencia(userId, id) {
  const { rowCount } = await pool.query(
    "DELETE FROM asistencias WHERE id=$1 AND user_id=$2",
    [id, userId]
  );
  return rowCount > 0;
}
// ==== NUEVAS FUNCIONES PARA ESCÁNER, CHECKIN/CHECKOUT Y FEEDBACK ====

// Buscar una asistencia específica por sesión + documento (person_id = cédula)
export async function findBySessionAndDocument(sessionId, document) {
  const { rows } = await pool.query(
    `SELECT *
     FROM asistencias
     WHERE session_id = $1 AND person_id = $2`,
    [sessionId, document]
  );
  return rows[0] || null;
}

// Crear / actualizar asistencia de ENTRADA (estado = 'PRESENTE')
export async function upsertCheckin({ sessionId, document }) {
  const { rows } = await pool.query(
    `INSERT INTO asistencias (session_id, person_id, estado)
     VALUES ($1, $2, 'PRESENTE')
     ON CONFLICT (session_id, person_id)
     DO UPDATE SET estado = 'PRESENTE', updated_at = now()
     RETURNING *`,
    [sessionId, document]
  );
  return rows[0];
}

// Marcar SALIDA (solo cambiamos estado)
export async function checkoutAsistencia({ sessionId, document }) {
  const { rows } = await pool.query(
    `UPDATE asistencias
     SET estado = 'SALIDA', updated_at = now()
     WHERE session_id = $1 AND person_id = $2
     RETURNING *`,
    [sessionId, document]
  );
  return rows[0] || null;
}

// Listar asistencias de una sesión (incluye PRESENTES y AUSENTES)
export async function listBySession(sessionId) {
  const query = `
    SELECT
      a.id,
      COALESCE(a.session_id, $1::text)      AS session_id,
      p.document                            AS person_id,
      COALESCE(a.estado, 'AUSENTE')         AS estado,
      a.rating,
      a.observacion,
      a.created_at,
      a.updated_at,
      p.full_name,
      p.document,
      p.email,
      p.phone
    FROM persons p
    LEFT JOIN asistencias a
      ON a.person_id = p.document
     AND a.session_id = $1::text
    ORDER BY p.full_name;
  `;

  const { rows } = await pool.query(query, [sessionId]);
  return rows;
}

// Historial de asistencias de una persona (por documento)
export async function listByDocument(document) {
  const { rows } = await pool.query(
    `
    SELECT 
      a.*,
      p.full_name,
      p.document,
      p.email,
      p.phone
    FROM asistencias a
    JOIN persons p
      ON p.document = a.person_id   -- 🔴 importante: join por document, NO por id
    WHERE a.person_id = $1
    ORDER BY a.created_at DESC
    `,
    [document]
  );
  return rows;
}

// Guardar feedback (rating + observacion) en una asistencia ya creada
export async function saveFeedback({ sessionId, document, rating, observacion }) {
  const { rows } = await pool.query(
    `UPDATE asistencias
     SET rating = $3,
         observacion = $4,
         updated_at = now()
     WHERE session_id = $1 AND person_id = $2
     RETURNING *`,
    [sessionId, document, rating, observacion]
  );
  return rows[0] || null;
}
