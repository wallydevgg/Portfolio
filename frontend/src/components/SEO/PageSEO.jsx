// PageSEO — Fetches dynamic SEO settings from the API at mount time.
// On React 19, <title> and <meta> are hoisted to <head> natively.
import { useState, useEffect } from "react";

const API_BASE = "/api/v1/settings";

const DEFAULT_SEO = {
  title: { en: "wallydev | Fullstack Web Developer", es: "wallydev | Desarrollador Web Fullstack" },
  description: {
    en: "Portfolio de Waldir Apaza — Fullstack Developer especializado en React 19, FastAPI, PostgreSQL y DevOps.",
    es: "Portfolio de Waldir Apaza — Desarrollador Fullstack especializado en React 19, FastAPI, PostgreSQL y DevOps.",
  },
  keywords: { en: "developer, react, fullstack", es: "desarrollador, react, fullstack" },
  og_image: "https://wallydev.dev/og.jpg",
  site_url: "https://wallydev.dev",
  twitter_handle: "@wallydevgg",
};

let cachedSeo = null;

const PageSEO = ({
  locale = "en",
  titleOverride,
  descriptionOverride,
  urlOverride,
}) => {
  const [seo, setSeo] = useState(cachedSeo || DEFAULT_SEO);

  useEffect(() => {
    if (cachedSeo) return; // Use in-memory cache across page navigations
    fetch(`${API_BASE}/seo`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          cachedSeo = data;
          setSeo(data);
        }
      })
      .catch(() => {}); // Silently fall back to defaults
  }, []);

  const rawTitle = titleOverride || seo.title?.[locale] || seo.title?.en || "wallydev";
  const fullTitle = rawTitle.includes("wallydev") ? rawTitle : `${rawTitle} | wallydev`;
  const description = descriptionOverride || seo.description?.[locale] || seo.description?.en || "";
  const canonicalUrl = urlOverride || seo.site_url || "https://wallydev.dev";
  const ogImage = seo.og_image || "https://wallydev.dev/og.jpg";
  const twitterHandle = seo.twitter_handle || "@wallydevgg";

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="wallydev" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Canonical */}
      <link rel="canonical" href={canonicalUrl} />

      {/* JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Waldir Apaza",
          url: seo.site_url || "https://wallydev.dev",
          jobTitle: "Fullstack Web Developer",
          sameAs: [
            "https://github.com/wallydevgg",
            "https://linkedin.com/in/waldirxam",
          ],
        })}
      </script>
    </>
  );
};

export default PageSEO;
