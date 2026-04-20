# WallyDev - Personal Portfolio & Blog

Este repositorio contiene el código fuente de mi **Portfolio Personal**, que funciona también como **Blog** y centro de desarrollo para pruebas técnicas (incluyendo integraciones con Inteligencia Artificial).

## Arquitectura del Proyecto

El sistema está construido en un formato arquitectónico desacoplado (Full-Stack SPA):

### 1. Frontend (`/frontend`)
Aplicación SPA moderna enfocada en rendimiento y alto detalle estético:
- **Core:** React 19 + Vite.
- **Estilos:** Tailwind CSS 100% (migrado desde SCSS) estructurado sobre [shadcn/ui] y con soporte de íconos vía `lucide-react`.
- **Internacionalización (i18n):** LinguiJS (usando macros y archivos `.po` pre-compilados a diccionarios en fase de build para reducir drásticamente el peso inicial).
- **Editores de Contenido:** TipTap (Rich Text sin vulnerabilidades de XSS ni dependencias inestables).
- **UI:** Incluye Dashboard Layouts y Public Layouts, con lógica de Context protegido por tokens (JWT).

### 2. Backend (`/backend`)
API robusta diseñada con Domain Driven Design (DDD) ligero:
- **Core:** Python + FastAPI.
- **ORM & DB:** SQLAlchemy conectado a PostgreSQL v15.
- **Seguridad:** JWT Bearer (Access/Refresh Tokens) para proteger rutas de administración (`domains/users`).
- **CMS:** El blog (`domains/blog`) provee Endpoints CRUD para los artículos del portafolio.
- **Endpoints de IA:** `domains/portfolio` y módulos relacionados servirán de "Proxy"/"Gateway" rate-limited usando Redis para conectar el asistente RAG (**MyDevMemory**) con el modelo (Gemini u OpenAI) localmente.

### 3. Deploy & CI/CD
El ambiente de producción hace uso intensivo de Docker:
- **Infra:** VPS Personal en Hetzner / AWS + HestiaCP (Docker Networks compartidas `data-network` y `proxy-network`).
- **Nginx:** Template automatizado para Reverse Proxy que envía los picos de tráfico de HTTPS al contenedor Vite (puerto 3030 frontend) y Uvicorn (puerto 8003 backend).
- **Github Actions:** Flujo de build/push en cada commit a la rama `main` que despliega un rolling update en el servidor en caliente.

#### Secretos de GitHub Actions (Variables de Producción)
El flujo de despliegue en `fullstack-deploy.yml` crea el archivo `.env` "on-the-fly" en el VPS vía SSH en lugar de arrastrarlo desde la repo. Por ende, debes ir a **Settings -> Secrets and variables -> Actions** en tu GitHub y agregar los siguientes _Repository secrets_:
- `SSH_HOST`: IP o Dominio de tu VPS (ej: `123.45.67.89`)
- `SSH_USER`: Usuario SSH de tu VPS (ej: `wallydev-ops`)
- `SSH_PORT`: Puerto de conexión SSH (ej: `22`)
- `INPUT_PASSWORD`: Contraseña del usuario SSH
- `DB_USER`: Usuario base de datos PostgreSQL de prod
- `DB_PASSWORD`: Contraseña súper segura para Prod (no uses la vieja!) 

## Convenciones de Desarrollo
- Reutilizar el sistema de UI SaaS.
- Evitar librerías CSS pesadas extra.
- Mantener en local las variables maestras de `.env` (No commit!).

## 🎯 Estado Actual (Progreso)
- ✅ **Fase 1 completada:** Despliegue, configuraciones de LinguiJS y Limpieza de dependencias.
- ✅ **Fase 2 completada:** Autenticación local con OAuth2 (FastAPI), Arquitectura del Dashboard protegido y Editor de CMS Rich Text con TipTap. Frontend y Backend alineados de forma limpia. 
- ⏳ **En Espera (Fase 3):** Conectar de forma completa las páginas públicas e integrarlas completamente al modelo nuevo de estilo. Integración RAG / Gateway de IA (MyDevMemory).
