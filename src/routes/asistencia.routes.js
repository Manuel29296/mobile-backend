import { Router } from "express";
import { auth } from "../middlewares/auth.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import {
  createAsistenciaCtrl,
  listAsistenciasCtrl,
  getAsistenciaCtrl,
  updateAsistenciaCtrl,
  deleteAsistenciaCtrl
} from "../controllers/asistencia.controller.js";

const router = Router();
router.use(auth);

router.get("/",     asyncHandler(listAsistenciasCtrl));
router.post("/",    asyncHandler(createAsistenciaCtrl));
router.get("/:id",  asyncHandler(getAsistenciaCtrl));
router.put("/:id",  asyncHandler(updateAsistenciaCtrl));
router.delete("/:id", asyncHandler(deleteAsistenciaCtrl));

export default router;
