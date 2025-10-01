# 🤝 Guide de Contribution

Merci de votre intérêt pour contribuer à Multi-Billeterie ! Ce guide vous aidera à comprendre comment participer au développement du projet.

## 📋 Table des matières

- [Code de conduite](#code-de-conduite)
- [Comment contribuer](#comment-contribuer)
- [Processus de développement](#processus-de-développement)
- [Standards de code](#standards-de-code)
- [Tests](#tests)
- [Documentation](#documentation)

## 📜 Code de conduite

En participant à ce projet, vous acceptez de respecter notre [Code de Conduite](CODE_OF_CONDUCT.md). Veuillez le lire avant de contribuer.

## 🚀 Comment contribuer

### 🐛 Signaler un bug

1. **Vérifiez** que le bug n'a pas déjà été signalé dans les [Issues](https://github.com/votre-username/multi-billeterie/issues)
2. **Créez** une nouvelle issue en utilisant le template "Bug Report"
3. **Incluez** autant de détails que possible :
   - Étapes pour reproduire
   - Comportement attendu vs réel
   - Captures d'écran si applicable
   - Environnement (OS, navigateur, version Node.js)

### ✨ Proposer une fonctionnalité

1. **Vérifiez** que la fonctionnalité n'a pas déjà été proposée
2. **Créez** une nouvelle issue en utilisant le template "Feature Request"
3. **Décrivez** clairement :
   - Le problème que cela résoudrait
   - La solution proposée
   - Les alternatives considérées

### 🔧 Contribuer du code

1. **Fork** le projet
2. **Créez** une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. **Codez** en suivant nos standards
4. **Testez** vos modifications
5. **Commitez** vos changements (`git commit -m 'Add some AmazingFeature'`)
6. **Poussez** vers la branche (`git push origin feature/AmazingFeature`)
7. **Ouvrez** une Pull Request

## 🔄 Processus de développement

### Branches

- `main` : Branche principale (code de production)
- `develop` : Branche de développement (intégration continue)
- `feature/*` : Nouvelles fonctionnalités
- `bugfix/*` : Corrections de bugs
- `hotfix/*` : Corrections urgentes pour la production

### Workflow Git

```bash
# 1. Cloner le projet
git clone https://github.com/votre-username/multi-billeterie.git
cd multi-billeterie

# 2. Installer les dépendances
npm install

# 3. Créer une branche
git checkout -b feature/ma-nouvelle-fonctionnalite

# 4. Faire vos modifications et tests
npm run test
npm run lint

# 5. Commiter
git add .
git commit -m "feat: ajouter nouvelle fonctionnalité"

# 6. Pousser
git push origin feature/ma-nouvelle-fonctionnalite

# 7. Créer une Pull Request sur GitHub
```

### Messages de commit

Nous utilisons les [Conventional Commits](https://www.conventionalcommits.org/) :

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types** :
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage, style (pas de changement de code)
- `refactor`: Refactoring
- `test`: Tests
- `chore`: Maintenance

**Exemples** :
```bash
feat: ajouter authentification JWT
fix: corriger le bug de validation des emails
docs: mettre à jour le README
style: formatter le code avec Prettier
refactor: restructurer les contrôleurs
test: ajouter tests pour l'API auth
chore: mettre à jour les dépendances
```

## 📏 Standards de code

### JavaScript

- **ESLint** : Suivez la configuration `.eslintrc.json`
- **Prettier** : Le code doit être formaté avec Prettier
- **Style** : 
  - Utilisez des noms descriptifs pour les variables et fonctions
  - Préférez `const` et `let` à `var`
  - Utilisez les arrow functions quand approprié
  - Documentez les fonctions complexes

### Structure des fichiers

```javascript
// 1. Imports des modules tiers
const express = require('express');
const mongoose = require('mongoose');

// 2. Imports des modules locaux
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// 3. Constants
const CACHE_DURATION = 3600;

// 4. Functions
const getUserById = async (id) => {
  // Implementation
};

// 5. Exports
module.exports = {
  getUserById,
};
```

### CSS/Styles

- Utilisez **Bootstrap 5** comme framework de base
- Organisez les styles personnalisés dans `/public/css/`
- Utilisez des noms de classes descriptifs
- Préférez les CSS custom properties (variables)

## 🧪 Tests

### Lancer les tests

```bash
# Tous les tests
npm test

# Tests en mode watch
npm run test:watch

# Tests avec couverture
npm run test:coverage
```

### Écrire des tests

- **Tests unitaires** : Testez les fonctions individuelles
- **Tests d'intégration** : Testez les interactions entre modules
- **Tests E2E** : Testez les scénarios utilisateur complets

**Exemple de test** :

```javascript
const request = require('supertest');
const app = require('../src/app');

describe('Auth API', () => {
  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });
  });
});
```

### Couverture de code

- **Minimum** : 70% de couverture
- **Objectif** : 80%+ de couverture
- Tous les nouveaux features doivent avoir des tests

## 📚 Documentation

### Code

- Documentez les fonctions complexes avec des commentaires JSDoc
- Expliquez le "pourquoi", pas seulement le "quoi"
- Mettez à jour la documentation quand vous changez le code

```javascript
/**
 * Génère un token JWT pour un utilisateur
 * @param {Object} user - L'objet utilisateur
 * @param {string} user.id - L'ID de l'utilisateur
 * @param {string} user.email - L'email de l'utilisateur
 * @returns {string} Le token JWT signé
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};
```

### README et Wiki

- Mettez à jour le README si vous ajoutez des fonctionnalités
- Créez des guides dans le Wiki pour les fonctionnalités complexes
- Incluez des exemples de code

## 🔍 Révision de code

Toutes les Pull Requests passent par une révision :

### Critères de révision

- ✅ Code fonctionnel et testé
- ✅ Respect des standards de code
- ✅ Documentation mise à jour
- ✅ Pas de régression
- ✅ Performance acceptable

### Processus

1. **Automatique** : Les CI/CD checks doivent passer
2. **Manuelle** : Au moins un reviewer approuve
3. **Tests** : Toute nouvelle fonctionnalité doit être testée
4. **Documentation** : Les changements significatifs doivent être documentés

## 🏷️ Releases

### Versioning

Nous suivons [Semantic Versioning](https://semver.org/) :

- `MAJOR.MINOR.PATCH`
- **MAJOR** : Changements incompatibles
- **MINOR** : Nouvelles fonctionnalités compatibles
- **PATCH** : Corrections de bugs

### Process de release

1. Mettre à jour `CHANGELOG.md`
2. Bumper la version dans `package.json`
3. Créer un tag Git
4. Déployer automatiquement via GitHub Actions

## ❓ Questions

Des questions ? N'hésitez pas à :

- 🐛 [Ouvrir une issue](https://github.com/votre-username/multi-billeterie/issues)
- 💬 Rejoindre notre [Discord](lien-discord)
- 📧 Envoyer un email à : contribuer@multi-billeterie.fr

## 🎉 Reconnaissance

Tous les contributeurs sont listés dans notre [Hall of Fame](CONTRIBUTORS.md) et mentionnés dans les release notes.

---

**Merci de contribuer à Multi-Billeterie ! 🎫✨**