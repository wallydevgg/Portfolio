// ✅ GENERADO POR CLAUDE - Archivo: frontend/src/pages/Home/Sections/Hero/Hero.jsx
import { Icon } from "@/barrell";
import { Link } from "react-router-dom";
import fotowaldir from "@/images/fotowaldir.webp";
import { faEnvelope, faDownload, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { faLinkedin, faGithub } from "@fortawesome/free-brands-svg-icons";
import "./Hero.scss";
import { Trans, t } from "@lingui/macro";

const Hero = () => {
  const handleDownloadCV = () => {
    const link = document.createElement("a");
    link.href = "/cv/Waldir_Apaza_CV.pdf";
    link.download = "Waldir_Apaza_CV.pdf";
    link.click();
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <div className="hero-container" id="hero">
      <div className="hero-left">
        <h1>
          <Trans>
            Hi! I'm <span className="hashTag">Waldir Apaza</span>
          </Trans>
        </h1>
        <p>
          <Trans>
            +3 Years of experience{" "}
            <span className="hashTag">Fullstack Web Developer</span> with a
            solid background in{" "}
            <span className="hashTag">software development</span>
          </Trans>
        </p>
        <div className="social-buttons">
          <button className="social-btn" onClick={() => scrollToSection("projects")}>
            <Icon css="icon" icon={faArrowRight} /> {t`hero.viewProjects`}
          </button>
          <Link to="/blog" className="social-btn">
            <Icon css="icon" icon={faArrowRight} /> {t`hero.readBlog`}
          </Link>
          <Link
            to="https://github.com/wallydevgg"
            className="social-btn"
            target="_blank"
            rel="noreferrer"
          >
            <Icon css="icon" icon={faGithub} /> GitHub
          </Link>
          <Link
            to="https://www.linkedin.com/in/waldirxam/"
            className="social-btn"
            target="_blank"
            rel="noreferrer"
          >
            <Icon css="icon" icon={faLinkedin} /> LinkedIn
          </Link>
          <Link to="mailto:waliuxd@gmail.com" className="social-btn">
            <Icon css="icon" icon={faEnvelope} /> {t`hero.contactButton`}
          </Link>
          <button className="social-btn social-btn--cv" onClick={handleDownloadCV}>
            <Icon css="icon" icon={faDownload} /> {t`hero.downloadCV`}
          </button>
        </div>
      </div>
      <div className="hero-right">
        <img src={fotowaldir} alt="profile pic" />
        <div className="status">{t`hero.status`}</div>
      </div>
    </div>
  );
};

export default Hero;
