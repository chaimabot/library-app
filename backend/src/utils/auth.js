import crypto from "node:crypto";

// --- Password hashing (scrypt, no external deps) ---
export function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { hash, salt };
}

export function verifyPassword(password, salt, expectedHash) {
  const { hash } = hashPassword(password, salt);
  const a = Buffer.from(hash, "hex");
  const b = Buffer.from(expectedHash, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// --- Simple in-memory token sessions ---
// Tokens are opaque random strings mapped to a user id.
// This is sufficient for a single-instance demo app; for production
// this should be replaced with signed JWTs or a persisted session store.
const sessions = new Map();
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function createSession(userId) {
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, { userId, expiresAt: Date.now() + SESSION_TTL_MS });
  return token;
}

export function getUserIdForToken(token) {
  const session = sessions.get(token);
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    sessions.delete(token);
    return null;
  }
  return session.userId;
}

export function destroySession(token) {
  sessions.delete(token);
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  const userId = token ? getUserIdForToken(token) : null;
  if (!userId) {
    return res.status(401).json({ error: "Non authentifié" });
  }
  req.userId = userId;
  next();
}
