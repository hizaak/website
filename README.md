# alexandre maurice

Source code of [alexandremaurice.fr](https://alexandremaurice.fr), a landscape photography portfolio.

The site presents series of photographs in French and English. It was designed and built end to end: the public site, the API behind it, a full admin interface, the hosting setup and an automated deployment pipeline.

---

## Contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Project structure](#project-structure)
- [Quality and security](#quality-and-security)
- [Deployment](#deployment)
- [Getting started](#getting-started)
- [License](#license)

---

## Features

### Public site

- **Works gallery**: photographs grouped into series, each shown with the years it spans.
- **Photo viewer**: one photo at a time, browsable by click or keyboard, each with its own shareable URL.
- **Bilingual**: the whole site exists in French and English, with the visitor's language detected on their first visit.
- **Responsive images**: every photo comes in several sizes, and the browser loads the one that fits the screen.
- **Fast loading**: static pages are pre-rendered at build time, and neighbouring photos are preloaded in the background.

### Visibility

- **SEO**: titles, descriptions and language alternates for every page, in both languages.
- **Sitemap**: generated automatically from the content, always up to date.
- **Link previews**: sharing a link on WhatsApp, Discord, LinkedIn and others shows the right photo, title and description.

### Admin

A private, password-protected interface to manage the whole site without touching the code:

- **Series**: create, rename, delete.
- **Photos**: upload, edit, replace, reorder, delete, and download the original files.
- **Automatic image processing**: uploads are resized, compressed, stripped of personal metadata such as GPS location, and tagged with author and copyright.
- **Documents**: publish files such as a CV under short, readable URLs like `alexandremaurice.fr/documents/cv`.
- **Account**: change username and password.

---

## Tech stack

| Area           | Technologies             |
| -------------- | ------------------------ |
| Frontend       | Angular, TypeScript, SCSS |
| Translations   | ngx-translate            |
| Backend        | Node.js, Express         |
| Database       | MongoDB                  |
| Image processing | Sharp                  |
| API docs       | Swagger                  |
| Hosting        | Docker, nginx, VPS       |
| CI/CD          | GitHub Actions           |

---

## Architecture

The repository holds two applications:

- **`frontend/`**: the public site and the admin interface, built with Angular and served by nginx.
- **`backend/`**: a REST API built with Express, which stores the content, processes images and serves photos and documents.

In production, everything runs as three Docker containers that start in order and are health-checked: database, then API, then site.

```
                        Visitor
                           │
                ┌──────────▼──────────┐
                │        Site         │   alexandremaurice.fr
                │  Angular + nginx    │
                └──────────┬──────────┘
                           │
                ┌──────────▼──────────┐
                │         API         │   api.alexandremaurice.fr
                │  Node.js + Express  │
                └─────┬──────────┬────┘
                      │          │
              ┌───────▼───┐  ┌───▼───────────┐
              │  MongoDB  │  │   Photos and  │
              │           │  │   documents   │
              └───────────┘  └───────────────┘
```

**Site.** Pages that rarely change (works, about, contact, legal) are pre-rendered into plain HTML at build time, so they display instantly and are fully readable by search engines. The rest, including the viewer and the admin, loads on demand.

**API.** Serves the content to the site and handles every change made from the admin. It also generates the sitemap and the link previews. Interactive documentation is available at `/api-docs`.

**nginx.** Serves the site and routes each request to the right place: a page, a published document, or the API.

---

## Project structure

```
.
├── frontend/
│   ├── src/app/
│   │   ├── pages/              Works, viewer, about, contact, legal, admin
│   │   ├── shared/             Header and admin navigation
│   │   ├── services/           Communication with the API
│   │   ├── core/               Language, SEO, authentication
│   │   ├── guards/             Admin access control
│   │   └── interfaces/
│   ├── src/i18n/               French and English texts
│   ├── nginx.conf              Routing and caching
│   └── Dockerfile
│
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── services/               Shared business logic
│   ├── models/                 Data models (works, photos, user)
│   ├── config/                 Database, auth, validation, image pipeline, API docs
│   ├── scripts/                (Only to set admin password)
│   ├── test/
│   ├── uploads/                Uploaded photos and documents (not versioned)
│   └── Dockerfile
│
├── .github/workflows/          CI/CD pipeline
├── docker-compose.yml          Production setup
├── Makefile
├── setup.sh                    Development machine setup
└── configure-env.sh            Interactive configuration of the .env files
```

---

## Quality and security

**Quality**

- Automated tests cover the API and the site: authentication, works, photo uploads and ordering, documents, SEO.
- Every change is linted and tested automatically; nothing ships if a check fails.

**Security**

- Password-protected admin, with rate-limited login attempts.
- Passwords are hashed, never stored in plain text.
- All incoming data is validated before being accepted.
- Strict browser security headers, including a Content Security Policy.
- Original photo files are never publicly accessible.
- Secrets live outside the code and the repository.

---

## Deployment

Every push to `main` is tested and deployed automatically with GitHub Actions.

```
               Push to main
                     │
       ┌─────────────┴─────────────┐
       ▼                           ▼
┌──────────────┐          ┌──────────────────┐
│     API      │          │       Site       │
│ lint, tests  │          │ lint, tests,     │
│              │          │ build            │
└──────┬───────┘          └────────┬─────────┘
       └─────────────┬─────────────┘
                     ▼
        ┌──────────────────────────┐
        │ Deploy to the VPS        │
        │ over SSH and healthcheck │
        └──────────────────────────┘
```

1. **Checks**: the API and the site are linted and tested in parallel.
2. **Deploy**: once both pass, GitHub connects to the server, pulls the latest code and rebuilds the containers.
3. **Health check**: the deploy only succeeds if every container comes back up healthy.

Pull requests go through the same checks without being deployed. Uploaded content and server configuration are never touched by a deploy.

---

## Getting started

**Requirements**: Node.js, npm and Docker.

### Local development

```bash
# Install dependencies and configure the .env files
make setup

# Start the development database
make dev-db

# Then, in two terminals
npm run dev:backend        # API on http://localhost:3000
npm run dev:frontend       # Site on http://localhost:4200
```

`make setup` installs the dependencies, then runs the configuration script described below. The admin account is created on first start, with the password chosen during configuration.

### Production

```bash
make env                   # Choose "Production"
make prod
```

### Configuration

Settings and secrets live in two files that are not versioned:

- `.env`: production settings, read by Docker Compose;
- `backend/.env`: API settings, used in development and production.

They can be filled in by hand from the `.env.example` templates, or with an interactive script:

```bash
make env                   # or: bash configure-env.sh
```

The script asks whether it runs on a development machine or on the production server, then:

- generates the secret key used to sign admin sessions;
- asks for the admin password (and, in production, the database password), or generates a strong one if left empty;
- keeps values that are already set, unless asked to change them.

Generated passwords are shown once at the end. The script can be run again at any time.

### Commands

| Command          | Description                                      |
| ---------------- | ------------------------------------------------ |
| `make setup`     | Install dependencies and configure the `.env` files |
| `make env`       | Configure the `.env` files (secrets and passwords) |
| `make dev-db`    | Start the development database                   |
| `make prod`      | Build and start production                       |
| `make stop`      | Stop the containers                              |
| `make restart`   | Restart the containers                           |
| `make logs`      | Follow the logs                                  |
| `make lint`      | Lint the code                                    |
| `make test`      | Run the tests                                    |
| `make clean`     | Remove the containers and the database           |

To reset the admin password on the server:

```bash
docker exec -it site-perso-backend node scripts/set-admin-password.js
```

---

## License

Copyright (c) 2026 Alexandre Maurice. All rights reserved.

This repository is published for reference only. The photographs and other content shown on alexandremaurice.fr are not part of it and remain the property of their author. See [LICENSE](LICENSE).
