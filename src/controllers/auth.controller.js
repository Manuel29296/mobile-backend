import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";
import { findByUsername, createUser } from "../models/user.model.js";

const sign = (user) =>
  jwt.sign(
    { sub: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
  );

export const register = async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Datos inválidos" });

  const { username, password, fullname } = parsed.data;
  const existing = await findByUsername(username);
  if (existing) return res.status(400).json({ message: "Usuario ya existe" });

  const password_hash = await bcrypt.hash(password, 10);
  const user = await createUser({ username, password_hash, fullname });

  return res.status(201).json({ message: "Usuario creado", user });
};

export const login = async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Datos inválidos" });

  const { username, password } = parsed.data;
  const user = await findByUsername(username);
  if (!user) return res.status(400).json({ message: "Usuario/contraseña inválidos" });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(400).json({ message: "Usuario/contraseña inválidos" });

  const token = sign(user);
  return res.json({ token, user: { id: user.id, username: user.username, fullname: user.fullname } });
};

export const me = async (req, res) => {
  return res.json({ user: req.user });
};

export const logout = async (req, res) => {
  // Con JWT stateless, basta con borrar en el cliente. (Opcional: lista de revocados)
  return res.json({ message: "Sesión cerrada" });
};
