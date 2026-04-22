import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { faExternalLink } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@/barrell";
import projects from "@/Content/projects.json";

const Proyects = () => {
  const [images, setImages] = useState({});

  useEffect(() => {
    const loadImages = async () => {
      const imageModules = import.meta.glob("@/images/projects/*.webp");
      const loadedImages = await Promise.all(
        projects.map(async (project) => {
          const imageName = project.image.split("/").pop();
          const imageLoader = imageModules[`/src/images/projects/${imageName}`];
          if (!imageLoader) return { id: project.id, src: null };
          const image = await imageLoader();
          return { id: project.id, src: image.default };
        })
      );
      setImages(loadedImages.reduce((acc, img) => ({ ...acc, [img.id]: img.src }), {}));
    };
    loadImages();
  }, []);

  return (
    <div id="projects">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <h2 className="text-[2rem] font-semibold whitespace-nowrap text-[var(--LM-Title)] dark:text-[var(--DM-Title)]">
          <span className="hashTag">#</span>projects
        </h2>
        <div className="flex-1 h-px bg-gradient-to-r from-[var(--color-primary)] to-transparent" />
      </div>

      {/* Grid */}
      <div className="flex flex-wrap gap-[1%] justify-center py-16 max-[599px]:flex-col max-[599px]:gap-0 max-[599px]:py-10 max-[991px]:flex-col max-[991px]:gap-[3%] max-[991px]:py-8">
        {projects.map((project) => (
          <div
            key={project.id}
            className="relative w-[45%] overflow-hidden flex m-4 rounded-[1.75rem] max-[599px]:w-full max-[599px]:border max-[599px]:border-[var(--color-primary)] max-[599px]:flex-wrap max-[599px]:static max-[599px]:overflow-visible max-[599px]:mb-4 max-[599px]:m-0 max-[599px]:dark:bg-[var(--BgDark)] max-[991px]:w-[85%] max-[991px]:mx-auto max-[991px]:mb-8 max-[991px]:border max-[991px]:border-[var(--color-primary)] max-[991px]:flex-wrap max-[991px]:static max-[991px]:overflow-visible hover:brightness-90 group"
          >
            {images[project.id] ? (
              <img
                src={images[project.id]}
                alt={project.title}
                className="rounded-[1.75rem] transition-[filter] duration-300 h-auto max-[599px]:w-full max-[599px]:rounded-[1.75rem_1.75rem_0_0] max-[991px]:w-full max-[991px]:rounded-[1.75rem_1.75rem_0_0] lg:h-full"
              />
            ) : (
              <div className="flex items-center justify-center w-full bg-[rgba(167,169,190,0.1)] text-[var(--parrafos)] rounded-[1.75rem]">
                Image not found
              </div>
            )}

            {/* Hover overlay content */}
            <div className="absolute inset-0 text-[var(--DM-Title)] flex flex-col justify-center p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 max-[599px]:static max-[599px]:translate-y-0 max-[991px]:static max-[991px]:translate-y-0 lg:bg-[var(--BgDark)] lg:opacity-90 lg:backdrop-blur-[10px] lg:rounded-[1.75rem]">
              <h2 className="text-[1.25rem] font-bold text-left">{project.title}</h2>
              <p className="text-[0.8rem] text-left font-normal">{project.description}</p>
              <ul className="flex flex-row flex-wrap gap-[5%] py-3 list-none">
                {project.skills.map((skill) => (
                  <li
                    key={skill}
                    className="border border-[var(--color-primary)] rounded-[0.75rem] px-2 py-1 text-[0.8rem] font-bold text-[var(--DM-Title)]"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
              <div className="flex flex-row gap-[4%] max-[599px]:ml-[0.4rem] max-[991px]:ml-[0.4rem]">
                <Link
                  onClick={() => window.open(project.websiteLink, "_blank")}
                  className="text-[var(--DM-Title)] font-bold no-underline text-[0.85rem] hover:text-[var(--color-primary)] cursor-pointer"
                >
                  Preview <Icon css="icon" icon={faExternalLink} />
                </Link>
                <Link
                  onClick={() => window.open(project.githubLink, "_blank")}
                  className="text-[var(--DM-Title)] font-bold no-underline text-[0.85rem] hover:text-[var(--color-primary)] cursor-pointer"
                >
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
