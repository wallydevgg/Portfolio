// ✅ GENERADO POR CLAUDE - Archivo: frontend/src/pages/Home/Sections/Skills/Skills.jsx
import React from "react";
import "./Skills.scss";
import { t } from "@lingui/macro";

const SKILLS = {
  frontend: [
    { name: "React 19", level: 90 },
    { name: "TypeScript", level: 80 },
    { name: "Tailwind CSS", level: 95 },
    { name: "Next.js", level: 80 },
    { name: "Vite", level: 90 },
    { name: "SCSS / CSS", level: 90 },
  ],
  backend: [
    { name: "Python / FastAPI", level: 80 },
    { name: "Node.js / Express", level: 80 },
    { name: "PostgreSQL", level: 85 },
    { name: "SQLAlchemy", level: 75 },
    { name: "JWT / Auth", level: 90 },
    { name: "REST APIs", level: 90 },
  ],
  devops: [
    { name: "Docker", level: 80 },
    { name: "Git / GitHub", level: 95 },
    { name: "GitHub Actions", level: 75 },
    { name: "Linux / Bash", level: 80 },
    { name: "Nginx", level: 75 },
    { name: "VPS / Hetzner", level: 75 },
  ],
};

const SkillBar = ({ name, level }) => (
  <div className="skill-item">
    <div className="skill-header">
      <span className="skill-name">{name}</span>
      <span className="skill-level">{level}%</span>
    </div>
    <div className="skill-bar">
      <div className="skill-progress" style={{ width: `${level}%` }} />
    </div>
  </div>
);

const Skills = () => {
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
        <div className="skill-category">
          <h3>{t`skills.frontend`}</h3>
          {SKILLS.frontend.map((s) => (
            <SkillBar key={s.name} {...s} />
          ))}
        </div>
        <div className="skill-category">
          <h3>{t`skills.backend`}</h3>
          {SKILLS.backend.map((s) => (
            <SkillBar key={s.name} {...s} />
          ))}
        </div>
        <div className="skill-category">
          <h3>{t`skills.devops`}</h3>
          {SKILLS.devops.map((s) => (
            <SkillBar key={s.name} {...s} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Skills;
