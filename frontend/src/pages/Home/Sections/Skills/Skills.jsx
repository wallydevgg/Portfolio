import React, { useState, useEffect } from "react";
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

const SkillBar = ({ name, level, icon }) => (
  <div className="skill-item">
    <div className="skill-header">
      <span className="skill-name">
        <SkillIcon name={name} icon={icon} />
        {name}
      </span>
      <span className="skill-level">{level}%</span>
    </div>
    <div className="skill-bar">
      <div className="skill-progress" style={{ width: `${level}%` }} />
    </div>
  </div>
);

// Curated selection: only the strongest/most relevant skills (~21 total),
// grouped into 3 columns. The full list (56) lives in the dashboard/CV.
const SKILL_COLUMNS = [
  {
    titleKey: "skills.colLanguages",
    categories: ["Languages", "Databases"],
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
    categories: ["Frontend"],
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
    categories: ["Backend", "DevOps & Cloud", "Architecture & Methodologies"],
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

const COLUMN_TITLES = {
  "skills.colLanguages": t`skills.colLanguages`,
  "skills.colFrontend": t`skills.colFrontend`,
  "skills.colBackend": t`skills.colBackend`,
};

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
      <div key={col.titleKey} className="skill-category">
        <h3>{getColumnTitle(col.titleKey)}</h3>
        {items.map((s) => (
          <SkillBar key={s.name} name={s.name} level={s.level} icon={s.icon} />
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

      <div className="skills-grid">
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