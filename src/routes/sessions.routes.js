import express from "express";
import { createSession, getSessions, updateSession, deleteSession } from "../controllers/session.controller.js"; // Correcto


const router = express.Router();

// Ruta para crear una nueva sesión
router.post("/", createSession);

// Ruta para obtener todas las sesiones
router.get("/", getSessions);

// Ruta para actualizar una sesión
router.put("/:id", updateSession);

// Ruta para eliminar una sesión
router.delete("/:id", deleteSession);

export default router;
