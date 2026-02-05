# Cahier des charges – Ymmovest

---

## 1. Choix du sujet de visualisation web

**Sujet :** Outil web interactif de simulation et d'analyse d'investissement immobilier locatif.

**Objectif :** Permettre aux investisseurs particuliers, professionnels de l'immobilier et gestionnaires de patrimoine d'évaluer la rentabilité potentielle d'un bien immobilier locatif en France grâce à des données foncières réelles, des estimations de loyers et des simulations financières personnalisées.

---

## 2. Matrice SWOT

| **Forces** | **Faiblesses** |
|-----------|---------------|
| - Accès à des données foncières publiques fiables (DVF, Banque de France)<br>- Calculs financiers complets : rentabilité, cash flow, TRI<br>- Interface intuitive et responsive<br>- Architecture moderne et scalable (Docker, PostgreSQL, React)<br>- Positionnement accessible pour particuliers et petits investisseurs | - Nécessité de formation continue sur les API et données immobilières<br>- Ressources limitées (temps, budget, équipe)<br>- Couverture fonctionnelle encore inférieure aux outils professionnels établis<br>- Dépendance aux API externes (DVF, Banque de France) |

| **Opportunités** | **Menaces** |
|-----------------|-------------|
| - Forte demande d'outils de simulation pour investisseurs particuliers<br>- Démocratisation de l'investissement locatif en France<br>- Potentiel de partenariats avec agences immobilières, courtiers et gestionnaires<br>- Croissance du marché de l'analyse de données immobilières<br>- Évolution vers des décisions d'investissement basées sur la data | - Concurrence croissante des plateformes de simulation professionnelles<br>- Changement ou fermeture d'API (DVF, Banque de France)<br>- Risques liés à la réglementation des données (RGPD)<br>- Qualité et granularité variables des données selon les zones géographiques<br>- Volatilité du marché immobilier |

---

## 3. Diagramme Bête à cornes

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   À QUI REND-IL SERVICE ?                                          │
│   • Investisseurs particuliers                                     │
│   • Professionnels de l'immobilier                                │
│   • Gestionnaires de patrimoine                                    │
│   • Agences immobilières                                           │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│                         YMMOVEST                                    │
│         Simulateur d'investissement immobilier                      │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   SUR QUOI AGIT-IL ?                                               │
│   • Données foncières (DVF+)                                       │
│   • Estimations de prix et loyers                                  │
│   • Taux de crédit immobilier                                      │
│   • Simulations financières                                        │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   DANS QUEL BUT ?                                                  │
│   Estimer la rentabilité potentielle d'un investissement           │
│   immobilier locatif et faciliter la prise de décision             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. Diagramme Pieuvre

```
                    ┌──────────────┐
        FC1 ────────│   API DVF+   │
                    └──────────────┘
                           │
                           │
        FC2 ───────────────┼────────────── FC3
                           │
                    ┌──────▼──────┐
        FC4 ────────│             │──────── FC5
                    │  YMMOVEST   │
        FC6 ────────│             │──────── FC7
                    └──────▲──────┘
                           │
                           │
        FC8 ───────────────┼────────────── FC9
                           │
                           │
                    ┌──────┴──────┐
        FC10 ───────│ Utilisateur │
                    └─────────────┘
```

### Fonctions Principales (FP)

| Code | Fonction Principale | Description |
|------|---------------------|-------------|
| **FP1** | Recherche de communes | Permettre à l'utilisateur de rechercher une commune par nom, code postal ou code INSEE |
| **FP2** | Estimation de prix | Calculer une estimation du prix d'achat basée sur les données foncières réelles |
| **FP3** | Estimation de loyers | Estimer le loyer mensuel potentiel selon la localisation, type et surface |
| **FP4** | Simulation financière | Calculer les indicateurs de rentabilité (cash flow, rendement, TRI) |
| **FP5** | Visualisation des données | Afficher graphiques et tableaux de bord interactifs |

### Fonctions Contraintes (FC)

| Code | Fonction Contrainte | Description |
|------|---------------------|-------------|
| **FC1** | Connexion aux API | Se connecter aux API externes (DVF+, Banque de France) |
| **FC2** | Adaptation aux API | Gérer les formats, quotas et limites imposés par les API |
| **FC3** | Continuité de service | Gérer les indisponibilités ou évolutions des API |
| **FC4** | Conformité RGPD | Respecter le Règlement Général sur la Protection des Données |
| **FC5** | Protection des données | Garantir la sécurité et la confidentialité des données utilisateurs |
| **FC6** | Respect des licences | Respecter les droits d'exploitation et licences des données |
| **FC7** | Compatibilité navigateurs | Fonctionner sur les principaux navigateurs web (Chrome, Firefox, Safari, Edge) |
| **FC8** | Multi-support | Être accessible sur différents supports (PC, tablette, mobile) |
| **FC9** | Dépendance Internet | Fonctionner avec une connexion Internet standard |
| **FC10** | Performance applicative | Garantir des temps de réponse acceptables (<2s pour les requêtes) |

---

## 5. Analyse des contraintes et besoins

### Contraintes

- **Technique :**
  - Outil accessible via navigateur web (connexion Internet requise)
  - Données issues d'API publiques (DVF+, Banque de France)
  - Architecture conteneurisée (Docker)
  - Base de données PostgreSQL pour stockage local

- **Légales :**
  - Respect du RGPD
  - Hébergement des données en Europe
  - Respect des licences de données publiques

- **Ergonomiques :**
  - Interface en français
  - Design responsive (mobile-first)
  - Temps de chargement < 2 secondes

### Besoins Fonctionnels

| ID | Besoin | Description |
|----|--------|-------------|
| **BF1** | Recherche par commune | Recherche par nom, code postal ou code INSEE avec autocomplétion |
| **BF2** | Affichage des statistiques | Visualisation des prix médians, min, max et évolution sur 1 an |
| **BF3** | Estimation de loyer | Calcul du loyer mensuel estimé selon surface et type de bien |
| **BF4** | Simulation financière | Calcul de rentabilité, cash flow, rendement brut/net |
| **BF5** | Comparaison de biens | Comparer plusieurs communes ou biens côte à côte |
| **BF6** | Historique de recherches | Sauvegarder les simulations de l'utilisateur |
| **BF7** | Export de rapports | Générer un rapport PDF des simulations |
| **BF8** | Gestion administrative | Interface admin pour gérer communes et utilisateurs |
| **BF9** | Authentification | Connexion sécurisée pour les administrateurs |
| **BF10** | Actualisation des données | Mise à jour périodique des données via API |

### Besoins Non Fonctionnels

| ID | Besoin | Description | Critère de mesure |
|----|--------|-------------|-------------------|
| **BNF1** | Performance | Temps de réponse rapide | < 2s pour 95% des requêtes |
| **BNF2** | Disponibilité | Service accessible en permanence | Uptime > 99% |
| **BNF3** | Sécurité | Protection des données utilisateurs | Chiffrement HTTPS, hachage bcrypt |
| **BNF4** | Ergonomie | Interface intuitive et professionnelle | Taux de satisfaction > 80% |
| **BNF5** | Scalabilité | Capacité à supporter la montée en charge | Support de 1000 utilisateurs simultanés |
| **BNF6** | Maintenabilité | Code propre et documenté | Documentation API complète |
| **BNF7** | Compatibilité | Multi-navigateurs et multi-devices | Support des 5 navigateurs majeurs |
| **BNF8** | Accessibilité | Respect des normes WCAG 2.1 | Niveau AA minimum |

---

## 6. Identification des utilisateurs

### Utilisateurs Finaux

| Profil | Description | Besoins spécifiques |
|--------|-------------|---------------------|
| **Investisseur particulier** | Personne souhaitant réaliser son premier ou prochain investissement locatif | • Interface simple et guidée<br>• Explications pédagogiques<br>• Estimations fiables<br>• Comparaison de plusieurs biens |
| **Investisseur expérimenté** | Professionnel de l'investissement immobilier avec plusieurs biens | • Simulations avancées<br>• Export de rapports<br>• Historique des analyses<br>• Scénarios multiples |
| **Gestionnaire de patrimoine** | Conseiller accompagnant des clients dans leurs investissements | • Analyse comparative<br>• Personnalisation des paramètres<br>• Export professionnel<br>• Données à jour |
| **Agent immobilier** | Professionnel aidant les clients à évaluer des opportunités | • Accès rapide aux statistiques<br>• Estimation de loyers<br>• Arguments de vente<br>• Interface claire |

### Utilisateurs Techniques

| Profil | Description | Responsabilités |
|--------|-------------|-----------------|
| **Administrateur système** | Supervise le bon fonctionnement de l'application | • Gestion des comptes utilisateurs<br>• Gestion des droits d'accès<br>• Surveillance de la sécurité<br>• Maintenance des serveurs |
| **Gestionnaire de données (Data Manager)** | Contrôle la qualité et la mise à jour des données | • Validation des données importées<br>• Surveillance des erreurs de flux<br>• Contrôle qualité<br>• Mise à jour des communes |
| **Développeur / Technicien web** | Intervient pour corriger les anomalies techniques | • Correction des bugs<br>• Maintenance des connexions API<br>• Mise à jour du code<br>• Optimisation des performances |
| **Analyste produit / Responsable technique** | Suit les performances et planifie les évolutions | • Analyse des retours utilisateurs<br>• Suivi des KPI<br>• Planification des features<br>• Veille technologique |

---

## 7. User Stories

### Pour les Utilisateurs Finaux

| ID | En tant que... | Je veux... | Afin de... |
|----|----------------|-----------|------------|
| **US1** | Investisseur particulier | Rechercher une commune par son nom ou code postal | Trouver rapidement les informations immobilières d'une zone |
| **US2** | Investisseur particulier | Visualiser les prix au m² (médian, min, max) | Évaluer le prix du marché avant d'investir |
| **US3** | Investisseur particulier | Estimer le loyer mensuel selon la surface | Calculer mes revenus locatifs potentiels |
| **US4** | Investisseur expérimenté | Comparer plusieurs communes côte à côte | Identifier les meilleures opportunités d'investissement |
| **US5** | Investisseur expérimenté | Calculer le rendement locatif brut et net | Évaluer la rentabilité de mon investissement |
| **US6** | Gestionnaire de patrimoine | Exporter un rapport PDF de mes simulations | Présenter une analyse professionnelle à mes clients |
| **US7** | Gestionnaire de patrimoine | Sauvegarder mes simulations | Retrouver mes analyses précédentes |
| **US8** | Agent immobilier | Accéder aux statistiques d'évolution des prix | Argumenter mes propositions auprès des clients |
| **US9** | Investisseur | Visualiser l'historique des transactions | Comprendre la dynamique du marché local |
| **US10** | Investisseur | Filtrer les communes selon critères de rentabilité | Cibler les zones les plus intéressantes |

### Pour les Utilisateurs Techniques

| ID | En tant que... | Je veux... | Afin de... |
|----|----------------|-----------|------------|
| **US11** | Administrateur | Ajouter, modifier ou supprimer des communes | Maintenir la base de données à jour |
| **US12** | Administrateur | Gérer les comptes utilisateurs (créer, modifier, supprimer) | Contrôler les accès à l'application |
| **US13** | Administrateur | Visualiser l'état des connexions API en temps réel | Anticiper les pannes et interruptions de service |
| **US14** | Gestionnaire de données | Disposer de tableaux de bord de qualité des données | Garantir la fiabilité des visualisations |
| **US15** | Gestionnaire de données | Voir les taux de complétude et erreurs de synchronisation | Identifier et corriger les problèmes de données |
| **US16** | Développeur | Visualiser les logs d'erreurs et métriques d'utilisation | Optimiser les performances de l'application |
| **US17** | Développeur | Accéder à la documentation API complète (OpenAPI) | Faciliter le développement et la maintenance |
| **US18** | Analyste produit | Suivre les fonctionnalités les plus utilisées | Identifier les améliorations prioritaires |
| **US19** | Analyste produit | Analyser le parcours utilisateur | Optimiser l'UX et le taux de conversion |
| **US20** | Administrateur | Me connecter de manière sécurisée avec authentification | Protéger l'accès aux fonctions d'administration |

---

## 8. KPI (Indicateurs Clés de Performance)

### Pour les Investisseurs

**Objectif :** Évaluer la rentabilité d'un investissement immobilier

**KPIs clés :**
- **Prix moyen au m²** (médian, min, max)
- **Évolution des prix sur 1 an** (%)
- **Loyer mensuel estimé** (€/mois)
- **Rendement locatif brut** (%)
- **Rendement locatif net** (%)
- **Cash flow mensuel** (€/mois)
- **TRI (Taux de Rentabilité Interne)** (%)
- **Nombre de transactions** (indicateur de liquidité)

**Visuels :** Cartes de synthèse, graphiques d'évolution, tableaux comparatifs

---

### Pour les Gestionnaires de Patrimoine

**Objectif :** Comparer plusieurs opportunités d'investissement

**KPIs clés :**
- **Classement des communes par rentabilité**
- **Ratio prix/loyer**
- **Évolution du marché (tendances)**
- **Zone de prix (accessible/premium)**
- **Potentiel de plus-value**

**Visuels :** Tableaux comparatifs, quadrants rendement/risque, cartes thermiques

---

### Pour les Agents Immobiliers

**Objectif :** Argumenter les propositions commerciales

**KPIs clés :**
- **Prix médian du marché**
- **Fourchette de prix (min/max)**
- **Loyer médian au m²**
- **Dynamique du marché** (nombre de transactions)
- **Évolution des prix**

**Visuels :** Statistiques de marché, graphiques d'évolution, comparatifs zone

---

### Pour les Administrateurs Système

**Objectif :** Supervision technique de la plateforme

**KPIs clés :**
- **Uptime API** (%)
- **Latence moyenne** (ms)
- **Taux d'erreurs API** (%)
- **Volume d'appels API** (nombre/jour)
- **Dernière synchronisation réussie** (date/heure)
- **Nombre d'utilisateurs actifs** (DAU/MAU)

**Visuels :** Dashboard temps réel, alertes, graphiques de disponibilité

---

### Pour les Gestionnaires de Données

**Objectif :** Assurer la qualité des données

**KPIs clés :**
- **Taux de complétude des données** (%)
- **Fraîcheur des données** (dernière mise à jour)
- **Erreurs de synchronisation** (nombre)
- **Taux d'incohérences** (%)
- **Score qualité global** (/100)
- **Couverture géographique** (% communes)

**Visuels :** Score qualité, heatmap des données manquantes, timeline de synchronisation

---

### Pour les Développeurs

**Objectif :** Maintenir les performances et la stabilité

**KPIs clés :**
- **Taux d'erreurs applicatives** (%)
- **Temps de réponse moyen** (ms)
- **Pages les plus lentes** (top 5)
- **Crash rate** (%)
- **Top des erreurs** (Pareto)
- **Taux de disponibilité** (%)

**Visuels :** Timeline des erreurs, diagrammes de Pareto, métriques de performance

---

### Pour les Analystes Produit

**Objectif :** Optimiser l'usage et l'adoption

**KPIs clés :**
- **DAU / MAU** (utilisateurs actifs quotidiens/mensuels)
- **Pages les plus consultées**
- **Durée moyenne de session** (minutes)
- **Funnel de conversion** (recherche → simulation → export)
- **Taux de rebond** (%)
- **Taux de rétention** (%)
- **NPS (Net Promoter Score)**

**Visuels :** Ranking des pages, funnel de navigation, courbes de rétention

---

## 9. Architecture de la solution

### Architecture Technique

**Frontend :**
- **Framework :** React + TypeScript
- **Routing :** React Router
- **State Management :** Context API
- **Styling :** CSS modules / Tailwind CSS
- **Build :** Vite
- **Conteneurisation :** Docker

**Backend :**
- **Runtime :** Node.js
- **Framework :** Express.js
- **API Documentation :** OpenAPI 3.0 / Swagger UI
- **Authentification :** bcrypt pour hachage des mots de passe
- **Conteneurisation :** Docker

**Base de Données :**
- **SGBD :** PostgreSQL 15
- **Tables principales :**
  - `prix_communes` : données des communes (prix, loyers, statistiques)
  - `users` : utilisateurs et administrateurs
- **Persistance :** Volumes Docker

**Reverse Proxy :**
- **Serveur :** Nginx
- **Rôles :** Routage, SSL/TLS, load balancing

**Orchestration :**
- **Outil :** Docker Compose
- **Services :** frontend, backend, database, nginx

**APIs Externes :**
- **DVF+ (Data.gouv.fr)** : Données de transactions immobilières
- **API Webstat (Banque de France)** : Taux de crédit immobilier
- *Futures :* API d'estimation de loyers, géocodage (OpenStreetMap/Nominatim)

**Hébergement :**
- **Cloud :** AWS / OVH / Render
- **CI/CD :** GitHub Actions (déploiement automatisé)

**Sécurité :**
- **HTTPS** : Certificats SSL/TLS
- **CORS** : Configuration sécurisée
- **Hachage des mots de passe** : bcrypt (10 rounds)
- **Validation des entrées** : Côté client et serveur
- **RGPD** : Conformité assurée

---

### Schéma d'Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     UTILISATEUR                          │
│                    (Navigateur Web)                      │
└────────────────────┬─────────────────────────────────────┘
                     │ HTTPS
                     ▼
┌──────────────────────────────────────────────────────────┐
│                  NGINX (Reverse Proxy)                   │
│              • Routage                                   │
│              • SSL/TLS                                   │
└────┬───────────────────────────────────────────┬─────────┘
     │                                           │
     │ /                                         │ /api
     ▼                                           ▼
┌─────────────────┐                    ┌─────────────────────┐
│   FRONTEND      │                    │      BACKEND        │
│   (React + TS)  │                    │    (Express.js)     │
│                 │                    │                     │
│ • Interface UI  │                    │ • API REST          │
│ • Simulations   │◄───────JSON────────│ • Logique métier    │
│ • Visualisation │                    │ • Gestion données   │
└─────────────────┘                    └──────────┬──────────┘
                                                  │
                                                  │ SQL
                                                  ▼
                                       ┌─────────────────────┐
                                       │   PostgreSQL 15     │
                                       │                     │
                                       │ • prix_communes     │
                                       │ • users             │
                                       └─────────────────────┘
                                                  ▲
                                                  │
                                       ┌──────────┴──────────┐
                                       │   APIs Externes     │
                                       │                     │
                                       │ • DVF+              │
                                       │ • Banque de France  │
                                       └─────────────────────┘
```

---

### Flux de Données

1. **Recherche de commune :**
   - Utilisateur saisit un nom/code postal
   - Frontend → Backend `/api/communes?q={query}`
   - Backend interroge PostgreSQL
   - Retour liste de communes correspondantes
   - Affichage des résultats

2. **Affichage des statistiques :**
   - Utilisateur sélectionne une commune
   - Frontend → Backend `/api/communes/{code}/stats?type={appartement|maison}`
   - Backend calcule les statistiques
   - Retour des prix médian, min, max, évolution
   - Visualisation graphique

3. **Estimation de loyer :**
   - Utilisateur saisit une surface
   - Frontend → Backend `/api/communes/{code}/loyer?surface={X}`
   - Backend calcule le loyer estimé
   - Retour loyer min, médian, max + rendement
   - Affichage des résultats

4. **Connexion administrateur :**
   - Admin saisit email/password
   - Frontend → Backend `/api/auth/login` (POST)
   - Backend vérifie credentials (bcrypt)
   - Retour token/session
   - Accès au panel d'administration

5. **Gestion des communes (Admin) :**
   - Admin CRUD sur communes
   - Frontend → Backend `/api/admin/communes` (GET/POST/PUT/DELETE)
   - Backend met à jour PostgreSQL
   - Confirmation de l'opération

6. **Gestion des utilisateurs (Admin) :**
   - Admin CRUD sur users
   - Frontend → Backend `/api/admin/users` (GET/POST/PUT/DELETE)
   - Backend met à jour PostgreSQL (hachage bcrypt pour passwords)
   - Confirmation de l'opération

---

## 10. Extensions Futures

### Phase 2 – Améliorations Fonctionnelles

- **Scénarios multiples :** Permettre de tester différentes hypothèses (taux, vacance locative, travaux)
- **Export PDF avancé :** Rapports personnalisés avec graphiques et logos
- **Historique des simulations :** Sauvegarde côté serveur avec compte utilisateur
- **Comparaison avancée :** Comparer jusqu'à 5 biens simultanément
- **Alertes personnalisées :** Notifications sur nouvelles opportunités

### Phase 3 – Intelligence Artificielle

- **Chatbot intelligent :** Assistance conversationnelle pour guider les utilisateurs
  - "Trouve-moi des appartements avec un rendement > 5% à Lyon"
- **Prédictions de prix :** Modèles ML pour anticiper l'évolution des prix
- **Recommandation personnalisée :** Suggestions basées sur le profil investisseur

### Phase 4 – Monétisation

- **Modèle Freemium :**
  - Gratuit : 5 simulations/mois, fonctionnalités de base
  - Premium : Simulations illimitées, exports PDF, scénarios avancés, alertes
- **Partenariats B2B :**
  - Leads qualifiés pour agences immobilières
  - White-label pour courtiers
- **Produits complémentaires :**
  - Assurance loyers impayés
  - Mise en relation avec gestionnaires locatifs

---

## 11. Défis et Solutions

| Défi / Risque | Solution ou mitigation |
|---------------|------------------------|
| **Qualité/granularité des données DVF** | • Tolérer zones d'incertitude<br>• Permettre à l'utilisateur de compléter les données<br>• Afficher des fourchettes plutôt que des valeurs précises |
| **Mise à jour & latence des données** | • Indiquer la date de dernière mise à jour<br>• Mise en cache des données fréquentes<br>• Combiner avec d'autres sources plus fraîches |
| **Modélisation de l'estimation** | • Utiliser des modèles de régression<br>• Calibrage local par zones<br>• Afficher des intervalles de confiance |
| **Réglementations & conformité** | • Respecter le RGPD strictement<br>• Hébergement données en Europe<br>• Politique de confidentialité claire |
| **Scalabilité & coûts d'API** | • Limiter les appels API (rate limiting)<br>• Mettre en cache les résultats<br>• Facturer selon l'usage (freemium) |
| **Interface utilisateur complexe** | • Design simple et épuré<br>• Tutoriels intégrés<br>• Progressive disclosure (affichage progressif) |
| **Fiabilité des taux & conditions de crédit** | • Afficher des marges d'erreur<br>• Proposer des fourchettes<br>• Mettre à jour régulièrement |
| **Erreur bcrypt (Exec format error)** | • Reconstruire l'image Docker<br>• Utiliser bcryptjs (pure JS) au lieu de bcrypt (natif)<br>• Vérifier compatibilité architecture (x86/ARM) |

---

## 12. Planning Prévisionnel

| Phase | Durée | Livrables |
|-------|-------|-----------|
| **Phase 1 : Analyse & Conception** | 2 semaines | • Cahier des charges validé<br>• Maquettes UI/UX<br>• Architecture technique détaillée |
| **Phase 2 : Développement MVP** | 6 semaines | • Frontend (recherche, stats, simulation)<br>• Backend (API REST, base de données)<br>• Authentification admin<br>• Déploiement Docker |
| **Phase 3 : Tests & Validation** | 2 semaines | • Tests unitaires et d'intégration<br>• Tests utilisateurs<br>• Corrections de bugs |
| **Phase 4 : Déploiement & Documentation** | 1 semaine | • Mise en production<br>• Documentation complète<br>• Formation utilisateurs |
| **Phase 5 : Maintenance & Évolutions** | Continue | • Corrections bugs<br>• Ajout de fonctionnalités<br>• Optimisations |

---

## 13. Critères de Succès

| Critère | Objectif | Mesure |
|---------|----------|--------|
| **Adoption** | Attirer des utilisateurs | 500 utilisateurs actifs en 3 mois |
| **Satisfaction** | Retours positifs | NPS > 50 |
| **Performance** | Application rapide | Temps de réponse < 2s |
| **Disponibilité** | Service fiable | Uptime > 99% |
| **Qualité des données** | Données fiables | Taux de complétude > 95% |
| **Conversion** | Engagement utilisateur | Taux de simulation > 60% |
| **Sécurité** | Aucune faille majeure | 0 incident de sécurité |

---

## 14. Glossaire

| Terme | Définition |
|-------|------------|
| **DVF** | Demande de Valeurs Foncières : base de données publique des transactions immobilières en France |
| **TRI** | Taux de Rentabilité Interne : indicateur de rentabilité d'un investissement |
| **Cash Flow** | Flux de trésorerie généré par un investissement (loyers - charges - crédit) |
| **Rendement brut** | (Loyers annuels / Prix d'achat) × 100 |
| **Rendement net** | Rendement après déduction des charges, taxes et frais |
| **RGPD** | Règlement Général sur la Protection des Données |
| **MVP** | Minimum Viable Product : version minimale fonctionnelle du produit |
| **API REST** | Interface de programmation permettant l'échange de données via HTTP |
| **PostgreSQL** | Système de gestion de base de données relationnelle open-source |
| **Docker** | Plateforme de conteneurisation d'applications |
| **bcrypt** | Algorithme de hachage sécurisé pour les mots de passe |

---

## 15. Contacts et Équipe

| Rôle | Responsabilité |
|------|----------------|
| **Chef de projet** | Coordination générale, suivi planning |
| **Product Owner** | Définition fonctionnelle, priorisation backlog |
| **Développeur Frontend** | Interface React, UX/UI |
| **Développeur Backend** | API Express, gestion données |
| **DevOps** | Architecture, déploiement, monitoring |
| **Data Analyst** | Qualité des données, modélisation |

---

**Date de rédaction :** 5 février 2026  
**Version :** 1.0  
**Statut :** Validé

---

*Document de travail - Ymmovest - Tous droits réservés*
