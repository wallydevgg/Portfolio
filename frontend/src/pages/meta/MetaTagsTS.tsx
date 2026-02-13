import { useEffect } from "react";

interface MetaTagsProps {
  title: string;
  description: string;
  url?: string;
  image?: string;
  robots?: string;
  additionalTags?: Array<{ property: string; content: string }>;
}

const MetaTags: React.FC<MetaTagsProps> = ({
  title,
  description,
  url = "",
  image = "",
  robots = "index, follow",
  additionalTags = [],
}) => {
  useEffect(() => {
    document.title = title;

    const updateMetaTag = (name: string, content: string) => {
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

    // Update meta tags
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

    // Update additional tags
    additionalTags.forEach((tag) => {
      updateMetaTag(tag.property, tag.content);
    });

    return () => {
      // Clean up meta tags if needed
    };
  }, [title, description, url, image, robots, additionalTags]);

  return null;
};

export default MetaTags;
