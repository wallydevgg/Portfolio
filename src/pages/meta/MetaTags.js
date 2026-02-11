import { useEffect } from "react";
import PropTypes from "prop-types";

const MetaTags = ({ title, description, url, image, robots }) => {
  useEffect(() => {
    document.title = title;

    const updateMetaTag = (name, content) => {
      let element =
        document.querySelector(`meta[name="${name}"]`) ||
        document.querySelector(`meta[property="${name}"]`);
      if (!element) {
        element = document.createElement("meta");
        if (name.startsWith("og:") || name.startsWith("twitter:")) {
          element.setAttribute("property", name);
        } else {
          element.setAttribute("name", name);
        }
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // Actualizar las etiquetas meta
    updateMetaTag("description", description);
    updateMetaTag("robots", robots);
    updateMetaTag("og:type", "website");
    updateMetaTag("og:url", url);
    updateMetaTag("og:title", title);
    updateMetaTag("og:description", description);
    updateMetaTag("og:image", image);
    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:url", url);
    updateMetaTag("twitter:title", title);
    updateMetaTag("twitter:description", description);
    updateMetaTag("twitter:image", image);

    return () => {
      // Opcional: limpiar las etiquetas meta al desmontar el componente
      // Puedes quitar o limpiar las etiquetas meta aquí si es necesario
    };
  }, [title, description, url, image, robots]);

  return null;
};

MetaTags.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
  robots: PropTypes.string,
};

MetaTags.defaultProps = {
  robots: "index, follow",
};

export default MetaTags;
