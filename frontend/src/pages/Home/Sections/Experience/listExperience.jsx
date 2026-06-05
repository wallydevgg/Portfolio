import "./Experience.scss";
import { useState, useEffect } from "react";
import { t } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { usePortfolioApi } from "@/features/portfolio/usePortfolioApi";
import { getTranslation } from "@/helpers/i18nContent";

export default function ListExperience() {
  useLingui();
  const { getExperience } = usePortfolioApi();
  const [experience, setExperience] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMore, setShowMore] = useState({});

  useEffect(() => {
    getExperience()
      .then(setExperience)
      .catch((err) => {
        console.error("Failed to load experience:", err);
        setExperience([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleShowMore = (id) => {
    setShowMore((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return <div className="timeline-container">Loading experiences...</div>;
  }

  const listItems = experience.map((work) => {
    const isExpanded = showMore[work.id];
    const maxVisibleItems = 2;
    const responsibilities = work.responsibilities || [];
    const visible = isExpanded
      ? responsibilities
      : responsibilities.slice(0, maxVisibleItems);

    return (
      <li key={work.id} className="timeline-content">
        <div className="timeline-title">
          <div className="timeline-title-content">
            <div className="one">
              <h3>{getTranslation(work.title)}</h3>
              <h4>{work.company}</h4>
              <time>{work.date}</time>
            </div>
            <div className="two">
              <ul className="timeline-description">
                {visible.map((resp, idx) => (
                  <li key={idx}>{getTranslation(resp)}</li>
                ))}
                {responsibilities.length > maxVisibleItems && (
                  <button onClick={() => toggleShowMore(work.id)}>
                    {isExpanded ? t({ id: "experience.seeLess", message: "See less" }) : t({ id: "experience.seeMore", message: "See more >" })}
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
