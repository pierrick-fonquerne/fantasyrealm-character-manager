# FantasyRealm Character Manager

Système de gestion de personnages pour le MMORPG "FantasyRealm Online" par PixelVerse Studios.

## Description

Application web permettant aux joueurs de :
- Créer et personnaliser des personnages (traits du visage, couleurs)
- Équiper des accessoires (vêtements, armures, armes)
- Partager leurs créations avec la communauté
- Commenter les créations des autres joueurs

## Stack Technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18 + TypeScript + Vite |
| Backend | .NET 8 (ASP.NET Core Web API) |
| BDD Relationnelle | PostgreSQL |
| BDD NoSQL | MongoDB (logs d'activité) |

## Structure du projet

```
fantasyrealm-character-manager/
├── src/
│   ├── frontend/          # Application React + TypeScript
│   └── backend/           # API .NET 8
├── infra/                 # Docker, scripts de déploiement
├── docs/                  # Documentation (manuel, charte graphique)
├── database/
│   ├── sql/              # Scripts PostgreSQL
│   └── mongodb/          # Scripts MongoDB
└── README.md
```

## Prérequis

- [Node.js](https://nodejs.org/) 20 LTS
- [.NET SDK](https://dotnet.microsoft.com/download) 8.0
- [PostgreSQL](https://www.postgresql.org/download/) 16
- [MongoDB](https://www.mongodb.com/try/download) 7.0

## Installation

### 1. Cloner le repository

```bash
git clone https://github.com/votre-username/fantasyrealm-character-manager.git
cd fantasyrealm-character-manager
```

### 2. Backend (.NET)

```bash
cd src/backend
dotnet restore
cp appsettings.Development.example.json appsettings.Development.json
# Configurer les connexions BDD dans appsettings.Development.json
dotnet run --project src/FantasyRealm.Api
```

L'API sera disponible sur `http://localhost:5000`

### 3. Frontend (React)

```bash
cd src/frontend
npm install
cp .env.example .env.local
# Configurer l'URL de l'API dans .env.local
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

### 4. Base de données

```bash
# PostgreSQL - Créer la base de données
createdb -U postgres fantasyrealm

# Exécuter les scripts SQL
psql -U postgres -d fantasyrealm -f database/sql/001_create_tables.sql
psql -U postgres -d fantasyrealm -f database/sql/002_seed_data.sql

# MongoDB - Initialiser les collections
mongosh fantasyrealm database/mongodb/init.js
```

## Commandes utiles

### Frontend

```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run lint         # Vérification ESLint
npm run type-check   # Vérification TypeScript
npm run test         # Lancer les tests
```

### Backend

```bash
dotnet run           # Lancer l'API
dotnet build         # Compiler
dotnet test          # Lancer les tests
dotnet ef database update  # Appliquer les migrations
```

## Déploiement

| Service | Plateforme |
|---------|------------|
| Frontend | Vercel |
| Backend + PostgreSQL | Railway |
| MongoDB | MongoDB Atlas |

## Rôles utilisateurs

| Rôle | Permissions |
|------|-------------|
| User | Création/gestion de personnages, avis |
| Employee | Modération, gestion des articles |
| Admin | Gestion des employés, logs d'activité |

## Conformité

- **RGPD** : Protection des données personnelles
- **RGAA** : Accessibilité web
- **CNIL** : Sécurité des mots de passe

## Licence

MIT License - voir [LICENSE](LICENSE)

---

Projet ECF - TP Développeur Web et Web Mobile
