import { Router } from "express";
import { db } from "../db/index.js";
import {
  hashPassword,
  verifyPassword,
  createSession,
  destroySession,
  requireAuth,
} from "../utils/auth.js";

const router = Router();

function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar_url: user.avatar_url,
  };
}

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe requis" });
  }

  const user = db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email.trim().toLowerCase());
  if (
    !user ||
    !verifyPassword(password, user.password_salt, user.password_hash)
  ) {
    return res.status(401).json({ error: "Email ou mot de passe incorrect" });
  }

  const token = createSession(user.id);
  res.json({ token, user: toPublicUser(user) });
});

// POST /api/auth/register
router.post("/register", (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: "name, email et password sont requis" });
  }
  if (password.length < 6) {
    return res
      .status(400)
      .json({ error: "Le mot de passe doit contenir au moins 6 caractères" });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = db
    .prepare("SELECT id FROM users WHERE email = ?")
    .get(normalizedEmail);
  if (existing) {
    return res
      .status(409)
      .json({ error: "Un compte existe déjà avec cet email" });
  }

  const { hash, salt } = hashPassword(password);
  const result = db
    .prepare(
      `INSERT INTO users (name, email, password_hash, password_salt, role) VALUES (?, ?, ?, ?, ?)`,
    )
    .run(name, normalizedEmail, hash, salt, "Librarian");

  const user = db
    .prepare("SELECT * FROM users WHERE id = ?")
    .get(result.lastInsertRowid);
  const token = createSession(user.id);
  res.status(201).json({ token, user: toPublicUser(user) });
});

// GET /api/auth/me
router.get("/me", requireAuth, (req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.userId);
  if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });
  res.json(toPublicUser(user));
});

// PUT /api/auth/profile
router.put("/profile", requireAuth, (req, res) => {
  const { name, email, role, avatar_url } = req.body || {};

  const existing = db
    .prepare("SELECT * FROM users WHERE id = ?")
    .get(req.userId);
  if (!existing)
    return res.status(404).json({ error: "Utilisateur introuvable" });

  const newName = name || existing.name;
  const newEmail = email?.trim().toLowerCase() || existing.email;
  const newRole = role || existing.role;
  const newAvatarUrl =
    avatar_url !== undefined ? avatar_url : existing.avatar_url;

  // Check email uniqueness if changed
  if (newEmail !== existing.email) {
    const conflict = db
      .prepare("SELECT id FROM users WHERE email = ? AND id != ?")
      .get(newEmail, req.userId);
    if (conflict)
      return res.status(409).json({ error: "Cet email est déjà utilisé" });
  }

  db.prepare(
    `UPDATE users SET name = ?, email = ?, role = ?, avatar_url = ? WHERE id = ?`,
  ).run(newName, newEmail, newRole, newAvatarUrl, req.userId);

  const updated = db
    .prepare("SELECT * FROM users WHERE id = ?")
    .get(req.userId);
  res.json(toPublicUser(updated));
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (token) destroySession(token);
  res.status(204).end();
});

export default router;
