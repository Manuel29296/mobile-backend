// src/routes/asistencia.routes.js
import { Router } from "express";
import { auth } from "../middlewares/auth.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import {
  createAsistenciaCtrl,
  listAsistenciasCtrl,
  getAsistenciaCtrl,
  updateAsistenciaCtrl,
  deleteAsistenciaCtrl,
  // nuevas
  checkin,
  checkout,
  getBySession,
  getByPerson,
  registerFeedback,
} from "../controllers/asistencia.controller.js";

const router = Router();

// Todas las rutas de asistencias requieren auth
router.use(auth);

// === Rutas NUEVAS para la app móvil (escáner, listados y feedback) ===

// Marca ENTRADA con escáner (o búsqueda): sessionId + document
router.post("/checkin", asyncHandler(checkin));

// Marca SALIDA
router.post("/checkout", asyncHandler(checkout));

// Lista asistentes de una sesión
router.get("/sesion/:sessionId", asyncHandler(getBySession));

// Historial de asistencias de una persona (por documento)
router.get("/person/:document", asyncHandler(getByPerson));

// Guardar feedback (rating + observación) en una asistencia
router.post("/feedback", asyncHandler(registerFeedback));

// === Rutas CRUD ORIGINALES (las que ya tenías) ===
router.get("/",     asyncHandler(listAsistenciasCtrl));
router.post("/",    asyncHandler(createAsistenciaCtrl));
router.get("/:id",  asyncHandler(getAsistenciaCtrl));
router.put("/:id",  asyncHandler(updateAsistenciaCtrl));
router.delete("/:id", asyncHandler(deleteAsistenciaCtrl));

export default router;
