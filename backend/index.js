const express = require("express");
const cors = require('cors');
    const path = require("path");
const { Pool } = require('pg');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const app = express();
const PORT = process.env.PORT || 5000;
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
console.log('=== CONFIGURATION AU DÉMARRAGE ===');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✓ Défini' : '✗ Manquant');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✓ Défini' : '✗ Manquant');
console.log('===================================');
app.use(express.json());
app.use(cors());
const swaggerDocument = YAML.load(path.join(__dirname, 'openapi.yaml'));
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

app.get("/", (req, res) => {
  res.json({ message: "Backend API is running" });
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


// ============================================
// ROUTES ADMIN POUR CONNEXIONS
// ============================================

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

        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Accès réservé aux administrateurs"
            });
        }

        // Comparer le mot de passe avec le hash en base
        const bcrypt = require('bcrypt');
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Email ou mot de passe incorrect"
            });
        }

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

app.post("/api/auth/google", async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            console.error('Token manquant dans la requête');
            return res.status(400).json({ message: 'Token manquant' });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        console.log('Token validé avec succès');

        const payload = ticket.getPayload();
        const email = payload.email;

        const result = await pool.query(
            'SELECT id, email, role FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Email non autorisé"
            });
        }

        const user = result.rows[0];

        const jwtToken = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token: jwtToken, user });
    } catch (error) {
        console.error('Erreur validation Google:', {
            message: error.message,
            name: error.name,
            stack: error.stack
        });
        return res.status(401).json({ message: 'token google invalide', error: error.message });
    }
});


// ============================================
// ROUTES ADMIN POUR GESTION DES COMMUNES
// ============================================

// Récupérer toutes les communes
app.get("/api/admin/communes", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, code, nom, codepostal as "codePostal", 
              prixm2median::float as "prixM2Median", 
              prixm2min::float as "prixM2Min", 
              prixm2max::float as "prixM2Max", 
              evolution1an::float as "evolution1An", 
              nombretransactions as "nombreTransactions", 
              loyerm2median::float as "loyerM2Median"
       FROM prix_communes
       ORDER BY id`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la récupération des communes", error: err.message });
  }
});

// Créer une nouvelle commune
app.post("/api/admin/communes", async (req, res) => {
  const { code, nom, codePostal, prixM2Median, prixM2Min, prixM2Max, evolution1An, nombreTransactions, loyerM2Median } = req.body;
  
  if (!code || !nom || !codePostal || prixM2Median === undefined || prixM2Min === undefined || 
      prixM2Max === undefined || evolution1An === undefined || nombreTransactions === undefined || 
      loyerM2Median === undefined) {
    return res.status(400).json({ message: "Tous les champs sont requis" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO prix_communes (code, nom, codepostal, prixm2median, prixm2min, prixm2max, evolution1an, nombretransactions, loyerm2median)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, code, nom, codepostal as "codePostal", 
                 prixm2median::float as "prixM2Median", 
                 prixm2min::float as "prixM2Min", 
                 prixm2max::float as "prixM2Max", 
                 evolution1an::float as "evolution1An", 
                 nombretransactions as "nombreTransactions", 
                 loyerm2median::float as "loyerM2Median"`,
      [code, nom, codePostal, prixM2Median, prixM2Min, prixM2Max, evolution1An, nombreTransactions, loyerM2Median]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la création de la commune", error: err.message });
  }
});

// Modifier une commune
app.put("/api/admin/communes/:id", async (req, res) => {
  const id = req.params.id;
  const { code, nom, codePostal, prixM2Median, prixM2Min, prixM2Max, evolution1An, nombreTransactions, loyerM2Median } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE prix_communes 
       SET code = $1, nom = $2, codepostal = $3, prixm2median = $4, prixm2min = $5, 
           prixm2max = $6, evolution1an = $7, nombretransactions = $8, loyerm2median = $9
       WHERE id = $10
       RETURNING id, code, nom, codepostal as "codePostal", 
                 prixm2median::float as "prixM2Median", 
                 prixm2min::float as "prixM2Min", 
                 prixm2max::float as "prixM2Max", 
                 evolution1an::float as "evolution1An", 
                 nombretransactions as "nombreTransactions", 
                 loyerm2median::float as "loyerM2Median"`,
      [code, nom, codePostal, prixM2Median, prixM2Min, prixM2Max, evolution1An, nombreTransactions, loyerM2Median, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Commune non trouvée" });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la modification de la commune", error: err.message });
  }
});

// Supprimer une commune
app.delete("/api/admin/communes/:id", async (req, res) => {
  const id = req.params.id;
  
  try {
    const result = await pool.query(
      `DELETE FROM prix_communes WHERE id = $1 RETURNING id`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Commune non trouvée" });
    }
    
    res.json({ message: "Commune supprimée avec succès", id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la suppression de la commune", error: err.message });
  }
});


app.get("/api/docs.json", async (req, res) => {
    res.status(200).json(swaggerDocument);
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));



// ============================================
// ROUTES ADMIN POUR GESTION DES UTILISATEURS
// ============================================

// Récupérer tous les utilisateurs
app.get("/api/admin/users", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, role FROM users ORDER BY id`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs", error: err.message });
  }
});

// Créer un nouvel utilisateur
app.post("/api/admin/users", async (req, res) => {
  const { email, password, role } = req.body;
  
  if (!email || !password || !role) {
    return res.status(400).json({ message: "Email, mot de passe et rôle sont requis" });
  }

  try {
    const bcrypt = require('bcrypt');
    const password_hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, role)
       VALUES ($1, $2, $3)
       RETURNING id, email, role`,
      [email, password_hash, role]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') { // Code d'erreur PostgreSQL pour violation d'unicité
      res.status(400).json({ message: "Cet email est déjà utilisé" });
    } else {
      res.status(500).json({ message: "Erreur lors de la création de l'utilisateur", error: err.message });
    }
  }
});

// Modifier un utilisateur
app.put("/api/admin/users/:id", async (req, res) => {
  const id = req.params.id;
  const { email, password, role } = req.body;
  
  try {
    let query, params;
    
    if (password) {
      // Si un nouveau mot de passe est fourni, on le hash
      const bcrypt = require('bcrypt');
      const password_hash = await bcrypt.hash(password, 10);
      
      query = `UPDATE users 
               SET email = $1, password_hash = $2, role = $3
               WHERE id = $4
               RETURNING id, email, role`;
      params = [email, password_hash, role, id];
    } else {
      // Sinon on met à jour seulement l'email et le rôle
      query = `UPDATE users 
               SET email = $1, role = $2
               WHERE id = $3
               RETURNING id, email, role`;
      params = [email, role, id];
    }
    
    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      res.status(400).json({ message: "Cet email est déjà utilisé" });
    } else {
      res.status(500).json({ message: "Erreur lors de la modification de l'utilisateur", error: err.message });
    }
  }
});

// Supprimer un utilisateur
app.delete("/api/admin/users/:id", async (req, res) => {
  const id = req.params.id;
  
  try {
    const result = await pool.query(
      `DELETE FROM users WHERE id = $1 RETURNING id`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    
    res.json({ message: "Utilisateur supprimé avec succès", id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la suppression de l'utilisateur", error: err.message });
  }
});

