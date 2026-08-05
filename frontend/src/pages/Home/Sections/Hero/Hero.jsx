// ✅ GENERADO POR CLAUDE - Archivo: frontend/src/pages/Home/Sections/Hero/Hero.jsx
import { Icon } from "@/barrell";
import { Link } from "react-router";
import fotowaldir from "@/images/fotowaldir.webp";
import {
  faEnvelope,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import { faLinkedin, faGithub } from "@fortawesome/free-brands-svg-icons";
import "./Hero.scss";
import { Trans, t } from "@lingui/macro";
import { useLingui } from "@lingui/react";

const Hero = () => {
  useLingui();
  const handleDownloadCV = () => {
    const link = document.createElement("a");
    link.href = "/cv/Waldir_Apaza_CV.pdf";
    link.download = "Waldir_Apaza_CV.pdf";
    link.click();
  };

  return (
    <div className="hero-container" id="hero">
      <div className="hero-left">
        <h1>
          <Trans>
            Hi! I'm <span className="highlight">Waldir Apaza</span>
          </Trans>
        </h1>
        <p>
          <Trans>
            +5 years building scalable{" "}
            <span className="highlight">fullstack web applications</span>
          </Trans>
        </p>
        <div className="social-buttons">
          <Link
            to="https://github.com/wallydevgg"
            className="social-btn"
            target="_blank"
            rel="noreferrer"
          >
            <span className="social-btn__icon">
              <Icon css="icon" icon={faGithub} />
            </span>
            <span className="social-btn__label">GitHub</span>
          </Link>
          <Link
            to="https://www.linkedin.com/in/waldirxam/"
            className="social-btn"
            target="_blank"
            rel="noreferrer"
          >
            <span className="social-btn__icon">
              <Icon css="icon" icon={faLinkedin} />
            </span>
            <span className="social-btn__label">LinkedIn</span>
          </Link>
          <Link to="mailto:contact@wallydev.dev" className="social-btn">
            <span className="social-btn__icon">
              <Icon css="icon" icon={faEnvelope} />
            </span>
            <span className="social-btn__label">{t`hero.contactButton`}</span>
          </Link>
          <button
            className="social-btn social-btn--cv"
            onClick={handleDownloadCV}
          >
            <span className="social-btn__icon">
              <Icon css="icon" icon={faDownload} />
            </span>
            <span className="social-btn__label">{t`hero.downloadCV`}</span>
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