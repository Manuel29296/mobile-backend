import { z } from "zod";

export const asistenciaCreateSchema = z.object({
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato YYYY-MM-DD"),
  curso: z.string().min(1).max(120),
  estado: z.enum(["PRESENTE", "AUSENTE", "TARDANZA"]).optional(),
  observacion: z.string().optional()
});

export const asistenciaUpdateSchema = asistenciaCreateSchema.partial();

