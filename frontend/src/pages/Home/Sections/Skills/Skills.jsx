import React, { useState, useEffect, useRef } from "react";
import "./Skills.scss";
import { t } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { usePortfolioApi } from "@/features/portfolio/usePortfolioApi";
import { resolveSkillIcon } from "@/components/IconPicker";
import { ArrowRight } from "lucide-react";

// Some DB skill names don't match picker icon names exactly.
const SKILL_ICON_OVERRIDES = {
  "AWS (EC2, ECS, RDS, S3)": "AWS",
  "JavaScript (ES6+)": "JavaScript",
  "Tailwind CSS": "Tailwind",
};

const SkillIcon = ({ name, icon }) => {
  const Icon =
    resolveSkillIcon(icon) ||
    resolveSkillIcon(SKILL_ICON_OVERRIDES[name] || name);
  if (!Icon) return null;
  return (
    <span className="skill-icon" title={name}>
      <Icon />
    </span>
  );
};

const SkillBar = ({ name, level, icon, revealed, index }) => (
  <div className="skill-item">
    <div className="skill-header">
      <span className="skill-name">
        <SkillIcon name={name} icon={icon} />
        {name}
      </span>
      <span className="skill-level">{level}%</span>
    </div>
    <div className="skill-bar">
      <div
        className="skill-progress"
        style={{
          width: revealed ? `${level}%` : 0,
          // Escalonado corto: las barras de una columna entran en cascada en
          // lugar de todas a la vez.
          transitionDelay: `${index * 60}ms`,
        }}
      />
    </div>
  </div>
);

/**
 * Revela el contenido cuando el elemento observado entra en el viewport.
 *
 * Con `prefers-reduced-motion` activo arranca revelado: el valor final se ve
 * de entrada y la transición se anula desde SCSS, sin esperar al scroll.
 *
 * `enabled` existe porque el nodo observado solo se monta cuando terminó la
 * carga; sin él el efecto correría con la ref vacía y no volvería a intentarlo.
 */
function useRevealOnScroll(enabled = true) {
  const ref = useRef(null);
  const [revealed, setRevealed] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    if (!enabled || revealed || !ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setRevealed(true);
        observer.disconnect(); // se anima una sola vez, no en cada scroll
      },
      { threshold: 0.2 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [enabled, revealed]);

  return [ref, revealed];
}

// Curated selection: only the strongest/most relevant skills (~21 total),
// grouped into 3 columns. The full list (56) lives in the dashboard/CV.
// `accent` es decisión de diseño, no dato de negocio: vive aquí y no en la DB.
// Se inyecta como custom property y de ahí lo toman barra, icono y título.
const SKILL_COLUMNS = [
  {
    titleKey: "skills.colLanguages",
    accent: "#ff8906", // ámbar — el primario de la marca
    skills: [
      "Python",
      "JavaScript (ES6+)",
      "TypeScript",
      "SQL",
      "PostgreSQL",
      "MongoDB",
      "Redis",
    ],
  },
  {
    titleKey: "skills.colFrontend",
    accent: "#22d3ee", // cian
    skills: [
      "React",
      "Next.js",
      "Tailwind CSS",
      "Redux",
      "Zustand",
      "Sass",
      "Angular",
    ],
  },
  {
    titleKey: "skills.colBackend",
    accent: "#a78bfa", // violeta
    skills: [
      "Django",
      "Django REST Framework",
      "FastAPI",
      "Node.js",
      "Docker",
      "AWS (EC2, ECS, RDS, S3)",
      "GitHub Actions",
    ],
  },
];

// Los títulos se resuelven dentro de la función a propósito: invocar el macro
// `t` en el ámbito del módulo lo congelaría en el idioma del primer render.
const getColumnTitle = (key) => {
  const titles = {
    "skills.colLanguages": t`skills.colLanguages`,
    "skills.colFrontend": t`skills.colFrontend`,
    "skills.colBackend": t`skills.colBackend`,
  };
  return titles[key];
};

const Skills = () => {
  useLingui();
  const { getSkills } = usePortfolioApi();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gridRef, revealed] = useRevealOnScroll(!loading);

  useEffect(() => {
    getSkills()
      .then(setCategories)
      .catch((err) => {
        console.error("Failed to load skills:", err);
        setCategories([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const scrollToHero = () => {
    const el = document.getElementById("hero");
    if (el) {
      const top = el.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  // Build a lookup: skill name -> {level, icon}
  const skillMap = {};
  categories.forEach((cat) => {
    cat.skills.forEach((s) => {
      skillMap[s.name] = { level: s.level, icon: s.icon };
    });
  });

  const renderColumn = (col) => {
    const items = col.skills
      .map((name) => ({ name, ...skillMap[name] }))
      .filter((s) => s.level !== undefined);
    return (
      <div
        key={col.titleKey}
        className="skill-category"
        style={{ "--skill-accent": col.accent }}
      >
        <h3>{getColumnTitle(col.titleKey)}</h3>
        {items.map((s, i) => (
          <SkillBar
            key={s.name}
            name={s.name}
            level={s.level}
            icon={s.icon}
            revealed={revealed}
            index={i}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="skills" id="skills">
        <div className="title-container">
          <h2>
            <span className="hashTag">#</span>
            {t`skills.title`}
          </h2>
          <div className="space-line"></div>
        </div>
        <div>Loading skills...</div>
      </div>
    );
  }

  return (
    <div className="skills" id="skills">
      <div className="title-container">
        <h2>
          <span className="hashTag">#</span>
          {t`skills.title`}
        </h2>
        <div className="space-line"></div>
      </div>

      <div className="skills-grid" ref={gridRef}>
        {SKILL_COLUMNS.map(renderColumn)}
      </div>

      <div className="skills-footer">
        <button className="skills-cv-btn" onClick={scrollToHero}>
          {t`skills.seeAllInCV`} <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default Skills;