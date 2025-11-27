// session.controller.js

import {
  createSessionInDB,
  fetchSessionsFromDB,
  updateSessionInDB,
  deleteSessionFromDB,
  getSessionByUserId,
  fetchSessionByIdFromDB,
} from "../models/sessions.model.js";

// Crear una nueva sesión
export const createSession = async (req, res) => {
  try {
    const {
      title,
      description = null,
      starts_at,
      ends_at,
      youtube_video_id = null, // por ahora lo ignoramos en el modelo
    } = req.body;

    if (!title || !starts_at || !ends_at) {
      return res
        .status(400)
        .json({ message: "title, starts_at y ends_at son obligatorios" });
    }

    const data = {
      title,
      description,
      starts_at,
      ends_at,
      youtube_video_id,
    };

    // 👇 CLAVE: pasamos primero el userId, luego el payload
    const userId = req.user?.id; // asegúrate de tener auth middleware
    const newSession = await createSessionInDB(userId, data);
    return res.status(201).json(newSession);
  } catch (error) {
    console.error("Error al crear la sesión:", error);
    return res.status(500).json({ message: "Error al crear la sesión" });
  }
};

// Obtener todas las sesiones del usuario autenticado
export const getSessions = async (req, res) => {
  try {
    const userId = req.user?.id;
    const sessions = await fetchSessionsFromDB(userId);
    return res.status(200).json(sessions);
  } catch (error) {
    console.error("Error al obtener las sesiones:", error);
    return res.status(500).json({ message: "Error al obtener las sesiones" });
  }
};

// Obtener una sesión por id (detalle: /api/sessions/:id)
export const getSessionById = async (req, res) => {
  const { id } = req.params;

  try {
    const userId = req.user?.id;
    const session = await fetchSessionByIdFromDB(userId, id);

    if (!session) {
      return res.status(404).json({ message: "Sesión no encontrada" });
    }

    return res.status(200).json(session);
  } catch (error) {
    console.error("Error al obtener la sesión:", error);
    return res.status(500).json({ message: "Error al obtener la sesión" });
  }
};

// (Opcional) Obtener sesiones por usuario específico (no autenticado)
export const getSessionByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const sessions = await getSessionByUserId(userId);

    if (!sessions || sessions.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron sesiones para este usuario" });
    }

    return res.status(200).json(sessions);
  } catch (error) {
    console.error("Error al obtener sesiones del usuario:", error);
    return res
      .status(500)
      .json({ message: "Error al obtener sesiones del usuario" });
  }
};

// Actualizar una sesión
export const updateSession = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description = null,
    starts_at,
    ends_at,
    youtube_video_id = null,
  } = req.body;

  if (!title || !starts_at || !ends_at) {
    return res
      .status(400)
      .json({ message: "title, starts_at y ends_at son obligatorios" });
  }

  try {
    const userId = req.user?.id;

    const updatedSession = await updateSessionInDB(userId, id, {
      title,
      description,
      starts_at,
      ends_at,
      youtube_video_id,
    });

    if (!updatedSession) {
      return res.status(404).json({ message: "Sesión no encontrada" });
    }

    return res.status(200).json(updatedSession);
  } catch (error) {
    console.error("Error al actualizar la sesión:", error);
    return res.status(500).json({ message: "Error al actualizar la sesión" });
  }
};

// Eliminar una sesión
export const deleteSession = async (req, res) => {
  const { id } = req.params;

  try {
    const userId = req.user?.id;
    const deletedSession = await deleteSessionFromDB(userId, id);

    if (!deletedSession) {
      return res.status(404).json({ message: "Sesión no encontrada" });
    }

    return res.status(200).json({ message: "Sesión eliminada" });
  } catch (error) {
    console.error("Error al eliminar la sesión:", error);
    return res.status(500).json({ message: "Error al eliminar la sesión" });
  }
};
