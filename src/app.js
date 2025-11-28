// src/app.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import asistenciaRoutes from "./routes/asistencia.routes.js";
import sessionRoutes from "./routes/sessions.routes.js";
import personRoutes from "./routes/person.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Rutas de la API
app.use("/api/auth", authRoutes);
app.use("/api/asistencias", asistenciaRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/persons", personRoutes);
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// 404 para rutas que no existan (opcional)
app.use((req, res, next) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

// Manejo de errores genérico
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Error interno del servidor" });
});

export default app;
