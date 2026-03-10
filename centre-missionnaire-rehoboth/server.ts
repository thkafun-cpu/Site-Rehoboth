import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const db = new Database("church.db");
const JWT_SECRET = process.env.JWT_SECRET || "rehoboth-secret-key-2024";

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('Visiteur', 'Gestionnaire', 'Technicien'))
  );

  CREATE TABLE IF NOT EXISTS finances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT NOT NULL CHECK(currency IN ('CDF', 'USD')),
    date TEXT NOT NULL,
    user_id INTEGER,
    status TEXT NOT NULL DEFAULT 'En attente',
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Seed initial technician account if not exists
const seedTech = db.prepare("SELECT * FROM users WHERE role = 'Technicien'").get();
if (!seedTech) {
  const hashedPassword = bcrypt.hashSync("admin123", 10);
  db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)").run(
    "Admin Technicien",
    "tech@rehoboth.cd",
    hashedPassword,
    "Technicien"
  );
  
  // Also seed a manager for testing US01
  const managerPassword = bcrypt.hashSync("manager123", 10);
  db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)").run(
    "Gestionnaire Finance",
    "finance@rehoboth.cd",
    managerPassword,
    "Gestionnaire"
  );
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Auth Middleware
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Non autorisé" });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: "Session expirée" });
    }
  };

  // --- API ROUTES ---

  // US02: Authentication
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: "24h" });
    res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
  });

  // US03: User Registration
  app.post("/api/auth/register", (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Tous les champs sont obligatoires" });
    }

    try {
      const hashedPassword = bcrypt.hashSync(password, 10);
      const result = db.prepare(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)"
      ).run(name, email, hashedPassword, "Visiteur");
      
      const token = jwt.sign({ id: result.lastInsertRowid, role: "Visiteur", name }, JWT_SECRET, { expiresIn: "24h" });
      res.json({ token, user: { id: result.lastInsertRowid, name, role: "Visiteur", email } });
    } catch (err: any) {
      if (err.message.includes("UNIQUE constraint failed")) {
        return res.status(400).json({ error: "Cet email est déjà utilisé" });
      }
      res.status(500).json({ error: "Erreur lors de l'inscription" });
    }
  });

  // US01: Record Finances
  app.post("/api/finances", authenticate, (req: any, res) => {
    if (req.user.role !== "Gestionnaire" && req.user.role !== "Technicien") {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const { type, amount, currency, date } = req.body;
    try {
      const result = db.prepare(
        "INSERT INTO finances (type, amount, currency, date, user_id, status) VALUES (?, ?, ?, ?, ?, ?)"
      ).run(type, amount, currency, date || new Date().toISOString(), req.user.id, "Validé");
      
      res.json({ id: result.lastInsertRowid, message: "Transaction enregistrée avec succès" });
    } catch (err) {
      res.status(500).json({ error: "Erreur lors de l'enregistrement" });
    }
  });

  app.get("/api/finances", authenticate, (req: any, res) => {
    const finances = db.prepare("SELECT * FROM finances ORDER BY date DESC").all();
    res.json(finances);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
