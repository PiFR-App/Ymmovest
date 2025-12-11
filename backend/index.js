const express = require("express");
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

app.get("/", (req, res) => {
  res.json({ message: "Backend API is running" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok" });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

// Search communes by name / codepostal / code
app.get("/api/communes", async (req, res) => {
  const q = (req.query.q || "").toString();
  if (!q || q.length < 1) return res.json([]);

  const search = `%${q}%`;
  try {
    const result = await pool.query(
      `SELECT id, code, nom, codepostal as "codePostal", prixm2median::float as "prixM2Median", prixm2min::float as "prixM2Min", prixm2max::float as "prixM2Max", evolution1an::float as "evolution1An", nombretransactions as "nombreTransactions", loyerm2median::float as "loyerM2Median"
             FROM prix_communes
             WHERE nom ILIKE $1 OR codepostal ILIKE $2 OR code ILIKE $3
             ORDER BY nombretransactions DESC
             LIMIT 8`,
      [search, search, search]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "query error", error: err.message });
  }
});

app.get("/api/communes/:code", async (req, res) => {
  const code = req.params.code;
  try {
    const result = await pool.query(
      `SELECT id, code, nom, codepostal as "codePostal", prixm2median::float as "prixM2Median", prixm2min::float as "prixM2Min", prixm2max::float as "prixM2Max", evolution1an::float as "evolution1An", nombretransactions as "nombreTransactions", loyerm2median::float as "loyerM2Median"
             FROM prix_communes WHERE code = $1 LIMIT 1`,
      [code]
    );
    if (!result.rows.length)
      return res.status(404).json({ message: "Commune not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "query error", error: err.message });
  }
});

app.get("/api/communes/:code/stats", async (req, res) => {
  const code = req.params.code;
  const typeBien = (req.query.type || "appartement").toString();
  try {
    const result = await pool.query(
      `SELECT prixm2median::float as "prixM2Median", prixm2min::float as "prixM2Min", prixm2max::float as "prixM2Max", evolution1an::float as "evolution1An", nombretransactions as "nombreTransactions", loyerm2median::float as "loyerM2Median"
             FROM prix_communes WHERE code = $1 LIMIT 1`,
      [code]
    );
    if (!result.rows.length)
      return res.status(404).json({ message: "Commune not found" });
    const c = result.rows[0];
    const facteurType = typeBien === "maison" ? 0.85 : 1;
    const stats = {
      prixMoyenM2: Math.round(c.prixM2Median * facteurType),
      nombreVentes: c.nombreTransactions,
      prixMin: Math.round(c.prixM2Min * facteurType),
      prixMax: Math.round(c.prixM2Max * facteurType),
      surfaceMoyenne: typeBien === "maison" ? 95 : 58,
      evolution1An: Number(c.evolution1An),
    };
    // Normalize property names in case Postgres returned lowercased keys
    // Some drivers map column names to lowercase; ensure we read correct fields
    // but we already cast using ::float so names may be as in SQL.
    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "query error", error: err.message });
  }
});

app.get("/api/communes/:code/loyer", async (req, res) => {
  const code = req.params.code;
  const surface = parseFloat((req.query.surface || "0").toString()) || 0;
  try {
    const result = await pool.query(
      `SELECT prixm2median::float as "prixM2Median", loyerm2median::float as "loyerM2Median" FROM prix_communes WHERE code = $1 LIMIT 1`,
      [code]
    );
    if (!result.rows.length)
      return res.status(404).json({ message: "Commune not found" });
    const c = result.rows[0];
    const loyerM2 = Number(c.loyerM2Median || 0);
    const loyerMensuelMedian = Math.round(loyerM2 * surface);
    const response = {
      loyerMensuelMin: Math.round(loyerMensuelMedian * 0.85),
      loyerMensuelMedian,
      loyerMensuelMax: Math.round(loyerMensuelMedian * 1.15),
      rendementBrutEstime:
        ((loyerM2 * 12) / Number(c.prixM2Median || 1)) * 100,
      source: "Base locale Postgres",
    };
    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "query error", error: err.message });
  }
});

// Login endpoint
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: "Email et mot de passe requis" 
    });
  }

  try {
    const result = await pool.query(
      `SELECT id, email, password_hash, role FROM users WHERE email = $1`,
      [email]
    );

    if (!result.rows.length) {
      return res.status(401).json({ 
        success: false, 
        message: "Email ou mot de passe incorrect" 
      });
    }

    const user = result.rows[0];

    // Vérifier si l'utilisateur est administrateur
    if (user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: "Accès réservé aux administrateurs" 
      });
    }

    // Pour l'instant, on compare directement le password
    // En production, utiliser bcrypt.compare(password, user.password_hash)
    // Mot de passe de test: "adminpassword"
    const bcrypt = require('bcrypt');
    password_user_hashed = bcrypt.hash(password);
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ 
        success: false, 
        message: "Email ou mot de passe incorrect" 
      });
    }

    // Connexion réussie
    res.json({ 
      success: true, 
      message: "Connexion réussie",
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false, 
      message: "Erreur serveur", 
      error: err.message 
    });
  }
});
