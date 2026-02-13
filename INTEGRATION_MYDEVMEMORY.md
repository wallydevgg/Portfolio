# Plan de Integración: MyDevMemory en Portfolio

Este documento detalla la estrategia para integrar el motor RAG "MyDevMemory" en la web personal (Portfolio), incluyendo medidas de seguridad para la demo pública.

## 1. Concepto del Showcase

En lugar de un simple link a GitHub, "MyDevMemory" será una sección interactiva en la web: **"Talk with my Code"**.

- **UX:** Un chat minimalista (estilo terminal o Vercel AI SDK).
- **Prompt Inicial:** "Pregúntame cómo implementé Clean Architecture en el proyecto de Minería" o "¿Cuál es mi patrón favorito para manejar errores en React?".

## 2. Arquitectura de la Demo (Limitada)

Para evitar el abuso de tokens (costos de OpenAI/Anthropic), implementaremos una arquitectura de **"Gateway Seguro"**:

### Backend (Next.js API Route / Edge Function)

1.  **Rate Limiting Estricto:**
    - Máximo 5 preguntas por IP por día.
    - Uso de `Upstash Redis` (tier gratuito) para trackear IPs.
2.  **Capa de Caché Semántica:**
    - Antes de llamar al LLM, verificar si la pregunta ya fue respondida anteriormente (caching de embeddings).
    - Si es una pregunta repetida ("¿Qué stack usas?"), devolver respuesta pre-caché (costo $0).

3.  **Modelo Económico (Fallback):**
    - Usar `Gemini-Flash` o `GPT-4o-mini` para la demo pública (muy baratos y rápidos).
    - Reservar `GPT-4` solo para uso local/admin.

### Frontend (Portfolio)

1.  **Componente Chat:**
    - Usar `useChat` de Vercel AI SDK para streaming de texto.
    - Mostrar citas/referencias al código fuente (links a GitHub).

2.  **Auth (Opcional):**
    - Para desbloquear más preguntas, pedir Login con GitHub (esto filtra bots y te da leads de quién está interesado).

## 3. Pasos de Implementación

- [ ] **Backend:** Exponer una API REST/GraphQL en `coding-intel-agent` (actualmente es CLI CLI).
  - Necesitamos envolver el script `chat.py` en un servidor rápido (FastAPI o crear un endpoint en Next.js que llame al script python vía subprocess, aunque lo ideal es FastAPI).
- [ ] **Seguridad:** Implementar middleware de Rate Limit.
- [ ] **Deploy:** Subir el backend de Python a una instancia barata (Railway/Render) o usar una AWS Lambda.

---

_Este plan será ejecutado cuando retomemos el desarrollo del Portfolio._
