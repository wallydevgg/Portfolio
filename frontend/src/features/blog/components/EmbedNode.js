import { Node, mergeAttributes } from "@tiptap/core";
import {
  EMBED_PROVIDERS,
  embedPermalink,
  embedSrc,
  isValidEmbed,
} from "../embedProviders";

/**
 * Nodo de embed.
 *
 * Se serializa a `<div data-embed="youtube" data-embed-id="...">` — nunca a un
 * iframe. El HTML guardado no contiene markup de terceros, así que el post
 * almacenado no puede arrastrar scripts ni atributos ajenos.
 *
 * Dentro del editor sí se pinta el iframe, para que se vea lo que se está
 * insertando; la construcción pasa por embedSrc(), la misma lista blanca que
 * usa el render público.
 */
export const Embed = Node.create({
  name: "embed",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      provider: { default: null },
      embedId: { default: null },
      // TikTok lo usa para el usuario; Instagram, para el tipo de permalink.
      embedUser: { default: null },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-embed]",
        getAttrs: (element) => ({
          provider: element.getAttribute("data-embed"),
          embedId: element.getAttribute("data-embed-id"),
          embedUser: element.getAttribute("data-embed-user"),
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { provider, embedId, embedUser } = HTMLAttributes;
    return [
      "div",
      mergeAttributes({
        "data-embed": provider,
        "data-embed-id": embedId,
        ...(embedUser ? { "data-embed-user": embedUser } : {}),
      }),
    ];
  },

  addNodeView() {
    return ({ node }) => {
      const wrapper = document.createElement("div");
      wrapper.className = "tiptap-embed";

      const { provider, embedId, embedUser } = node.attrs;
      const config = EMBED_PROVIDERS[provider];

      if (!config || !isValidEmbed(provider, embedId, embedUser)) {
        wrapper.classList.add("tiptap-embed--invalid");
        wrapper.textContent = "Embed no reconocido";
        return { dom: wrapper };
      }

      const badge = document.createElement("span");
      badge.className = "tiptap-embed__badge";
      badge.textContent = config.label;

      // YouTube se puede previsualizar tal cual dentro del editor.
      if (config.type === "iframe") {
        wrapper.style.aspectRatio = config.ratio;
        if (config.maxWidth) wrapper.style.maxWidth = config.maxWidth;

        const iframe = document.createElement("iframe");
        iframe.src = embedSrc(provider, embedId);
        iframe.loading = "lazy";
        iframe.allow = config.allow;
        iframe.referrerPolicy = "strict-origin-when-cross-origin";
        iframe.setAttribute("allowfullscreen", "");
        iframe.setAttribute("frameborder", "0");
        wrapper.appendChild(iframe);
        wrapper.appendChild(badge);
        return { dom: wrapper };
      }

      // TikTok e Instagram necesitan su script para hidratarse, y cargarlo
      // dentro del editor no aporta nada: aquí se muestra una ficha con el
      // enlace, y el embed real aparece en la vista previa y en el post.
      wrapper.classList.add("tiptap-embed--card");

      const link = document.createElement("a");
      link.href = embedPermalink(provider, embedId, embedUser) || "#";
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = link.href;
      link.className = "tiptap-embed__link";

      const title = document.createElement("strong");
      title.textContent = `Vídeo de ${config.label}`;

      wrapper.appendChild(badge);
      wrapper.appendChild(title);
      wrapper.appendChild(link);

      return { dom: wrapper };
    };
  },

  addCommands() {
    return {
      setEmbed:
        ({ provider, embedId, embedUser = null }) =>
        ({ commands }) => {
          if (!isValidEmbed(provider, embedId, embedUser)) return false;
          return commands.insertContent({
            type: this.name,
            attrs: { provider, embedId, embedUser },
          });
        },
    };
  },
});

export default Embed;
