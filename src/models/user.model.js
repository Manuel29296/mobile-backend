import { pool } from "../db/pool.js";

export const findByUsername = async (username) => {
  const { rows } = await pool.query(
    "SELECT * FROM users WHERE username = $1",
    [username.toLowerCase()]
  );
  return rows[0] || null;
};

export const createUser = async ({ username, password_hash, fullname }) => {
  const { rows } = await pool.query(
    `INSERT INTO users (username, password_hash, fullname)
     VALUES ($1,$2,$3) RETURNING id, username, fullname, created_at`,
    [username.toLowerCase(), password_hash, fullname]
  );
  return rows[0];
};
