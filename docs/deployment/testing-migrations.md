# Guide de Test des Migrations SQL

Ce guide explique comment tester vos migrations SQL localement avant de les déployer sur staging ou production.

## 🎯 Pourquoi tester les migrations ?

**Sécurité :** Éviter les erreurs SQL en production
**Rapidité :** Détecter les problèmes avant le déploiement
**Qualité :** Valider le schéma de base de données
**Confiance :** Déployer en toute sérénité

## 🛠️ Outils disponibles

### 1. **test-migrations-local.sh** - Test complet automatisé
Script principal pour tester toutes les migrations sur une base PostgreSQL temporaire.

### 2. **clean-test-db.sh** - Nettoyage
Supprime la base de données de test.

### 3. **dump-schema.sh** - Export du schéma
Exporte le schéma de base de données pour comparaison.

## 🚀 Usage rapide

### Test simple (recommandé pour démarrer)

```bash
cd infra/scripts

# Rendre les scripts exécutables
chmod +x *.sh

# Lancer le test
./test-migrations-local.sh
```

Ce script va :
1. ✅ Démarrer un PostgreSQL temporaire dans Docker
2. ✅ Appliquer toutes les migrations dans l'ordre
3. ✅ Vérifier que tout fonctionne
4. ✅ Afficher l'historique des migrations
5. ✅ Laisser la base accessible pour inspection

### Test avec validation complète

```bash
./test-migrations-local.sh --validate
```

En plus du test simple :
- ✅ Vérifie que toutes les tables attendues existent
- ✅ Compte les indexes et foreign keys
- ✅ Valide les données de seed (roles)
- ✅ Affiche les statistiques du schéma

### Test avec nettoyage automatique

```bash
./test-migrations-local.sh --clean
```

Après le test, supprime automatiquement la base de données de test.

### Reset complet et re-test

```bash
./test-migrations-local.sh --reset --validate
```

Utile après avoir modifié des migrations existantes.

## 📊 Workflow de développement

### Scénario 1 : Créer une nouvelle migration

```bash
# 1. Créer le fichier SQL
cat > database/sql/003_add_user_avatar.sql << 'EOF'
-- Add avatar support to users
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500);
CREATE INDEX idx_users_avatar ON users(avatar_url) WHERE avatar_url IS NOT NULL;
EOF

# 2. Tester la migration
cd infra/scripts
./test-migrations-local.sh --validate

# 3. Si OK, inspecter la base
PGPASSWORD='test_password_123' psql -h localhost -p 5433 -U test_user -d fantasyrealm_migration_test

# 4. Vérifier la colonne
\d users

# 5. Nettoyer
./clean-test-db.sh --force

# 6. Commiter
git add database/sql/003_add_user_avatar.sql
git commit -m "feat(db): add avatar_url to users table"
```

### Scénario 2 : Modifier une migration existante

⚠️ **Attention** : Ne jamais modifier une migration déjà déployée !

Si la migration n'est pas encore sur staging/production :

```bash
# 1. Modifier le fichier SQL
vim database/sql/003_add_user_avatar.sql

# 2. Reset et re-tester
./test-migrations-local.sh --reset --validate

# 3. Si OK, commiter
git add database/sql/003_add_user_avatar.sql
git commit -m "fix(db): correct avatar_url column type"
```

Si la migration est déjà déployée :
```bash
# Créer une NOUVELLE migration pour corriger
cat > database/sql/004_fix_avatar_url.sql << 'EOF'
-- Fix avatar_url column
ALTER TABLE users ALTER COLUMN avatar_url TYPE TEXT;
EOF
```

### Scénario 3 : Comparer les schémas

Utile pour vérifier que staging et local sont synchronisés.

```bash
# 1. Dumper le schéma local (dev)
./dump-schema.sh local

# 2. Dumper le schéma de test (après migration)
./test-migrations-local.sh --keep-db
./dump-schema.sh test

# 3. Comparer
diff database/schema-dumps/schema_local_*.sql database/schema-dumps/schema_test_*.sql

# 4. Nettoyer
./clean-test-db.sh --force
```

## 🔍 Inspection manuelle de la base de test

Après `./test-migrations-local.sh` (sans `--clean`), vous pouvez vous connecter :

```bash
# Connection string
PGPASSWORD='test_password_123' psql -h localhost -p 5433 -U test_user -d fantasyrealm_migration_test
```

### Commandes utiles dans psql

```sql
-- Lister les tables
\dt

-- Voir la structure d'une table
\d users
\d characters

-- Voir tous les indexes
\di

-- Voir les foreign keys
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';

-- Historique des migrations
SELECT * FROM migration_history ORDER BY applied_at;

-- Quitter
\q
```

## 🧪 Tests automatisés dans la CI

Les tests de migrations peuvent être intégrés dans la CI :

```yaml
# Exemple pour .github/workflows/ci.yml
test-migrations:
  name: Test Database Migrations
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4

    - name: Test migrations
      run: |
        cd infra/scripts
        chmod +x test-migrations-local.sh
        ./test-migrations-local.sh --validate --clean
```

## ⚠️ Bonnes pratiques

### ✅ À FAIRE

1. **Toujours tester localement** avant de pousser sur develop
2. **Utiliser --validate** pour vérifier le schéma complet
3. **Nommer les migrations avec des numéros séquentiels** : 001, 002, 003...
4. **Ajouter des commentaires SQL** pour expliquer les changements
5. **Tester les rollbacks** (créer des migrations DOWN si nécessaire)
6. **Garder les migrations petites** et atomiques

### ❌ À ÉVITER

1. ❌ Ne jamais modifier une migration déjà déployée
2. ❌ Ne pas sauter de numéros dans la séquence
3. ❌ Ne pas faire de migrations destructives sans backup
4. ❌ Ne pas mélanger DDL (CREATE, ALTER) et DML (INSERT, UPDATE) dans la même transaction si possible
5. ❌ Ne pas oublier les indexes sur les foreign keys

## 🐛 Dépannage

### Le container ne démarre pas

```bash
# Vérifier si Docker est en cours d'exécution
docker ps

# Vérifier les logs
docker logs fantasyrealm-migration-test

# Forcer le nettoyage
docker stop fantasyrealm-migration-test
docker rm fantasyrealm-migration-test
```

### Conflit de port 5433

```bash
# Voir ce qui utilise le port
lsof -i :5433  # macOS/Linux
netstat -ano | findstr :5433  # Windows

# Modifier le port dans test-migrations-local.sh
# Ligne: TEST_DB_PORT="5434"  # Ou un autre port libre
```

### Migration échoue

1. **Lire le message d'erreur** complet dans le terminal
2. **Vérifier la syntaxe SQL** du fichier qui échoue
3. **Tester la requête SQL manuellement** :
   ```bash
   ./test-migrations-local.sh --keep-db
   PGPASSWORD='test_password_123' psql -h localhost -p 5433 -U test_user -d fantasyrealm_migration_test
   # Copier-coller votre SQL
   ```
4. **Reset et re-tester** :
   ```bash
   ./test-migrations-local.sh --reset
   ```

### Schéma différent entre local et test

Cela peut arriver si :
- Vous avez modifié la base locale manuellement
- Des migrations ont été ajoutées mais pas appliquées localement

**Solution :**
```bash
# Option 1 : Repartir de zéro localement
docker-compose down -v
docker-compose up -d
# Puis appliquer les migrations

# Option 2 : Comparer et synchroniser
./dump-schema.sh local
./dump-schema.sh test
diff database/schema-dumps/schema_local_*.sql database/schema-dumps/schema_test_*.sql
```

## 📚 Ressources

- [PostgreSQL Best Practices](https://wiki.postgresql.org/wiki/Don%27t_Do_This)
- [Database Migration Best Practices](https://www.prisma.io/dataguide/types/relational/migration-strategies)
- [SQL Style Guide](https://www.sqlstyle.guide/)

## 🎓 Concepts avancés

### Migration versionnée vs Migration basée sur l'état

**FantasyRealm utilise les migrations versionnées** :
- Chaque fichier SQL est une migration
- Appliquées dans l'ordre chronologique
- Trackées dans `migration_history`

**Avantages** :
- Simple à comprendre
- Historique clair des changements
- Facile à rollback (créer migration inverse)

**Alternative (non utilisée ici)** :
- Migration basée sur l'état (comme Prisma)
- Compare état actuel vs état désiré
- Génère automatiquement les migrations

### Idempotence des migrations

**C'est quoi ?** Une migration idempotente peut être exécutée plusieurs fois sans erreur.

**Exemple NON idempotent** :
```sql
-- ❌ Échoue si la colonne existe déjà
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500);
```

**Exemple idempotent** :
```sql
-- ✅ OK si déjà exécuté
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);
```

**Note :** Notre système de tracking évite les doubles exécutions, mais l'idempotence est une sécurité supplémentaire.

### Transactions dans les migrations

PostgreSQL supporte les DDL dans les transactions :

```sql
BEGIN;

-- Si une commande échoue, tout est annulé
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500);
CREATE INDEX idx_users_avatar ON users(avatar_url);

COMMIT;
```

Notre script `migrate-database.sh` exécute chaque fichier SQL dans sa propre transaction.

---

**Prêt à tester tes migrations ?** 🚀

```bash
cd infra/scripts
./test-migrations-local.sh --validate
```
