# Cahier des charges – Ymmovest

---

## 1. Présentation du sujet Web service

**Sujet :** Outil web interactif de simulation et d'analyse d'investissement immobilier locatif.

**Objectif :** Permettre aux investisseurs particuliers, professionnels de l'immobilier et gestionnaires de patrimoine d'évaluer la rentabilité potentielle d'un bien immobilier locatif en France grâce à des données foncières réelles, des estimations de loyers et des simulations financières personnalisées.

---

## 2. Matrice SWOT

| **Forces** | **Faiblesses** |
|------------|----------------|
| - Algorithmes personnalisés : rentabilité, cash flow, TRI | - Nécessité de formation continue sur les API et données immobilières |
| Utilisation de l'IA | - Ressources limitées (temps, budget, équipe) |
| Maîtrise des technologies | - Couverture fonctionnelle encore inférieure aux outils professionnels établis |

| **Opportunités** | **Menaces** |
|------------------|-------------|
| - Accès à des données foncières publiques fiables (DVF, Banque de France) |  - Volatilité du marché immobilier 
| - Forte demande d'outils de simulation pour investisseurs particuliers | - Concurrence croissante des plateformes de simulation professionnelles |
| - Démocratisation de l'investissement locatif en France | - Changement ou fermeture d'API (DVF, Banque de France) |
| - Potentiel de partenariats avec agences immobilières, courtiers et gestionnaires | - Risques liés à la réglementation des données (RGPD) |
| - Croissance du marché de l'analyse de données immobilières | - Qualité et granularité variables des données selon les zones géographiques |
| - Évolution vers des décisions d'investissement basées sur la data ||

---


## 3. Diagramme Bête à cornes

### Représentation graphique

```
        ╭─────────────────────────╮                     ╭─────────────────────────╮
       ╱                           ╲                   ╱                           ╲
      │                            │                  │                            │
      │  • Investisseurs           │                  │  • Données foncières       │
      │    particuliers            │                  │    (DVF+)                  │
      │  • Professionnels          │                  │  • Marchés immobiliers     │
      │    de l'immobilier         │                  │  • Estimations prix        │
      │  • Gestionnaires           │                  │    et loyers               │
      │    de patrimoine           │                  │  • Taux de crédit          │
      │  • Agences immobilières    │                  │  • Simulations             │
       ╲                           ╱                    ╲    financières           ╱
        ╰─────────────┬───────────╯                      ╰────────┬──────────────╯
                      │                                           │
                      │                                           │
                      └───────────────────┬───────────────────────┘
                                          │
                                          ▼
                              ╭─────────────────────────╮
                             ╱                           ╲
                            │         YMMOVEST           │
                            │                            │
                            │   Simulateur d'estimation  │
                            │   et d'analyse             │
                            │   d'investissement         │
                            │   immobilier locatif       │
                             ╲                           ╱
                              ╰───────────┬─────────────╯
                                          │
                                          │
                                          ▼
                              ╭───────────────────────────╮
                             ╱                             ╲
                            │                              │
                            │  Faciliter la prise de       │
                            │  décision d'investissement   │
                            │  en estimant la rentabilité  │
                            │  potentielle d'un bien       │
                            │  immobilier locatif          │
                             ╲                             ╱
                              ╰───────────────────────────╯
```

---

## 4. Diagramme Pieuvre

### Représentation graphique

```
    ╭──────────────────────────╮                              ╭──────────────────────────╮
   ╱  INVESTISSEURS            ╲         FP1, FP2, FP4       ╱   DONNÉES DVF+            ╲
  │   • Particuliers            │◄────────────────────────── │   • Transactions          │
  │   • Professionnels          │         (Recherche,        │   • Prix immobiliers      │
  │   • Gestionnaires           │       Estimation prix,     │   • Statistiques marché   │
  │     patrimoine              │        Simulation)         │                           │
  │   • Agences immobilières    │                            │  ┌────────────────────┐  │
   ╲                           ╱                              ╲ │ FC1: Connexion API │ ╱
    ╰──────────┬───────────────╯                              ╰─┤ FC2: Adaptation    ├─╯
               │                                                └────────────────────┘
               │ FP5: Visualisation                                      │
               │      des données                         ┌──────────────┴─────────────┐
               │                                          │ FC3: Continuité de service │
               │              ╭────────────────────────╮  └────────────────┬───────────┘
               │             ╱                          ╲                  │
               └────────────│        YMMOVEST           │◄─────────────────┘
                            │                           │
  ┌──────────────────────┐  │     Simulateur            │  ┌──────────────────────┐
  │ FC7: Compatibilité   │─►│     Immobilier            │◄─│ FC6: Respect des     │
  │      navigateurs     │  │                           │  │      licences        │
  └──────────────────────┘  │                           │  └──────────────────────┘
                            │                           │
  ┌──────────────────────┐  │                           │  ┌──────────────────────┐
  │ FC8: Multi-support   │─►│                           │◄─│ FC4: Conformité RGPD │
  │    (Responsive)      │   ╲                          ╱  │ FC5: Protection      │
  └──────────────────────┘    ╰──────────┬──────────────╯  │      des données     │
                                         │                  └──────────────────────┘
                                         │ FP3: Estimation
                                         │      loyers
                            ╭────────────▼──────────────╮
                           ╱   MARCHÉS IMMOBILIERS      ╲
                          │   • Taux de crédit           │
                          │   • Loyers médians           │
                          │   • Évolutions du marché     │
                          │   • Rendements locatifs      │
                           ╲                             ╱
                            ╰────────────┬───────────────╯
                                         │
                          ┌──────────────┴────────────────┐
                          │ FC9: Dépendance Internet      │
                          │ FC10: Performance applicative │
                          └──────────────┬────────────────┘
                            ╭────────────▼───────────────╮
                           ╱      ENVIRONNEMENT          ╲
                          │   • Navigateurs web           │
                          │   • Connexion Internet        │
                          │   • Multi-devices (PC,        │
                          │     tablette, mobile)         │
                           ╲                              ╱
                            ╰────────────────────────────╯
```

### Légende

**FP = Fonction Principale** : Interaction directe entre Ymmovest et ses utilisateurs/données pour répondre au besoin  
**FC = Fonction Contrainte** : Contrainte technique, légale ou ergonomique imposée par l'environnement
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
| **FC10** | Performance applicative | Garantir des temps de réponse acceptables (< 2s pour les requêtes) |

---

## 5. Analyse des contraintes et besoins


### Contraintes



* **Techniques :**
    * Outil accessible via navigateur web (connexion Internet requise)
    * Données issues d'API publiques (DVF+, Banque de France)
    * Architecture conteneurisée (Docker)
    * Base de données PostgreSQL pour stockage local
* **Légales :**
    * Respect du RGPD
    * Hébergement des données en Europe
    * Respect des licences de données publiques
* **Ergonomiques :**
    * Interface en français
    * Design responsive (mobile-first)
    * Temps de chargement &lt; 2 secondes


### Besoins Fonctionnels

| ID | Besoin | Description |
|----|--------|-------------|
| **BF1** | Recherche par commune | Recherche par nom, code postal ou code INSEE avec autocomplétion |
| **BF2** | Affichage des statistiques | Visualisation des prix médians, min, max et évolution sur 1 an |
| **BF3** | Estimation de loyer | Calcul du loyer mensuel estimé selon surface et type de bien |
| **BF4** | Simulation financière | Calcul de rentabilité, cash flow, rendement brut/net |
| **BF5** | Comparaison de biens | Comparer plusieurs communes ou biens côte à côte |
| **BF6** | Gestion administrative | Interface admin pour gérer communes et utilisateurs |
| **BF7** | Authentification | Connexion sécurisée pour les administrateurs |
| **BF8** | Actualisation des données | Mise à jour périodique des données via API |

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
| **Gestionnaire de patrimoine** | Conseiller accompagnant des clients dans leurs investissements | • Analyse comparative<br>• Personnalisation des paramètres<br>• Données à jour |
| **Agent immobilier** | Professionnel aidant les clients à évaluer des opportunités | • Accès rapide aux statistiques<br>• Estimation de loyers<br>• Arguments de vente<br>• Interface claire |

### Utilisateurs Techniques

| Profil | Description | Responsabilités |
|--------|-------------|-----------------|
| **Administrateur système** | Supervise le bon fonctionnement de l'application | • Gestion des comptes utilisateurs<br>• Gestion des droits d'accès<br>• Surveillance de la sécurité<br>• Maintenance des serveurs |
| **Gestionnaire de données (Data Manager)** | Contrôle la qualité et la mise à jour des données | • Validation des données importées<br>• Surveillance des erreurs de flux<br>• Contrôle qualité<br>• Mise à jour des communes |
| **Développeur / Technicien web** | Intervient pour corriger les anomalies techniques | • Correction des bugs<br>• Maintenance des connexions API<br>• Mise à jour du code<br>• Optimisation des performances |

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
| **US6** | Agent immobilier | Accéder aux statistiques d'évolution des prix | Argumenter mes propositions auprès des clients |

### Pour les Utilisateurs Techniques

| ID | En tant que... | Je veux... | Afin de... |
|----|----------------|-----------|------------|
| **US7** | Administrateur | Ajouter, modifier ou supprimer des communes | Maintenir la base de données à jour |
| **US8** | Administrateur | Gérer les comptes utilisateurs (créer, modifier, supprimer) | Contrôler les accès à l'application |
| **US9** | Gestionnaire de données | Disposer de tableaux de bord de qualité des données | Garantir la fiabilité des visualisations |
| **US10** | Développeur | Visualiser les logs d'erreurs et métriques d'utilisation | Optimiser les performances de l'application |
| **US11** | Développeur | Accéder à la documentation API complète (OpenAPI) | Faciliter le développement et la maintenance |
| **US12** | Administrateur | Me connecter de manière sécurisée avec authentification | Protéger l'accès aux fonctions d'administration |

---

## 9. Architecture en web services de la solution

### Schéma d'architecture
```
┌──────────────────────────────────────────────────────────┐
│                     UTILISATEUR                          │
│                    (Navigateur Web)                      │
└────────────────────┬─────────────────────────────────────┘
                     │ HTTPS
                     ▼
┌──────────────────────────────────────────────────────────┐
│                  Reverse Proxy                           │
│              • Routage                                   │
│              • SSL/TLS                                   │
└────┬───────────────────────────────────────────┬─────────┘
     │                                           │
     │ /                                         │ /api
     ▼                                           ▼
┌─────────────────┐                    ┌─────────────────────┐
│   FRONTEND      │                    │      BACKEND        │
│                 │                    │                     │
│ • Interface UI  │                    │ • API REST          │
│ • Simulations   │◄───────JSON────────│ • Logique métier    │
│ • Visualisation │                    │ • Gestion données   │
└─────────────────┘                    └──────────┬──────────┘
                                                  │
                                                  │ SQL
                                                  ▼
                                       ┌─────────────────────┐
                                       │   Base de données   │
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

**Frontend :**
* **Framework :** React + TypeScript
* **Routing :** React Router
* **State Management :** Context API
* **Styling :** CSS modules / Tailwind CSS
* **Build :** Vite
* **Conteneurisation :** Docker

**Backend :**
* **Runtime :** Node.js
* **Framework :** Express.js
* **API Documentation :** OpenAPI 3.0 / Swagger UI
* **Authentification :** bcrypt pour hachage des mots de passe
* **Conteneurisation :** Docker

**Base de Données :**
* **SGBD :** PostgreSQL 15
* **Tables principales :**
    * `prix_communes` : données des communes (prix, loyers, statistiques)
    * `users` : utilisateurs et administrateurs
* **Persistance :** Volumes Docker

**Reverse Proxy :**
* **Serveur :** Nginx
* **Rôles :** Routage, SSL/TLS, load balancing

**Orchestration :**
* **Outil :** Docker Compose
* **Services :** frontend, backend, database, nginx

**APIs Externes (donnée issue de ces sources mais non connecté car non dispo public) :**
* **DVF+ (Data.gouv.fr)** : Données de transactions immobilières
* **API Webstat (Banque de France)** : Taux de crédit immobilier
* *Futures :* API d'estimation de loyers, géocodage (OpenStreetMap/Nominatim)

**Hébergement :**
* **Cloud :** AWS / OVH / Render (possibilité)
* **CI/CD :** GitHub Actions (déploiement automatisé) (pas encore implémentée)

**Sécurité :**
* **HTTPS** : Certificats SSL/TLS
* **CORS** : Configuration sécurisée
* **Hachage des mots de passe** : bcrypt (10 rounds)
* **Validation des entrées** : Côté client et serveur
* **RGPD** : Conformité assurée

### Flux de Données

1. **Recherche de commune :**
    1. Utilisateur saisit un nom/code postal
    2. Frontend → Backend `/api/communes?q={query}`
    3. Backend interroge PostgreSQL
    4. Retour liste de communes correspondantes
    5. Affichage des résultats
2. **Affichage des statistiques :**
    6. Utilisateur sélectionne une commune
    7. Frontend → Backend `/api/communes/{code}/stats?type={appartement|maison}`
    8. Backend calcule les statistiques
    9. Retour des prix médian, min, max, évolution
    10. Visualisation graphique
3. **Estimation de loyer :**
    11. Utilisateur saisit une surface
    12. Frontend → Backend `/api/communes/{code}/loyer?surface={X}`
    13. Backend calcule le loyer estimé
    14. Retour loyer min, médian, max + rendement
    15. Affichage des résultats
4. **Connexion administrateur :**
    16. Admin saisit email/password
    17. Frontend → Backend `/api/auth/login` (POST)
    18. Backend vérifie credentials (bcrypt)
    19. Retour token/session
    20. Accès au panel d'administration
5. **Gestion des communes (Admin) :**
    21. Admin CRUD sur communes
    22. Frontend → Backend `/api/admin/communes` (GET/POST/PUT/DELETE)
    23. Backend met à jour PostgreSQL
    24. Confirmation de l'opération
6. **Gestion des utilisateurs (Admin) :**
    25. Admin CRUD sur users
    26. Frontend → Backend `/api/admin/users` (GET/POST/PUT/DELETE)
    27. Backend met à jour PostgreSQL (hachage bcrypt pour passwords)
    28. Confirmation de l'opération

##
## 10. Extensions Futures
### Phase 2 – Améliorations Fonctionnelles
* **Scénarios multiples :** Permettre de tester différentes hypothèses (taux, vacance locative, travaux)
* **Export PDF :** Rapports personnalisés avec graphiques et logos
* **Historique des simulations :** Sauvegarde côté serveur avec compte utilisateur
* **Comparaison avancée :** Comparer jusqu'à 5 biens simultanément
* **Alertes personnalisées :** Notifications sur nouvelles opportunités


### Phase 3 – Intelligence Artificielle
* **Chatbot intelligent :** Assistance conversationnelle pour guider les utilisateurs
    * "Trouve-moi des appartements avec un rendement > 5% à Lyon"
* **Prédictions de prix :** Modèles ML pour anticiper l'évolution des prix
* **Recommandation personnalisée :** Suggestions basées sur le profil investisseur


### Phase 4 – Monétisation
* **Modèle Freemium :**
    * Gratuit : 5 simulations/mois, fonctionnalités de base
    * Premium : Simulations illimitées, exports PDF, scénarios avancés, alertes
* **Partenariats B2B :**
    * Leads qualifiés pour agences immobilières
    * White-label pour courtiers
* **Produits complémentaires :**
    * Assurance loyers impayés
    * Mise en relation avec gestionnaires locatifs


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


<table>
  <tr>
   <td>Terme
   </td>
   <td>Définition
   </td>
  </tr>
  <tr>
   <td><strong>DVF</strong>
   </td>
   <td>Demande de Valeurs Foncières : base de données publique des transactions immobilières en France
   </td>
  </tr>
  <tr>
   <td><strong>TRI</strong>
   </td>
   <td>Taux de Rentabilité Interne : indicateur de rentabilité d'un investissement
   </td>
  </tr>
  <tr>
   <td><strong>Cash Flow</strong>
   </td>
   <td>Flux de trésorerie généré par un investissement (loyers - charges - crédit)
   </td>
  </tr>
  <tr>
   <td><strong>Rendement brut</strong>
   </td>
   <td>(Loyers annuels / Prix d'achat) × 100
   </td>
  </tr>
  <tr>
   <td><strong>Rendement net</strong>
   </td>
   <td>Rendement après déduction des charges, taxes et frais
   </td>
  </tr>
  <tr>
   <td><strong>RGPD</strong>
   </td>
   <td>Règlement Général sur la Protection des Données
   </td>
  </tr>
  <tr>
   <td><strong>MVP</strong>
   </td>
   <td>Minimum Viable Product : version minimale fonctionnelle du produit
   </td>
  </tr>
  <tr>
   <td><strong>API REST</strong>
   </td>
   <td>Interface de programmation permettant l'échange de données via HTTP
   </td>
  </tr>
  <tr>
   <td><strong>PostgreSQL</strong>
   </td>
   <td>Système de gestion de base de données relationnelle open-source
   </td>
  </tr>
  <tr>
   <td><strong>Docker</strong>
   </td>
   <td>Plateforme de conteneurisation d'applications
   </td>
  </tr>
  <tr>
   <td><strong>bcrypt</strong>
   </td>
   <td>Algorithme de hachage sécurisé pour les mots de passe
   </td>
  </tr>
</table>

