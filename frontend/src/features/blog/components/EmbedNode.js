import { Node, mergeAttributes } from "@tiptap/core";
import { EMBED_PROVIDERS, embedSrc, isValidEmbed } from "../embedProviders";

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
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-embed]",
        getAttrs: (element) => ({
          provider: element.getAttribute("data-embed"),
          embedId: element.getAttribute("data-embed-id"),
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { provider, embedId } = HTMLAttributes;
    return [
      "div",
      mergeAttributes({
        "data-embed": provider,
        "data-embed-id": embedId,
      }),
    ];
  },

  addNodeView() {
    return ({ node }) => {
      const wrapper = document.createElement("div");
      wrapper.className = "tiptap-embed";

      const { provider, embedId } = node.attrs;
      const src = embedSrc(provider, embedId);

      if (!src) {
        wrapper.classList.add("tiptap-embed--invalid");
        wrapper.textContent = "Embed no reconocido";
        return { dom: wrapper };
      }

      const config = EMBED_PROVIDERS[provider];
      wrapper.style.aspectRatio = config.ratio;
      if (config.maxWidth) wrapper.style.maxWidth = config.maxWidth;

      const iframe = document.createElement("iframe");
      iframe.src = src;
      iframe.loading = "lazy";
      iframe.allow = config.allow;
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      iframe.setAttribute("allowfullscreen", "");
      iframe.setAttribute("frameborder", "0");
      wrapper.appendChild(iframe);

      const badge = document.createElement("span");
      badge.className = "tiptap-embed__badge";
      badge.textContent = config.label;
      wrapper.appendChild(badge);

      return { dom: wrapper };
    };
  },

  addCommands() {
    return {
      setEmbed:
        ({ provider, embedId }) =>
        ({ commands }) => {
          if (!isValidEmbed(provider, embedId)) return false;
          return commands.insertContent({
            type: this.name,
            attrs: { provider, embedId },
          });
        },
    };
  },
});

export default Embed;
