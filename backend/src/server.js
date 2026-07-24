import express from "express";
import cors from "cors";
import booksRouter from "./routes/books.js";
import membersRouter from "./routes/members.js";
import borrowingsRouter from "./routes/borrowings.js";
import authRouter from "./routes/auth.js";
import "./db/seed.js"; // seed automatique au démarrage si la base est vide

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/books", booksRouter);
app.use("/api/members", membersRouter);
app.use("/api/borrowings", borrowingsRouter);

app.use((req, res) => res.status(404).json({ error: "Route non trouvée" }));

app.listen(PORT, () => {
  console.log(`Library API listening on http://localhost:${PORT}`);
});
