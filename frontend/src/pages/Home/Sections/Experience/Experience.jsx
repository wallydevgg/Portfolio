import React, { useState } from "react";
import "./Experience.scss";
import ListExperience from "./listExperience";

const Experience = () => {
  const [showMore, setShowMore] = useState(false);

  const toggleShowMore = () => {
    setShowMore(!showMore);
  };

  return (
    <div className="experience" id="experience">
      <div className="title-container">
        <h2>
          <span className="hashTag">#</span>experiencia
        </h2>
        <div className="space-line"></div>
      </div>

      <div className="experience-container">
        <ListExperience />
      </div>
    </div>
  );
};

export default Experience;
