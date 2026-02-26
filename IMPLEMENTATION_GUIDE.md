# Guide d'implémentation – Ymmovest
## Détail technique des points manquants – Février 2026

> Ce document est le complément de **[MOE.md](./MOE.md)**. Il regroupe tous les guides de code pour implémenter les fonctionnalités manquantes, classés par priorité.

---

## 🔴 Priorité haute

### 1. Middleware JWT sur les routes `/api/admin/*`

**Fichier :** `backend/index.js`

```javascript
// Ajouter ce middleware avant les routes admin
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  if (!token) return res.status(401).json({ message: 'Token manquant' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ message: 'Token invalide' });
  }
};

// Protéger toutes les routes admin :
app.get("/api/admin/communes",  authenticateToken, async (req, res) => { ... });
app.post("/api/admin/communes", authenticateToken, async (req, res) => { ... });
app.put("/api/admin/communes/:id",    authenticateToken, async (req, res) => { ... });
app.delete("/api/admin/communes/:id", authenticateToken, async (req, res) => { ... });
app.get("/api/admin/users",    authenticateToken, async (req, res) => { ... });
app.post("/api/admin/users",   authenticateToken, async (req, res) => { ... });
app.put("/api/admin/users/:id",    authenticateToken, async (req, res) => { ... });
app.delete("/api/admin/users/:id", authenticateToken, async (req, res) => { ... });
```

---

### 2. `ProtectedRoute` React sur les routes `/admin*`

**Nouveau fichier :** `frontend/components/ProtectedRoute.tsx`

```typescript
import { Navigate } from "react-router-dom";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user || user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
```

**Fichier :** `frontend/routes.tsx` — entourer les routes admin :

```typescript
import { ProtectedRoute } from "./components/ProtectedRoute";

// Remplacer les routes admin par :
{
  path: "admin",
  element: <ProtectedRoute><AdminPanel /></ProtectedRoute>
},
{
  path: "admin/communes",
  element: <ProtectedRoute><CitiesManagement /></ProtectedRoute>
},
{
  path: "admin/users",
  element: <ProtectedRoute><UsersManagement /></ProtectedRoute>
},
{
  path: "admin/docs",
  element: <ProtectedRoute><SwaggerUiComponent /></ProtectedRoute>
},
```

---

### 3. Unifier login email → retour JWT

**Fichier :** `backend/index.js` — dans `POST /api/auth/login`, ajouter le JWT avant le `res.json()` :

```javascript
// Après la vérification bcrypt réussie, remplacer res.json() par :
const jwtToken = jwt.sign(
  { id: user.id, email: user.email, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);
res.json({
  success: true,
  message: "Connexion réussie",
  token: jwtToken,
  user: { id: user.id, email: user.email, role: user.role }
});
```

**Fichier :** `frontend/components/Login.tsx` — stocker le token :

```typescript
const response = await login(email, password);
if (response.success) {
  localStorage.setItem("user", JSON.stringify(response.user));
  localStorage.setItem("token", response.token); // ← ajouter
  navigate("/admin");
}
```

---

### 4. Déconnexion (`logout`)

**Fichier :** `frontend/components/Header.tsx` — ajouter un bouton logout :

```typescript
const handleLogout = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  navigate("/login");
};
```

**Fichier :** `frontend/services/api.ts` — envoyer le token dans les appels admin :

```typescript
// Intercepteur Axios pour ajouter automatiquement le token
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

### 5. Volume Docker persistant pour la base de données

**Fichier :** `docker-compose.yml` — ajouter le volume au service `db` :

```yaml
db:
  # ...existing config...
  volumes:
    - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    - db_data:/var/lib/postgresql/data   # ← ajouter cette ligne

volumes:
  db_data:   # ← déclarer le volume (déjà présent, vérifier)
```

---

## 🟡 Priorité moyenne

### 6. Calcul du TRI (Taux de Rentabilité Interne)

**Fichier :** `frontend/services/api-mock.ts` — ajouter la fonction :

```typescript
export function calculerTRI(
  investissementInitial: number,
  cashFlows: number[], // flux nets annuels (loyer - charges - mensualité)
  maxIterations = 1000,
  tolerance = 0.0001
): number {
  let taux = 0.1; // estimation initiale : 10%
  for (let i = 0; i < maxIterations; i++) {
    const npv = cashFlows.reduce(
      (acc, cf, t) => acc + cf / Math.pow(1 + taux, t + 1),
      -investissementInitial
    );
    const derivee = cashFlows.reduce(
      (acc, cf, t) => acc - ((t + 1) * cf) / Math.pow(1 + taux, t + 2),
      0
    );
    const newTaux = taux - npv / derivee;
    if (Math.abs(newTaux - taux) < tolerance) return newTaux * 100;
    taux = newTaux;
  }
  return taux * 100;
}
```

**Fichier :** `frontend/components/DetailedSimulation.tsx` — afficher le TRI :

```typescript
import { calculerTRI } from "../services/api-mock";

// Dans le composant, après calculerProjection() :
const cashFlowsAnnuels = projection.map(
  (annee) => annee.loyerNet - annee.mensualite - annee.charges
);
const tri = calculerTRI(apport, cashFlowsAnnuels);

// Dans le JSX :
<Typography>TRI estimé : {tri.toFixed(2)}%</Typography>
```

---

### 7. Remplacer `api-mock` par les vrais appels API dans le Dashboard

**Fichier :** `frontend/components/Dashboard.tsx` — remplacer les imports mock :

```typescript
// Supprimer :
import { estimerLoyer, estimerCharges, ... } from "../services/api-mock";

// Ajouter dans api.ts :
export async function estimerLoyer(code: string, surface: number) {
  const res = await axios.get(`/api/communes/${encodeURIComponent(code)}/loyer?surface=${surface}`);
  return res.data;
}

// Dans Dashboard.tsx, utiliser :
import { estimerLoyer } from "../services/api";

// Et adapter l'appel :
const loyer = await estimerLoyer(commune.code, surface);
// (au lieu de estimerLoyer(commune, surface))
```

> ⚠️ `estimerCharges()` et `calculerProjection()` n'ont pas d'équivalent backend — ils restent dans `api-mock.ts` tant que les routes correspondantes ne sont pas créées côté serveur.

---

### 8. Debounce sur la recherche de communes

**Fichier :** `frontend/components/Home.tsx`

```typescript
import { useMemo, useEffect } from "react";

// Remplacer handleInputChange par :
const debouncedSearch = useMemo(
  () =>
    debounce(async (val: string) => {
      if (val.length >= 2) {
        try {
          const results = await searchCommunes(val);
          setOptions(results || []);
        } catch {
          setOptions([]);
        }
      } else {
        setOptions([]);
      }
    }, 300),
  []
);

const handleInputChange = (_: any, newInputValue: string) => {
  setInputValue(newInputValue);
  debouncedSearch(newInputValue);
};

// Cleanup au démontage
useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch]);
```

Installer lodash si absent :
```bash
npm install lodash @types/lodash
```

---

### 9. Pagination serveur pour la liste des communes

**Fichier :** `backend/index.js` — modifier `GET /api/admin/communes` :

```javascript
app.get("/api/admin/communes", authenticateToken, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const [data, count] = await Promise.all([
    pool.query(`SELECT ... FROM prix_communes ORDER BY id LIMIT $1 OFFSET $2`, [limit, offset]),
    pool.query(`SELECT COUNT(*) FROM prix_communes`)
  ]);

  res.json({
    data: data.rows,
    total: parseInt(count.rows[0].count),
    page,
    totalPages: Math.ceil(parseInt(count.rows[0].count) / limit)
  });
});
```

**Fichier :** `frontend/components/CitiesManagement.tsx` — utiliser la pagination MUI :

```typescript
const [page, setPage] = useState(1);
const [total, setTotal] = useState(0);
const PAGE_SIZE = 20;

// Dans loadCommunes() :
const res = await axios.get(`/api/admin/communes?page=${page}&limit=${PAGE_SIZE}`);
setCommunes(res.data.data);
setTotal(res.data.total);

// Dans le JSX :
<Pagination
  count={Math.ceil(total / PAGE_SIZE)}
  page={page}
  onChange={(_, val) => setPage(val)}
/>
```

---

### 10. Comparaison de biens (BF5)

**Étape 1 — Étendre `SimulationContext.tsx` :**

```typescript
interface SimulationContextType {
  simulationData: SimulationData | null;
  setSimulationData: (data: SimulationData | null) => void;
  savedSimulations: SimulationData[];          // ← nouveau
  addSimulation: (data: SimulationData) => void;  // ← nouveau
  removeSimulation: (index: number) => void;   // ← nouveau
}

// Dans le provider :
const [savedSimulations, setSavedSimulations] = useState<SimulationData[]>([]);

const addSimulation = (data: SimulationData) => {
  setSavedSimulations((prev) => [...prev.slice(0, 4), data]); // max 5
};

const removeSimulation = (index: number) => {
  setSavedSimulations((prev) => prev.filter((_, i) => i !== index));
};
```

**Étape 2 — Créer `frontend/components/Comparison.tsx` :**

```typescript
// Afficher les simulations côte à côte en colonnes MUI Grid
import { useSimulation } from "../contexts/SimulationContext";

export function Comparison() {
  const { savedSimulations } = useSimulation();
  return (
    <Grid container spacing={2}>
      {savedSimulations.map((sim, i) => (
        <Grid item xs={12} md={12 / savedSimulations.length} key={i}>
          {/* Carte résumé de chaque simulation */}
        </Grid>
      ))}
    </Grid>
  );
}
```

**Étape 3 — Ajouter la route dans `routes.tsx` :**

```typescript
{ path: "compare", Component: Comparison }
```

---

### 11. Simulation de vacance locative

**Fichier :** `frontend/components/DetailedSimulation.tsx` — ajouter un slider :

```typescript
const [tauxVacance, setTauxVacance] = useState(5); // 5% par défaut

// Dans le calcul du loyer annuel net :
const loyerAnnuelNet = loyerMensuel * 12 * (1 - tauxVacance / 100);

// Dans le JSX :
<Typography>Vacance locative : {tauxVacance}%</Typography>
<Slider
  value={tauxVacance}
  onChange={(_, val) => setTauxVacance(val as number)}
  min={0} max={20} step={1}
  marks={[{ value: 0, label: '0%' }, { value: 10, label: '10%' }, { value: 20, label: '20%' }]}
/>
```

---

## 🟢 Priorité basse

### 12. Mise à jour DVF+ automatique (cron job)

**Installer node-cron :**
```bash
cd backend && npm install node-cron
```

**Nouveau fichier :** `backend/scripts/updateDVF.js`

```javascript
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function updateCommunesFromDVF() {
  // L'API DVF+ : https://api.data.gouv.fr/datasets/5c4ae55a634f4117716d5656/
  const response = await fetch('https://api.data.gouv.fr/datasets/5c4ae55a634f4117716d5656/');
  const data = await response.json();
  // Parser et insérer/mettre à jour dans prix_communes
  // ...
  console.log('Mise à jour DVF terminée :', new Date().toISOString());
}

module.exports = { updateCommunesFromDVF };
```

**Fichier :** `backend/index.js` — ajouter le cron :

```javascript
const cron = require('node-cron');
const { updateCommunesFromDVF } = require('./scripts/updateDVF');

// Mise à jour hebdomadaire le dimanche à 2h du matin
cron.schedule('0 2 * * 0', async () => {
  console.log('Lancement mise à jour DVF...');
  await updateCommunesFromDVF();
});
```

Ajouter dans `init.sql` :
```sql
ALTER TABLE prix_communes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
```

---

### 13. Dockerfile frontend pour la production (build statique)

**Fichier :** `frontend/Dockerfile` — remplacer le contenu par un multi-stage build :

```dockerfile
# Étape 1 : Build de l'application Vite
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build
# Le build Vite génère ./dist

# Étape 2 : Servir avec Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx-config/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Modifier `docker-compose.yml` — supprimer le volume de montage dev et retirer le port exposé du frontend (Nginx proxy s'en charge) :

```yaml
frontend:
  build: ./frontend
  container_name: frontend_service
  # Supprimer les volumes et laisser Nginx servir les fichiers statiques
  restart: unless-stopped
  networks:
    - app_network
```

Mettre à jour `nginx/nginx-config/default.conf` pour servir les fichiers statiques directement depuis le conteneur frontend :

```nginx
location / {
  proxy_pass http://frontend:80;  # ← port 80 au lieu de 5173
  proxy_http_version 1.1;
  proxy_set_header Host $host;
}
```

---

### 14. HTTPS / SSL avec Let's Encrypt

Modifier `docker-compose.yml` pour exposer le port 443 et monter les certificats :

```yaml
nginx:
  # ...existing config...
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - /etc/letsencrypt:/etc/letsencrypt:ro
```

Modifier `nginx/nginx-config/default.conf` :

```nginx
server {
  listen 80;
  server_name votre-domaine.fr;
  return 301 https://$host$request_uri;
}

server {
  listen 443 ssl;
  server_name votre-domaine.fr;

  ssl_certificate     /etc/letsencrypt/live/votre-domaine.fr/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/votre-domaine.fr/privkey.pem;

  location / { ... }
  location /api/ { ... }
}
```

Obtenir le certificat (à faire sur le serveur de production) :
```bash
certbot certonly --standalone -d votre-domaine.fr
```

---

### 15. Historique des simulations (compte utilisateur)

**Fichier :** `init.sql` — ajouter une table :

```sql
CREATE TABLE IF NOT EXISTS simulations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  commune_code VARCHAR(10) NOT NULL,
  commune_nom VARCHAR(255) NOT NULL,
  surface NUMERIC(6,2) NOT NULL,
  prix_bien NUMERIC(12,2) NOT NULL,
  apport NUMERIC(12,2),
  taux_credit NUMERIC(4,2),
  duree_credit INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Fichier :** `backend/index.js` — ajouter les routes :

```javascript
// Sauvegarder une simulation
app.post("/api/simulations", authenticateToken, async (req, res) => {
  const { commune_code, commune_nom, surface, prix_bien, apport, taux_credit, duree_credit } = req.body;
  const result = await pool.query(
    `INSERT INTO simulations (user_id, commune_code, commune_nom, surface, prix_bien, apport, taux_credit, duree_credit)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [req.user.id, commune_code, commune_nom, surface, prix_bien, apport, taux_credit, duree_credit]
  );
  res.status(201).json(result.rows[0]);
});

// Récupérer l'historique de l'utilisateur connecté
app.get("/api/simulations", authenticateToken, async (req, res) => {
  const result = await pool.query(
    `SELECT * FROM simulations WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20`,
    [req.user.id]
  );
  res.json(result.rows);
});
```

---

### 16. Export PDF du rapport

**Installer les dépendances :**
```bash
cd frontend && npm install jspdf html2canvas
```

**Fichier :** `frontend/components/Report.tsx` — ajouter l'export :

```typescript
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const handleExportPDF = async () => {
  const element = document.getElementById("report-content");
  if (!element) return;

  const canvas = await html2canvas(element, { scale: 2 });
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");
  const imgWidth = 210;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
  pdf.save(`rapport-ymmovest-${commune.nom}.pdf`);
};

// Dans le JSX :
<Button
  id="report-content"
  startIcon={<Download />}
  onClick={handleExportPDF}
  variant="contained"
>
  Exporter en PDF
</Button>
```

---

*Guide d'implémentation – Ymmovest – Février 2026*

