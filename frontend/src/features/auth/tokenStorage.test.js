import { beforeEach, describe, expect, it } from "vitest";
import {
  clearStoredToken,
  getRememberPreference,
  getStoredToken,
  storeToken,
} from "./tokenStorage";

const TOKEN = "header.payload.signature";

describe("tokenStorage", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('con "remember" guarda en localStorage, que sobrevive a cerrar el navegador', () => {
    storeToken(TOKEN, true);

    expect(localStorage.getItem("admin_token")).toBe(TOKEN);
    expect(sessionStorage.getItem("admin_token")).toBeNull();
    expect(getStoredToken()).toBe(TOKEN);
  });

  it('sin "remember" guarda en sessionStorage, que muere con la pestaña', () => {
    storeToken(TOKEN, false);

    expect(sessionStorage.getItem("admin_token")).toBe(TOKEN);
    expect(localStorage.getItem("admin_token")).toBeNull();
    expect(getStoredToken()).toBe(TOKEN);
  });

  // El caso que deja sesiones colgando: si al desmarcar la casilla no se
  // borrase el token de localStorage, la sesión anterior seguiría viva otros
  // siete días en un equipo donde el usuario acaba de pedir lo contrario.
  it("al pasar de recordado a no recordado no deja el token anterior", () => {
    storeToken(TOKEN, true);
    storeToken("otro.token.nuevo", false);

    expect(localStorage.getItem("admin_token")).toBeNull();
    expect(sessionStorage.getItem("admin_token")).toBe("otro.token.nuevo");
    expect(getStoredToken()).toBe("otro.token.nuevo");
  });

  it("al pasar de no recordado a recordado tampoco deja el anterior", () => {
    storeToken(TOKEN, false);
    storeToken("otro.token.nuevo", true);

    expect(sessionStorage.getItem("admin_token")).toBeNull();
    expect(localStorage.getItem("admin_token")).toBe("otro.token.nuevo");
  });

  it("logout borra el token de los dos almacenes", () => {
    localStorage.setItem("admin_token", TOKEN);
    sessionStorage.setItem("admin_token", TOKEN);

    clearStoredToken();

    expect(getStoredToken()).toBeFalsy();
  });

  // Las páginas del dashboard leen el token por getStoredToken(). Antes lo
  // sacaban de localStorage a mano, y ese es el modo de fallo que rompería la
  // sesión sin recordar: token en sessionStorage y llamadas sin cabecera.
  it("getStoredToken encuentra un token dejado solo en localStorage", () => {
    localStorage.setItem("admin_token", TOKEN);

    expect(getStoredToken()).toBe(TOKEN);
  });

  describe("preferencia de la casilla", () => {
    it("por defecto viene marcada", () => {
      expect(getRememberPreference()).toBe(true);
    });

    it("recuerda que se desmarcó, incluso sin token guardado", () => {
      storeToken(TOKEN, false);
      clearStoredToken();

      expect(getRememberPreference()).toBe(false);
    });

    it("vuelve a true al marcarla de nuevo", () => {
      storeToken(TOKEN, false);
      storeToken(TOKEN, true);

      expect(getRememberPreference()).toBe(true);
    });
  });
});
