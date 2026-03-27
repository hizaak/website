# ⚡ Quick Start Guide

## 🚀 En 5 minutes

### 1. Cloner et setup
```bash
git clone git@github.com:Hizaak/website.git
cd website
bash setup.sh          # Ou: make setup
```

### 2. Lancer
```bash
make dev              # Ou: docker-compose up
```

### 3. Accéder
- Frontend: http://localhost:4200
- API: http://localhost:3000
- MongoDB: mongodb://admin:changeme@localhost:27017

---

## 📚 Commandes Principales

### Développement
```bash
make dev              # Lancer tous les services
make logs             # Voir les logs
make stop             # Arrêter
```

### Production
```bash
make prod             # Lancer en production
./deploy.sh           # Déploiement complet
```

### Utiles
```bash
make help             # Voir toutes les commandes
docker-compose ps     # Status des services
docker-compose logs -f backend  # Logs backend
```

---

## 🔑 Variables d'Environnement

Modifier `.env` pour configurer:

```env
JWT_SECRET=ta-clé-secrète
MONGO_ROOT_PASSWORD=ton-mot-de-passe
CORS_ORIGIN=ton-domaine
```

⚠️ **Générer des clés sécurisées:**
```bash
openssl rand -base64 32    # JWT Secret
openssl rand -base64 24    # MongoDB Password
```

---

## 🆘 Problèmes Courants

| Problème | Solution |
|----------|----------|
| Port déjà utilisé | `docker-compose down && docker-compose up` |
| MongoDB ne démarre pas | Vérifier MONGO_ROOT_PASSWORD dans .env |
| Frontend vide | Attendre compilation (1-2 min) |
| Erreur CORS | Vérifier CORS_ORIGIN dans backend/.env |

---

## 📖 Documentation Complète

- **Development**: Voir `README.md`
- **Deployment**: Voir `DEPLOYMENT.md`
- **Contributing**: Voir `CONTRIBUTING.md`

---

## 🎯 Prochaines Étapes

1. [ ] Configurer variables d'env (.env)
2. [ ] Lancer `make dev`
3. [ ] Tester les endpoints (Bruno: ./bruno/)
4. [ ] Lire README.md complètement
5. [ ] Créer ta première feature

**Besoin d'aide?** Consulte README.md section Troubleshooting.
