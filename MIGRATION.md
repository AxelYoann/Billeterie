# 📋 Guide de Migration

Ce guide vous aide à migrer votre installation existante de Multi-Billeterie vers la nouvelle version.

## 🔄 Migration depuis une version antérieure

### Version 0.x → 1.0.0

Cette migration comprend des changements majeurs dans l'architecture et la configuration.

#### 📊 Changements Majeurs

- **Architecture** : Passage à une architecture MVC complète
- **Sécurité** : Implémentation de JWT et amélioration de la sécurité
- **Base de données** : Nouveaux modèles et relations
- **Configuration** : Nouvelles variables d'environnement
- **Tests** : Ajout d'une suite de tests complète

#### 🗂️ Sauvegarde des Données

**⚠️ IMPORTANT : Sauvegardez toujours vos données avant la migration !**

```bash
# Sauvegarde MongoDB
mongodump --db multi-billeterie --out ./backup/$(date +%Y%m%d_%H%M%S)

# Sauvegarde des fichiers de configuration
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
```

#### 🔧 Étapes de Migration

1. **Arrêter l'ancienne version**
   ```bash
   # Si vous utilisez PM2
   pm2 stop multi-billeterie
   
   # Ou arrêter le processus Node.js
   pkill -f "node.*multi-billeterie"
   ```

2. **Télécharger la nouvelle version**
   ```bash
   # Renommer l'ancien dossier
   mv multi-billeterie multi-billeterie-old
   
   # Cloner la nouvelle version
   git clone https://github.com/your-username/multi-billeterie.git
   cd multi-billeterie
   ```

3. **Migrer la configuration**
   ```bash
   # Copier l'ancien fichier .env
   cp ../multi-billeterie-old/.env .env.old
   
   # Créer la nouvelle configuration
   npm run setup
   ```

4. **Migrer les données**
   
   Exécuter le script de migration :
   ```bash
   node scripts/migrate.js
   ```

5. **Installer et tester**
   ```bash
   npm install
   npm test
   npm run dev
   ```

#### 📝 Migration des Variables d'Environnement

Nouvelles variables ajoutées dans v1.0.0 :

```env
# Nouvelles variables requises
JWT_SECRET=your-jwt-secret
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Variables optionnelles
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email
EMAIL_PASS=your-password
```

#### 🗄️ Migration de la Base de Données

Les modèles suivants ont été modifiés :

**Users** - Nouveaux champs :
- `role` : Rôle utilisateur (client, provider, admin)
- `isVerified` : Statut de vérification email
- `lastLogin` : Dernière connexion

**Events** - Nouveaux champs :
- `category` : Catégorie d'événement
- `status` : Statut (draft, published, cancelled)
- `capacity` : Capacité maximale

**Tickets** - Nouveaux champs :
- `qrCode` : Code QR pour validation
- `status` : Statut du ticket

#### 🔄 Script de Migration Automatique

Créez le fichier `scripts/migrate.js` :

```javascript
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Event = require('../src/models/Event');
const Ticket = require('../src/models/Ticket');

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('🔄 Début de la migration...');
    
    // Migration des utilisateurs
    await User.updateMany(
      { role: { $exists: false } },
      { $set: { role: 'client', isVerified: true } }
    );
    
    // Migration des événements
    await Event.updateMany(
      { status: { $exists: false } },
      { $set: { status: 'published', category: 'other' } }
    );
    
    // Migration des tickets
    await Ticket.updateMany(
      { status: { $exists: false } },
      { $set: { status: 'active' } }
    );
    
    console.log('✅ Migration terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

migrate();
```

## 🔄 Migration de Déploiement

### Heroku

Si vous avez déjà déployé sur Heroku :

1. **Mettre à jour les variables d'environnement**
   ```bash
   heroku config:set JWT_SECRET=your-new-jwt-secret
   heroku config:set RATE_LIMIT_WINDOW_MS=900000
   heroku config:set RATE_LIMIT_MAX_REQUESTS=100
   ```

2. **Déployer la nouvelle version**
   ```bash
   git push heroku main
   ```

3. **Exécuter les migrations**
   ```bash
   heroku run node scripts/migrate.js
   ```

### Docker

Si vous utilisez Docker :

1. **Sauvegarder les volumes**
   ```bash
   docker-compose down
   docker run --rm -v multi-billeterie_mongo_data:/data -v $(pwd):/backup alpine tar czf /backup/mongo_backup.tar.gz -C /data .
   ```

2. **Mettre à jour les images**
   ```bash
   docker-compose pull
   docker-compose up --build -d
   ```

3. **Exécuter les migrations**
   ```bash
   docker-compose exec app node scripts/migrate.js
   ```

## 🔄 Migration des Développeurs

### Dépendances

Nouvelles dépendances ajoutées :

```json
{
  "dependencies": {
    "jsonwebtoken": "^9.0.2",
    "express-rate-limit": "^7.1.5",
    "helmet": "^7.1.0",
    "express-validator": "^7.0.1"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "eslint": "^8.55.0",
    "prettier": "^3.1.0",
    "husky": "^8.0.3",
    "lint-staged": "^15.2.0"
  }
}
```

### Structure des Fichiers

Nouveaux dossiers et fichiers :

```
├── .github/                 # GitHub templates et workflows
├── tests/                   # Suite de tests
├── scripts/                 # Scripts de migration et outils
├── docs/                    # Documentation supplémentaire
├── DEPLOYMENT.md            # Guide de déploiement
├── CONTRIBUTING.md          # Guide de contribution
├── SECURITY.md              # Politique de sécurité
├── setup.js                 # Script de setup automatique
├── setup.bat                # Script Windows
└── setup.sh                 # Script Unix
```

### Configuration ESLint/Prettier

Nouveaux fichiers de configuration :

- `.eslintrc.json`
- `.prettierrc.json`
- `.eslintignore`
- `.prettierignore`

## 🧪 Tests de Migration

Après la migration, exécutez ces tests :

```bash
# Tests unitaires
npm test

# Tests d'intégration
npm run test:integration

# Vérification de l'API
curl http://localhost:3000/health

# Test de connexion à la base de données
node -e "require('./src/config/database')"
```

## 🚨 Problèmes Courants

### Erreur de connexion MongoDB

```bash
# Vérifier la chaîne de connexion
echo $MONGODB_URI

# Tester la connexion
mongo "$MONGODB_URI"
```

### Erreurs de dépendances

```bash
# Nettoyer le cache npm
npm cache clean --force

# Supprimer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install
```

### Variables d'environnement manquantes

```bash
# Vérifier les variables
npm run setup

# Ou manuellement
cp .env.example .env
```

## 📞 Support

Si vous rencontrez des problèmes pendant la migration :

1. **Consultez les logs** : `npm run logs` ou `docker-compose logs`
2. **Vérifiez la documentation** : README.md, DEPLOYMENT.md
3. **Ouvrez une issue** : [GitHub Issues](https://github.com/your-username/multi-billeterie/issues)
4. **Rejoignez la communauté** : [Discussions](https://github.com/your-username/multi-billeterie/discussions)

## 🎯 Checklist de Migration

- [ ] Sauvegarde des données effectuée
- [ ] Ancienne version arrêtée
- [ ] Nouvelle version téléchargée
- [ ] Configuration migrée
- [ ] Base de données migrée
- [ ] Tests passés
- [ ] Application démarrée
- [ ] Fonctionnalités vérifiées
- [ ] Monitoring en place
- [ ] Documentation mise à jour

---

**Migration réussie ?** 🎉 Partagez votre expérience dans les [Discussions](https://github.com/your-username/multi-billeterie/discussions) !