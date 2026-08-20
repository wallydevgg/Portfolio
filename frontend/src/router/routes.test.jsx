import { render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { I18nProvider } from "@lingui/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { routes } from "./Router";
import { ThemeProvider } from "@/components/Context/ThemeContext";
import i18n from "@/i18n";

/**
 * Mismo envoltorio que main.jsx: I18nProvider → ThemeProvider → Router. Se
 * replica aquí, y no se inventa uno más simple, porque el objetivo del test es
 * comprobar la composición real. De hecho la primera versión olvidó
 * ThemeProvider y el test lo cazó: DashboardLayout desestructura useContext y
 * revienta sin él.
 */
function renderRuta(ruta) {
  const router = createMemoryRouter(routes, { initialEntries: [ruta] });
  render(
    <I18nProvider i18n={i18n}>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </I18nProvider>
  );
  return router;
}

/**
 * Humo de rutas: monta el árbol REAL de `routes` con un router en memoria y
 * comprueba que cada página del dashboard se pinta.
 *
 * Lo que protege esto es la composición de providers. Cuando el ToastProvider
 * estaba montado en dos sitios, `/dashboard/posts` reventaba con "useToast must
 * be used within a ToastProvider" y react-router lo mostraba como "Unexpected
 * Application Error!". Por eso la aserción es justo esa: si una página lanza al
 * montar, react-router la sustituye por su pantalla de error y el test cae.
 *
 * Montar los providers a mano en el test no serviría de nada: se estaría
 * comprobando el árbol del test, no el de la aplicación.
 */

// jwt-decode solo parsea; la firma no se valida en cliente. Basta con un exp
// futuro para que AuthProvider dé la sesión por buena.
function fakeToken() {
  const b64 = (o) =>
    btoa(JSON.stringify(o)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const exp = Math.floor(Date.now() / 1000) + 3600;
  return `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub: "1", exp })}.firma`;
}

const RUTAS = [
  "/dashboard",
  "/dashboard/settings",
  "/dashboard/settings/profile",
  "/dashboard/settings/theme",
  "/dashboard/settings/language",
  "/dashboard/posts",
  "/dashboard/posts/archived",
  "/dashboard/messages",
  "/dashboard/experience",
  "/dashboard/skills",
  "/dashboard/projects",
];

describe("árbol de rutas del dashboard", () => {
  beforeEach(() => {
    window.localStorage.setItem("admin_token", fakeToken());
    // Toda página del dashboard pide datos al montar. El stub devuelve lo
    // mínimo con la forma correcta: una lista para los listados y el objeto de
    // estadísticas para Overview, que lee stats.messages.new.
    const stats = {
      messages: { new: 0, total: 0 },
      posts: { published: 0, drafts: 0 },
      skills: { total: 0, categories: 0 },
      projects: 0,
      experiences: 0,
      recent_messages: [],
    };

    // /contact devuelve una página, no una lista: la forma importa porque
    // MessagesPage lee data.items directamente.
    const paginaVacia = { items: [], total: 0, new_count: 0 };

    // El perfil que la cabecera usa para el nombre y la inicial.
    const perfil = {
      id: 2,
      username: "wallydev",
      email: "admin@example.com",
      display_name: "Waldir",
      avatar_url: "https://cdn.example.test/avatars/abc.png",
      is_superuser: true,
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((input) => {
        const url = String(input?.url ?? input);
        let body = [];
        if (url.includes("/dashboard/stats")) body = stats;
        else if (url.includes("/users/me")) body = perfil;
        else if (url.includes("/contact")) body = paginaVacia;
        return Promise.resolve({ ok: true, status: 200, json: async () => body });
      })
    );
  });

  it.each(RUTAS)("%s se monta sin lanzar", async (ruta) => {
    renderRuta(ruta);

    // "Logout" solo está en el sidebar, así que confirma que el layout montó
    // sin chocar con los títulos de cada página.
    await waitFor(() => {
      expect(screen.getByText("Logout")).toBeInTheDocument();
    });

    expect(screen.queryByText(/Unexpected Application Error/i)).toBeNull();
    expect(screen.queryByText(/must be used within/i)).toBeNull();
  });

  /**
   * El avatar sacaba la inicial de `user.sub`, que es el id numérico del JWT:
   * con el id 2 en la esquina aparecía un "2". El nombre hay que pedirlo a
   * /users/me, porque el token no lo lleva.
   */
  it("la cabecera muestra el nombre del perfil, no el id del token", async () => {
    renderRuta("/dashboard");

    await waitFor(() => {
      expect(screen.getByText("Waldir")).toBeInTheDocument();
    });

    const avatar = document.querySelector(".dashboard__user-avatar");
    expect(avatar).not.toBeNull();
    // Con avatar_url el círculo lleva la foto; el alt conserva el nombre.
    expect(avatar.querySelector("img")).toHaveAttribute("alt", "Waldir");
    // El `sub` del token de prueba es "1"; que no vuelva a colarse un dígito.
    expect(avatar.textContent.trim()).not.toMatch(/\d/);
  });

  it("cae a la inicial cuando el perfil no trae foto", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((input) => {
        const url = String(input?.url ?? input);
        const body =
          url.includes("/users/me") ?
            { id: 2, username: "wallydev", display_name: "Waldir", avatar_url: null }
          : [];
        return Promise.resolve({ ok: true, status: 200, json: async () => body });
      })
    );

    renderRuta("/dashboard/projects");

    await waitFor(() => {
      const avatar = document.querySelector(".dashboard__user-avatar");
      expect(avatar?.textContent.trim()).toBe("W");
    });
    expect(document.querySelector(".dashboard__user-avatar img")).toBeNull();
  });

  it('cae a "Admin" mientras el perfil no ha llegado', async () => {
    // /users/me falla: la cabecera no debe quedarse vacía ni romper. Se usa una
    // ruta de listado, que se conforma con [], y no /dashboard, que necesita el
    // objeto de estadísticas entero.
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((input) => {
        const url = String(input?.url ?? input);
        if (url.includes("/users/me")) return Promise.reject(new Error("sin red"));
        return Promise.resolve({ ok: true, status: 200, json: async () => [] });
      })
    );

    renderRuta("/dashboard/projects");

    await waitFor(() => {
      expect(screen.getByText("Admin")).toBeInTheDocument();
    });

    const avatar = document.querySelector(".dashboard__user-avatar");
    expect(avatar.textContent.trim()).toBe("A");
  });

  /**
   * La preferencia de tema puede valer "system", pero la clase del shell se
   * compone con `${theme}-theme`. Cuando las dos cosas eran la misma variable,
   * elegir "seguir al sistema" producía `system-theme`, que no existe en
   * ninguna hoja de estilos: el panel se quedaba sin tema.
   */
  it('con la preferencia "system" el shell resuelve a una clase real', async () => {
    window.localStorage.setItem("theme", "system");

    renderRuta("/dashboard/projects");

    await waitFor(() => {
      expect(document.querySelector(".dashboard")).not.toBeNull();
    });

    const shell = document.querySelector(".dashboard");
    expect(shell.className).not.toMatch(/system-theme/);
    expect(shell.className).toMatch(/(dark|light)-theme/);
  });

  it("manda a /login cuando no hay sesión", async () => {
    window.localStorage.removeItem("admin_token");

    const router = renderRuta("/dashboard/posts");

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/login");
    });
  });
});
