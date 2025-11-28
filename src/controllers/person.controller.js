// src/controllers/person.controller.js
import {
  findByDocument,
  createPerson,
  findById,
  searchPersons,
} from "../models/person.model.js";

export const search = async (req, res) => {
  try {
    const { query = "", by = "doc" } = req.query;

    if (!query) {
      return res
        .status(400)
        .json({ ok: false, message: "query es obligatorio" });
    }

    const persons = await searchPersons({ query, by });
    res.json({ ok: true, data: persons });
  } catch (err) {
    console.error("Error search persons", err);
    res
      .status(500)
      .json({ ok: false, message: "Error buscando personas" });
  }
};

export const create = async (req, res) => {
  try {
    const { document, full_name, email, phone, person_type } = req.body;

    if (!document || !full_name) {
      return res.status(400).json({
        ok: false,
        message: "document y full_name son obligatorios",
      });
    }

    const existing = await findByDocument(document);
    if (existing) {
      return res.status(409).json({
        ok: false,
        message: "Ya existe una persona con ese documento",
      });
    }

    const person = await createPerson({
      document,
      full_name,
      email,
      phone,
      person_type,
    });

    res.status(201).json({ ok: true, data: person });
  } catch (err) {
    console.error("Error create person", err);
    res.status(500).json({ ok: false, message: "Error creando persona" });
  }
};

export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const person = await findById(id);

    if (!person) {
      return res
        .status(404)
        .json({ ok: false, message: "Persona no encontrada" });
    }

    res.json({ ok: true, data: person });
  } catch (err) {
    console.error("Error get person", err);
    res
      .status(500)
      .json({ ok: false, message: "Error obteniendo persona" });
  }
};

export const getByDocument = async (req, res) => {
  try {
    const { document } = req.params;
    const person = await findByDocument(document);
    if (!person) {
      return res.status(404).json({ message: "Persona no encontrada" });
    }
    res.json(person);
  } catch (err) {
    console.error("Error get person by document", err);
    res.status(500).json({ message: "Error obteniendo persona" });
  }
};