import { pool } from "../db/pool.js";

// Crear una nueva sesión
// sessions.model.js
export const createSessionInDB = async (userId, refreshToken, sessionDate, sessionName) => {
  const query = `
    INSERT INTO sessions (user_id, refresh_token, session_name, session_date, created_at) 
    VALUES ($1, $2, $3, $4, NOW()) 
    RETURNING *;
  `;
  const values = [userId, refreshToken, sessionName, sessionDate];  // Ahora incluimos sessionName

  try {
    const result = await pool.query(query, values);
    return result.rows[0]; // Devuelve la sesión creada
  } catch (error) {
    console.error("Error al crear la sesión:", error);
    throw new Error("Error al crear la sesión");
  }
};



// Obtener todas las sesiones
export const fetchSessionsFromDB = async () => {
  const query = "SELECT * FROM sessions";

  try {
    const result = await pool.query(query);
    return result.rows; // Devuelve todas las sesiones
  } catch (error) {
    console.error("Error al obtener las sesiones:", error);
    throw new Error("Error al obtener las sesiones");
  }
};

// Actualizar una sesión
export const updateSessionInDB = async (id, sessionName, sessionDate) => {
  const query = `
    UPDATE sessions
    SET session_name = $1, session_date = $2
    WHERE id = $3
    RETURNING *;
  `;
  const values = [sessionName, sessionDate, id];

  try {
    const result = await pool.query(query, values);
    return result.rows[0]; // Devuelve la sesión actualizada
  } catch (error) {
    console.error("Error al actualizar la sesión:", error);
    throw new Error("Error al actualizar la sesión");
  }
};

// Eliminar una sesión
export const deleteSessionFromDB = async (id) => {
  const query = "DELETE FROM sessions WHERE id = $1 RETURNING *";
  const values = [id];

  try {
    const result = await pool.query(query, values);
    return result.rows[0]; // Devuelve la sesión eliminada
  } catch (error) {
    console.error("Error al eliminar la sesión:", error);
    throw new Error("Error al eliminar la sesión");
  }
};
