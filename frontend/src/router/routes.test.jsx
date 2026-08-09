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

    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((input) => {
        const url = String(input?.url ?? input);
        const body = url.includes("/dashboard/stats") ? stats : [];
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

  it("manda a /login cuando no hay sesión", async () => {
    window.localStorage.removeItem("admin_token");

    const router = renderRuta("/dashboard/posts");

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/login");
    });
  });
});
