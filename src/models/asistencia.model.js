import { pool } from "../db/pool.js";

export async function createAsistencia(userId, { fecha, curso, estado = "PRESENTE", observacion = null }) {
  const { rows } = await pool.query(
    `INSERT INTO asistencias (user_id, fecha, curso, estado, observacion)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING *`,
    [userId, fecha, curso, estado, observacion]
  );
  return rows[0];
}

export async function listAsistencias(userId, { desde, hasta, curso }) {
  const conds = ["user_id = $1"];
  const vals = [userId];
  let i = 2;

  if (desde) { conds.push(`fecha >= $${i++}`); vals.push(desde); }
  if (hasta) { conds.push(`fecha <= $${i++}`); vals.push(hasta); }
  if (curso) { conds.push(`curso ILIKE $${i++}`); vals.push(`%${curso}%`); }

  const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
  const { rows } = await pool.query(
    `SELECT * FROM asistencias ${where} ORDER BY fecha DESC, created_at DESC`,
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
