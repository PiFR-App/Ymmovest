# Maîtrise d'Œuvre (MOE) – Ymmovest
## État d'avancement du projet – Février 2026

> 📖 Les guides d'implémentation pour chaque point manquant sont disponibles dans **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)**.

---

## 1. Vue d'ensemble

Ce document décrit l'état d'implémentation du projet **Ymmovest** — simulateur d'analyse et d'investissement immobilier locatif — en se basant sur le **Cahier des Charges** et le code actuellement en place. Il recense ce qui fonctionne, comment c'est fait, et ce qui est manquant.

---

## 2. Architecture technique en place

### Stack technologique

| Couche | Technologie | Version | Statut |
|--------|------------|---------|--------|
| **Frontend** | React + TypeScript | 18.3 | ✅ En place |
| **Routing** | React Router DOM | v7.9.5 | ✅ En place |
| **UI Library** | Material UI (MUI) | v5.16 | ✅ En place |
| **Graphiques** | Recharts | v2.12 | ✅ En place |
| **HTTP Client** | Axios | v1.7 | ✅ En place |
| **Build Tool** | Vite | v5.4 | ✅ En place |
| **Backend** | Node.js + Express | Express v5.1 | ✅ En place |
| **Base de données** | PostgreSQL | v15 | ✅ En place |
| **Reverse Proxy** | Nginx | alpine | ✅ En place |
| **Conteneurisation** | Docker + Docker Compose | – | ✅ En place |
| **Auth Google** | google-auth-library + @react-oauth/google | v10 / v0.13 | ✅ En place |
| **JWT** | jsonwebtoken | v9 | ✅ En place |
| **Hachage mdp** | bcrypt | v5.1 | ✅ En place |
| **Documentation API** | Swagger UI / OpenAPI 3.0 | – | ✅ En place |

### Schéma d'architecture déployée

```
Navigateur
    │
    ▼ :8080
┌────────────────────────────────────────┐
│          NGINX (Reverse Proxy)          │
│  / ──► frontend (Vite dev :5173)        │
│  /api/ ──► backend (Express :5000)      │
└────────────────────────────────────────┘
         │                   │
         ▼                   ▼
  ┌─────────────┐     ┌──────────────┐
  │  FRONTEND   │     │   BACKEND    │
  │  React/TS   │     │  Node.js     │
  │  Vite dev   │     │  Express     │
  └─────────────┘     └──────┬───────┘
                             │ SQL
                             ▼
                      ┌──────────────┐
                      │  PostgreSQL  │
                      │   :5432      │
                      └──────────────┘
```

---

## 3. Besoins Fonctionnels – État d'implémentation

### BF1 – Recherche par commune ✅ **Implémenté**

**Ce qui est en place :**
- Composant `Home.tsx` : champ `Autocomplete` MUI avec recherche dynamique dès 2 caractères
- Service frontend `api.ts → searchCommunes()` : appel `GET /api/communes?q={query}`
- Route backend `GET /api/communes` : requête PostgreSQL avec `ILIKE` sur nom, code postal et code INSEE
- Limite de 8 résultats triés par nombre de transactions décroissant
- Bouton "Voir un exemple" qui charge Paris 11e / 65m² automatiquement

**Comment c'est fait :**
```
Utilisateur tape → handleInputChange() → searchCommunes(query)
    → GET /api/communes?q=xxx → pool.query PostgreSQL → retour JSON
    → setOptions(results) → Autocomplete affiche les suggestions
```

**Ce qui manque :**
- ❌ Gestion du debounce (chaque frappe déclenche une requête)
- ❌ Message "Aucun résultat" explicite quand la liste est vide

---

### BF2 – Affichage des statistiques de prix ✅ **Implémenté**

**Ce qui est en place :**
- Composant `Dashboard.tsx` : affiche prix médian, min, max, évolution sur 1 an, nombre de transactions
- Route backend `GET /api/communes/:code/stats?type={appartement|maison}` avec facteur de correction (×0.85 pour maison)
- Graphique bar chart (Recharts) avec comparaison des prix
- Chips de type de bien pour switcher appartement/maison
- Slider pour ajuster la surface

**Ce qui manque :**
- ❌ Historique d'évolution sur plusieurs années (données statiques, pas de série temporelle)
- ❌ Comparaison avec la moyenne nationale ou régionale
- ❌ Carte interactive pour visualiser la commune

---

### BF3 – Estimation de loyer ✅ **Implémenté**

**Ce qui est en place :**
- Route backend `GET /api/communes/:code/loyer?surface={X}` : calcul loyer min/médian/max et rendement brut
- Service mock `api-mock.ts → estimerLoyer()` : utilisé dans Dashboard et DetailedSimulation (données locales de la commune)
- Affichage dans le Dashboard avec loyer mensuel estimé et rendement brut

**⚠️ Attention – double source de données :**
> Le `Dashboard.tsx` utilise `api-mock.ts` (calcul local côté front) alors que la route backend `/api/communes/:code/loyer` existe et renvoie les mêmes données depuis PostgreSQL. Les deux sont cohérents car ils utilisent `loyerM2Median` de la même table.

**Ce qui manque :**
- ❌ Le Dashboard utilise `api-mock.ts` au lieu de l'API réelle → à unifier
- ❌ Prise en compte du type de bien (maison vs appartement) pour le loyer
- ❌ Distinction meublé / vide

---

### BF4 – Simulation financière ⚠️ **Implémenté (partiellement)**

**Ce qui est en place :**
- `Dashboard.tsx` : sliders pour apport, taux de crédit (%), durée (années)
- Calcul mensualité, cash flow mensuel, rendement brut/net
- `DetailedSimulation.tsx` : simulation avancée avec tableau de projection sur 20 ans, graphiques LineChart et PieChart (répartition des charges)
- `api-mock.ts → calculerMensualite()`, `calculerProjection()`, `estimerCharges()` : calculs financiers locaux

**Ce qui manque :**
- ❌ Calcul du TRI (Taux de Rentabilité Interne) — mentionné dans le CDC mais non implémenté
- ❌ Simulation de vacance locative (% de mois sans locataire)
- ❌ Simulation des travaux de rénovation
- ❌ Fiscalité (LMNP, régime foncier, micro-foncier) — non implémentée
- ❌ Taux de crédit réel (actuellement codé en dur à 3.5% dans `api-mock.ts`)

---

### BF5 – Comparaison de biens ❌ **Non implémenté**

**Ce qui est dans le CDC :**
> Comparer plusieurs communes ou biens côte à côte

**Ce qui manque :**
- ❌ Aucune interface de comparaison n'existe
- ❌ Pas de sauvegarde de plusieurs simulations simultanées

---

### BF6 – Gestion administrative ✅ **Implémenté**

**Ce qui est en place :**

**Communes (`CitiesManagement.tsx`) :**
- Liste complète avec pagination
- Formulaire de création et modification (modal)
- Suppression avec confirmation
- Routes backend : `GET/POST /api/admin/communes`, `PUT/DELETE /api/admin/communes/:id`

**Utilisateurs (`UsersManagement.tsx`) :**
- Liste des utilisateurs avec rôle
- Création avec hachage bcrypt du mot de passe côté backend
- Modification (email, rôle, mot de passe optionnel)
- Suppression
- Routes backend : `GET/POST /api/admin/users`, `PUT/DELETE /api/admin/users/:id`

**Panneau admin (`AdminPanel.tsx`) :**
- 4 boutons : Communes, Utilisateurs, Swagger API, Paramètres
- Navigation vers les sous-pages

**Ce qui manque :**
- ❌ Pas de protection des routes admin (n'importe qui peut accéder à `/admin` sans être connecté)
- ❌ Bouton "Paramètres" ne fait rien (`navigate('#')`)
- ❌ Pas de pagination serveur (toutes les communes chargées d'un coup)

---

### BF7 – Authentification ⚠️ **Implémenté (partiellement)**

**Ce qui est en place :**

**Login email/password :**
- `Login.tsx` : formulaire email + mot de passe
- `POST /api/auth/login` : vérification bcrypt du hash en base
- Rôle vérifié (`admin` uniquement)
- Stockage de l'utilisateur dans `localStorage`

**Login Google OAuth :**
- `@react-oauth/google` + `GoogleLogin` component dans `Login.tsx`
- `POST /api/auth/google` : vérification du token Google via `google-auth-library`
- Vérification que l'email Google existe dans la table `users`
- Retour d'un JWT signé avec `JWT_SECRET`

**Configuration :**
- Variables d'environnement via `.env` à la racine : `GOOGLE_CLIENT_ID`, `JWT_SECRET`, `DATABASE_URL`

**Ce qui manque :**
- ❌ Le token JWT retourné par Google auth n'est pas stocké / utilisé pour sécuriser les appels API
- ❌ Login email/password ne retourne pas de JWT (seulement l'objet user)
- ❌ Pas de middleware de vérification JWT sur les routes `/api/admin/*`
- ❌ Pas de déconnexion (`logout`) implémentée côté frontend

---

### BF8 – Actualisation des données ❌ **Non implémenté**

**Ce qui est dans le CDC :**
> Mise à jour périodique des données via API (DVF+, Banque de France)

**Ce qui manque :**
- ❌ Aucun service de scraping ou d'import DVF+ réel
- ❌ Aucune tâche planifiée (cron job)
- ❌ Les données actuelles sont 25 communes statiques en dur dans `init.sql`

---

## 4. Besoins Non Fonctionnels – État d'implémentation

| ID | Besoin | Statut | Détails |
|----|--------|--------|---------|
| **BNF1** | Performance < 2s | ⚠️ Partiel | Pas de cache Redis, pas de compression Nginx |
| **BNF2** | Disponibilité 99% | ⚠️ Partiel | `restart: unless-stopped` dans Docker Compose, mais pas de healthcheck backend |
| **BNF3** | Sécurité (HTTPS, bcrypt) | ⚠️ Partiel | bcrypt OK, JWT présent, HTTPS **absent**, routes admin **non protégées** |
| **BNF4** | Ergonomie | ✅ | MUI, interface en français, formulaires guidés |
| **BNF5** | Scalabilité 1000 users | ❌ | Pas de load balancer, pas de pool de connexions optimisé |
| **BNF6** | Maintenabilité | ✅ | Code TypeScript typé, Swagger UI intégré |
| **BNF7** | Compatibilité navigateurs | ✅ | React + MUI, compatible tous navigateurs modernes |
| **BNF8** | Accessibilité WCAG 2.1 | ❌ | Non testé, aucune conformité explicite |

---

## 5. Fonctions du Diagramme Pieuvre – État d'implémentation

### Fonctions Principales (FP)

| Code | Fonction | Statut | Composant/Route |
|------|----------|--------|-----------------|
| **FP1** | Recherche de communes | ✅ | `Home.tsx` + `GET /api/communes` |
| **FP2** | Estimation de prix | ✅ | `Dashboard.tsx` + `GET /api/communes/:code/stats` |
| **FP3** | Estimation de loyers | ✅ | `Dashboard.tsx` + `GET /api/communes/:code/loyer` |
| **FP4** | Simulation financière | ⚠️ Partiel | `DetailedSimulation.tsx` (TRI manquant, fiscalité absente) |
| **FP5** | Visualisation des données | ✅ | Recharts (BarChart, PieChart, LineChart) dans Dashboard et DetailedSimulation |

### Fonctions Contraintes (FC)

| Code | Contrainte | Statut | Détails |
|------|-----------|--------|---------|
| **FC1** | Connexion aux API externes | ⚠️ Mock | DVF+ et Banque de France simulées dans `api-mock.ts` |
| **FC2** | Adaptation aux API | ❌ | Pas de gestion des quotas ni des erreurs d'API réelles |
| **FC3** | Continuité de service | ⚠️ | `restart: unless-stopped` mais pas de fallback si DB indisponible |
| **FC4** | Conformité RGPD | ⚠️ | Aucune mention ni gestion concrète dans le code |
| **FC5** | Protection des données | ⚠️ | bcrypt OK, JWT présent, HTTPS absent |
| **FC6** | Respect des licences | ✅ | Données publiques (DVF+, Open Data) |
| **FC7** | Compatibilité navigateurs | ✅ | Vite + MUI assurent la compatibilité |
| **FC8** | Multi-support (responsive) | ✅ | MUI Grid responsive, `Container` adaptatif |
| **FC9** | Dépendance Internet | ✅ | Application 100% web |
| **FC10** | Performance < 2s | ⚠️ | Pas de cache, pas de CDN |

---

## 6. Infrastructure Docker – État d'implémentation

### Services actuels (`docker-compose.yml`)

| Service | Image | Port | Statut |
|---------|-------|------|--------|
| `frontend` | Build `./frontend` (Vite dev) | – | ✅ |
| `nginx` | Build `./nginx` | 8080:80 | ✅ |
| `backend` | Build `./backend` | 5000:5000 | ✅ |
| `db` | `postgres:15` | 5432:5432 | ✅ |

### Points d'attention

**✅ Ce qui fonctionne :**
- `init.sql` monté dans `/docker-entrypoint-initdb.d/` → table `prix_communes` et `users` créées automatiquement
- Healthcheck sur PostgreSQL (`pg_isready`)
- `depends_on` avec condition `service_healthy` pour le backend
- Variables d'environnement via `.env` (hors dépôt Git)
- Réseau Docker `app_network` (bridge)

**⚠️ Ce qui est en mode développement :**
- Le frontend tourne en mode `vite dev` (hot reload), pas en build de production
- Pas de volume persistant pour la base de données (`db_data` manquant)
- Le mode `dev` Vite dans Docker cause l'erreur `@rollup/rollup-linux-x64-musl` si `node_modules` est monté depuis Windows

**❌ Ce qui manque :**
- Pas de HTTPS / certificats SSL
- Pas de Dockerfile de production pour le frontend (build statique + Nginx)

---

## 7. Documentation API – État d'implémentation

**✅ Ce qui est en place :**
- Fichier `backend/openapi.yaml` : spécification OpenAPI 3.0
- Route `GET /api/docs` : Swagger UI intégré avec `swagger-ui-express`
- Route `GET /api/docs.json` : accès au schéma JSON
- Composant frontend `SwaggerUiComponent.tsx` : affiche Swagger depuis le frontend sur `/admin/docs`

**❌ Ce qui manque :**
- Le fichier `openapi.yaml` ne couvre pas encore toutes les routes admin ajoutées récemment
- Pas d'authentification documentée dans Swagger (Bearer token)

---

## 8. User Stories – État de réalisation

| ID | User Story | Statut |
|----|-----------|--------|
| **US1** | Rechercher une commune par nom/code postal | ✅ Fait |
| **US2** | Visualiser les prix au m² (médian, min, max) | ✅ Fait |
| **US3** | Estimer le loyer mensuel selon la surface | ✅ Fait |
| **US4** | Comparer plusieurs communes côte à côte | ❌ Non fait |
| **US5** | Calculer le rendement locatif brut et net | ⚠️ Partiel (TRI manquant) |
| **US6** | Accéder aux statistiques d'évolution des prix | ⚠️ Partiel (1 an seulement) |
| **US7** | Ajouter, modifier ou supprimer des communes | ✅ Fait |
| **US8** | Gérer les comptes utilisateurs | ✅ Fait |
| **US9** | Tableaux de bord qualité des données | ❌ Non fait |
| **US10** | Logs d'erreurs et métriques d'utilisation | ❌ Non fait |
| **US11** | Documentation API complète (OpenAPI) | ⚠️ Partiel |
| **US12** | Connexion sécurisée avec authentification | ⚠️ Partiel (routes admin non protégées) |

---

## 9. Ce qui est manquant – Priorisation

### 🔴 Priorité haute (sécurité / fonctionnel bloquant)

| Tâche | Effort | Impact |
|-------|--------|--------|
| Middleware JWT sur routes `/api/admin/*` | 1h | Critique – sécurité |
| `ProtectedRoute` React sur `/admin*` | 1h | Critique – sécurité |
| Unifier login email → retour JWT | 30min | Élevé |
| Déconnexion (`logout`) + clear localStorage | 30min | Élevé |
| Volume Docker persistant pour `db_data` | 15min | Élevé – perte de données |

### 🟡 Priorité moyenne (fonctionnalités CDC)

| Tâche | Effort | Impact |
|-------|--------|--------|
| Calcul du TRI dans `DetailedSimulation` | 3h | Élevé – CDC explicite |
| Remplacer `api-mock` par vrais appels API dans Dashboard | 2h | Moyen |
| Debounce sur la recherche de communes | 1h | Moyen |
| Pagination serveur pour la liste des communes | 2h | Moyen |
| Comparaison de biens (BF5) | 2 jours | Élevé – CDC |
| Simulation vacance locative | 4h | Élevé |

### 🟢 Priorité basse (améliorations futures)

| Tâche | Effort | Impact |
|-------|--------|--------|
| Mise à jour DVF+ automatique (cron) | 1 jour | Élevé long terme |
| Export PDF du rapport | 2 jours | Moyen (CDC Phase 2) |
| HTTPS / SSL | 1h avec Let's Encrypt | Moyen (production) |
| Dockerfile frontend production (build statique) | 1h | Moyen (prod) |
| Simulation fiscale (LMNP, micro-foncier) | 3 jours | Élevé Phase 2 |
| Historique des simulations (compte utilisateur) | 3 jours | Élevé Phase 2 |
| Connexion API Banque de France réelle | 2 jours | Élevé |
| Tests unitaires et d'intégration | 1 semaine | Élevé |
| RGPD : mentions légales, politique confidentialité | 1 jour | Légal |

---

## 10. Synthèse globale

```
┌─────────────────────────────────────────────────────────┐
│                    AVANCEMENT MVP                       │
├─────────────────────────────────────┬───────────────────┤
│ Fonctionnalité                      │ Statut            │
├─────────────────────────────────────┼───────────────────┤
│ Recherche de communes               │ ✅ Complet         │
│ Affichage statistiques prix         │ ✅ Complet         │
│ Estimation loyer                    │ ✅ Complet         │
│ Simulation financière de base       │ ✅ Complet         │
│ Simulation financière avancée (TRI) │ ⚠️ Partiel        │
│ Comparaison de biens                │ ❌ Absent          │
│ Gestion admin (communes/users)      │ ✅ Complet         │
│ Authentification email              │ ⚠️ Sans JWT retour │
│ Authentification Google OAuth       │ ✅ Complet         │
│ Protection routes admin             │ ❌ Absent          │
│ Documentation API Swagger           │ ✅ Présent         │
│ Conteneurisation Docker             │ ✅ Fonctionnel     │
│ Données réelles DVF+                │ ❌ Simulées        │
│ Taux crédit Banque de France        │ ❌ Simulés         │
│ Export PDF rapport                  │ ❌ Absent          │
│ HTTPS / SSL                         │ ❌ Absent          │
├─────────────────────────────────────┴───────────────────┤
│  Progression estimée du MVP : ~65%                      │
└─────────────────────────────────────────────────────────┘
```

> 📖 Voir **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** pour les guides de code détaillés sur chaque point manquant.

---

*Document généré le 23 février 2026 – à mettre à jour à chaque sprint.*
