import {
  asistenciaCreateSchema,
  asistenciaUpdateSchema,
} from "../validators/asistencia.validator.js";

import {
  createAsistencia,
  listAsistencias,
  getAsistencia,
  updateAsistencia,
  deleteAsistencia,
  // nuevas funciones del modelo
  upsertCheckin,
  checkoutAsistencia,
  listBySession,
  listByDocument,
  saveFeedback,
} from "../models/asistencia.model.js";

import { findByDocument as findPersonByDocument } from "../models/person.model.js";

// ===================== TUS HANDLERS ORIGINALES (CRUD GENÉRICO) =====================

export const createAsistenciaCtrl = async (req, res) => {
  const parsed = asistenciaCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Datos inválidos" });

  // Lógica temporal para pruebas con usuario y cédula simulada
  const pruebaEmail = "prueba@gmail.com";
  const cedulaPrueba = "12345678";
  const nombrePrueba = "Juan Pérez";
  if (
    req.user?.username === pruebaEmail &&
    (req.body?.documento === cedulaPrueba || req.body?.nombre === nombrePrueba)
  ) {
    return res.status(201).json({
      id: 1,
      documento: cedulaPrueba,
      nombre: nombrePrueba,
      email: "juan.perez@correo.com",
      telefono: "3001234567",
      tipo: "student",
      estado: parsed.data.estado || "PRESENTE",
      observacion: parsed.data.observacion || null,
      fecha: parsed.data.fecha || new Date().toISOString().slice(0, 10),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  const asistencia = await createAsistencia(req.user.id, parsed.data);
  res.status(201).json(asistencia);
};

export const listAsistenciasCtrl = async (req, res) => {
  const filtros = {
    sessionId: req.query.sessionId,
    personId: req.query.personId,
  };

  // Lógica temporal para pruebas con usuario y cédula simulada
  const pruebaEmail = "prueba@gmail.com";
  const cedulaPrueba = "12345678";
  const nombrePrueba = "Juan Pérez";
  if (
    req.user?.username === pruebaEmail &&
    (req.query?.documento === cedulaPrueba ||
      (req.query?.nombre &&
        req.query.nombre.toLowerCase().includes(nombrePrueba.toLowerCase())))
  ) {
    return res.json([
      {
        id: 1,
        documento: cedulaPrueba,
        nombre: nombrePrueba,
        email: "juan.perez@correo.com",
        telefono: "3001234567",
        tipo: "student",
        estado: "PRESENTE",
        observacion: null,
        fecha: new Date().toISOString().slice(0, 10),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);
  }

  const items = await listAsistencias(req.user.id, filtros);
  res.json(items);
};

export const getAsistenciaCtrl = async (req, res) => {
  const item = await getAsistencia(req.user.id, req.params.id);
  if (!item) return res.status(404).json({ message: "No encontrada" });
  res.json(item);
};

export const updateAsistenciaCtrl = async (req, res) => {
  const parsed = asistenciaUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Datos inválidos" });
  const item = await updateAsistencia(req.user.id, req.params.id, parsed.data);
  if (!item) return res.status(404).json({ message: "No encontrada" });
  res.json(item);
};

export const deleteAsistenciaCtrl = async (req, res) => {
  const ok = await deleteAsistencia(req.user.id, req.params.id);
  if (!ok) return res.status(404).json({ message: "No encontrada" });
  res.json({ message: "Eliminada" });
};

// ===================== NUEVOS HANDLERS PARA APP MÓVIL (ESCÁNER) =====================

// POST /api/asistencias/checkin
export const checkin = async (req, res) => {
  try {
    const { sessionId, document } = req.body;

    if (!sessionId || !document) {
      return res.status(400).json({
        ok: false,
        message: "sessionId y document son obligatorios",
      });
    }

    // 1. Verificar que la persona exista en persons
    const person = await findPersonByDocument(document);
    if (!person) {
      return res.status(404).json({
        ok: false,
        code: "PERSON_NOT_FOUND",
        message: "No existe una persona con ese documento",
      });
    }

    // 2. Crear / actualizar asistencia (entrada)
    const asistencia = await upsertCheckin({ sessionId, document });

    return res.status(201).json({
      ok: true,
      person,
      asistencia,
    });
  } catch (err) {
    console.error("Error checkin", err);
    res
      .status(500)
      .json({ ok: false, message: "Error registrando asistencia" });
  }
};

// POST /api/asistencias/checkout
export const checkout = async (req, res) => {
  try {
    const { sessionId, document } = req.body;

    if (!sessionId || !document) {
      return res.status(400).json({
        ok: false,
        message: "sessionId y document son obligatorios",
      });
    }

    const person = await findPersonByDocument(document);
    if (!person) {
      return res.status(404).json({
        ok: false,
        message: "Persona no encontrada",
      });
    }

    const asistencia = await checkoutAsistencia({ sessionId, document });
    if (!asistencia) {
      return res.status(404).json({
        ok: false,
        message: "No había asistencia registrada para esa sesión y documento",
      });
    }

    res.json({ ok: true, person, asistencia });
  } catch (err) {
    console.error("Error checkout", err);
    res
      .status(500)
      .json({ ok: false, message: "Error registrando salida" });
  }
};

// GET /api/asistencias/sesion/:sessionId
export const getBySession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const data = await listBySession(sessionId);
    res.json({ ok: true, data });
  } catch (err) {
    console.error("Error getBySession", err);
    res
      .status(500)
      .json({ ok: false, message: "Error listando asistencias" });
  }
};

// GET /api/asistencias/person/:document
export const getByPerson = async (req, res) => {
  try {
    const { document } = req.params;
    const data = await listByDocument(document);
    res.json({ ok: true, data });
  } catch (err) {
    console.error("Error getByPerson", err);
    res
      .status(500)
      .json({ ok: false, message: "Error listando historial" });
  }
};

// POST /api/asistencias/feedback
export const registerFeedback = async (req, res) => {
  try {
    const { sessionId, document, rating, observacion } = req.body;

    if (!sessionId || !document || rating == null) {
      return res.status(400).json({
        ok: false,
        message: "sessionId, document y rating son obligatorios",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        ok: false,
        message: "rating debe estar entre 1 y 5",
      });
    }

    const asistencia = await saveFeedback({
      sessionId,
      document,
      rating,
      observacion,
    });

    if (!asistencia) {
      return res.status(404).json({
        ok: false,
        message: "No se encontró asistencia para registrar feedback",
      });
    }

    res.json({ ok: true, asistencia });
  } catch (err) {
    console.error("Error registerFeedback", err);
    res
      .status(500)
      .json({ ok: false, message: "Error guardando feedback" });
  }
};
