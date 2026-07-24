import { db } from "./index.js";
import { hashPassword } from "../utils/auth.js";

const userCount = db.prepare("SELECT COUNT(*) AS n FROM users").get().n;

if (userCount === 0) {
  const { hash, salt } = hashPassword("libris123");
  db.prepare(
    `INSERT INTO users (name, email, password_hash, password_salt, role, avatar_url) VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(
    "Alex Thompson",
    "alex.thompson@libris.io",
    hash,
    salt,
    "Senior Researcher",
    "",
  );
  console.log(
    "Seeded default user: alex.thompson@libris.io / libris123 (change this password in production).",
  );
}

const bookCount = db.prepare("SELECT COUNT(*) AS n FROM books").get().n;

if (bookCount === 0) {
  const insertBook = db.prepare(`
    INSERT INTO books (title, author, isbn, category, description, cover_url, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const books = [
    {
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      isbn: "978-0743273565",
      category: "Classic Fiction",
      description:
        "A portrait of the Jazz Age in all of its decadence and excess, following Nick Carraway's fascination with the mysterious millionaire Jay Gatsby.",
      cover_url: "",
      status: "Available",
    },
    {
      title: "1984",
      author: "George Orwell",
      isbn: "978-0451524935",
      category: "Dystopian",
      description:
        "A dystopian social science fiction novel exploring the dangers of totalitarianism and mass surveillance.",
      cover_url: "",
      status: "Borrowed",
    },
    {
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      isbn: "978-0060935467",
      category: "Literature",
      description:
        "A story of racial injustice and childhood innocence in the American South, told through the eyes of young Scout Finch.",
      cover_url: "",
      status: "Available",
    },
    {
      title: "The Hobbit",
      author: "J.R.R. Tolkien",
      isbn: "978-0547928227",
      category: "Fantasy",
      description:
        "Bilbo Baggins is swept into an epic quest to reclaim the Lonely Mountain from the dragon Smaug.",
      cover_url: "",
      status: "Available",
    },
    {
      title: "Dune",
      author: "Frank Herbert",
      isbn: "978-0441172719",
      category: "Sci-Fi",
      description:
        "Set on the desert planet Arrakis, a story of politics, religion, and ecology centered on young Paul Atreides.",
      cover_url: "",
      status: "Borrowed",
    },
  ];

  db.exec("BEGIN");
  for (const b of books) {
    insertBook.run(
      b.title,
      b.author,
      b.isbn,
      b.category,
      b.description,
      b.cover_url,
      b.status,
    );
  }
  db.exec("COMMIT");
  console.log(`Seeded ${books.length} books.`);
}

const memberCount = db.prepare("SELECT COUNT(*) AS n FROM members").get().n;

if (memberCount === 0) {
  const insertMember = db.prepare(`
    INSERT INTO members (name, email, phone, status)
    VALUES (?, ?, ?, ?)
  `);

  const members = [
    {
      name: "Amina Sassi",
      email: "amina.sassi@example.com",
      phone: "+216 20 123 456",
      status: "Active",
    },
    {
      name: "Yassine Trabelsi",
      email: "yassine.t@example.com",
      phone: "+216 22 555 789",
      status: "Active",
    },
    {
      name: "Sarra Mansour",
      email: "sarra.mansour@example.com",
      phone: "+216 25 987 321",
      status: "Inactive",
    },
  ];

  db.exec("BEGIN");
  for (const m of members) {
    insertMember.run(m.name, m.email, m.phone, m.status);
  }
  db.exec("COMMIT");
  console.log(`Seeded ${members.length} members.`);
}

const borrowingCount = db
  .prepare("SELECT COUNT(*) AS n FROM borrowings")
  .get().n;

if (borrowingCount === 0) {
  const insertBorrowing = db.prepare(`
    INSERT INTO borrowings (book_id, member_id, borrow_date, due_date, status)
    VALUES (?, ?, ?, ?, ?)
  `);

  const today = new Date();
  const due = new Date();
  due.setDate(today.getDate() + 14);

  const borrowings = [
    {
      book_id: 2,
      member_id: 1,
      borrow_date: today.toISOString().split("T")[0],
      due_date: due.toISOString().split("T")[0],
      status: "Active",
    },
    {
      book_id: 5,
      member_id: 2,
      borrow_date: today.toISOString().split("T")[0],
      due_date: due.toISOString().split("T")[0],
      status: "Active",
    },
  ];

  db.exec("BEGIN");
  for (const bw of borrowings) {
    insertBorrowing.run(
      bw.book_id,
      bw.member_id,
      bw.borrow_date,
      bw.due_date,
      bw.status,
    );
  }
  db.exec("COMMIT");
  console.log(`Seeded ${borrowings.length} borrowings.`);
}

console.log("Seed complete.");
