## 🏠 **Simulateur d’investissement immobilier**

### Concept :

L’app estime la rentabilité potentielle d’un bien immobilier à voaction de location à partir d’une adresse ou ville / prix du m², en incluant taxes, loyers, etc.

## Sommaire

1. Une **liste d’APIs ouvertes utiles** (et leurs liens)
2. Un **cahier des charges plus poussé / aperçu fonctionnel** : les modules, les données, le flux de l’app

---

## 1. APIs ouvertes utiles & liens

Voici des APIs / sources de données “open” ou semi-ouvertes que tu peux exploiter en France :

| API / source                                                      | Ce que ça fournit                                                               | Lien / info utile                                                                                                           |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **DVF / Données foncières**                                       | Transactions immobilières réelles (vente, prix, date, localisation) depuis 2014 | API DVF+ sur Data.gouv : **“API DVF +”** permet d’accéder aux valeurs de ventes et mutations foncières. ([data.gouv.fr][1]) |
| **Baromètre des prix au m² – estimation immobilière (data.gouv)** | Estimations de prix au m² par commune, rue, zone                                | Baromètre des prix au m² & estimation immobilière ([data.gouv.fr][2])                                                       |
| **Webstat – Banque de France**                                    | Séries statistiques : taux de crédit immobilier, coût du crédit, etc.           | API / Webstat guide Banque de France ([webstat.banque-france.fr][3])                                                        |

Notes :

- L’API **DVF+** est particulièrement centrale, car c’est la source des transactions réelles (prix, dates, adresses).
- L’API de la Banque de France (Webstat) permet de récupérer des séries historiques de taux.

1 : https://www.data.gouv.fr/es/dataservices/api-dvf "API DVF + - Trouvez les valeurs de ventes et + encore - Data Gouv"

2 : https://www.data.gouv.fr/reuses/barometre-des-prix-au-m2-et-estimation-immobiliere "Baromètre des prix au m² et estimation immobilière - Data.gouv"

3 : https://webstat.banque-france.fr/fr/pages/guide-migration-api "Guide de l'API Webstat - Banque de France"

---

## 2. Spécification plus détaillée du projet

### 2.1. Fonctions principales (MVP)

Voici les modules essentiels à prévoir :

| Module                                  | Fonctionnalité                                                                     | Données nécessaires                                                                       |
| --------------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **Recherche & saisie du bien**          | L’utilisateur renseigne une adresse, un type (appartement, maison), surface, etc.  | Géocodage, API d’adresses (OpenStreetMap / Nominatim)                                     |
| **Historique du marché local**          | Afficher les ventes récentes autour (quartier, rue)                                | DVF+, filtrage spatial                                                                    |
| **Estimation du prix d’achat / valeur** | Estimer un prix de marché réaliste                                                 | Modèles statistiques + données de ventes comparables                                      |
| **Estimation des loyers & revenus**     | Proposer un loyer possible selon localisation, type, surface                       | Base de données loyers ou estimation selon grille de marché                               |
| **Intégration des taux de crédit**      | Récupérer les taux actuels (prêts immobiliers) pour simuler le coût du financement | API Webstat (Banque de France) pour taux effectifs moyens ([webstat.banque-france.fr][5]) |
| **Back-office**                         | Récupération et traitement des données                                             | Serveur / base de données / API interne                                                   |

### 2.2. Architecture & flux de données (simplifié)

1. L’utilisateur entre l’adresse ou indique une ville et une surface en m²
2. Le système interroge DVF+ pour les ventes dans le voisinage
3. Le système construit une estimation de prix
4. On va chercher les taux de crédit via l’API Banque de France
5. On calcule les indicateurs financiers (cash flow, rentabilité, TRI, etc.)
6. On affiche les résultats + scénarios

### 2.3. Technologies utilisées
- Frontend
    - React - Typescript
        - Simple à mettre en place et aisance du groupe sur cette technologie, très largement utilisé aujourd'hui
- Backend
    - Express.js
        - Simple et rapide à mettre en place, pas de grosse charge à supporter
- Orchestration
    - Docker et docker-compose
        - Pour séparer le front et le back dans différents conteneurs, et docker-compose nous servira à lancer ces différents conteneurs plus simplement.

---

## 3. Assistant immobilier (Chatbot IA)

### 3.1. Vue d'ensemble

L'application intègre un assistant IA spécialisé dans l'immobilier, accessible depuis l'interface via un composant dédié. Il repose sur l'API **Groq** (modèle `llama-3.3-70b-versatile`) et propose **4 architectures de communication** sélectionnables à la volée par l'utilisateur.

### 3.2. Stack technique

| Couche | Technologie | Rôle |
|---|---|---|
| **Service IA** | FastAPI (Python) | Expose les architectures REST synchrone et asynchrone/polling |
| **Backend principal** | Express.js (Node.js) | Expose les architectures SSE et WebSocket, proxy vers Groq |
| **LLM** | Groq API — `llama-3.3-70b-versatile` | Génération de texte, streaming token par token |
| **Frontend** | React / TypeScript + MUI | Interface chat, sélection d'architecture, affichage des métriques |

### 3.3. Architectures de communication

#### Architecture 1 — REST Synchrone

- **Endpoint** : `POST /api/groq/chat`
- **Fonctionnement** : la requête attend la réponse complète de Groq avant de renvoyer le JSON. Simple et sans état.
- **Quand l'utiliser** : réponses courtes, latence acceptable, client HTTP standard.

```
Client ──POST /api/groq/chat──► Backend ──► Groq API
Client ◄──── JSON { response } ────────────────────
```

---

#### Architecture 2 — REST Asynchrone + Polling

- **Endpoints** :
  - `POST /api/chat/async` → retourne immédiatement un `task_id` (HTTP 202)
  - `GET /api/tasks/{task_id}` → interrogé périodiquement (toutes les 1 500 ms) pour récupérer le résultat
- **Fonctionnement** : le service Python (FastAPI) lance le traitement Groq dans un thread daemon et stocke le résultat en mémoire. Le client interroge régulièrement jusqu'à obtenir `status: "done"`.
- **Quand l'utiliser** : découpler soumission et récupération, tolérance à la latence réseau.

```
Client ──POST /api/chat/async──► FastAPI ──► thread Groq
Client ◄── { task_id } ─────────────────────────────────

Client ──GET /api/tasks/{id}──► FastAPI (polling toutes les 1.5s)
Client ◄── { status: "done", result } ──────────────────
```

---

#### Architecture 3 — HTTP SSE (Server-Sent Events)

- **Endpoint** : `POST /api/groq/chat-stream`
- **Fonctionnement** : le backend Express ouvre une connexion SSE (`Content-Type: text/event-stream`) et envoie les tokens Groq au fur et à mesure (`data: { content }\n\n`). La réponse s'affiche progressivement côté client via `ReadableStream`.
- **Quand l'utiliser** : streaming unidirectionnel serveur → client, affichage progressif de la réponse.

```
Client ──POST /api/groq/chat-stream──► Backend
Client ◄── data: { content: "token1" } ──────── (SSE stream)
Client ◄── data: { content: "token2" } ────────
Client ◄── data: [DONE] ───────────────────────
```

---

#### Architecture 4 — WebSocket

- **Endpoint** : `ws(s)://{host}/ws/chat`
- **Fonctionnement** : connexion WebSocket persistante établie au premier message. Le backend maintient un historique de conversation par connexion (messages `system` + `user` + `assistant` accumulés). Chaque token Groq est pushé en temps réel via `{ type: "stream", token }`. Un heartbeat (ping/pong toutes les 30 s) évite les connexions zombies.
- **Quand l'utiliser** : communication bidirectionnelle, contexte de conversation multi-tours, latence minimale.

```
Client ──WS connect──────────────────────► Backend (connexion persistante)
Client ──{ prompt: "..." }───────────────►
Client ◄── { type: "stream", token: "…" } (token par token)
Client ◄── { type: "done" }
Client ──{ prompt: "suite…" }────────────► (même connexion, contexte conservé)
```

### 3.4. Métriques affichées

Chaque réponse de l'assistant affiche des indicateurs contextuels :

| Indicateur | Architectures concernées | Description |
|---|---|---|
| `latency_ms` | REST synchrone, Polling | Durée de l'appel Groq en ms |
| `tokens_used` | REST synchrone, Polling | Nombre total de tokens consommés |
| `polls` | Polling | Nombre d'appels de polling nécessaires |
| Étiquette d'architecture | Toutes | Badge indiquant le mode utilisé |