# 📸 Site Personnel - Portfolio

Un site personnel moderne avec galerie de photos, portfolio et panel admin. Architecture fullstack avec Angular (frontend), Node.js/Express (backend) et MongoDB (database).

---

## 🏗️ Architecture

```
site-perso/
├── backend/                 # API Node.js/Express
│   ├── controllers/         # Logique métier
│   ├── models/             # Schémas MongoDB
│   ├── routes/             # Endpoints API
│   ├── public/uploads/     # Fichiers téléchargés
│   ├── Dockerfile          # Image Docker backend
│   ├── index.js            # Point d'entrée
│   └── package.json        # Dépendances Node
│
├── frontend/               # Application Angular
│   ├── src/
│   │   ├── app/            # Composants Angular
│   │   ├── services/       # Services API
│   │   └── environments/   # Configuration
│   ├── Dockerfile          # Image Docker frontend
│   ├── nginx.conf          # Configuration nginx
│   └── package.json        # Dépendances Angular
│
├── docker-compose.yml      # Orchestration des services
├── package.json            # Scripts de gestion
├── Makefile                # Commandes de développement
├── .env.example            # Variables d'exemple
└── README.md               # Cette documentation
```

---

## 🚀 Démarrage Rapide

### Prérequis

- **Docker** (v20.10+)
- **Docker Compose** (v2.0+)
- **Node.js** (v18+) - *pour le développement local*
- **Git**

### Installation Initiale

```bash
# 1. Cloner le repo
git clone git@github.com:Hizaak/website.git
cd website

# 2. Setup initial (copie des fichiers .env et installation des dépendances)
make setup

# OU avec npm
npm run setup
```

### Lancement en Développement

```bash
# Avec Make
make dev

# OU avec Docker Compose
docker-compose up

# OU avec npm
npm run dev
```

**Accès :**
- 🌐 **Frontend** : http://localhost:4200
- 🔌 **API Backend** : http://localhost:3000
- 🗄️ **MongoDB** : mongodb://localhost:27017

---

## 📋 Commandes Disponibles

### 🔨 Make (Recommandé)

```bash
make setup              # Setup initial
make dev                # Lancer en dev
make prod               # Lancer en production
make logs               # Voir tous les logs
make logs-backend       # Logs du backend
make stop               # Arrêter les services
make clean              # Nettoyer complètement
```

### 📦 NPM

```bash
npm run setup           # Setup initial
npm run dev             # Lancer en dev
npm run dev:build       # Lancer avec rebuild
npm run prod            # Lancer en production
npm run stop            # Arrêter
npm run logs            # Voir les logs
npm run clean           # Nettoyer
```

### 🐳 Docker Compose Directement

```bash
docker-compose up                    # Lancer
docker-compose up --build            # Rebuild et lancer
docker-compose down                  # Arrêter
docker-compose logs -f               # Logs
docker-compose exec backend /bin/sh  # Shell du backend
```

---

## ⚙️ Configuration

### Variables d'Environnement

Copier `.env.example` en `.env` et configurer :

```bash
cp .env.example .env
```

**Variables importantes :**

| Variable | Description | Exemple |
|----------|-------------|---------|
| `NODE_ENV` | Environnement | `production`, `development` |
| `JWT_SECRET` | ⚠️ Clé secrète JWT | Très long aléatoire |
| `MONGO_ROOT_PASSWORD` | ⚠️ Mot de passe admin DB | Fort et sécurisé |
| `CORS_ORIGIN` | Origine CORS autorisée | `http://localhost:80` |
| `ANGULAR_ENV` | Env Angular | `production`, `development` |
| `API_URL` | URL du backend | `http://backend:3000` |

### ⚠️ Sécurité (Production)

1. **Générer une clé JWT sécurisée :**
```bash
openssl rand -base64 32
```

2. **Générer un mot de passe MongoDB fort :**
```bash
openssl rand -base64 24
```

3. **Mettre à jour le `.env` :**
```env
JWT_SECRET=votre-clé-très-longue
MONGO_ROOT_PASSWORD=votre-mot-de-passe-fort
```

---

## 📱 Développement Local

### Lancer les services séparément

**Terminal 1 - Backend (port 3000) :**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 - Frontend (port 4200) :**
```bash
cd frontend
npm install
npm start
```

**Terminal 3 - MongoDB (port 27017) :**
```bash
docker run -d \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=changeme \
  -p 27017:27017 \
  mongo:7.0-alpine
```

### Structure du Projet

#### Backend

```
backend/
├── index.js                 # Point d'entrée principal
├── config/
│   └── db.js               # Configuration MongoDB
├── controllers/
│   ├── authController.js   # Authentification
│   ├── photoController.js  # Gestion des photos
│   └── serieController.js  # Gestion des séries
├── models/
│   ├── User.js             # Modèle utilisateur
│   ├── Photo.js            # Modèle photo
│   └── Serie.js            # Modèle série de photos
├── routes/
│   ├── authRoutes.js       # Routes auth
│   ├── photosRoutes.js     # Routes photos
│   └── seriesRoutes.js     # Routes séries
└── public/uploads/         # Uploads des photos
```

**Points d'entrée API :**
- `POST /auth/login` - Connexion
- `GET /photos` - Toutes les photos
- `GET /photos/random` - Photo aléatoire
- `GET /series` - Toutes les séries
- `POST /series` - Créer une série
- `PUT /series/:id` - Modifier une série
- `DELETE /series/:id` - Supprimer une série

#### Frontend

```
frontend/src/
├── app/
│   ├── app.component.ts    # Composant racine
│   ├── app.routes.ts       # Routage Angular
│   ├── core/
│   │   ├── auth.service.ts    # Service auth
│   │   └── toast.service.ts   # Notifications
│   ├── guards/
│   │   ├── auth.guard.ts      # Protection des routes
│   │   └── no-auth.guard.ts   # Inverse du précédent
│   ├── pages/
│   │   ├── home/              # Page d'accueil
│   │   ├── gallery/           # Galerie de photos
│   │   ├── about/             # À propos
│   │   ├── blog/              # Blog (futur)
│   │   ├── contact/           # Contact (futur)
│   │   └── admin/dashboard/   # Dashboard admin
│   ├── services/api/
│   │   ├── abstract-request.service.ts  # Base de requêtes
│   │   ├── photo.service.ts             # Service photos
│   │   └── serie.service.ts             # Service séries
│   └── shared/
│       └── components/
│           └── header/        # Header navigation
├── environments/
│   ├── environment.ts                # Production
│   └── environment.development.ts    # Développement
└── styles/
    └── reset.scss              # Reset CSS
```

---

## 🗄️ Base de Données

### MongoDB Collections

**Users**
```json
{
  "_id": ObjectId,
  "username": "admin",
  "email": "admin@example.com",
  "password": "hashed_password",
  "createdAt": Date,
  "updatedAt": Date
}
```

**Photos**
```json
{
  "_id": ObjectId,
  "title": "Photo Title",
  "path": "/uploads/photo.jpg",
  "date": "2024-03-27",
  "size": 234.5,
  "serie": ObjectId,
  "createdAt": Date,
  "updatedAt": Date
}
```

**Series**
```json
{
  "_id": ObjectId,
  "title": "Série Title",
  "years": "2023-2024",
  "photos": [ObjectId, ObjectId, ...],
  "createdAt": Date,
  "updatedAt": Date
}
```

---

## 🔐 Authentification

### Flow JWT

1. **Login** : POST `/auth/login` avec username/password
2. **Token** : Backend retourne un JWT
3. **Storage** : Frontend stocke le token en localStorage
4. **Usage** : Header `Authorization: Bearer <token>`
5. **Protection** : Routes protégées par `AuthGuard`

### Guards

- **AuthGuard** : Protège les routes admin (dashboard)
- **NoAuthGuard** : Empêche l'accès à login si déjà connecté

---

## 📦 Déploiement

### Production avec Docker

```bash
# Build et lancer
make prod

# OU
npm run prod

# Vérifier que tout marche
docker-compose ps
```

### Avec Registre Docker (optionnel)

```bash
# Tagguer les images
docker tag site-perso-backend:latest your-registry/backend:latest
docker tag site-perso-frontend:latest your-registry/frontend:latest

# Push
docker push your-registry/backend:latest
docker push your-registry/frontend:latest
```

### Health Checks

Les services ont des health checks intégrés :
- ✅ Backend : HTTP GET `/` (port 3000)
- ✅ MongoDB : `ping` command
- ✅ Frontend : HTTP GET `/` (port 80)

---

## 🧪 Tests

```bash
# Backend (futur : Mocha)
npm run backend:test

# Frontend (Jasmine/Karma)
npm run frontend:test

# Tous les tests
npm run test
```

---

## 📚 API Documentation

### Endpoints Principaux

```http
# Auth
POST /auth/login
  Body: { username, password }
  Response: { token }

# Photos
GET /photos              # Toutes les photos
GET /photos/random       # Photo aléatoire
GET /photos/:id          # Une photo
POST /photos             # Créer
PUT /photos/:id          # Modifier
DELETE /photos/:id       # Supprimer

# Séries
GET /series              # Toutes les séries
GET /series/:id          # Une série
POST /series             # Créer
PUT /series/:id          # Modifier
DELETE /series/:id       # Supprimer
```

Utilise **Bruno** (./bruno/) pour tester les endpoints.

---

## 🐛 Troubleshooting

### Les services ne démarrent pas

```bash
# Vérifier les logs
docker-compose logs

# Redémarrer complètement
make clean
make dev
```

### Port déjà utilisé

```bash
# Voir quel processus utilise le port
lsof -i :3000
lsof -i :4200
lsof -i :27017

# Tueur le processus
kill -9 <PID>
```

### Problèmes MongoDB

```bash
# Se connecter à MongoDB
make shell-mongodb

# Vérifier les collections
show collections
db.users.find()
```

### Problèmes CORS

Vérifier que `CORS_ORIGIN` dans `.env` correspond à ton domaine frontend.

---

## 🔄 Workflow Git

```bash
# Créer une branche de feature
git checkout -b feature/my-feature

# Commit réguliers
git add .
git commit -m "feat: description"

# Push
git push origin feature/my-feature

# PR sur main (avant merge)
```

---

## 📝 Conventions

### Commits

```
feat: nouvelle fonctionnalité
fix: correction de bug
docs: documentation
style: formatage
refactor: restructuring
perf: optimisation
test: tests
chore: maintenance
```

### Branches

- `main` - Production
- `dev` - Développement
- `feature/*` - Nouvelles features
- `fix/*` - Bug fixes

---

## 📄 Licence

ISC - Alexandre Maurice

---

## 👥 Support

En cas de problème, consulte :
- Logs Docker : `docker-compose logs`
- Bruno pour tester l'API : `./bruno/`
- Variables d'env : `.env.example`

**Besoin d'aide ?**
```bash
# Voir toutes les commandes
make help

# Ou
npm run
```

---

**Dernière mise à jour** : 27 Mars 2026
