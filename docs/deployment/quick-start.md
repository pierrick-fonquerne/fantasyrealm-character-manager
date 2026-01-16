# Quick Start - Déploiement Staging

Guide rapide pour déployer l'environnement de recette en 15 minutes.

## ⚡ Prérequis (5 min)

```bash
# 1. Installer Railway CLI
npm install -g @railway/cli

# 2. Se connecter
railway login

# 3. Créer compte MongoDB Atlas (gratuit)
# https://mongodb.com/atlas
```

## 🚀 Setup (10 min)

### 1. Railway (5 min)

```bash
# Lancer le script de setup
cd infra/scripts
chmod +x setup-railway-staging.sh
./setup-railway-staging.sh
```

**Suivre les instructions du script :**
- Créer projet "fantasyrealm-staging"
- Ajouter PostgreSQL
- Noter les tokens et IDs

### 2. MongoDB Atlas (3 min)

1. Créer cluster M0 (gratuit) → `fantasyrealm-staging`
2. Network Access → Autoriser `0.0.0.0/0`
3. Database Access → Créer user `fantasyrealm_staging`
4. Copier la connection string

### 3. GitHub Secrets (2 min)

Aller dans GitHub → Settings → Secrets → Actions

Ajouter :
- `RAILWAY_TOKEN_STAGING`
- `RAILWAY_SERVICE_ID_STAGING`
- `RAILWAY_POSTGRES_SERVICE_ID_STAGING`

## ✅ Premier déploiement

```bash
git checkout develop
git push origin develop
```

Aller dans GitHub Actions et observer le déploiement ! 🎉

## 🔍 Vérification

```bash
# Voir les logs
railway logs

# Obtenir l'URL
railway domain

# Tester l'API
curl https://<railway-url>/health
```

## 📚 Documentation complète

Voir [railway-staging-setup.md](./railway-staging-setup.md) pour tous les détails.

## ❓ Problèmes ?

### Le déploiement échoue
```bash
railway logs --tail
```

### La migration échoue
```bash
DATABASE_URL=$(railway variables get DATABASE_URL)
bash infra/scripts/migrate-database.sh "$DATABASE_URL"
```

### Besoin d'aide ?
Consulter [railway-staging-setup.md](./railway-staging-setup.md) section "Dépannage"
