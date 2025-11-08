import { asistenciaCreateSchema, asistenciaUpdateSchema } from "../validators/asistencia.validator.js";
import { createAsistencia, listAsistencias, getAsistencia, updateAsistencia, deleteAsistencia } from "../models/asistencia.model.js";

export const createAsistenciaCtrl = async (req, res) => {
  const parsed = asistenciaCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Datos inválidos" });
  const asistencia = await createAsistencia(req.user.id, parsed.data);
  res.status(201).json(asistencia);
};

export const listAsistenciasCtrl = async (req, res) => {
  const filtros = {
    desde: req.query.desde,  // YYYY-MM-DD
    hasta: req.query.hasta,  // YYYY-MM-DD
    curso: req.query.curso   // substring match
  };
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
