import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  window.localStorage.clear();
  window.sessionStorage.clear();
});

// Almacenamiento web. Con jsdom 30 sobre Node 26, `window.localStorage` no
// llega al scope global que monta vitest, así que todo lo que lo toque revienta
// con "Cannot read properties of undefined". No es un fallo del código: la
// misma suite pasaba con la combinación anterior de versiones.
//
// El sustituto es una implementación mínima en memoria con la API que usa el
// proyecto. Se instala solo si falta, para no pisar la real cuando sí está.
function createStorage() {
  let data = new Map();
  return {
    get length() {
      return data.size;
    },
    key: (index) => [...data.keys()][index] ?? null,
    getItem: (key) => (data.has(String(key)) ? data.get(String(key)) : null),
    setItem: (key, value) => data.set(String(key), String(value)),
    removeItem: (key) => data.delete(String(key)),
    clear: () => data.clear(),
  };
}

for (const name of ["localStorage", "sessionStorage"]) {
  if (!window[name]) {
    const storage = createStorage();
    Object.defineProperty(window, name, { value: storage, configurable: true });
    Object.defineProperty(globalThis, name, { value: storage, configurable: true });
  }
}

// jsdom no implementa estas dos y varios componentes las usan al montar; sin
// ellas el test falla por el entorno, no por el código que se quiere probar.
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
}

if (!window.IntersectionObserver) {
  window.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
