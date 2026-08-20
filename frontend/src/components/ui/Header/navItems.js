import { t } from "@lingui/macro";

/**
 * Los items de navegación del sitio público, en un solo sitio.
 *
 * Estaban escritos dos veces: en Menu.jsx (escritorio) con cinco entradas
 * traducidas, y otra vez dentro de MenuButton.jsx (móvil) con tres entradas en
 * inglés fijo. El menú de móvil llevaba tiempo sin #contact ni #blog y sin el
 * selector de idioma, porque cada vez que se añadía algo se añadía solo en una
 * de las dos listas.
 *
 * `section` es el id al que se hace scroll dentro de la portada; `to` es la
 * ruta a la que navegar. Blog es el único que va a otra página.
 */
export const NAV_ITEMS = [
  { key: "experience", to: "/", section: "experience" },
  { key: "projects", to: "/", section: "projects" },
  { key: "about", to: "/", section: "about" },
  { key: "contact", to: "/", section: "contact" },
  { key: "blog", to: "/blog", section: "" },
];

/**
 * Etiqueta traducida de un item.
 *
 * Va en un switch con literales y no en un mapa indexado por variable porque
 * `t` es un macro: se resuelve en tiempo de compilación y sustituye cada
 * mensaje por el hash con el que se indexa el catálogo. Con `i18n._(variable)`
 * la búsqueda ocurre en ejecución, no encuentra ese hash y acaba pintando el
 * identificador crudo — que es exactamente lo que pasaba: "#menu.experience".
 *
 * Se llama durante el render para que el cambio de idioma se note; ambos menús
 * usan useLingui() para suscribirse.
 */
export function navLabel(key) {
  switch (key) {
    case "experience":
      return t`menu.experience`;
    case "projects":
      return t`menu.projects`;
    case "about":
      return t`menu.about`;
    case "contact":
      return t`menu.contact`;
    case "blog":
      return t`menu.blog`;
    default:
      return key;
  }
}

/** Etiqueta accesible del botón que abre el menú de móvil. */
export function menuToggleLabel() {
  return t`menu.toggleAria`;
}
