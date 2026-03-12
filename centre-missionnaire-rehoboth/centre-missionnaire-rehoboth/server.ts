import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("church.db");
const JWT_SECRET = process.env.JWT_SECRET || "rehoboth-secret-key-2024";

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('Visiteur', 'Gestionnaire', 'Technicien', 'Pasteur'))
  );

  CREATE TABLE IF NOT EXISTS meditations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    date TEXT NOT NULL,
    author_id INTEGER,
    FOREIGN KEY (author_id) REFERENCES users(id)
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

  CREATE TABLE IF NOT EXISTS ressources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    state TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    location TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS programmes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    date_start TEXT NOT NULL,
    date_end TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('Hebdomadaire', 'Spécial', 'Séminaire'))
  );

  CREATE TABLE IF NOT EXISTS user_program_interest (
    user_id INTEGER,
    programme_id INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, programme_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (programme_id) REFERENCES programmes(id)
  );
`);

// Seed initial accounts if not exists
const seedAccount = (name: string, email: string, password: string, role: string) => {
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user) {
    const hashedPassword = bcrypt.hashSync(password, 10);
    db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)").run(
      name,
      email,
      hashedPassword,
      role
    );
  }
};

seedAccount("Admin Technicien", "tech@rehoboth.cd", "admin123", "Technicien");
seedAccount("Gestionnaire Finance", "finance@rehoboth.cd", "manager123", "Gestionnaire");
seedAccount("Pasteur Principal", "pasteur@rehoboth.cd", "pasteur123", "Pasteur");

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

  const isManagerOrTech = (req: any, res: any, next: any) => {
    if (req.user.role !== "Gestionnaire" && req.user.role !== "Technicien") {
      return res.status(403).json({ error: "Accès refusé" });
    }
    next();
  };

  const isPasteur = (req: any, res: any, next: any) => {
    if (req.user.role !== "Pasteur") {
      return res.status(403).json({ error: "Accès réservé au Pasteur" });
    }
    next();
  };

  // Email Transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
    if (!process.env.SMTP_HOST) {
      console.log("--- SIMULATED EMAIL ---");
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body: ${text}`);
      console.log("-----------------------");
      return;
    }
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"Rehoboth" <noreply@rehoboth.cd>',
        to,
        subject,
        text,
        html,
      });
    } catch (err) {
      console.error("Email sending failed:", err);
    }
  };

  // --- API ROUTES ---

  // US02: Authentication
  app.post("/api/auth/login", (req, res) => {
    try {
      const { email, password } = req.body;
      const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
      
      if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ error: "Identifiants invalides" });
      }

      const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: "24h" });
      res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
    } catch (err) {
      res.status(500).json({ error: "Erreur lors de la connexion" });
    }
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

  app.get("/api/finances", authenticate, isManagerOrTech, (req: any, res) => {
    const finances = db.prepare("SELECT * FROM finances ORDER BY date DESC").all();
    res.json(finances);
  });

  // US01: Mobile Money Donations
  app.post("/api/donations/mobile-money", authenticate, (req: any, res) => {
    const { amount, currency, provider, phone } = req.body;
    try {
      // Record as a donation in finances table
      const result = db.prepare(
        "INSERT INTO finances (type, amount, currency, date, user_id, status) VALUES (?, ?, ?, ?, ?, ?)"
      ).run("Don Mobile Money", amount, currency, new Date().toISOString(), req.user.id, "En attente");
      
      res.json({ 
        id: result.lastInsertRowid, 
        message: `Demande de don de ${amount} ${currency} via ${provider} envoyée. Veuillez confirmer sur votre téléphone.` 
      });
    } catch (err) {
      res.status(500).json({ error: "Erreur lors de l'enregistrement du don" });
    }
  });

  // US06: Ressources Management
  app.get("/api/ressources", authenticate, isManagerOrTech, (req, res) => {
    const ressources = db.prepare("SELECT * FROM ressources").all();
    res.json(ressources);
  });

  app.post("/api/ressources", authenticate, isManagerOrTech, (req, res) => {
    const { name, state, quantity, location } = req.body;
    try {
      db.prepare("INSERT INTO ressources (name, state, quantity, location) VALUES (?, ?, ?, ?)").run(name, state, quantity, location);
      res.json({ message: "Ressource ajoutée" });
    } catch (err) {
      res.status(500).json({ error: "Erreur" });
    }
  });

  // US04: Programmes
  app.get("/api/programmes", (req, res) => {
    const programmes = db.prepare("SELECT * FROM programmes ORDER BY date_start ASC").all();
    res.json(programmes);
  });

  app.post("/api/programmes", authenticate, isManagerOrTech, (req, res) => {
    const { title, description, date_start, date_end, type } = req.body;
    try {
      db.prepare("INSERT INTO programmes (title, description, date_start, date_end, type) VALUES (?, ?, ?, ?, ?)").run(title, description, date_start, date_end, type);
      res.json({ message: "Programme ajouté" });
    } catch (err) {
      res.status(500).json({ error: "Erreur" });
    }
  });

  app.put("/api/programmes/:id", authenticate, isManagerOrTech, (req, res) => {
    const { title, description, date_start, date_end, type } = req.body;
    const { id } = req.params;
    try {
      db.prepare("UPDATE programmes SET title = ?, description = ?, date_start = ?, date_end = ?, type = ? WHERE id = ?").run(title, description, date_start, date_end, type, id);
      res.json({ message: "Programme mis à jour" });
    } catch (err) {
      res.status(500).json({ error: "Erreur" });
    }
  });

  app.delete("/api/programmes/:id", authenticate, isManagerOrTech, (req, res) => {
    const { id } = req.params;
    try {
      db.prepare("DELETE FROM user_program_interest WHERE programme_id = ?").run(id);
      db.prepare("DELETE FROM programmes WHERE id = ?").run(id);
      res.json({ message: "Programme supprimé" });
    } catch (err) {
      res.status(500).json({ error: "Erreur" });
    }
  });

  // US: User Program Interest
  app.post("/api/programmes/:id/interest", authenticate, (req: any, res) => {
    const { id } = req.params;
    try {
      db.prepare("INSERT OR IGNORE INTO user_program_interest (user_id, programme_id) VALUES (?, ?)").run(req.user.id, id);
      res.json({ message: "Intérêt enregistré" });
    } catch (err) {
      res.status(500).json({ error: "Erreur lors de l'enregistrement de l'intérêt" });
    }
  });

  app.delete("/api/programmes/:id/interest", authenticate, (req: any, res) => {
    const { id } = req.params;
    try {
      db.prepare("DELETE FROM user_program_interest WHERE user_id = ? AND programme_id = ?").run(req.user.id, id);
      res.json({ message: "Intérêt retiré" });
    } catch (err) {
      res.status(500).json({ error: "Erreur lors du retrait de l'intérêt" });
    }
  });

  app.get("/api/programmes/interests", authenticate, (req: any, res) => {
    try {
      const interests = db.prepare("SELECT programme_id FROM user_program_interest WHERE user_id = ?").all(req.user.id);
      res.json(interests.map((i: any) => i.programme_id));
    } catch (err) {
      res.status(500).json({ error: "Erreur lors de la récupération des intérêts" });
    }
  });

  // US: Send Notifications
  app.post("/api/programmes/:id/notify", authenticate, isManagerOrTech, async (req, res) => {
    const { id } = req.params;
    try {
      const programme: any = db.prepare("SELECT * FROM programmes WHERE id = ?").get(id);
      if (!programme) return res.status(404).json({ error: "Programme non trouvé" });

      const interestedUsers: any = db.prepare(`
        SELECT u.email, u.name 
        FROM users u 
        JOIN user_program_interest upi ON u.id = upi.user_id 
        WHERE upi.programme_id = ?
      `).all(id);

      if (interestedUsers.length === 0) {
        return res.json({ message: "Aucun utilisateur intéressé à notifier" });
      }

      const date = new Date(programme.date_start);
      const d = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
      const t = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      const dateStr = `${d} à ${t}`;

      const emailPromises = interestedUsers.map((user: any) => {
        const subject = `Rappel : ${programme.title}`;
        const text = `Bonjour ${user.name},\n\nCeci est un rappel pour le programme "${programme.title}" auquel vous avez exprimé votre intérêt.\n\nDate : ${dateStr}\nDescription : ${programme.description || 'Pas de description'}\n\nNous espérons vous y voir !\n\nL'équipe Rehoboth`;
        const html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #1e3a8a;">Rappel de Programme</h2>
            <p>Bonjour <strong>${user.name}</strong>,</p>
            <p>Ceci est un rappel pour le programme auquel vous avez exprimé votre intérêt :</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #b45309;">${programme.title}</h3>
              <p><strong>Date :</strong> ${dateStr}</p>
              <p>${programme.description || ''}</p>
            </div>
            <p>Nous espérons vous y voir !</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #6b7280;">Centre Missionnaire Rehoboth</p>
          </div>
        `;
        return sendEmail(user.email, subject, text, html);
      });

      await Promise.all(emailPromises);

      res.json({ message: `${interestedUsers.length} notification(s) envoyée(s) avec succès` });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur lors de l'envoi des notifications" });
    }
  });

  // --- MEDITATIONS ROUTES ---
  app.get("/api/meditations", (req, res) => {
    const meditations = db.prepare("SELECT m.*, u.name as author FROM meditations m JOIN users u ON m.author_id = u.id ORDER BY date DESC").all();
    res.json(meditations);
  });

  app.post("/api/meditations", authenticate, isPasteur, (req: any, res) => {
    const { title, content } = req.body;
    try {
      db.prepare("INSERT INTO meditations (title, content, date, author_id) VALUES (?, ?, ?, ?)").run(
        title,
        content,
        new Date().toISOString(),
        req.user.id
      );
      res.json({ message: "Méditation publiée" });
    } catch (err) {
      res.status(500).json({ error: "Erreur lors de la publication" });
    }
  });

  app.put("/api/meditations/:id", authenticate, isPasteur, (req, res) => {
    const { title, content } = req.body;
    const { id } = req.params;
    try {
      db.prepare("UPDATE meditations SET title = ?, content = ? WHERE id = ?").run(title, content, id);
      res.json({ message: "Méditation mise à jour" });
    } catch (err) {
      res.status(500).json({ error: "Erreur" });
    }
  });

  app.delete("/api/meditations/:id", authenticate, isPasteur, (req, res) => {
    const { id } = req.params;
    try {
      db.prepare("DELETE FROM meditations WHERE id = ?").run(id);
      res.json({ message: "Méditation supprimée" });
    } catch (err) {
      res.status(500).json({ error: "Erreur" });
    }
  });

  // 404 for API routes - MUST be before Vite/SPA fallback
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: `Route API non trouvée: ${req.method} ${req.url}` });
  });

  // Global error handler for JSON responses
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("Server Error:", err);
    res.status(500).json({ error: "Une erreur interne est survenue" });
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
