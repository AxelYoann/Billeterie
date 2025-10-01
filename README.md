# 🎫 Multi-Billeterie

Une plateforme moderne de multi-billeterie permettant aux prestataires de créer leur propre billetterie et aux clients d'acheter des tickets dans n'importe quelle billeterie.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-v18+-green.svg)
![Express](https://img.shields.io/badge/express-v4.18+-lightgrey.svg)
![MongoDB](https://img.shields.io/badge/mongodb-v6.0+-green.svg)
![Bootstrap](https://img.shields.io/badge/bootstrap-v5.3+-purple.svg)
[![CI/CD](https://github.com/your-username/multi-billeterie/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/your-username/multi-billeterie/actions/workflows/ci-cd.yml)
[![GitHub Pages](https://github.com/your-username/multi-billeterie/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/your-username/multi-billeterie/actions/workflows/deploy-pages.yml)
[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=flat&logo=github)](https://your-username.github.io/multi-billeterie/)

## 🌐 Demo Live & Documentation

🔗 **[Voir la Demo Live et Documentation Complète](https://AxelYoann.github.io/multi-billeterie/)**

Notre page GitHub Pages inclut :
- 📄 Landing page professionnelle
- 📚 Documentation interactive complète
- 🎨 Démo visuelle des fonctionnalités
- 🏗️ Architecture et technologies détaillées
- 📋 Guide d'installation pas-à-pas
- 🗺️ Roadmap et fonctionnalités futures

## 🚀 Fonctionnalités

### 👥 Pour les Clients
- ✅ Inscription et connexion sécurisées
- ✅ Navigation intuitive avec recherche et filtres
- ✅ Réservation de tickets avec codes QR
- ✅ Gestion des réservations (téléchargement PDF)
- ✅ Profil personnalisable avec préférences
- ✅ Dashboard avec statistiques personnelles

### 🏢 Pour les Prestataires
- ✅ Interface d'administration complète
- ✅ Création et gestion d'événements
- ✅ Suivi des ventes et analytics
- ✅ Dashboard avec métriques de performance
- ✅ Gestion des clients et des tickets

### 🛡️ Sécurité & Performance
- ✅ Authentification JWT robuste
- ✅ Hashage sécurisé des mots de passe (bcrypt)
- ✅ Protection CORS et headers de sécurité (Helmet)
- ✅ Rate limiting configurable
- ✅ Validation stricte des données d'entrée
- ✅ Sessions sécurisées avec expiration

## 🏗️ Architecture

```
src/
├── controllers/     # Logique de contrôle MVC
├── models/          # Modèles de données Mongoose
├── routes/          # Définition des routes Express
├── views/           # Templates EJS
├── middleware/      # Middlewares Express
├── services/        # Logique métier (KISS)
├── utils/           # Utilitaires et helpers
├── config/          # Configuration application
└── public/            # Assets statiques (CSS, JS, images)
```

## 🚀 Technologies Utilisées

- **Backend**: Node.js + Express.js
- **Base de données**: MongoDB + Mongoose
- **Templating**: EJS
- **Authentification**: JWT + bcryptjs
- **Validation**: express-validator
- **Sécurité**: Helmet, CORS, Rate Limiting
- **Dev Tools**: Nodemon, ESLint, Prettier, Jest

## 📦 Installation

### 🚀 Installation Automatique (Recommandée)

**Windows :**
```cmd
git clone https://github.com/your-username/multi-billeterie.git
cd multi-billeterie
setup.bat
```

**Linux/macOS :**
```bash
git clone https://github.com/your-username/multi-billeterie.git
cd multi-billeterie
chmod +x setup.sh
./setup.sh
```

**Ou avec Node.js :**
```bash
git clone https://github.com/your-username/multi-billeterie.git
cd multi-billeterie
npm install
npm run setup
```

### ⚡ Installation Manuelle

1. **Cloner le repository**
   ```bash
   git clone https://github.com/your-username/multi-billeterie.git
   cd multi-billeterie
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer l'environnement**
   ```bash
   cp .env.example .env
   # Éditer le fichier .env avec vos paramètres
   ```

4. **Lancer l'application**
   ```bash
   npm run dev  # Mode développement
   npm start    # Mode production
   ```

## 🔧 Configuration

Créez un fichier `.env` à la racine du projet avec:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/multi-billeterie
JWT_SECRET=votre_jwt_secret_ici
NODE_ENV=development
```

## 🧪 Tests

```bash
npm test
```

## 🚀 Déploiement

Multi-Billeterie peut être déployé sur plusieurs plateformes. Consultez notre [Guide de Déploiement Complet](DEPLOYMENT.md) pour des instructions détaillées.

### Options de déploiement

- **Heroku** : Déploiement simple avec Git
- **Docker** : Conteneurisation complète
- **AWS** : Elastic Beanstalk ou ECS
- **Azure** : Container Instances ou App Service
- **DigitalOcean** : Droplets ou App Platform

### Déploiement rapide avec Docker

```bash
# Build et run
docker build -t multi-billeterie .
docker run -p 3000:3000 multi-billeterie

# Ou avec Docker Compose
docker-compose up -d
```

📖 **Voir le [Guide de Déploiement](DEPLOYMENT.md) pour plus de détails**

## 🌐 GitHub Pages

Une **page de présentation professionnelle** est automatiquement déployée sur GitHub Pages :

🔗 **[Voir la Demo Live](https://your-username.github.io/multi-billeterie/)**

### Configuration automatique :
```bash
git push origin main
# GitHub Pages se déploie automatiquement !
```

📖 **Voir le [Guide GitHub Pages](GITHUB_PAGES.md) pour la configuration complète**

## 📝 Principes de Développement

- **MVC**: Séparation claire des responsabilités
- **Clean Code**: Code lisible, maintenable et testé
- **KISS**: Solutions simples et efficaces
- **DRY**: Don't Repeat Yourself
- **SOLID**: Principes de conception orientée objet

## 🔒 Sécurité

- Authentification JWT
- Hashage des mots de passe (bcrypt)
- Validation des données d'entrée
- Protection CORS
- Rate limiting
- Headers de sécurité (Helmet)

## 📄 Licence

MIT License

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Consultez notre [Guide de Contribution](CONTRIBUTING.md).

## 📞 Support

- 📖 [Documentation complète](https://your-username.github.io/multi-billeterie/)
- 🐛 [Signaler un bug](https://github.com/your-username/multi-billeterie/issues)
- 💬 [Discussions](https://github.com/your-username/multi-billeterie/discussions)
- 📧 [Contact](mailto:contact@votre-domaine.com)

## ⭐ Remerciements

Merci à tous les contributeurs qui ont rendu ce projet possible !

---

**Développé avec ❤️ en utilisant Node.js, Express.js, MongoDB et Bootstrap 5**