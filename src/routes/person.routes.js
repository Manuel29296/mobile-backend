// src/routes/person.routes.js
import express from "express";
import * as personController from "../controllers/person.controller.js";
// De momento sin middleware de auth para evitar errores
// Luego podemos copiar el mismo middleware que uses en sessions/asistencias

const router = express.Router();

// 👉 mejor así
router.get("/", personController.search);
router.post("/", personController.create);

// primero la ruta más específica
router.get("/document/:document", personController.getByDocument);

// luego la genérica por id
router.get("/:id", personController.getById);

export default router;
