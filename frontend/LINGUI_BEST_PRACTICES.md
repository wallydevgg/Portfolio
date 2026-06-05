# Lingui Best Practices — Portfolio Project

Documento sobre cómo usar Lingui correctamente en este proyecto React 19 + Vite con EN/ES locales.

## ✅ Setup

- **I18nProvider**: Envuelve toda la app en `main.jsx`
- **Catalogs compilados**: `.ts` files en `src/locales/{locale}/messages.ts`
- **ESLint plugin**: `eslint-plugin-lingui` installed — atrapa imports incorrectos

## 📝 Macros — Cuándo usar cuál

### `Trans` — Para JSX con contenido
Usa para cualquier texto dentro de componentes JSX.

```jsx
import { Trans } from "@lingui/react/macro";

// Texto simple
<h1><Trans>Welcome</Trans></h1>

// Con variables
<p><Trans>Hello {userName}</Trans></p>

// Con componentes (rich text)
<Trans>
  Read the <a href="/docs">documentation</a>
</Trans>
```

### `t` — Para strings / atributos / no-JSX
Usa en template literals o con explicit IDs.

```jsx
import { t } from "@lingui/macro";
import { useLingui } from "@lingui/react/macro";

// Template literal (simple)
const label = t`Save changes`;

// Explicit ID (mejor control)
const title = t({ id: "section.title", message: "Section Title" });

// En atributos
<img alt={t`Profile picture`} />

// En alerts/eventos
const { t } = useLingui();
const handleError = () => alert(t`Error occurred`);
```

### `msg` — Para constantes / arrays
Usa a nivel de módulo para lazy translations.

```jsx
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react/macro";

const STATUSES = {
  active: msg`Active`,
  inactive: msg`Inactive`,
};

function Status({ status }) {
  const { _ } = useLingui();
  return <span>{_(STATUSES[status])}</span>;
}
```

### `useLingui()` — Para suscribir a cambios de locale

**Caso 1: Solo suscripción** (sin usar `t` o `Trans` en el componente)
```jsx
import { useLingui } from "@lingui/react"; // ⚠️ NO /macro aquí

function Menu() {
  useLingui(); // Suscribe a cambios de locale → re-render
  return <div>Menu</div>;
}
```

**Caso 2: Usa `t`/`Trans` + necesita el hook**
```jsx
import { t } from "@lingui/macro";
import { useLingui } from "@lingui/react/macro";

function Component() {
  const { i18n, _ } = useLingui(); // DEBE asignarse a variable

  return <div>{t`message`}</div>;
}
```

**TL;DR**: 
- Solo llamar `useLingui()` → importar de `@lingui/react`
- Usar el resultado → importar de `@lingui/react/macro` e INVERTIBLE asignarlo a variable

## ❌ Errores comunes

### ❌ Importar `useLingui` de `@lingui/react`
```jsx
import { useLingui } from "@lingui/react"; // ❌ MALO
```

### ✅ Correcto
```jsx
import { useLingui } from "@lingui/react/macro"; // ✅ BIEN
```

---

### ❌ Lógica compleja dentro de Trans
```jsx
<Trans>Hello {user.name.toUpperCase()}</Trans> // Extracto: "Hello {0}"
```

### ✅ Correcto
```jsx
const userName = user.name.toUpperCase();
<Trans>Hello {userName}</Trans> // Extracto: "Hello {userName}"
```

---

### ❌ Macros a nivel de módulo
```jsx
import { t } from "@lingui/macro";
const LABELS = [t`Red`, t`Green`, t`Blue`]; // ❌ No funciona
```

### ✅ Correcto
```jsx
import { msg } from "@lingui/core/macro";
const LABELS = [msg`Red`, msg`Green`, msg`Blue`]; // ✅ Use msg
```

## 🔄 Workflow: Agregar/Editar textos

### 1. Escribir mensaje en código
```jsx
<h1><Trans>Welcome to my portfolio</Trans></h1>
// o
const greeting = t`Hello, ${name}`;
```

### 2. Extraer catálogos
```bash
npm run messages:extract
```
Genera/actualiza `src/locales/{en,es}/messages.po`.

### 3. Traducir
Abre `src/locales/es/messages.po` y rellena `msgstr ""`:
```po
#: Hero.jsx:35
msgid "Welcome to my portfolio"
msgstr "Bienvenido a mi portafolio"
```

### 4. Compilar
```bash
npm run compile
```
Genera `.ts` files que Vite consume.

### 5. Verificar en desarrollo
```bash
npm run dev
```
Cambia idioma en el language switch — debe actualizar al instante.

## 🌍 Cambiar idioma dinámicamente

Desde cualquier componente:

```jsx
import { dynamicActivate } from "@/i18n";

function LanguageSwitch() {
  const toggleLanguage = () => {
    dynamicActivate("es"); // o "en"
  };

  return <button onClick={toggleLanguage}>Cambiar idioma</button>;
}
```

**Automático**: Guarda en `localStorage` bajo la key `locale`.

## 📊 Pluralización

```jsx
import { Plural } from "@lingui/react/macro";

<Plural
  value={messageCount}
  one="You have # message"
  other="You have # messages"
/>
```

Con exactos:
```jsx
<Plural
  value={count}
  _0="No messages"
  one="# message"
  other="# messages"
/>
```

## 📅 Fechas y números

```jsx
import { useLingui } from "@lingui/react/macro";

function PostDate({ date }) {
  const { i18n } = useLingui();

  return <time>{i18n.date(date, { month: "long", day: "numeric" })}</time>;
}
```

## 🛡️ ESLint

El plugin `eslint-plugin-lingui` atrapa:
- ❌ `import { useLingui } from "@lingui/react"` → ✅ must use `/macro`
- ❌ Dynamic/computed message IDs
- ❌ Macros a nivel de módulo → ✅ use `msg` instead

Ejecuta:
```bash
npx eslint src --fix
```

## 📚 Referencias

- [Lingui Docs](https://lingui.dev)
- [Macro Best Practices](https://lingui.dev/ref/macro)
- [useLingui Hook](https://lingui.dev/ref/react#uselingu)
- [Deployment Considerations](https://lingui.dev/guides/bundle-size)
