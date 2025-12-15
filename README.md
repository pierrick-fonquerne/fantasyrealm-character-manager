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
| Frontend | React 19 + TypeScript + Vite |
| Backend | .NET 8 (ASP.NET Core Web API) |
| BDD Relationnelle | PostgreSQL 18 |
| BDD NoSQL | MongoDB 8.0 (logs d'activité) |
| Conteneurisation | Docker Compose |

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

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (pour l'environnement local)
- [Node.js](https://nodejs.org/) 20 LTS (pour le développement frontend)
- [.NET SDK](https://dotnet.microsoft.com/download) 8.0 (optionnel, pour le développement backend hors Docker)

## Installation rapide (Docker)

```bash
# Cloner le repository
git clone https://github.com/pierrick-fonquerne/fantasyrealm-character-manager.git
cd fantasyrealm-character-manager

# Lancer l'installation automatique
./scripts/install.sh
```

Le script va :
1. Vérifier que Docker est installé et démarré
2. Générer automatiquement des mots de passe sécurisés dans `.env`
3. Démarrer PostgreSQL 18, MongoDB 8.0 et l'API .NET
4. Exécuter les migrations SQL

**Services disponibles après installation :**

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| API | http://localhost:5000 |
| Swagger | http://localhost:5000/swagger |
| pgAdmin | http://localhost:5050 |
| PostgreSQL | localhost:5432 |
| MongoDB | localhost:27017 |

## Scripts utilitaires

```bash
./scripts/start.sh      # Démarrer l'environnement
./scripts/stop.sh       # Arrêter l'environnement
./scripts/logs.sh       # Voir les logs (tous les services)
./scripts/logs.sh api   # Voir les logs de l'API
./scripts/migrate.sh    # Exécuter les nouvelles migrations SQL
./scripts/reset-db.sh   # Réinitialiser les bases de données
```

## Développement Frontend

```bash
cd src/frontend
npm install
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

## Installation manuelle (sans Docker)

<details>
<summary>Cliquer pour voir les instructions manuelles</summary>

### Prérequis

- [PostgreSQL](https://www.postgresql.org/download/) 18
- [MongoDB](https://www.mongodb.com/try/download) 8.0

### Backend (.NET)

```bash
cd src/backend
dotnet restore
# Configurer les connexions BDD dans appsettings.Development.json
dotnet run --project src/FantasyRealm.Api
```

### Base de données

```bash
# PostgreSQL - Créer la base de données
createdb -U postgres fantasyrealm

# Exécuter les scripts SQL
psql -U postgres -d fantasyrealm -f database/sql/001_initial_schema.sql
```

</details>

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
