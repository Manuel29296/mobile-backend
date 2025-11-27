import { z } from "zod";

export const asistenciaCreateSchema = z.object({
  sessionId: z.string().uuid(),
  personId: z.string().min(1).max(120),
  estado: z.enum(["PRESENTE", "AUSENTE", "TARDANZA"]).optional(),
  observacion: z.string().optional()
});

export const asistenciaUpdateSchema = asistenciaCreateSchema.partial();
