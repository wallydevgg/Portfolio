import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { I18nProvider } from "@lingui/react";
import { describe, expect, it } from "vitest";
import Header from "./Header";
import { ThemeProvider } from "@/components/Context/ThemeContext";
import i18n from "@/i18n";

/**
 * El menú de escritorio y el desplegable de móvil se pintan los dos a la vez;
 * cuál se ve lo decide el CSS por ancho de pantalla. Durante mucho tiempo cada
 * uno llevaba su propia lista escrita a mano, y la de móvil se quedó con tres
 * entradas en inglés fijo mientras la de escritorio tenía cinco traducidas: en
 * móvil faltaban #contact, #blog y el selector de idioma.
 *
 * La comprobación se hace contra el DOM de cada menú y no contra la lista
 * compartida: si mañana alguien vuelve a escribir un enlace a mano en uno solo
 * de los dos, comparar el origen no lo vería y comparar el resultado sí.
 */
function renderHeader() {
  const router = createMemoryRouter([{ path: "/", element: <Header /> }], {
    initialEntries: ["/"],
  });
  const { container } = render(
    <I18nProvider i18n={i18n}>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </I18nProvider>
  );
  return container;
}

function linksOf(container, selector) {
  const root = container.querySelector(selector);
  if (!root) throw new Error(`No se encontró el menú "${selector}"`);
  return [...root.querySelectorAll("a")].map((a) => a.textContent.trim()).sort();
}

describe("Header", () => {
  it("los dos menús ofrecen exactamente los mismos enlaces", () => {
    const container = renderHeader();

    const desktop = linksOf(container, ".menu-header");
    const mobile = linksOf(container, ".menu");

    expect(desktop.length).toBeGreaterThan(0);
    expect(mobile).toEqual(desktop);
  });

  it("los dos menús llevan selector de tema y de idioma", () => {
    renderHeader();

    // El de tema es un botón con aria-label; el de idioma, un checkbox.
    expect(screen.getAllByLabelText("Cambiar tema")).toHaveLength(2);
    expect(screen.getAllByRole("checkbox")).toHaveLength(2);
  });

  it("el botón del menú anuncia si está abierto", () => {
    const container = renderHeader();

    const toggle = container.querySelector(".menu-toggle");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    // La etiqueta accesible sale del catálogo, no de una cadena escrita a mano.
    expect(toggle.getAttribute("aria-label")).toBeTruthy();
    expect(toggle.getAttribute("aria-label")).not.toMatch(/^menu\./);
  });
});
