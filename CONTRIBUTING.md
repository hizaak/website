# 🤝 Guide de Contribution

Merci de contribuer à ce projet ! Ce guide t'explique comment bien démarrer.

## 📋 Avant de Commencer

1. Fork le dépôt
2. Clone ta copie : `git clone git@github.com:TON-USERNAME/website.git`
3. Crée une branche : `git checkout -b feature/ma-feature`
4. Setup le projet : `make setup`

## 🔧 Setup Local

```bash
# Installation complète
make setup

# OU manuellement
npm run setup:deps
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

## 🚀 Développement

### Lancer les services

```bash
# Option 1: Avec Make (Recommandé)
make dev

# Option 2: Avec Docker Compose
docker-compose up

# Option 3: Avec npm
npm run dev
```

### Développer le Backend

```bash
# Terminal séparé
cd backend
npm run dev

# Accès: http://localhost:3000
# Test les endpoints avec Bruno: ../bruno/
```

### Développer le Frontend

```bash
# Terminal séparé
cd frontend
npm start

# Accès: http://localhost:4200
# HMR automatique activé
```

### Tester avec Bruno

Utilise l'API REST client **Bruno** :

```bash
cd bruno
# Ouvre Bruno et importe les collections
# Endpoints: login.bru, getAllPhotos.bru, etc.
```

## 📝 Conventions de Code

### Commits

Utiliser les **Conventional Commits** :

```
feat: ajouter upload de photos
fix: corriger bug auth
docs: améliorer README
style: formater le code
refactor: réorganiser les services
perf: optimiser les requêtes
test: ajouter tests authentification
chore: mettre à jour dependencies
```

### Branches

```
main          # Production (stable)
dev           # Développement
feature/*     # Nouvelles features
fix/*         # Corrections de bugs
docs/*        # Documentation
```

### Code Style

**Backend (Node.js)**
- Indentation: 2 espaces
- Noms: camelCase pour les variables, PascalCase pour les classes
- Pas de var, utiliser const/let
- Ajouter les commentaires pour la logique complexe

**Frontend (Angular)**
- Suivre les conventions Angular officielles
- Utiliser standalone components
- Noms: camelCase pour les fichiers/variables, PascalCase pour les classes
- Ajouter JSDoc pour les méthodes publiques
- Utiliser TypeScript strict mode

## 🧪 Tests

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# Tous les tests
npm run test
```

## 📤 Pull Request

1. **Avant de push**, assurez-vous que:
   - Le code fonctionne localement : `make dev`
   - Pas d'erreurs de build
   - Tests passent (si applicable)

2. **Commit message clair** :
   ```bash
   git commit -m "feat: ajouter dashboard admin"
   ```

3. **Push vers ta branche** :
   ```bash
   git push origin feature/ma-feature
   ```

4. **Ouvre une Pull Request** :
   - Titre clair et descriptif
   - Description des changements
   - Lien vers les issues (si applicable)
   - Screenshots/videos si UI change

## 🔍 Review Checklist

Avant de soumettre un PR:

- [ ] Code formaté et cohérent
- [ ] Pas de `console.log` de debug
- [ ] Variables d'env pas commitées (utiliser .env.example)
- [ ] Pas de fichiers inutiles
- [ ] Tests passent
- [ ] Documentation à jour si nécessaire
- [ ] Pas de breaking changes (ou bien documentés)

## 🐛 Signaler un Bug

1. Vérifie que le bug existe réellement
2. Crée une issue avec:
   - Titre descriptif
   - Description du problème
   - Étapes pour reproduire
   - Résultat attendu vs actuel
   - Environnement (OS, versions, etc)

## 💡 Suggérer une Amélioration

1. Ouvre une issue avec le tag `enhancement`
2. Explique ton idée clairement
3. Montre pourquoi c'est utile
4. Propose une implémentation si possible

## 📚 Ressources

- [Angular Docs](https://angular.dev)
- [Express Docs](https://expressjs.com)
- [MongoDB Docs](https://docs.mongodb.com)
- [Docker Docs](https://docs.docker.com)

## 🎯 Projet Structure

```
site-perso/
├── backend/           # API Node/Express
├── frontend/          # App Angular
├── bruno/             # Tests API
├── docker-compose.yml # Orchestration
├── Makefile          # Commandes
└── README.md         # Documentation
```

## 🆘 Besoin d'Aide?

1. Consulte la [FAQ](README.md#troubleshooting)
2. Regarde les [Issues existantes](../../issues)
3. Crée une nouvelle issue avec `question` tag

## 📄 License

Tous les contributions sont sous license ISC.

---

**Merci pour ta contribution! 🙏**
