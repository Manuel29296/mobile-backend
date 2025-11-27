// src/routes/sessions.routes.js
import express from "express";
import { auth } from "../middlewares/auth.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import {
  createSession,
  getSessions,
  getSessionById,
  getSessionByUser,
  updateSession,
  deleteSession,
} from "../controllers/session.controller.js";

const router = express.Router();

// Todas las rutas de sesión requieren estar autenticado
router.use(auth);

// Crear una nueva sesión
router.post("/", asyncHandler(createSession));

// Obtener todas las sesiones (lista para la pantalla principal)
router.get("/", asyncHandler(getSessions));

// (Opcional) Obtener sesiones de un usuario creador específico
router.get("/user/:userId", asyncHandler(getSessionByUser));

// Obtener una sesión específica por id (detalle)
router.get("/:id", asyncHandler(getSessionById));

// Actualizar una sesión
router.put("/:id", asyncHandler(updateSession));

// Eliminar una sesión
router.delete("/:id", asyncHandler(deleteSession));

export default router;
