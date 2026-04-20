// ✅ GENERADO POR CLAUDE - Archivo: frontend/src/components/SEO/PageSEO.jsx
import { Helmet } from "react-helmet-async";

const PageSEO = ({
  title = "wallydev | Fullstack Web Developer",
  description = "Portfolio de Waldir Apaza — Fullstack Developer especializado en React 19, FastAPI, PostgreSQL y DevOps.",
  url = "https://wallydev.dev",
  image = "https://wallydev.dev/og.jpg",
  type = "website",
}) => {
  const fullTitle = title.includes("wallydev") ? title : `${title} | wallydev`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="wallydev" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Canonical */}
      <link rel="canonical" href={url} />

      {/* JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Waldir Apaza",
          url: "https://wallydev.dev",
          jobTitle: "Fullstack Web Developer",
          sameAs: [
            "https://github.com/wallydevgg",
            "https://linkedin.com/in/waldirxam",
          ],
        })}
      </script>
    </Helmet>
  );
};

export default PageSEO;
