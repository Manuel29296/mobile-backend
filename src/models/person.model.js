// src/models/person.model.js
import { pool } from "../db/pool.js";

export const findByDocument = async (document) => {
  const { rows } = await pool.query(
    "SELECT * FROM persons WHERE document = $1",
    [document]
  );
  return rows[0] || null;
};

export const createPerson = async ({ document, full_name, email, phone, person_type }) => {
  const { rows } = await pool.query(
    `INSERT INTO persons (document, full_name, email, phone, person_type)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [document, full_name, email, phone, person_type || "EXTERNO"]
  );
  return rows[0];
};

export const findById = async (id) => {
  const { rows } = await pool.query(
    "SELECT * FROM persons WHERE id = $1",
    [id]
  );
  return rows[0] || null;
};

export const searchPersons = async ({ query, by }) => {
  let column;
  switch (by) {
    case "name":
      column = "full_name";
      break;
    case "email":
      column = "email";
      break;
    case "phone":
      column = "phone";
      break;
    case "doc":
    default:
      column = "document";
  }

  const { rows } = await pool.query(
    `SELECT * FROM persons
     WHERE ${column} ILIKE $1
     ORDER BY full_name`,
    [`%${query}%`]
  );

  return rows;
};
