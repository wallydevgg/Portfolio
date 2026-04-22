import React from "react";
import ListExperience from "./listExperience";

const Experience = () => {
  return (
    <div className="flex flex-col" id="experience">
      <div className="flex items-center gap-4 mb-10">
        <h2 className="text-[2rem] font-semibold whitespace-nowrap text-[var(--LM-Title)] dark:text-[var(--DM-Title)]">
          <span className="hashTag">#</span>experiencia
        </h2>
        <div className="flex-1 h-px bg-gradient-to-r from-[var(--color-primary)] to-transparent" />
      </div>
      <div className="flex py-12 max-[599px]:py-10">
        <ListExperience />
      </div>
    </div>
  );
};

export default Experience;
