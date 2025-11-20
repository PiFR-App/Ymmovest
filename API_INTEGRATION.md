**Résumé**

Ce document récapitule les modifications et explique comment mettre en place l'option B (proxy `nginx` du frontend vers le backend) afin que le frontend consomme exclusivement les données de la base Postgres initialisée par `init.sql`.

**Objectifs**
- Remplacer l'utilisation des données locales `frontend/data/prix-communes.ts` par des appels HTTP vers le backend.
- Proxy nginx sur le container frontend pour rediriger `/api/*` vers le service `backend` sur le réseau Docker interne.
- Fournir endpoints REST simples côté backend (`/api/communes`, `/api/communes/:code`, `/api/communes/:code/stats`, `/api/communes/:code/loyer`).

**Fichiers modifiés / ajoutés**
- `backend/index.js` : ajout de la connexion Postgres (`pg`), activation de `cors`, et nouveaux endpoints sous `/api`.
- `backend/package.json` : ajout des dépendances `pg` et `cors`.
- `frontend/nginx-config/default.conf` : ajout d'un bloc `location /api/ { proxy_pass http://backend:5000; ... }`.
- `frontend/services/api.ts` : nouveau wrapper côté frontend pour appeler les endpoints `/api/*` (utilisé par le front React).
- `frontend/components/Home.tsx` : utilisation de `searchCommunes` depuis `frontend/services/api.ts` au lieu du fichier `data/prix-communes.ts`.
- `frontend/types/index.ts` : centralisation/ajustement du type `CommuneData`.

**Base de données**
- Fichier d'initialisation : `init.sql` (déposé à la racine du repo) : crée la table `prix_communes` et y insère un jeu d'exemples.
- Connexion : `backend` lit `process.env.DATABASE_URL` ou utilise la valeur par défaut `postgres://root:1234@db:5432/database` (définie via `docker-compose.yml`).

Schéma (résumé) :
- Table `prix_communes` : `id, code, nom, codePostal, prixM2Median, prixM2Min, prixM2Max, evolution1An, nombreTransactions, loyerM2Median`.

**Endpoints exposés (backend)**
- `GET /api/communes?q=texte` : recherche par `nom`, `codePostal` ou `code` (ILIKE), renvoie jusqu'à 8 résultats ordonnés par `nombreTransactions`.
  - Exemple : `GET /api/communes?q=Paris`
  - Réponse (200) : tableau d'objets CommuneData (champs : `id, code, nom, codePostal, prixM2Median, prixM2Min, prixM2Max, evolution1An, nombreTransactions, loyerM2Median`).

- `GET /api/communes/:code` : récupère la commune par `code` (champ `code` dans la table).
  - Exemple : `GET /api/communes/75056`
  - Réponse : objet CommuneData ou 404 si non trouvé.

- `GET /api/communes/:code/stats?type=appartement|maison` : calcule et renvoie des statistiques simples basées sur les données stockées (prix moyen m2, min/max, nombre de ventes, surface moyenne estimée, évolution 1 an).
  - Exemple : `GET /api/communes/75056/stats?type=appartement`

- `GET /api/communes/:code/loyer?surface=XX` : calcule des fourchettes de loyers et un rendement brut estimé en utilisant `loyerM2Median` et `prixM2Median`.
  - Exemple : `GET /api/communes/75056/loyer?surface=50`

Remarque : Les réponses sont JSON, les nombres sont renvoyés en types numériques (float/int) côté backend.

**Front-end : utilisation**
- Fichier wrapper : `frontend/services/api.ts`. Fonctions exposées :
  - `searchCommunes(query: string): Promise<CommuneData[]>`
  - `getCommuneByCode(code: string): Promise<CommuneData | null>`
  - `getTransactionStats(code: string, typeBien?: string)`
  - `estimerLoyer(code: string, surface: number)`

- Exemple d'appel dans un composant React (fetch via wrapper déjà implémenté) :
  - `const results = await searchCommunes('Paris');`
  - `const commune = await getCommuneByCode('75056');`

Remplacement des mocks :
- Les imports vers `frontend/data/prix-communes.ts` ont été remplacés pour utiliser le type `CommuneData` depuis `frontend/types` et les appels réels via `frontend/services/api.ts`.

**Proxy Nginx (frontend)**
- Le container frontend sert le bundle statique (Vite -> `dist`) via `nginx`.
- Pour éviter CORS et garder la même origine, `nginx` proxy les requêtes `/api/*` vers `http://backend:5000` (résolution via le réseau Docker `app_network`).
- Fichier modifié : `frontend/nginx-config/default.conf` — bloc ajouté :
  ```
  location /api/ {
    proxy_pass http://backend:5000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
  ```

**Build & lancement (local / dev via Docker Compose)**
1. Rebuild et démarrage des services :
   ```bash
   docker compose up --build -d
   ```
2. Vérifier que les containers sont en ligne :
   ```bash
   docker compose ps
   ```
3. Vérifier l'API backend (depuis l'hôte) :
   ```bash
   curl http://localhost:5000/health
   ```
4. Vérifier la résolution depuis le container frontend (DNS interne) :
   - Ouvrir un shell dans le container frontend et tester la route backend :
   ```bash
   docker compose exec frontend sh -c "apk add --no-cache curl >/dev/null 2>&1 || true; curl -sS http://backend:5000/health"
   ```
   - La commande devrait répondre avec `{ "status": "ok" }` si la DB est accessible.

5. Ouvrez l'interface web : `http://localhost:8080`
   - Les appels réseau du frontend vers `/api/communes?q=...` sont proxifiés par `nginx` vers `backend`.

**Test rapide des endpoints**
- Depuis l'hôte :
  ```bash
  curl "http://localhost:5000/api/communes?q=Paris"
  curl "http://localhost:5000/api/communes/75056"
  curl "http://localhost:5000/api/communes/75056/stats?type=appartement"
  curl "http://localhost:5000/api/communes/75056/loyer?surface=50"
  ```
- Depuis le navigateur (frontend proxy) :
  - `http://localhost:8080/api/communes?q=Paris` (doit renvoyer le même JSON que ci-dessus)

**Dépannage fréquent**
- Erreur `ECONNREFUSED` ou 502 depuis nginx :
  - Vérifier que le service `backend` est démarré et sain (`docker compose ps`, `docker compose logs backend`).
  - Vérifier que `backend` écoute bien sur le port `5000` (dans `backend/index.js`, écoute sur `PORT`).

- Erreur liée à Postgres (500 / query error) :
  - Vérifier que `db` a démarré et que `init.sql` s'est exécuté (`docker compose logs db`).
  - Vérifier `DATABASE_URL` si personnalisé.

- `CORS` :
  - Le backend active `cors()` pour le développement ; si vous utilisez le proxy nginx, CORS n'est pas nécessaire car les requêtes seront same-origin entre navigateur et `frontend`.

**Sécurité & production**
- En production, évitez `app.use(cors())` en mode large ; restreignez `origin` et activez les bonnes règles.
- Protégez l'accès à Postgres (ne pas exposer `5432` sur internet) et utilisez des credentials robustes.

**Remarques techniques**
- `backend/package.json` a été mis à jour pour inclure `pg` et `cors` ; assurez-vous d'exécuter `npm ci` dans `backend` lors du build (le `Dockerfile` le fait pendant le build image).
- `frontend/services/api.ts` est un simple wrapper `fetch` et attend des réponses JSON au format décrit.

**Commandes utiles récapitulatives**
- Build et démarrage :
  ```bash
  docker compose up --build -d
  ```
- Voir logs (tail) :
  ```bash
  docker compose logs -f backend
  docker compose logs -f frontend
  docker compose logs -f db
  ```
- Tester depuis le container frontend (résolution interne) :
  ```bash
  docker compose exec frontend sh -c "apk add --no-cache curl >/dev/null 2>&1 || true; curl -sS http://backend:5000/api/communes?q=Paris"
  ```

**Prochaines suggestions (optionnelles)**
- Ajouter des tests unitaires pour les endpoints backend.
- Introduire une variable d'environnement pour la racine API côté frontend (injectée au build) si vous préférez ne pas forcer le proxy.
- Optimiser la sécurité : restreindre CORS, ajouter authentification si besoin pour endpoints sensibles.

---

Si vous voulez, je peux :
- Générer un `README` / checklist courte à coller dans la documentation de déploiement.
- Vous fournir des snippets axios / hooks React (useQuery) prêts à l'emploi pour remplacer d'autres usages du mock.

Fin du récapitulatif — aucune action Git n'a été réalisée ici (conforme à votre demande).
