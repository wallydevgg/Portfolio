// ─── Experience Data ──────────────────────────────────────────────────────────
// Stores only structural / non-translatable fields (id, company, date).
// Translatable strings are keyed via Lingui message IDs — see useExperience.js.

export const experience = [
  {
    id: "1",
    company: "Next_lvl Solutions",
    date: "June 2020 - 2024",
    titleKey: "experience.1.title",
    responsibilities: [
      "experience.1.resp.1",
      "experience.1.resp.2",
      "experience.1.resp.3",
    ],
  },
  {
    id: "2",
    company: "Duality Projects",
    date: "May 2020 - May 2021",
    titleKey: "experience.2.title",
    responsibilities: [
      "experience.2.resp.1",
      "experience.2.resp.2",
    ],
  },
];
