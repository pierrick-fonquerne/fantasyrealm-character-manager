# Guide de déploiement - Environnement de Recette (Staging)

Ce guide décrit le processus complet de configuration et de déploiement de l'environnement de recette sur Railway.

## 📋 Prérequis

### Comptes et services
- ✅ Compte Railway (gratuit) - [railway.app](https://railway.app)
- ✅ Compte MongoDB Atlas (gratuit) - [mongodb.com/atlas](https://www.mongodb.com/atlas)
- ✅ Compte GitHub (déjà configuré)
- ✅ Repository GitHub avec accès admin

### Outils locaux
- ✅ Railway CLI - `npm install -g @railway/cli`
- ✅ Git
- ✅ PostgreSQL client (psql) - optionnel pour tests locaux

## 🏗️ Architecture de l'environnement staging

```
GitHub (develop branch)
    ↓ (push automatique)
GitHub Actions CI
    ↓ (si success)
Railway Backend (.NET)
    ↓ (connecté à)
Railway PostgreSQL
    ↓ (logs dans)
MongoDB Atlas (staging)
    ↑ (appelé par)
Vercel Frontend (preview)
```

## 🚀 Configuration initiale (à faire une seule fois)

### Étape 1 : Setup Railway

```bash
# Installer Railway CLI
npm install -g @railway/cli

# Se connecter à Railway
railway login

# Lancer le script de setup
cd infra/scripts
chmod +x setup-railway-staging.sh
./setup-railway-staging.sh
```

Le script vous guidera à travers :
1. Création du projet Railway "fantasyrealm-staging"
2. Provisionnement de PostgreSQL
3. Configuration du service backend
4. Setup des variables d'environnement

### Étape 2 : MongoDB Atlas

#### 2.1 Créer un cluster
1. Aller sur [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Créer un compte gratuit
3. Créer un nouveau cluster (tier M0 - gratuit)
4. Nom du cluster : `fantasyrealm-staging`
5. Région : choisir la plus proche de Railway (EU-West généralement)

#### 2.2 Configurer l'accès réseau
1. Network Access → Add IP Address
2. Autoriser `0.0.0.0/0` (tous les IPs) pour Railway
   - ⚠️ En production, on restreindra aux IPs Railway

#### 2.3 Créer la database et un user
1. Database Access → Add Database User
   - Username: `fantasyrealm_staging`
   - Password: générer un mot de passe fort (noter quelque part)
   - Role: Read and write to any database

2. Databases → Browse Collections → Create Database
   - Database name: `fantasyrealm_logs_staging`
   - Collection name: `activity_logs`

#### 2.4 Récupérer la connection string
1. Cluster → Connect → Connect your application
2. Driver: C# / .NET
3. Copier la connection string :
   ```
   mongodb+srv://fantasyrealm_staging:<password>@cluster.mongodb.net/fantasyrealm_logs_staging?retryWrites=true&w=majority
   ```
4. Remplacer `<password>` par le vrai mot de passe

### Étape 3 : Configuration des variables Railway

Dans le dashboard Railway, ajouter ces variables d'environnement :

```bash
# Application
ASPNETCORE_ENVIRONMENT=Staging
ASPNETCORE_URLS=http://0.0.0.0:$PORT

# Database PostgreSQL (automatique via Railway)
ConnectionStrings__PostgreSQL=${{Postgres.DATABASE_URL}}

# Database MongoDB
ConnectionStrings__MongoDB=mongodb+srv://fantasyrealm_staging:<password>@cluster.mongodb.net/fantasyrealm_logs_staging?retryWrites=true&w=majority

# JWT
Jwt__Secret=<générer-une-clé-aléatoire-256-bits>
Jwt__Issuer=FantasyRealm.Api
Jwt__Audience=FantasyRealm.Client
Jwt__ExpirationMinutes=60

# Email (SMTP - exemple avec Gmail)
Email__SmtpServer=smtp.gmail.com
Email__SmtpPort=587
Email__Username=<votre-email>
Email__Password=<app-password>
Email__FromAddress=noreply@fantasy-realm.com
Email__FromName=FantasyRealm Online
Email__BaseUrl=<vercel-preview-url>

# CORS
Cors__AllowedOrigins=<vercel-preview-url>
```

**Génération du JWT Secret :**
```bash
openssl rand -base64 32
```

### Étape 4 : Configuration GitHub Secrets

Aller dans votre repository GitHub → Settings → Secrets and variables → Actions

Ajouter ces secrets :

| Nom du secret | Description | Comment l'obtenir |
|---------------|-------------|-------------------|
| `RAILWAY_TOKEN_STAGING` | Token d'API Railway | `railway tokens` dans le CLI |
| `RAILWAY_SERVICE_ID_STAGING` | ID du service backend | `railway service` dans le CLI |
| `RAILWAY_POSTGRES_SERVICE_ID_STAGING` | ID du service PostgreSQL | `railway service` (choisir postgres) |

**Obtenir les IDs Railway :**
```bash
# Se placer dans le projet
railway link

# Lister les services
railway service

# Pour chaque service, noter l'ID
```

### Étape 5 : Premier déploiement

```bash
# Depuis votre machine locale
git checkout develop
git pull

# Pousser sur develop pour déclencher le déploiement
git push origin develop
```

GitHub Actions va :
1. ✅ Exécuter les tests (CI)
2. ✅ Builder et déployer le backend sur Railway
3. ✅ Appliquer les migrations SQL
4. ✅ Afficher un résumé dans Actions

### Étape 6 : Vérification

```bash
# Via Railway CLI
railway logs

# Obtenir l'URL publique
railway domain

# Tester l'API
curl https://<railway-url>/health
```

## 🔄 Déploiement automatique

Une fois configuré, chaque push sur `develop` déclenche automatiquement :

1. **CI** (build + test)
2. **Deploy Backend** (Railway)
3. **Migrations SQL** (auto)
4. **Frontend** (Vercel preview - déjà configuré)

## 🗄️ Gestion des migrations SQL

### Ajouter une nouvelle migration

1. Créer un nouveau fichier dans `database/sql/` avec un numéro séquentiel :
   ```
   database/sql/003_add_new_feature.sql
   ```

2. Écrire le SQL :
   ```sql
   -- Description de la migration
   ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500);
   ```

3. Commiter et pousser sur `develop` :
   ```bash
   git add database/sql/003_add_new_feature.sql
   git commit -m "feat(db): add avatar_url to users"
   git push origin develop
   ```

4. GitHub Actions appliquera automatiquement la migration

### Vérifier l'historique des migrations

```bash
# Se connecter à la base Railway
railway connect Postgres

# Lister les migrations appliquées
SELECT filename, applied_at, execution_time_ms
FROM migration_history
ORDER BY applied_at DESC;
```

## 🐛 Dépannage

### Le déploiement échoue

1. Vérifier les logs GitHub Actions
2. Vérifier les logs Railway : `railway logs`
3. Vérifier les variables d'environnement : `railway variables`

### La base de données n'est pas accessible

```bash
# Tester la connexion
railway connect Postgres

# Vérifier le DATABASE_URL
railway variables get DATABASE_URL
```

### Les migrations ne s'appliquent pas

```bash
# Exécuter manuellement
DATABASE_URL=$(railway variables get DATABASE_URL)
bash infra/scripts/migrate-database.sh "$DATABASE_URL"
```

## 📊 Monitoring

### Logs Railway
```bash
railway logs --tail
```

### Métriques
1. Dashboard Railway → Metrics
2. Voir CPU, RAM, Network

### Base de données
1. Railway → PostgreSQL → Metrics
2. Connexions actives, queries, storage

## 🔐 Sécurité

### Checklist sécurité staging

- ✅ Variables sensibles dans Railway (pas en dur)
- ✅ CORS configuré (uniquement Vercel preview)
- ✅ MongoDB Atlas avec user dédié staging
- ✅ Pas de clés de production dans staging
- ✅ HTTPS forcé par Railway

## 📚 Ressources

- [Railway Documentation](https://docs.railway.app)
- [Nixpacks Documentation](https://nixpacks.com/docs)
- [MongoDB Atlas Documentation](https://www.mongodb.com/docs/atlas/)
- [GitHub Actions Documentation](https://docs.github.com/actions)

## ⏭️ Prochaines étapes

Une fois le staging fonctionnel, vous pourrez :
1. Tester l'application dans un environnement proche de la production
2. Valider les fonctionnalités avant le déploiement en production
3. Configurer l'environnement de production (similaire mais avec validations manuelles)
