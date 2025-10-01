# Changelog

Tous les changements notables de ce projet seront documentés dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
et ce projet adhère à [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### À venir
- Intégration de paiement Stripe
- Système de notifications push
- API mobile
- Support multi-langues

## [1.0.0] - 2025-01-15

### Ajouté
- 🎫 Système complet de multi-billeterie
- 👥 Authentification utilisateur avec JWT
- 🏢 Interface prestataire complète
- 📱 Design responsive avec Bootstrap 5
- 🛡️ Sécurité renforcée (Helmet, CORS, Rate Limiting)
- 📊 Dashboard avec statistiques
- 🎭 Gestion des événements
- 🎟️ Système de tickets avec QR codes
- 📧 Formulaire de contact
- 🔍 Recherche et filtres avancés
- 👤 Gestion de profil utilisateur
- ⚙️ Panel d'administration prestataire
- 📄 Pages statiques (À propos, Contact, FAQ)
- 🐳 Support Docker
- 🚀 CI/CD avec GitHub Actions
- 📚 Documentation complète
- 🧪 Tests unitaires et d'intégration

### Technique
- Architecture MVC moderne
- Node.js + Express.js
- MongoDB + Mongoose
- EJS templating
- Clean Code principles
- KISS methodology
- ESLint + Prettier
- Jest pour les tests
- Docker & Docker Compose
- GitHub Actions CI/CD

### Sécurité
- Authentification JWT
- Chiffrement bcrypt des mots de passe
- Validation des données avec express-validator
- Protection CORS
- Helmet pour la sécurité HTTP
- Rate limiting anti-spam
- Sanitisation des entrées

### Pages créées
- `/` - Page d'accueil
- `/auth/login` - Connexion
- `/auth/register` - Inscription
- `/dashboard` - Tableau de bord utilisateur
- `/events` - Catalogue des événements
- `/providers` - Annuaire des prestataires
- `/tickets` - Gestion des tickets
- `/profile` - Profil utilisateur
- `/admin` - Administration prestataire
- `/contact` - Formulaire de contact
- `/404` - Page d'erreur personnalisée

### API REST
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/events` - Liste des événements
- `POST /api/events` - Créer un événement
- `GET /api/tickets` - Mes tickets
- `POST /api/tickets/purchase` - Acheter un ticket
- `GET /api/providers` - Liste des prestataires
- `GET /api/health` - Health check

## [0.1.0] - 2025-01-01

### Ajouté
- Configuration initiale du projet
- Structure MVC de base
- Authentification basique
- Première version de l'API

---

## Types de changements

- `Ajouté` pour les nouvelles fonctionnalités.
- `Modifié` pour les changements dans les fonctionnalités existantes.
- `Déprécié` pour les fonctionnalités qui seront supprimées prochainement.
- `Supprimé` pour les fonctionnalités supprimées maintenant.
- `Corrigé` pour les corrections de bugs.
- `Sécurité` en cas de vulnérabilités.