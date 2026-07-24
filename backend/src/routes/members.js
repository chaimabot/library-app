import { Router } from "express";
import { db } from "../db/index.js";

const router = Router();

// GET /api/members?q=search
router.get("/", (req, res) => {
  const { q } = req.query;
  let sql = "SELECT * FROM members WHERE 1=1";
  const params = [];
  if (q) {
    sql += " AND (name LIKE ? OR email LIKE ?)";
    params.push(`%${q}%`, `%${q}%`);
  }
  sql += " ORDER BY created_at DESC";
  res.json(db.prepare(sql).all(...params));
});

// GET /api/members/:id
router.get("/:id", (req, res) => {
  const member = db.prepare("SELECT * FROM members WHERE id = ?").get(req.params.id);
  if (!member) return res.status(404).json({ error: "Membre introuvable" });
  res.json(member);
});

// POST /api/members
router.post("/", (req, res) => {
  const { name, email, phone, avatar_url, status } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "name et email sont requis" });
  }
  try {
    const result = db
      .prepare(
        `INSERT INTO members (name, email, phone, avatar_url, status) VALUES (?, ?, ?, ?, ?)`
      )
      .run(name, email, phone || null, avatar_url || null, status || "Active");
    const member = db.prepare("SELECT * FROM members WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json(member);
  } catch (err) {
    if (err.message.includes("UNIQUE")) {
      return res.status(409).json({ error: "Cet email est déjà utilisé" });
    }
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// PUT /api/members/:id
router.put("/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM members WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Membre introuvable" });

  const { name, email, phone, avatar_url, status } = req.body;
  db.prepare(
    `UPDATE members SET name = ?, email = ?, phone = ?, avatar_url = ?, status = ? WHERE id = ?`
  ).run(
    name ?? existing.name,
    email ?? existing.email,
    phone ?? existing.phone,
    avatar_url ?? existing.avatar_url,
    status ?? existing.status,
    req.params.id
  );

  res.json(db.prepare("SELECT * FROM members WHERE id = ?").get(req.params.id));
});

// DELETE /api/members/:id
router.delete("/:id", (req, res) => {
  const result = db.prepare("DELETE FROM members WHERE id = ?").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: "Membre introuvable" });
  res.status(204).send();
});

export default router;
