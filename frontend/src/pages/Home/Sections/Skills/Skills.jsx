import React from "react";
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
  <div className="mb-5">
    <div className="flex justify-between mb-[0.4rem] text-[0.9rem]">
      <span className="font-normal text-[var(--LM-Title)] dark:text-[var(--DM-Title)]">{name}</span>
      <span className="text-[var(--parrafos)] text-[0.8rem]">{level}%</span>
    </div>
    <div className="h-[6px] bg-[rgba(167,169,190,0.2)] rounded-[3px] overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-[3px] transition-[width] duration-700 ease-in-out"
        style={{ width: `${level}%` }}
      />
    </div>
  </div>
);

const Skills = () => {
  return (
    <div className="w-full my-8 p-8 max-[599px]:p-4" id="skills">
      <div className="flex items-center gap-4 mb-10">
        <h2 className="text-[2rem] font-semibold whitespace-nowrap text-[var(--LM-Title)] dark:text-[var(--DM-Title)]">
          <span className="hashTag">#</span>{t`skills.title`}
        </h2>
        <div className="flex-1 h-px bg-gradient-to-r from-[var(--color-primary)] to-transparent" />
      </div>

      <div className="grid grid-cols-3 gap-10 max-[991px]:grid-cols-2 max-[599px]:grid-cols-1">
        {[
          { key: "frontend", label: () => t`skills.frontend`, items: SKILLS.frontend },
          { key: "backend",  label: () => t`skills.backend`,  items: SKILLS.backend },
          { key: "devops",   label: () => t`skills.devops`,   items: SKILLS.devops },
        ].map(({ key, label, items }) => (
          <div key={key}>
            <h3 className="text-[1.1rem] font-semibold text-[var(--color-primary)] mb-6 pb-2 border-b border-[rgba(255,137,6,0.3)]">
              {label()}
            </h3>
            {items.map((s) => <SkillBar key={s.name} {...s} />)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Skills;
