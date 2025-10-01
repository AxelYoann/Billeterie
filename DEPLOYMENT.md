# 🚀 Guide de Déploiement

Ce guide vous explique comment déployer Multi-Billeterie en production sur différentes plateformes.

## 📋 Prérequis

- Node.js 18+ installé
- MongoDB (local ou cloud)
- Git installé
- Variables d'environnement configurées

## 🌐 Déploiement sur Heroku

### 1. Préparation

```bash
# Installer Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Se connecter à Heroku
heroku login

# Créer une nouvelle app
heroku create votre-app-name
```

### 2. Configuration des variables d'environnement

```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=votre-jwt-secret-super-securise
heroku config:set MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
heroku config:set EMAIL_HOST=smtp.sendgrid.net
heroku config:set EMAIL_USER=apikey
heroku config:set EMAIL_PASS=votre-sendgrid-api-key
```

### 3. Déploiement

```bash
# Ajouter Heroku comme remote
git remote add heroku https://git.heroku.com/votre-app-name.git

# Déployer
git push heroku main

# Ouvrir l'application
heroku open
```

### 4. Maintenance

```bash
# Voir les logs
heroku logs --tail

# Redémarrer l'app
heroku restart

# Ouvrir une console
heroku run bash
```

## 🐳 Déploiement avec Docker

### 1. Build local

```bash
# Construire l'image
docker build -t multi-billeterie .

# Lancer le conteneur
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e MONGODB_URI=mongodb://mongo:27017/multi-billeterie \
  -e JWT_SECRET=votre-secret \
  multi-billeterie
```

### 2. Docker Compose (production)

Créer `docker-compose.prod.yml` :

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/multi-billeterie
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongo
    restart: unless-stopped
    
  mongo:
    image: mongo:6.0
    volumes:
      - mongo_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  mongo_data:
```

```bash
# Lancer en production
docker-compose -f docker-compose.prod.yml up -d
```

## ☁️ Déploiement AWS

### 1. AWS Elastic Beanstalk

```bash
# Installer EB CLI
pip install awsebcli

# Initialiser
eb init

# Créer un environnement
eb create production

# Déployer
eb deploy

# Ouvrir l'application
eb open
```

### 2. AWS ECS avec Fargate

Créer `task-definition.json` :

```json
{
  "family": "multi-billeterie",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "multi-billeterie",
      "image": "your-repo/multi-billeterie:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/multi-billeterie",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

## 🔷 Déploiement Azure

### 1. Azure Container Instances

```bash
# Se connecter à Azure
az login

# Créer un groupe de ressources
az group create --name multi-billeterie-rg --location "West Europe"

# Déployer le conteneur
az container create \
  --resource-group multi-billeterie-rg \
  --name multi-billeterie \
  --image your-registry/multi-billeterie:latest \
  --dns-name-label multi-billeterie-unique \
  --ports 3000 \
  --environment-variables NODE_ENV=production \
  --secure-environment-variables JWT_SECRET=votre-secret
```

### 2. Azure App Service

```bash
# Créer un plan App Service
az appservice plan create \
  --name multi-billeterie-plan \
  --resource-group multi-billeterie-rg \
  --sku B1 \
  --is-linux

# Créer l'app web
az webapp create \
  --resource-group multi-billeterie-rg \
  --plan multi-billeterie-plan \
  --name multi-billeterie-app \
  --deployment-container-image-name your-registry/multi-billeterie:latest
```

## 🏗️ Déploiement DigitalOcean

### 1. Droplet (VPS)

```bash
# Se connecter au droplet
ssh root@votre-ip

# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Cloner le projet
git clone https://github.com/your-username/multi-billeterie.git
cd multi-billeterie

# Configurer l'environnement
cp .env.example .env
nano .env  # Éditer les variables

# Lancer avec Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

### 2. App Platform

Créer `.do/app.yaml` :

```yaml
name: multi-billeterie
region: fra
services:
- name: web
  source_dir: /
  github:
    repo: your-username/multi-billeterie
    branch: main
  build_command: npm ci
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: JWT_SECRET
    value: ${JWT_SECRET}
    type: SECRET
  - key: MONGODB_URI
    value: ${MONGODB_URI}
    type: SECRET
databases:
- name: mongodb
  engine: MONGODB
  version: "5"
  size: db-s-1vcpu-1gb
```

## 🔧 Configuration Nginx

Créer `nginx.conf` pour le reverse proxy :

```nginx
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;
    
    server {
        listen 80;
        server_name your-domain.com;
        
        # Redirect HTTP to HTTPS
        return 301 https://$server_name$request_uri;
    }
    
    server {
        listen 443 ssl http2;
        server_name your-domain.com;
        
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        
        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
        
        # Gzip compression
        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
        
        # Static files
        location /public/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            try_files $uri =404;
        }
        
        # API rate limiting
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # Login rate limiting
        location /auth/login {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # All other requests
        location / {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

## 📊 Monitoring et Logs

### 1. Monitoring avec PM2

```bash
# Installer PM2
npm install -g pm2

# Créer ecosystem.config.js
module.exports = {
  apps: [{
    name: 'multi-billeterie',
    script: 'src/app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm Z'
  }]
};

# Lancer avec PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 2. Logs avec Winston

```javascript
// src/utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'multi-billeterie' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

## 🔐 SSL/TLS avec Let's Encrypt

```bash
# Installer Certbot
sudo apt install certbot python3-certbot-nginx

# Obtenir un certificat
sudo certbot --nginx -d your-domain.com

# Renouvellement automatique
sudo crontab -e
# Ajouter : 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📈 Optimisations de Performance

### 1. Configuration Node.js

```bash
# Variables d'environnement pour la production
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=4096"
export UV_THREADPOOL_SIZE=16
```

### 2. Configuration MongoDB

```javascript
// Connexion avec pool
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferCommands: false,
  bufferMaxEntries: 0
});
```

## 🚨 Checklist de Déploiement

- [ ] Variables d'environnement configurées
- [ ] Base de données accessible
- [ ] SSL/TLS configuré
- [ ] Monitoring en place
- [ ] Backups configurés
- [ ] Firewall configuré
- [ ] Rate limiting activé
- [ ] Logs centralisés
- [ ] Health checks configurés
- [ ] Auto-scaling configuré (si applicable)
- [ ] CDN configuré pour les assets statiques
- [ ] Tests de charge effectués

## 🆘 Dépannage

### Problèmes courants

1. **Port déjà utilisé**
   ```bash
   # Tuer le processus sur le port 3000
   sudo lsof -ti:3000 | xargs kill -9
   ```

2. **MongoDB connexion échoue**
   ```bash
   # Vérifier la connexion
   mongo "mongodb+srv://cluster.mongodb.net/test" --username username
   ```

3. **Variables d'environnement manquantes**
   ```bash
   # Vérifier les variables
   printenv | grep NODE_ENV
   ```

4. **Certificats SSL expirés**
   ```bash
   # Renouveler avec Certbot
   sudo certbot renew
   ```

---

**Besoin d'aide ?** Ouvrez une [issue](https://github.com/your-username/multi-billeterie/issues) sur GitHub !