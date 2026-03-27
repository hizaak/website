# Site Personnel - Configuration Complète

## 🔐 Production Checklist

### Avant le déploiement en production:

- [ ] JWT_SECRET est défini avec une clé longue
- [ ] MONGO_ROOT_PASSWORD est un mot de passe fort
- [ ] NODE_ENV = production
- [ ] CORS_ORIGIN est correctement configuré
- [ ] Certificats SSL/TLS prêts (si domaine en HTTPS)
- [ ] Backups MongoDB configurés
- [ ] Logs centralisés configurés (optionnel)
- [ ] Monitoring configuré (optionnel)

## 🌍 Variables d'Environnement par Environnement

### Développement (`development`)

```env
NODE_ENV=development
BACKEND_PORT=3000
JWT_SECRET=dev-secret-key-not-for-production
CORS_ORIGIN=http://localhost:4200
MONGO_DB_NAME=site-perso-dev
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=dev-password
ANGULAR_ENV=development
API_URL=http://localhost:3000
```

### Production (`production`)

```env
NODE_ENV=production
BACKEND_PORT=3000
JWT_SECRET=<generate-avec-openssl-rand-base64-32>
CORS_ORIGIN=https://alexandremaurice.fr
MONGO_DB_NAME=site-perso
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=<generate-avec-openssl-rand-base64-24>
ANGULAR_ENV=production
API_URL=https://api.alexandremaurice.fr
```

## 🔐 Générer des Clés Sécurisées

### JWT Secret
```bash
openssl rand -base64 32
# Exemple output: 
# vH9qK2mL3nP5rS7tU9vW1xY3zA5bC7dE9fG1hI3jK5lM7nO9pQ1rS3tU5vW7xY9zA1b
```

### MongoDB Password
```bash
openssl rand -base64 24
# Exemple output:
# aB3cD5eF7gH9iJ1kL3mN5oP7qR9sT1u
```

## 📊 Monitoring

### Health Checks

- **Backend** : GET http://localhost:3000/health (ajouter si besoin)
- **Frontend** : GET http://localhost/index.html
- **MongoDB** : `db.runCommand("ping")`

### Logs à surveiller

```bash
# Tous les services
docker-compose logs -f

# Backend uniquement
docker-compose logs -f backend

# Erreurs seulement
docker-compose logs -f backend | grep ERROR
```

## 🔒 SSL/TLS Configuration (Optional)

Si tu veux HTTPS:

1. Obtenir les certificats (Let's Encrypt):
```bash
certbot certonly --standalone -d alexandremaurice.fr
```

2. Copier les certificats:
```bash
cp /etc/letsencrypt/live/alexandremaurice.fr/fullchain.pem ./certs/
cp /etc/letsencrypt/live/alexandremaurice.fr/privkey.pem ./certs/
```

3. Mettre à jour le nginx.conf et docker-compose.yml

## 📈 Scaling (Futur)

Pour scaler en production:

1. **Kubernetes** - Déployer les conteneurs
2. **Load Balancer** - Nginx ou HAProxy
3. **CDN** - CloudFlare ou AWS CloudFront
4. **Database Replication** - MongoDB Atlas
5. **Logs Centralisés** - ELK Stack ou similar

## 🛡️ Sécurité

### Recommandations

1. **HTTPS obligatoire** - Redirection auto HTTP → HTTPS
2. **Rate limiting** - Implémenter express-rate-limit
3. **CORS strict** - Uniquement domaines autorisés
4. **Validation input** - Joi ou Zod
5. **JWT expiration** - Configurer TTL court
6. **CSRF Protection** - Token CSRF si formulaires
7. **Sanitization** - Éviter XSS
8. **Secrets en secret** - Jamais en git (utiliser .env)

### Headers de Sécurité

À ajouter au backend:
```javascript
const helmet = require('helmet');
app.use(helmet());
```

## 💾 Backups

### MongoDB Backup

```bash
# Dump local
mongodump --uri "mongodb://admin:password@localhost:27017/site-perso"

# Dump depuis conteneur
docker-compose exec mongodb mongodump --uri "mongodb://admin:password@localhost:27017/site-perso"

# Restore
mongorestore --uri "mongodb://admin:password@localhost:27017" dump/
```

### Uploads Backup

```bash
# Backup des uploads
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz backend/public/uploads/

# Restore
tar -xzf uploads-backup-20240327.tar.gz -C backend/public/
```

## 🚀 CI/CD Pipeline (Futur)

Exemple GitHub Actions:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm run test
      
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: ./deploy.sh
```

## 📞 Support

En cas de problème:
- Voir README.md
- Voir CONTRIBUTING.md
- Checker les logs: `docker-compose logs`
- Créer une issue sur GitHub
