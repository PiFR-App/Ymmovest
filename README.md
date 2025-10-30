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