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
