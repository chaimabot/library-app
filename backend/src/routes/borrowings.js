import { Router } from "express";
import { db } from "../db/index.js";

const router = Router();

const SELECT_WITH_JOINS = `
  SELECT
    borrowings.*,
    books.title AS book_title,
    books.author AS book_author,
    books.cover_url AS book_cover_url,
    members.name AS member_name,
    members.email AS member_email
  FROM borrowings
  JOIN books ON books.id = borrowings.book_id
  JOIN members ON members.id = borrowings.member_id
`;

// GET /api/borrowings?status=Active
router.get("/", (req, res) => {
  const { status } = req.query;
  let sql = SELECT_WITH_JOINS + " WHERE 1=1";
  const params = [];
  if (status) {
    sql += " AND borrowings.status = ?";
    params.push(status);
  }
  sql += " ORDER BY borrowings.created_at DESC";
  res.json(db.prepare(sql).all(...params));
});

// GET /api/borrowings/:id
router.get("/:id", (req, res) => {
  const row = db.prepare(SELECT_WITH_JOINS + " WHERE borrowings.id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Emprunt introuvable" });
  res.json(row);
});

// POST /api/borrowings  -> crée l'emprunt et passe le livre en "Borrowed"
router.post("/", (req, res) => {
  const { book_id, member_id, borrow_date, due_date } = req.body;
  if (!book_id || !member_id || !borrow_date || !due_date) {
    return res.status(400).json({ error: "book_id, member_id, borrow_date et due_date sont requis" });
  }

  const book = db.prepare("SELECT * FROM books WHERE id = ?").get(book_id);
  if (!book) return res.status(404).json({ error: "Livre introuvable" });
  if (book.status === "Borrowed") {
    return res.status(409).json({ error: "Ce livre est déjà emprunté" });
  }

  let id;
  try {
    db.exec("BEGIN");
    const result = db
      .prepare(
        `INSERT INTO borrowings (book_id, member_id, borrow_date, due_date, status)
         VALUES (?, ?, ?, ?, 'Active')`
      )
      .run(book_id, member_id, borrow_date, due_date);
    db.prepare("UPDATE books SET status = 'Borrowed' WHERE id = ?").run(book_id);
    db.exec("COMMIT");
    id = result.lastInsertRowid;
  } catch (err) {
    db.exec("ROLLBACK");
    return res.status(500).json({ error: "Erreur lors de la création de l'emprunt" });
  }

  res.status(201).json(db.prepare(SELECT_WITH_JOINS + " WHERE borrowings.id = ?").get(id));
});

// PUT /api/borrowings/:id/return -> marque le retour et repasse le livre en "Available"
router.put("/:id/return", (req, res) => {
  const borrowing = db.prepare("SELECT * FROM borrowings WHERE id = ?").get(req.params.id);
  if (!borrowing) return res.status(404).json({ error: "Emprunt introuvable" });

  try {
    db.exec("BEGIN");
    db.prepare(
      "UPDATE borrowings SET status = 'Returned', return_date = date('now') WHERE id = ?"
    ).run(req.params.id);
    db.prepare("UPDATE books SET status = 'Available' WHERE id = ?").run(borrowing.book_id);
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    return res.status(500).json({ error: "Erreur lors du retour de l'emprunt" });
  }

  res.json(db.prepare(SELECT_WITH_JOINS + " WHERE borrowings.id = ?").get(req.params.id));
});

// DELETE /api/borrowings/:id
router.delete("/:id", (req, res) => {
  const result = db.prepare("DELETE FROM borrowings WHERE id = ?").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: "Emprunt introuvable" });
  res.status(204).send();
});

export default router;
