import { Router } from "express";
import { db } from "../db/index.js";

const router = Router();

// GET /api/books?q=search&status=Available
router.get("/", (req, res) => {
  const { q, status } = req.query;
  let sql = "SELECT * FROM books WHERE 1=1";
  const params = [];

  if (q) {
    sql += " AND (title LIKE ? OR author LIKE ? OR isbn LIKE ?)";
    const term = `%${q}%`;
    params.push(term, term, term);
  }
  if (status) {
    sql += " AND status = ?";
    params.push(status);
  }
  sql += " ORDER BY created_at DESC";

  const books = db.prepare(sql).all(...params);
  res.json(books);
});

// GET /api/books/stats
router.get("/stats", (req, res) => {
  const total = db.prepare("SELECT COUNT(*) AS n FROM books").get().n;
  const borrowed = db.prepare("SELECT COUNT(*) AS n FROM books WHERE status = 'Borrowed'").get().n;
  const topGenreRow = db
    .prepare(
      "SELECT category, COUNT(*) AS n FROM books WHERE category IS NOT NULL GROUP BY category ORDER BY n DESC LIMIT 1"
    )
    .get();
  const members = db.prepare("SELECT COUNT(*) AS n FROM members").get().n;

  res.json({
    totalVolumes: total,
    activeLoans: borrowed,
    topGenre: topGenreRow ? topGenreRow.category : "—",
    members,
  });
});

// GET /api/books/:id
router.get("/:id", (req, res) => {
  const book = db.prepare("SELECT * FROM books WHERE id = ?").get(req.params.id);
  if (!book) return res.status(404).json({ error: "Livre introuvable" });
  res.json(book);
});

// POST /api/books
router.post("/", (req, res) => {
  const { title, author, isbn, category, description, cover_url, status } = req.body;
  if (!title || !author) {
    return res.status(400).json({ error: "title et author sont requis" });
  }
  const result = db
    .prepare(
      `INSERT INTO books (title, author, isbn, category, description, cover_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(title, author, isbn || null, category || null, description || null, cover_url || null, status || "Available");

  const book = db.prepare("SELECT * FROM books WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(book);
});

// PUT /api/books/:id
router.put("/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM books WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Livre introuvable" });

  const { title, author, isbn, category, description, cover_url, status } = req.body;
  db.prepare(
    `UPDATE books SET title = ?, author = ?, isbn = ?, category = ?, description = ?, cover_url = ?, status = ?
     WHERE id = ?`
  ).run(
    title ?? existing.title,
    author ?? existing.author,
    isbn ?? existing.isbn,
    category ?? existing.category,
    description ?? existing.description,
    cover_url ?? existing.cover_url,
    status ?? existing.status,
    req.params.id
  );

  const updated = db.prepare("SELECT * FROM books WHERE id = ?").get(req.params.id);
  res.json(updated);
});

// DELETE /api/books/:id
router.delete("/:id", (req, res) => {
  const result = db.prepare("DELETE FROM books WHERE id = ?").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: "Livre introuvable" });
  res.status(204).send();
});

export default router;
