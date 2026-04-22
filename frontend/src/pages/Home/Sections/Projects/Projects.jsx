import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { faExternalLink } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@/barrell";
import projects from "@/Content/projects.json";
import "./Projects.scss";

const Proyects = () => {
  const [images, setImages] = useState({});

  useEffect(() => {
    const loadImages = async () => {
      const imageModules = import.meta.glob('@/images/projects/*.webp');
      const loadedImages = await Promise.all(
        projects.map(async (project) => {
          const imageName = project.image.split('/').pop();
          const imageLoader = imageModules[`/src/images/projects/${imageName}`];
          if (!imageLoader) {
            console.warn(`Image not found: ${imageName}`);
            return { id: project.id, src: null };
          }
          const image = await imageLoader();
          return { id: project.id, src: image.default };
        })
      );
      const imageMap = loadedImages.reduce((acc, img) => {
        acc[img.id] = img.src;
        return acc;
      }, {});
      setImages(imageMap);
    };

    loadImages();
  }, []);

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
            {images[project.id] ? (
              <img src={images[project.id]} alt={project.title} />
            ) : (
              <div className="image-placeholder">Image not found</div>
            )}
            <div className="content">
              <h2>{project.title}</h2>
              <p>{project.description}</p>
              <ul>
                {project.skills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
              <div className="links">
                <Link
                  onClick={() => window.open(project.websiteLink, "_blank")}
                >
                  Preview <Icon css="icon" icon={faExternalLink} />
                </Link>
                <Link onClick={() => window.open(project.githubLink, "_blank")}>
                  Code <Icon css="icon" icon={faGithub} />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Proyects;