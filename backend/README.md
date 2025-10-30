# Backend (API)

Ce service expose l’API de l’application (Node.js). Il se connecte à Postgres et Redis via les URLs fournies par Docker Compose.

## TL;DR
- Env requis: `DATABASE_URL`, `REDIS_URL`, `PORT` (par défaut 5000)
- Démarrage en Docker: géré via `docker-compose.yml` (service `backend`)
- Démarrage local (hors Docker): `npm install && npm run dev` (selon votre stack)

## Architecture attendue
- Runtime: Node.js 20
- Framework: au choix (Express, Fastify, NestJS…)
- Port: 5000 (exposé en interne au réseau Docker, routé par Nginx si vous avez un proxy)
- Base de données: Postgres (service `db`)
- Cache/queue: Redis (service `cache`)

## Variables d’environnement
- `DATABASE_URL` (ex: `postgres://user:pass@db:5432/app`)
- `REDIS_URL` (ex: `redis://cache:6379`)
- `PORT` (ex: `5000`)
- `NODE_ENV` (ex: `production` ou `development`)
- `LOG_LEVEL` (optionnel, ex: `info`)

Voir `.env.example` pour un modèle.

## Scripts NPM attendus
Assurez-vous d’avoir au minimum:
- `start`: lance l’API en production (ex: `node dist/server.js` ou `node server.js`)
- `dev`: lance l’API en développement (ex: `nodemon src/server.ts`)
- `test`: lance les tests (optionnel)

Le Dockerfile fourni exécute `npm start`.

## Démarrage avec Docker Compose
Le service `backend` est déjà défini dans `docker-compose.yml` et dépend de `db` et `cache`.

1. Créez un fichier `.env` dans ce dossier (ou configurez vos secrets dans Compose).
2. À la racine du projet, lancez:

```cmd
docker compose up --build
```

L’API sera accessible sur le réseau interne Docker via `http://backend:5000`. Si un proxy Nginx est en place, l’accès externe se fera via le `proxy`.

## Démarrage local (hors Docker)
1. Node 20 installé
2. Installer les deps: `npm install`
3. Exporter les variables d’env (ou `.env` + `dotenv` dans votre code)
4. Lancer en dev: `npm run dev`

Assurez-vous que Postgres et Redis sont accessibles (par exemple via Docker Compose en parallèle).

## Santé et observabilité
- Endpoint santé (recommandé): `GET /health` retournant `{ status: "ok" }`
- Logs JSON et `LOG_LEVEL`
- (Optionnel) métriques Prometheus

## Migrations et schéma (si applicable)
- Si vous utilisez Prisma/TypeORM/Knex, exposez des scripts: `npm run migrate` / `npm run prisma:migrate`.
- Exécutez les migrations au démarrage ou via un job séparé.

## Sécurité
- Ne commitez pas de secrets. Utilisez variables d’env / gestionnaire de secrets.
- Validez et nettoyez l’input.
- Activez CORS selon les besoins du frontend.

## Dépannage
- Si `backend` démarre avant `db`, Compose a un healthcheck pour `db`/`cache`. L’API doit toutefois tolérer les reconnexions.
- Vérifiez que `PORT` correspond à celui écouté par votre serveur.

