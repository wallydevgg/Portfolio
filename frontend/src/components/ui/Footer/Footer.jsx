import React from "react";
import "./Footer.scss";
import { Link } from "react-router-dom";
import { Icon } from "../../Icons";
import {
  faDiscord,
  faGithub,
  faLinkedin,
} from "@fortawesome/free-brands-svg-icons";

const Footer = () => {
  return (
    <div className="footer-container">
      <div className="footer-line"></div>
      <div className="footer-main">
        <div className="footer-right">
          <span className="footer-social-icons">
            <Link
              to="https://github.com/waldir-xam"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visita mi github"
            >
              <Icon css="icon" icon={faGithub} />
            </Link>
            <Link
              to="http://www.discordapp.com/users/597457139736510505"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contactame por discord"
            >
              <Icon css="icon" icon={faDiscord} />
            </Link>
            <Link
              to="https://www.linkedin.com/in/waldirxam/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visita mi linkedin y conecta conmigo"
            >
              <Icon css="icon" icon={faLinkedin} />
            </Link>
          </span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
        <span className="footer-derechos">Developed by Waldir Apaza</span>
        <Link to="/privacy" style={{ fontSize: "0.8rem", color: "var(--parrafos)", textDecoration: "none" }}>
          Privacy Policy
        </Link>
      </div>
    </div>
  );
};

export default Footer;
