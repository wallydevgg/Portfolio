import "./Experience.scss";
import { useState } from "react";
import { experience } from "../../../../Content/experience.js";

export default function ListExperience() {
  //const [showMore, setShowMore] = useState(false);
  const [showMore, setShowMore] = useState({});
  const toggleShowMore = (id) => {
    setShowMore((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  const listItems = experience.map((work) => {
    const isExpanded = showMore[work.id];
    const responsibilitiesKeys = Object.keys(work.description.responsibilities); 
    const maxVisibleItems = 2;

    return (
      <li key={work.id} className="timeline-content">
        <div className="timeline-title">
          <div className="timeline-title-content">
            <div className="one">
              <h3>{work.title}</h3>
              <h4>{work.company}</h4>
              <time>{work.date}</time>
            </div>
            <div className="two">
              <ul className="timeline-description">
                {isExpanded
                  ? responsibilitiesKeys.map((key) => (
                      <li key={key}>
                        {work.description.responsibilities[key]} <br />
                      </li>
                    ))
                  : responsibilitiesKeys
                      .slice(0, maxVisibleItems)
                      .map((key) => (
                        <li key={key}>
                          {work.description.responsibilities[key]} <br />
                        </li>
                      ))}
                {responsibilitiesKeys.length > maxVisibleItems && (
                  <button onClick={() => toggleShowMore(work.id)}>
                    {isExpanded ? "Ver menos" : "Saber más >"}
                  </button>
                )}
              </ul>
            </div>
          </div>
        </div>
      </li>
    );
  });
  return <ol className="timeline-container">{listItems}</ol>;
}
