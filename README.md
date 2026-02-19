# FantasyRealm Character Manager

Système de gestion de personnages pour le MMORPG **FantasyRealm Online**, développé par le studio  **PixelVerse Studios**.

## Sommaire

- [Présentation](#présentation)
- [Stack technique](#stack-technique)
- [Architecture](#architecture)
- [Structure du projet](#structure-du-projet)
- [Prérequis](#prérequis)
- [Installation (Docker)](#installation-docker)
- [Installation manuelle](#installation-manuelle)
- [Comptes de test](#comptes-de-test)
- [Scripts SQL](#scripts-sql)
- [Commandes utiles](#commandes-utiles)
- [Variables d'environnement](#variables-denvironnement)
- [Fonctionnalités](#fonctionnalités)
- [Sécurité](#sécurité)
- [Conformité](#conformité)
- [Tests](#tests)
- [Déploiement](#déploiement)
- [Documentation](#documentation)
- [Git workflow](#git-workflow)

## Présentation

Application web permettant aux joueurs de :

- **Créer et personnaliser** des personnages (traits du visage, couleurs de peau/yeux/cheveux)
- **Équiper des articles** de personnalisation (vêtements, armures, armes, accessoires)
- **Partager** leurs créations avec la communauté via une galerie publique
- **Commenter et noter** les créations des autres joueurs

L'application intègre un système de **modération** (employés) et d'**administration** (dashboard, gestion des employés, logs d'activité).

## Stack technique

| Composant | Technologie | Version |
|-----------|-------------|---------|
| Frontend | React + TypeScript + Vite | React 19 |
| CSS | Tailwind CSS | 4.x |
| Routage | React Router | v7 |
| Backend | ASP.NET Core Web API | .NET 8 |
| BDD relationnelle | PostgreSQL | 18 |
| BDD NoSQL | MongoDB | 8.0 |
| Hashage MDP | Argon2id | - |
| Auth | JWT Bearer Token | - |
| Email | Brevo API | - |
| Conteneurisation | Docker + Docker Compose | - |
| CI/CD | GitHub Actions | - |

## Architecture

L'application suit une architecture **client-serveur** :

- Le **frontend** (React) communique avec le **backend** (.NET API) via des appels REST en HTTPS avec authentification JWT
- Le backend accède à **PostgreSQL** pour les données relationnelles et à **MongoDB** pour les logs d'activité
- Les emails transactionnels sont envoyés via l'API **Brevo**

### Backend — Clean Architecture et DDD

Le backend est structuré en 4 couches selon les principes de la **Clean Architecture** et du **Domain-Driven Design** :

```
FantasyRealm.Api              → Controllers, politiques d'autorisation
FantasyRealm.Application      → Services métier, DTOs, interfaces (ports)
FantasyRealm.Infrastructure   → Persistence (EF Core, MongoDB), sécurité, email
FantasyRealm.Domain           → Entités, enums, exceptions métier
```

Les principes **SOLID** sont appliqués systématiquement (injection de dépendances, inversion des dépendances, séparation des responsabilités).

Le diagramme d'architecture détaillé est disponible dans [`docs/annexes/architecture-clean.png`](docs/annexes/architecture-clean.png).

### Modèle de données

- **MCD** : [`docs/annexes/mcd.png`](docs/annexes/mcd.png)
- **MLD** : [`docs/annexes/mld.png`](docs/annexes/mld.png)

## Structure du projet

```
fantasyrealm-character-manager/
├── src/
│   ├── frontend/                    # Application React + TypeScript (Vite)
│   └── backend/
│       ├── src/
│       │   ├── FantasyRealm.Api/            # Controllers, Program.cs
│       │   ├── FantasyRealm.Application/    # Services, DTOs, interfaces
│       │   ├── FantasyRealm.Infrastructure/ # Persistence, sécurité, email
│       │   └── FantasyRealm.Domain/         # Entités, enums, exceptions
│       └── tests/
│           ├── FantasyRealm.Tests.Unit/         # Tests unitaires (xUnit)
│           └── FantasyRealm.Tests.Integration/  # Tests d'intégration (Testcontainers)
├── database/
│   ├── sql/                         # Scripts PostgreSQL (schéma + données)
│   └── mongodb/                     # Script d'initialisation MongoDB
├── infra/                           # Docker Compose, configuration pgAdmin
├── docs/                            # Documentation technique, manuels, annexes
└── README.md
```

## Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (pour l'environnement complet)
- [Node.js](https://nodejs.org/) 20 LTS (pour le développement frontend)
- [.NET SDK 8.0](https://dotnet.microsoft.com/download) (pour le développement backend)

## Installation (Docker)

L'ensemble de l'environnement de développement se lance avec Docker Compose.

```bash
# 1. Cloner le repository
git clone https://github.com/pierrick-fonquerne/fantasyrealm-character-manager.git
cd fantasyrealm-character-manager

# 2. Lancer les services
docker compose -f infra/docker-compose.yml up -d --build
```

Au premier lancement, Docker va automatiquement :

- Démarrer PostgreSQL 18, MongoDB 8.0 et pgAdmin
- Exécuter les scripts SQL (`001_init_schema.sql`, `002_seed_test_data.sql`)
- Initialiser MongoDB avec la collection `activity_logs` et ses index
- Builder et démarrer l'API .NET et le frontend React

### Services disponibles

| Service | URL |
|---------|-----|
| Frontend | <http://localhost:5173> |
| API Backend | <http://localhost:5000> |
| Swagger (API docs) | <http://localhost:5000/swagger> |
| pgAdmin | <http://localhost:5050> |
| PostgreSQL | `localhost:5432` |
| MongoDB | `localhost:27017` |

### Commandes Docker utiles

```bash
# Arrêter les services
docker compose -f infra/docker-compose.yml down

# Voir les logs
docker compose -f infra/docker-compose.yml logs -f

# Logs d'un service spécifique
docker compose -f infra/docker-compose.yml logs -f api

# Réinitialiser les bases de données (supprime les volumes)
docker compose -f infra/docker-compose.yml down -v
docker compose -f infra/docker-compose.yml up -d --build
```

## Installation manuelle

<details>
<summary>Instructions sans Docker</summary>

### PostgreSQL

```bash
# Créer la base de données
createdb -U postgres fantasyrealm

# Exécuter les scripts SQL dans l'ordre
psql -U postgres -d fantasyrealm -f database/sql/001_init_schema.sql
psql -U postgres -d fantasyrealm -f database/sql/002_seed_test_data.sql
```

### MongoDB

```bash
# Se connecter à MongoDB et exécuter le script d'initialisation
mongosh fantasyrealm_logs database/mongodb/init-mongo.js
```

### Backend

```bash
cd src/backend
dotnet restore
# Configurer les connexions dans appsettings.Development.json
dotnet run --project src/FantasyRealm.Api
```

### Frontend

```bash
cd src/frontend
npm install
cp .env.example .env
npm run dev
```

</details>

## Scripts SQL

Les scripts SQL sont fournis dans `database/sql/` conformément aux exigences du projet :

| Script | Description |
|--------|-------------|
| `001_init_schema.sql` | Schéma complet : tables, contraintes, index, triggers, données de référence (rôles, classes, types d'articles, emplacements) |
| `002_seed_test_data.sql` | Données de test : comptes utilisateurs, personnages, articles, commentaires |

Le script MongoDB `database/mongodb/init-mongo.js` initialise la collection `activity_logs` avec ses index.

## Commandes utiles

### Frontend (depuis `src/frontend/`)

```bash
npm run dev          # Serveur de développement (Vite)
npm run build        # Build de production
npm run lint         # Vérification ESLint
npm run type-check   # Vérification TypeScript
```

### Backend (depuis `src/backend/`)

```bash
dotnet build         # Compiler la solution
dotnet run --project src/FantasyRealm.Api  # Lancer l'API
dotnet test          # Lancer tous les tests
dotnet test --filter "Category=Unit"       # Tests unitaires uniquement
```

## Variables d'environnement

### Backend (Railway / Docker)

| Variable | Description |
|----------|-------------|
| `ASPNETCORE_ENVIRONMENT` | Environnement (`Development`, `Staging`, `Production`) |
| `ConnectionStrings__PostgreSQL` | Chaîne de connexion PostgreSQL |
| `ConnectionStrings__MongoDB` | Chaîne de connexion MongoDB |
| `Jwt__SecretKey` | Clé secrète pour la signature des tokens JWT |
| `Jwt__Issuer` | Émetteur du JWT |
| `Jwt__Audience` | Audience du JWT |
| `Jwt__ExpirationMinutes` | Durée de validité du token (en minutes) |
| `CorsOrigins` | Origines autorisées, séparées par des virgules |
| `Brevo__ApiKey` | Clé API Brevo pour l'envoi d'emails |

### Frontend (Vercel / `.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | URL de l'API backend (ex: `http://localhost:5000/api`) |
| `VITE_APP_NAME` | Nom de l'application |

## Fonctionnalités

### Rôles utilisateurs

| Rôle | Fonctionnalités |
|------|-----------------|
| **User** | Inscription, connexion, création/modification/suppression de personnages, personnalisation faciale, équipement d'articles, partage en galerie, avis et commentaires, paramètres du compte |
| **Employee** | Modération des personnages (approuver/rejeter), modération des commentaires, gestion des articles de personnalisation (CRUD), consultation des utilisateurs |
| **Admin** | Dashboard avec statistiques de la plateforme, gestion des employés (CRUD), consultation des logs d'activité (MongoDB) |

### Système de personnages

- 4 classes jouables : **Guerrier**, **Mage**, **Archer**, **Voleur**
- Personnalisation faciale : couleur de peau, yeux, cheveux, forme des yeux/nez/bouche
- Genre : Masculin, Féminin
- Statuts : Brouillon, En attente de modération, Approuvé, Rejeté

### Articles de personnalisation

- 4 types : Vêtement, Armure, Arme, Accessoire
- 14 emplacements d'équipement (tête, torse, jambes, pieds, mains, cou, anneaux, etc.)
- 100 articles pré-configurés dans le seed

### Système d'avis

- Notes de 1 à 5 sur les personnages partagés
- Commentaires textuels avec modération (En attente, Approuvé, Rejeté)

## Sécurité

| Mesure | Détail |
|--------|--------|
| Authentification | JWT Bearer Token avec expiration configurable |
| Autorisation | Politiques par rôle : `RequireUser`, `RequireEmployee`, `RequireAdmin` |
| Hashage MDP | Argon2id (via Isopoh.Cryptography.Argon2) |
| Politique MDP (CNIL) | Min. 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial |
| Contraintes | Email et pseudo uniques |
| CORS | Origines configurables, credentials autorisés |

## Conformité

- **RGPD** : Protection des données personnelles, droit de suppression du compte
- **RGAA** : Accessibilité web (navigation clavier, skip links, attributs ARIA, contrastes)
- **CNIL** : Validation de la complexité des mots de passe

## Tests

### Backend

- **Tests unitaires** : xUnit + Moq + FluentAssertions — validation des services métier et des entités de domaine
- **Tests d'intégration** : Testcontainers (PostgreSQL) — validation du contexte EF Core et des contraintes SQL

```bash
# Tous les tests
dotnet test

# Tests unitaires uniquement
dotnet test --filter "Category=Unit"

# Tests d'intégration uniquement (nécessite Docker)
dotnet test --filter "Category=Integration"
```

### CI/CD

Les tests sont exécutés automatiquement via **GitHub Actions** à chaque push et pull request.

## Déploiement

| Service | Plateforme | URL |
|---------|------------|-----|
| Frontend | Vercel | <https://www.fantasy-realm.com> |
| Backend API | Railway | <https://fantasyrealm-api-production.up.railway.app> |
| PostgreSQL | Railway | Interne au réseau Railway |
| MongoDB | MongoDB Atlas | Cluster Europe (Paris) |

Le détail complet du déploiement est documenté dans [`docs/dossier-deploiement.pdf`](docs/dossier-deploiement.pdf).

## Documentation

Le dossier `docs/` contient l'ensemble de la documentation du projet :

| Document | Description |
|----------|-------------|
| [`documentation-technique.pdf`](docs/documentation-technique.pdf) | Architecture, modèle de données, endpoints API, sécurité, tests |
| [`dossier-deploiement.pdf`](docs/dossier-deploiement.pdf) | Procédures de déploiement (Railway, Vercel, MongoDB Atlas) |
| [`manuel-utilisateur.pdf`](docs/manuel-utilisateur.pdf) | Guide d'utilisation de l'application |
| [`gestion-projet.pdf`](docs/gestion-projet.pdf) | Méthodologie, planification, gestion du backlog |
| [`charte-graphique.pdf`](docs/charte-graphique.pdf) | Identité visuelle, couleurs, typographies |

### Diagrammes (dans `docs/annexes/`)

- Architecture générale et Clean Architecture
- MCD et MLD
- Diagrammes de séquence (authentification, création de personnage, modération, avis)
- Diagramme de cas d'utilisation

## Git workflow

Le projet suit le modèle **GitFlow** :

| Branche | Rôle |
|---------|------|
| `main` | Code prêt pour la production |
| `develop` | Branche d'intégration |
| `{issue}-{slug}` | Branches de fonctionnalité (ex: `75-gestion-des-employés`) |

Les pull requests ciblent toujours `develop`. Le merge vers `main` se fait après validation complète.

## Licence

MIT License — voir [LICENSE](LICENSE)
