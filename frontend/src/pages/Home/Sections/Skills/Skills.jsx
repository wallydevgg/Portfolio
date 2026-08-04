import React, { useState, useEffect } from "react";
import "./Skills.scss";
import { t } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { usePortfolioApi } from "@/features/portfolio/usePortfolioApi";
import { getTranslation } from "@/helpers/i18nContent";
import { resolveSkillIcon } from "@/components/IconPicker";

const SkillIcon = ({ name }) => {
  const Icon = resolveSkillIcon(name);
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
        <SkillIcon name={icon} />
        {name}
      </span>
      <span className="skill-level">{level}%</span>
    </div>
    <div className="skill-bar">
      <div className="skill-progress" style={{ width: `${level}%` }} />
    </div>
  </div>
);

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
        {categories.map((category) => (
          <div key={category.id} className="skill-category">
            <h3>{getTranslation(category.name)}</h3>
            {category.skills.map((s) => (
              <SkillBar key={s.id} name={s.name} level={s.level} icon={s.icon} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Skills;
