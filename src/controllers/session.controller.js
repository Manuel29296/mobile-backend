// session.controller.js

import { createSessionInDB, fetchSessionsFromDB, updateSessionInDB, deleteSessionFromDB } from "../models/sessions.model.js";

// Crear una nueva sesión

export const createSession = async (req, res) => {
  const { userId, refreshToken, sessionDate, sessionName } = req.body;

  // Validación para asegurarse de que todos los campos son proporcionados
  if (!userId || !refreshToken || !sessionDate || !sessionName) {
    return res.status(400).json({ message: "El userId, refreshToken, sessionDate y sessionName son obligatorios" });
  }

  try {
    const newSession = await createSessionInDB(userId, refreshToken, sessionDate, sessionName);  // Pasamos sessionName aquí
    res.status(201).json({ message: "Sesión creada", session: newSession });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear la sesión" });
  }
};


// Obtener todas las sesiones
export const getSessions = async (req, res) => {
  try {
    const sessions = await fetchSessionsFromDB();
    res.status(200).json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener las sesiones" });
  }
};

// Obtener sesiones por user_id
export const getSessionByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const sessions = await getSessionByUserId(userId);
    if (sessions.length === 0) {
      return res.status(404).json({ message: "No se encontraron sesiones para este usuario" });
    }
    res.status(200).json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener la sesión del usuario" });
  }
};

// Actualizar una sesión
export const updateSession = async (req, res) => {
  const { id } = req.params;
  const { sessionName, sessionDate } = req.body;

  if (!sessionName || !sessionDate) {
    return res.status(400).json({ message: "Todos los campos son obligatorios" });
  }

  try {
    const updatedSession = await updateSessionInDB(id, sessionName, sessionDate);
    if (!updatedSession) {
      return res.status(404).json({ message: "Sesión no encontrada" });
    }
    res.status(200).json({ message: "Sesión actualizada", session: updatedSession });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar la sesión" });
  }
};

// Eliminar una sesión
export const deleteSession = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedSession = await deleteSessionFromDB(id);
    if (!deletedSession) {
      return res.status(404).json({ message: "Sesión no encontrada" });
    }
    res.status(200).json({ message: "Sesión eliminada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar la sesión" });
  }
};
