// ─── useExperience ────────────────────────────────────────────────────────────
// Devuelve la data de experiencia con todas las strings resueltas por Lingui.
// Usa t`` estático (macro compile-time) para que lingui extract las detecte
// y las incluya en el catálogo compilado con sus hashes correctos.

import { t } from "@lingui/macro";
import { useLingui } from "@lingui/react";

export function useExperience() {
  useLingui();

  return [
    {
      id: "1",
      company: "Next_lvl Solutions",
      date: "June 2020 - 2024",
      title: t`Full Stack Developer`,
      responsibilities: [
        t`Redesigned the UX/UI of a travel agency website, resulting in a 30% increase in user satisfaction and a 15% increase in conversions`,
        t`Developed a dynamic travel agency website using Next.js and Postgres, implementing e-commerce functionalities and an advanced booking system. Managed and optimized cloud, web and mail services on AWS, Google Cloud and private VPS, ensuring 99.9% uptime and improving data security`,
        t`Performed extensive diagnostic, quality and feature validation testing, optimizing code and generating detailed reports to ensure software quality.`,
      ],
    },
    {
      id: "2",
      company: "Duality Projects",
      date: "May 2020 - May 2021",
      title: t`Full Stack Developer`,
      responsibilities: [
        t`Design UX/UI and web development. I've made and developed engaging and functional websites using technologies like CMS, Next.js, Payload, React and PostgreSQL.`,
        t`Development of WordPress sites and custom plugins. Design UX/UI and web development. I've made and developed engaging and functional websites using technologies like CMS, Next.js, Payload, React and PostgreSQL. Development of WordPress sites and custom plugins.`,
      ],
    },
  ];
}
