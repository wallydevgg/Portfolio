import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  TURNSTILE_SCRIPT_URL,
  TURNSTILE_SITE_KEY,
  loadTurnstile,
  resetTurnstileLoader,
} from "./turnstile";

/**
 * El captcha estuvo días sin existir en producción y nadie se enteró.
 *
 * El JSX colgaba de `import.meta.env.VITE_TURNSTILE_SITE_KEY`, que Vite
 * sustituye al compilar: con el secret de GitHub vacío, Rollup eliminaba el
 * widget entero como código muerto. El formulario seguía aceptando envíos, así
 * que el único síntoma fue el spam llegando por correo.
 *
 * Estas pruebas fijan lo que evita que vuelva a pasar: que la clave sobreviva
 * aunque no haya variable de entorno.
 */
describe("turnstile", () => {
  beforeEach(() => {
    resetTurnstileLoader();
    delete window.turnstile;
    document.querySelectorAll("script").forEach((s) => s.remove());
  });

  afterEach(() => {
    resetTurnstileLoader();
  });

  it("tiene site key aunque no haya variable de entorno", () => {
    // En el entorno de test VITE_TURNSTILE_SITE_KEY no está definida, que es
    // exactamente el caso que dejó el bundle sin widget.
    expect(import.meta.env.VITE_TURNSTILE_SITE_KEY).toBeFalsy();
    expect(TURNSTILE_SITE_KEY).toBeTruthy();
    expect(TURNSTILE_SITE_KEY).toMatch(/^0x4AAA/);
  });

  it("inyecta el script de Cloudflare una sola vez", async () => {
    const first = loadTurnstile();
    const second = loadTurnstile();
    expect(first).toBe(second);

    const scripts = document.querySelectorAll(`script[src^="${TURNSTILE_SCRIPT_URL}"]`);
    expect(scripts).toHaveLength(1);

    // jsdom no ejecuta el script; se simula la carga.
    window.turnstile = { render: vi.fn(), getResponse: vi.fn(), reset: vi.fn() };
    scripts[0].dispatchEvent(new Event("load"));

    await expect(first).resolves.toBe(window.turnstile);
  });

  it("no vuelve a inyectar si turnstile ya está disponible", async () => {
    window.turnstile = { render: vi.fn() };

    await expect(loadTurnstile()).resolves.toBe(window.turnstile);
    expect(document.querySelectorAll(`script[src^="${TURNSTILE_SCRIPT_URL}"]`)).toHaveLength(0);
  });

  it("resuelve a null si el script no carga, en vez de colgarse", async () => {
    // Un bloqueador de anuncios o una red caída no deben dejar el formulario
    // esperando para siempre: se envía sin token y decide el servidor.
    const promise = loadTurnstile();
    const script = document.querySelector(`script[src^="${TURNSTILE_SCRIPT_URL}"]`);
    script.dispatchEvent(new Event("error"));

    await expect(promise).resolves.toBeNull();
  });
});
