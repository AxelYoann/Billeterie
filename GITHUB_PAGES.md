# 📖 Guide GitHub Pages - Multi-Billeterie

Ce guide vous explique comment configurer et déployer Multi-Billeterie avec GitHub Pages.

## 🎯 Solutions de Déploiement

### 📄 Solution 1 : Documentation sur GitHub Pages (Recommandée)

GitHub Pages héberge une **belle page de présentation** de votre projet avec :
- ✅ Landing page professionnelle
- ✅ Documentation interactive
- ✅ Démo visuelle
- ✅ Guide d'installation
- ✅ Architecture détaillée
- ✅ Roadmap du projet

### 🚀 Solution 2 : Application complète avec déploiement automatique

L'application Node.js est déployée automatiquement sur :
- **Heroku** (recommandé pour Node.js)
- **Vercel** (excellent pour les API)
- **Railway** (alternative moderne)

## 🔧 Configuration GitHub Pages

### Étape 1 : Activer GitHub Pages

1. Allez dans **Settings** de votre repository
2. Descendez à la section **Pages**
3. Dans **Source**, sélectionnez **GitHub Actions**
4. GitHub détectera automatiquement votre configuration

### Étape 2 : Configuration automatique

Les fichiers suivants ont été créés automatiquement :

```
├── docs/
│   └── index.html          # Page principale (landing page)
├── _config.yml             # Configuration Jekyll
├── index.html              # Redirection vers docs/
└── .github/workflows/
    ├── deploy-pages.yml    # Workflow GitHub Pages
    ├── deploy-heroku.yml   # Déploiement automatique Heroku
    └── pr-checks.yml       # Tests sur les PRs
```

### Étape 3 : Premier déploiement

```bash
# Commiter les changements
git add .
git commit -m "feat: Add GitHub Pages configuration and landing page"
git push origin main
```

Le déploiement se lance automatiquement ! 🚀

### Étape 4 : Vérifier le déploiement

Votre site sera disponible à :
```
https://your-username.github.io/multi-billeterie/
```

## 🎨 Personnalisation de la Landing Page

### Modifier les informations

Éditez `docs/index.html` pour personnaliser :

1. **Informations du projet** :
   ```html
   <h1 class="display-4 fw-bold mb-4">
       Votre <span class="text-warning">Nom de Projet</span>
   </h1>
   ```

2. **URLs GitHub** :
   ```html
   <a href="https://github.com/VOTRE-USERNAME/VOTRE-REPO" ...>
   ```

3. **Technologies utilisées** :
   ```html
   <span class="tech-badge">Votre Tech</span>
   ```

4. **Screenshots/Demos** :
   ```html
   <img src="votre-screenshot.png" alt="Demo">
   ```

### Ajouter des screenshots

1. Créez le dossier `docs/assets/images/`
2. Ajoutez vos captures d'écran
3. Modifiez les URLs dans `index.html`

### Thème personnalisé

Modifiez le CSS dans `docs/index.html` ou créez `docs/style.css` :

```css
:root {
    --primary-color: #votre-couleur;
    --secondary-color: #votre-couleur-2;
}
```

## 🚀 Déploiement de l'Application

### Option A : Heroku (Recommandée)

1. **Créer une app Heroku** :
   ```bash
   heroku create votre-app-name
   ```

2. **Configurer les secrets GitHub** :
   - `HEROKU_API_KEY` : Votre clé API Heroku
   - `HEROKU_APP_NAME` : Nom de votre app
   - `HEROKU_EMAIL` : Votre email Heroku

3. **Variables d'environnement Heroku** :
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=votre-secret
   heroku config:set MONGODB_URI=votre-mongodb-uri
   ```

4. **Déploiement automatique** :
   ```bash
   git push origin main
   # Le workflow GitHub Actions déploie automatiquement
   ```

### Option B : Vercel

1. **Installer Vercel CLI** :
   ```bash
   npm i -g vercel
   ```

2. **Configuration** :
   ```bash
   vercel --prod
   ```

3. **Variables d'environnement** :
   Dans le dashboard Vercel, ajoutez :
   - `NODE_ENV=production`
   - `JWT_SECRET=votre-secret`
   - `MONGODB_URI=votre-mongodb-uri`

### Option C : Railway

1. **Connecter à Railway** :
   ```bash
   npm install -g @railway/cli
   railway login
   railway link
   ```

2. **Déployer** :
   ```bash
   railway up
   ```

## 📊 Monitoring et Analytics

### GitHub Pages Analytics

Ajoutez Google Analytics dans `docs/index.html` :

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_TRACKING_ID');
</script>
```

### Lighthouse CI

Le workflow inclut déjà Lighthouse CI pour mesurer :
- ⚡ Performance
- ♿ Accessibilité  
- 🔍 SEO
- 💻 Best Practices

## 🛠️ Outils et Intégrations

### Badges pour README

Ajoutez ces badges à votre README :

```markdown
![GitHub Pages](https://img.shields.io/github/deployments/your-username/multi-billeterie/github-pages?label=GitHub%20Pages)
![Heroku](https://img.shields.io/website?down_color=red&down_message=offline&up_color=green&up_message=online&url=https%3A%2F%2Fyour-app.herokuapp.com)
![Vercel](https://img.shields.io/github/deployments/your-username/multi-billeterie/production?label=Vercel&logo=vercel)
```

### Custom Domain

Pour utiliser votre propre domaine :

1. Créez `docs/CNAME` :
   ```
   votre-domaine.com
   ```

2. Configurez vos DNS :
   ```
   CNAME @ your-username.github.io
   ```

### SSL/HTTPS

GitHub Pages active automatiquement HTTPS pour :
- ✅ Sous-domaines github.io
- ✅ Domaines personnalisés (après vérification)

## 🔧 Dépannage

### Pages ne se déploie pas

1. **Vérifier les Actions** :
   - Allez dans l'onglet **Actions**
   - Vérifiez les logs d'erreur

2. **Permissions** :
   - Settings → Actions → General
   - Workflow permissions : **Read and write**

3. **Pages settings** :
   - Settings → Pages
   - Source : **GitHub Actions**

### App Heroku ne démarre pas

1. **Vérifier les logs** :
   ```bash
   heroku logs --tail --app votre-app
   ```

2. **Variables d'environnement** :
   ```bash
   heroku config --app votre-app
   ```

3. **Redémarrer** :
   ```bash
   heroku restart --app votre-app
   ```

### Build échoue

1. **Vérifier Node.js version** :
   ```json
   "engines": {
     "node": "18.x",
     "npm": "9.x"
   }
   ```

2. **Dépendances manquantes** :
   ```bash
   npm audit fix
   ```

## 📈 Métriques et Performances

### Core Web Vitals

Le Lighthouse CI mesure automatiquement :
- **LCP** (Largest Contentful Paint) : < 2.5s
- **FID** (First Input Delay) : < 100ms  
- **CLS** (Cumulative Layout Shift) : < 0.1

### Optimisations

1. **Images** : Utilisez WebP/AVIF
2. **CSS** : Minification automatique
3. **JS** : Code splitting si nécessaire
4. **CDN** : Bootstrap/jQuery depuis CDN

## 🎯 Checklist de Déploiement

### GitHub Pages ✅
- [ ] Repository public ou GitHub Pro
- [ ] Workflow `deploy-pages.yml` configuré
- [ ] Landing page créée dans `docs/`
- [ ] Configuration Jekyll `_config.yml`
- [ ] Actions GitHub activées
- [ ] Premier déploiement réussi

### Application ✅
- [ ] Plateforme choisie (Heroku/Vercel/Railway)
- [ ] Variables d'environnement configurées
- [ ] Base de données MongoDB accessible
- [ ] Secrets GitHub configurés
- [ ] Déploiement automatique activé
- [ ] Health check fonctionnel

### SEO & Performance ✅
- [ ] Balises meta configurées
- [ ] Sitemap généré
- [ ] Google Analytics (optionnel)
- [ ] Lighthouse CI configuré
- [ ] Custom domain (optionnel)
- [ ] HTTPS activé

## 🆘 Support

Si vous rencontrez des problèmes :

1. **Documentation GitHub Pages** : https://docs.github.com/pages
2. **Issues du projet** : Ouvrez une issue sur GitHub
3. **Discussions** : Utilisez GitHub Discussions
4. **Discord/Slack** : Rejoignez la communauté

---

🎉 **Félicitations !** Votre projet Multi-Billeterie est maintenant déployé et accessible au monde entier !

**URLs importantes** :
- 📖 Documentation : `https://your-username.github.io/multi-billeterie/`
- 🚀 Application : `https://your-app.heroku.com/`
- 📊 Métriques : GitHub Actions & Lighthouse CI