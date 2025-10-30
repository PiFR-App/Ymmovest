# Worker (tâches asynchrones)

Ce service exécute des tâches en arrière-plan: appels aux API externes, ingestion, nettoyage, planification, et écrit les données dans Postgres (et/ou Redis).

## TL;DR
- Env requis: `DATABASE_URL`, `REDIS_URL`
- Démarrage en Docker: géré via `docker-compose.yml` (service `worker`)
- Script NPM attendu: `worker` (le Dockerfile exécute `npm run worker`)

## Architecture attendue
- Runtime: Node.js 20
- Accès DB: Postgres (service `db`)
- Cache/queue: Redis (service `cache`) — utile pour des jobs/queues (BullMQ, Bee-Queue, etc.)

## Variables d’environnement
- `DATABASE_URL` (ex: `postgres://user:pass@db:5432/app`)
- `REDIS_URL` (ex: `redis://cache:6379`)
- `NODE_ENV` (ex: `production`)
- `WORKER_CONCURRENCY` (optionnel, ex: `5`)
- `CRON_SCHEDULE` (optionnel, si vous utilisez node-cron)

Voir `.env.example` pour un modèle.

## Scripts NPM attendus
- `worker`: démarre la boucle du worker (ex: `node dist/worker.js` ou `node worker.js`)
- `dev:worker`: version développement (ex: `nodemon src/worker.ts`)
- `test`: tests unitaires éventuels

## Démarrage avec Docker Compose
1. Créez un fichier `.env` dans ce dossier au besoin.
2. À la racine du projet:

```cmd
docker compose up --build
```

Le worker démarrera automatiquement et se connectera à Postgres/Redis lorsque disponibles.

## Stratégie de robustesse
- Reconnexion automatique DB/Redis en cas d’indisponibilité temporaire
- Retry exponentiel sur appels API externes (ex: 429/5xx)
- Circuit breaker/timeouts
- Idempotence lors de l’écriture en DB

## Observabilité
- Logs structurés
- Compteurs de jobs traités/échoués
- (Optionnel) métriques Prometheus

## Sécurité
- Ne commitez pas de secrets.
- Rate limit côté API externe si fourni par vos clés.

