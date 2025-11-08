import { Router } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { register, login, me, logout } from "../controllers/auth.controller.js";
import { auth } from "../middlewares/auth.js";

const router = Router();
router.post("/register", asyncHandler(register));
router.post("/login",    asyncHandler(login));
router.get("/me",        auth, asyncHandler(me));
router.post("/logout",   auth, asyncHandler(logout));
export default router;
