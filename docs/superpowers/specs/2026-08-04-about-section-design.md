# About Section: Configurable Image + Layout + Bilingual Text — Design

**Date:** 2026-08-04
**Status:** Approved by user
**Scope:** Replace About tech-logo carousel with a configurable photo + layout; editable from dashboard

## Goal

1. Remove the tech logos carousel from the `#about-me` public section (no longer useful).
2. Show a photo/image next to the About text.
3. Make it fully configurable from the dashboard: bilingual text (en/es), image upload, and layout (text-left/image-right, text-right/image-left, text-top/image-bottom, text-bottom/image-top).

## Decisions (from brainstorming)

| Decision | Choice |
|---|---|
| Dashboard placement | New "About" item in the sidebar (with Experience, Skills, Projects) |
| Editable content | Text (bilingual), image URL, layout |
| Backend pattern | Single-row `AboutSettings` table, mirroring `SeoSettings`/`NotificationSettings` |
| Image upload | Reuse existing `POST /api/v1/portfolio/upload` (MinIO) + `api.uploadImage` |
| Public layout default | `text-left` (text on left, image on right) |
| No image case | Text renders full-width, no broken image |
| Mobile behavior | Always stacked (column), text first |
| Seeder | Seeds About with the CV professional summary (bilingual), layout `text-left`, image `null` |

## Section 1 — Backend: `about` domain

New domain `backend/domains/about/` (models.py, schemas.py, router.py) following the settings domain pattern exactly.

### Model `AboutSettings` (table `about_settings`, single row)

| Field | Type | Notes |
|---|---|---|
| `id` | Integer PK | |
| `text` | JSON | `{"en": "...", "es": "..."}` — paragraphs separated by blank line (`\n\n`); frontend splits into `<p>` |
| `image_url` | String nullable | MinIO or external URL |
| `layout` | String | enum: `text-left` (default), `text-right`, `text-top`, `text-bottom` |
| `created_at` / `updated_at` | DateTime | server defaults, like other models |

### Schemas
- `AboutSettingsBase`: `text: Dict[str, Any]`, `image_url: Optional[str]`, `layout: str`
- `AboutSettingsUpdate` = Base
- `AboutSettingsResponse`: Base + id + created_at + updated_at

### Endpoints (registered in `main.py` as `/api/v1/about`)
- `GET /about` — public; creates defaults if row missing (same as `get_seo_settings`)
- `PUT /about` — auth (`get_current_user`); upsert (same as `update_seo_settings`)

### Migration
New alembic revision creating `about_settings`.

## Section 2 — Dashboard: About page

- New sidebar item "About" (lucide `UserRound`), placed after Experience in `DashboardLayout.jsx`.
- Route `/dashboard/about` → `frontend/src/pages/Dashboard/About/index.jsx` + `About.scss` (Settings-style page).
- Page content:
  - Text: two textareas (EN and ES), blank line separates paragraphs.
  - Image: upload button (reuses `api.uploadImage` → MinIO), preview, "remove" button.
  - Layout: 4 selectable visual cards (mini-diagrams): text-left / text-right / text-top / text-bottom.
  - Save → `PUT /about`; initial load `GET /about`.
- `frontend/src/features/portfolio/usePortfolioApi.js`: add `getAbout`, `updateAbout`.

## Section 3 — Public About section

- Delete `frontend/src/pages/Home/Sections/About/Caruousel.jsx` + `Carousel.scss`; remove usage from `About.jsx`. Check `frontend/src/Content/logos.json` — remove if orphaned (verify no other importer).
- Rewrite `About.jsx`: fetch `GET /about`, render:
  - Title `#about-me` (keep) + paragraphs + image (if `image_url`).
  - Layout classes: `about--text-left` (row: text, image), `about--text-right` (row-reverse), `about--text-top` (column: text, image), `about--text-bottom` (column-reverse).
  - Responsive: mobile always stacked with text first; no image → full-width text.
  - Image styled with theme (orange border/glow, rounded corners).

## Section 4 — Seeder

- `backend/scripts/seed_cv.py`: add `AboutSettings` seeding — text = CV "Resumen Profesional" (Spanish from CV, English translation), layout `text-left`, `image_url` null.
- Full replacement semantics: seeder also wipes `about_settings`. **Caveat**: re-running the seeder resets the uploaded photo (text re-seeded, image back to null).

### CV professional summary (seed text)

**es** (from CV): "Software Engineer con más de 5 años de experiencia diseñando y desarrollando aplicaciones web escalables para los sectores minería, educación, turismo, finanzas, contabilidad y ERP. Especializado en el desarrollo de soluciones Full Stack utilizando Python (Django, Django REST Framework, FastAPI) y JavaScript/TypeScript (React, Next.js, Angular y Node.js), con experiencia en modernización de sistemas legados, automatización de procesos, arquitecturas SaaS multitenant, integración de sistemas empresariales, pipelines ETL y despliegues cloud sobre AWS. He participado en todas las etapas del ciclo de vida del software, desde el levantamiento de requerimientos y diseño de arquitectura hasta la implementación, despliegue, monitoreo y optimización en producción. Me enfoco en construir software mantenible aplicando principios como Clean Architecture, Domain-Driven Design (DDD), SOLID y metodologías ágiles."

**en** (translation): "Software Engineer with 5+ years of experience designing and developing scalable web applications for mining, education, tourism, finance, accounting and ERP sectors. Specialized in Full Stack solutions using Python (Django, Django REST Framework, FastAPI) and JavaScript/TypeScript (React, Next.js, Angular and Node.js), with experience in legacy system modernization, process automation, multitenant SaaS architectures, enterprise system integration, ETL pipelines and cloud deployments on AWS. I have participated in every stage of the software lifecycle, from requirements gathering and architecture design to implementation, deployment, monitoring and production optimization. I focus on building maintainable software applying principles like Clean Architecture, Domain-Driven Design (DDD), SOLID and agile methodologies."

## Files

- `backend/domains/about/models.py`, `schemas.py`, `router.py` (new)
- `backend/alembic/versions/<rev>_add_about_settings.py` (new)
- `backend/main.py` (register about router)
- `backend/scripts/seed_cv.py` (seed AboutSettings)
- `frontend/src/layouts/DashboardLayout.jsx` (+scss: About nav item)
- `frontend/src/pages/Dashboard/About/index.jsx` + `About.scss` (new)
- `frontend/src/pages/Home/Sections/About/About.jsx` + `About.scss` (rewrite)
- delete `frontend/src/pages/Home/Sections/About/Caruousel.jsx`, `Carousel.scss` (+ `Content/logos.json` if orphaned)
- `frontend/src/router/Router.jsx` (add /dashboard/about route)
- `frontend/src/features/portfolio/usePortfolioApi.js` (getAbout, updateAbout)
- `frontend/src/locales/en|es/messages.po` (auto-extracted strings)

## Workflow

1. Implement → py_compile + `npm run build`.
2. Run seeder locally (updates About text), verify locally.
3. On user approval: commit, push, deploy; then run seeder on VPS (`docker exec portfolio_backend python -m scripts.seed_cv`).
4. User uploads photo + picks layout via dashboard.
