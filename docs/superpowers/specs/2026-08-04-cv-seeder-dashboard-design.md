# CV Seeder + Dashboard Overview + Settings Submenu — Design

**Date:** 2026-08-04
**Status:** Approved by user
**Scope:** Option A (existing models only: Experience, Projects, Skills) + Dashboard UX improvements

## Goal

1. Create a CV seeder that populates the portfolio (wallydev.dev) with the user's real CV data (Experience, Projects, Skills).
2. Make the dashboard Overview page useful (currently renders Blog Posts).
3. Move SEO + Notifications into a nested submenu under Settings in the dashboard sidebar.

## Decisions (from brainstorming)

| Decision | Choice |
|---|---|
| Seeder scope | Only existing models: Experience, Projects, Skills |
| Seeder behavior | Full replacement (destructive, wipes tables then seeds) |
| Project images | Placeholder images (placehold.co, theme colors), user replaces later via dashboard |
| Overview content | Stats cards + recent messages + quick links |
| Stats source | Dedicated backend endpoint `GET /api/v1/dashboard/stats` |
| Sidebar | Settings becomes an expandable accordion with submenu (Settings hub, SEO, Notifications) |
| Privacy | **No personal info seeded**: no phone, no address, no personal email (`waliuxd@gmail.com`). Contact references use `contact@wallydev.dev` only. |

## Section 1 — CV Seeder (`backend/scripts/seed_cv.py`)

Follows the `seed_admin.py` pattern: `SessionLocal`, `main()`, prints summary.
Run with: `docker exec portfolio_backend python -m scripts.seed_cv`

**Deletion order (FK-safe):** delete `skills` → `skill_categories` → `experiences` → `projects`; then insert everything.

All translatable fields are JSON `{"en": ..., "es": ...}` (site is bilingual; CV is in Spanish, English is a translation).

### Skill Categories (7)

1. Languages / Lenguajes
2. Frontend / Frontend
3. Backend / Backend
4. Databases / Bases de Datos
5. DevOps & Cloud / DevOps y Nube
6. Architecture & Methodologies / Arquitectura y Metodologías
7. Tools / Herramientas

### Skills (~45, with estimated levels 0-100 + IconPicker catalog icon names)

| Skill | Level | Icon (catalog name or null) |
|---|---|---|
| Python | 95 | Python |
| React | 93 | React |
| JavaScript | 92 | JavaScript |
| Django | 92 | Django |
| PostgreSQL | 92 | PostgreSQL |
| Next.js | 90 | Next.js |
| FastAPI | 90 | FastAPI |
| TypeScript | 90 | TypeScript |
| Docker | 90 | Docker |
| Git | 90 | Git |
| Tailwind CSS | 88 | Tailwind |
| Node.js | 88 | Node.js |
| Angular | 85 | Angular |
| Redis | 85 | Redis |
| MongoDB | 85 | MongoDB |
| MySQL | 85 | MySQL |
| AWS | 85 | null (removed from Simple Icons v5) |
| GitHub Actions | 85 | GitHub Actions |
| Nginx | 85 | Nginx |
| Linux | 85 | Linux |
| Express | 85 | Express |
| Flask | 85 | Flask |

**All remaining CV skills are seeded too** (SQL, Redux, Zustand, React Query, Shadcn/UI, Material UI, Bootstrap, Sass, NestJS, Payload CMS, Cassandra, Docker Compose, EC2/ECS/RDS/S3, GitLab CI/CD, Gunicorn, VPS, Clean Architecture, DDD, SOLID, MVC, REST APIs, SaaS Multitenant, ETL, Web Scraping, CI/CD, Scrum, Kanban, GitLab, Postman, Insomnia, Figma, HTML5, CSS3) with sensible levels (80-90 range) and `null` icon when no catalog match.

Levels are estimates — user adjusts via dashboard.

### Experiences (3)

1. **Software Engineer — La Joya Mining Group** (Feb 2025 – Nov 2025)
   - .NET legacy → Django REST Framework + Angular modernization (Clean Architecture, DDD)
   - Web scraping: SUNAT, SUNARP, INGEMMET, REINFO
   - ETL pipelines with Polars (reports minutes → seconds)
   - CI/CD: GitHub Actions, Docker, AWS (EC2, ECS, RDS, Nginx, Gunicorn)
   - Odoo ERP integration (REST/RPC)
   - APScheduler automation, dev standards, Angular reusable components
2. **Full Stack Developer — Next Level Solutions** (Jun 2021 – Nov 2024)
   - SaaS with DRF, Next.js, PostgreSQL
   - Multitenant (per-database isolation)
   - Payload CMS + Next.js App Router CMS features
   - On-demand ISR with Celery + Redis
   - JWT, HttpOnly cookies, RBAC, CORS policies
   - Payment gateways (signed webhooks, idempotency)
   - AWS, GCP, Linux VPS infra; tourism/e-commerce UX redesigns
3. **Full Stack Developer — Duality Projects** (May 2020 – May 2021)
   - React, Flask, PostgreSQL, MongoDB apps
   - Core Web Vitals + SEO improvements
   - UX/UI design, full dev lifecycle to production

### Projects (3)

Placeholder image: `https://placehold.co/600x400/1a1a2e/ff8906?text=<NAME>` (theme colors). User replaces via dashboard later.

1. **SIGOMC** — mining operations management: acopio, laboratorio, liquidaciones, document management, operational dashboards, Odoo ERP integration. Tech: Python, Django, DRF, Angular, PostgreSQL, Docker, GitHub Actions, AWS, Odoo, Polars, APScheduler.
2. **Kafi Wasi** — SaaS for coffee shops: CMS, reservations, content management, multi-company, cloud infrastructure. Tech: React, Next.js, Django, DRF, PostgreSQL, Redis, Celery, Payload CMS, Docker, AWS, GCP.
3. **NextLevel ERP** — modular ERP architecture for multiple business verticals, shared core + per-client modules. Tech: React, Next.js, Django, DRF, PostgreSQL, Redis, Celery, Payload CMS, Docker, AWS.

## Section 2 — Sidebar Settings submenu (`DashboardLayout.jsx`)

- Settings becomes an expandable accordion (local `settingsOpen` state, `ChevronDown` rotates).
- Submenu: Settings (hub), SEO, Notifications.
- Collapsed sidebar (icons only): submenu hidden; clicking Settings navigates to hub.
- Active route highlighting via NavLink.
- Remove the two flat links (SEO, Notifications) at current lines ~88-95.

## Section 3 — Overview page (`/dashboard`)

- New `frontend/src/pages/Dashboard/Overview/index.jsx` + `Overview.scss`.
- `Router.jsx`: route `""` → `OverviewPage` (PostsPage stays at `/dashboard/posts`).
- Content:
  - Header (LayoutDashboard icon + title + subtitle), same style as Settings.
  - 5 stat cards (each links to its section): Messages (new/total, orange badge if >0), Posts (published/drafts), Skills (total + categories), Projects, Experiences.
  - Recent messages: last 5 contact submissions (name, email, subject, status, date) → link to detail, "View all" button.
  - Quick links row: New Post, Messages, Skills, Projects, Experience.
  - Spinner loading + error state.

## Section 4 — Stats endpoint

- New `backend/domains/dashboard/router.py`, registered in `main.py` as `/api/v1/dashboard`.
- `GET /api/v1/dashboard/stats` (public read-only, like other listing endpoints), returns:

```json
{
  "messages": { "new": 3, "total": 12 },
  "posts": { "published": 4, "drafts": 2 },
  "skills": { "total": 45, "categories": 7 },
  "projects": 3,
  "experiences": 3,
  "recent_messages": [
    { "id": 12, "name": "...", "email": "...", "subject": "...", "status": "new", "created_at": "..." }
  ]
}
```

## Files

- `backend/scripts/seed_cv.py` (new)
- `backend/domains/dashboard/router.py` (new)
- `backend/main.py` (register router)
- `frontend/src/layouts/DashboardLayout.jsx` (+ scss if needed)
- `frontend/src/pages/Dashboard/Overview/index.jsx` + `Overview.scss` (new)
- `frontend/src/router/Router.jsx`

## Workflow

1. Implement → build frontend + py_compile backend locally.
2. Run seeder + verify locally (user manual inspection first).
3. On approval: commit, push to `main`, GitHub Actions deploy.
4. On VPS: `docker exec portfolio_backend python -m scripts.seed_cv` (destructive — replaces current data).
