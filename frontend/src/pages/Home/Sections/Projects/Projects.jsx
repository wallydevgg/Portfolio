import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { faExternalLink } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@/barrell";
import { usePortfolioApi } from "@/features/portfolio/usePortfolioApi";
import { getTranslation } from "@/helpers/i18nContent";
import "./Projects.scss";

const Projects = () => {
  const { getProjects } = usePortfolioApi();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProjects()
      .then(setProjects)
      .catch((err) => {
        console.error("Failed to load projects:", err);
        setProjects([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="projects" id="projects">
        <div className="proyectsHead">
          <div className="title-container">
            <h2>
              <span className="hashTag">#</span>projects
            </h2>
            <div className="space-line"></div>
          </div>
        </div>
        <div>Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="projects" id="projects">
      <div className="proyectsHead">
        <div className="title-container">
          <h2>
            <span className="hashTag">#</span>projects
          </h2>
          <div className="space-line"></div>
        </div>
      </div>
      <div className="proyect-list">
        {projects.map((project) => (
          <div key={project.id} className="project">
            {project.image_url ? (
              <img src={project.image_url} alt={getTranslation(project.title)} />
            ) : (
              <div className="image-placeholder">No image</div>
            )}
            <div className="content">
              <h2>{getTranslation(project.title)}</h2>
              <p>{getTranslation(project.description)}</p>
              <ul>
                {project.tech_stack.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
              <div className="links">
                {project.website_link && (
                  <Link onClick={() => window.open(project.website_link, "_blank")}>
                    Preview <Icon css="icon" icon={faExternalLink} />
                  </Link>
                )}
                {project.github_link && (
                  <Link onClick={() => window.open(project.github_link, "_blank")}>
                    Code <Icon css="icon" icon={faGithub} />
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projects;
