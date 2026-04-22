import React from "react";
import { Link } from "react-router-dom";
import { Icon } from "../../Icons";
import { faDiscord, faGithub, faLinkedin } from "@fortawesome/free-brands-svg-icons";

const Footer = () => {
  const iconLink = "flex items-center text-[1.2rem] no-underline text-[var(--LM-Title)] dark:text-[var(--DM-Title)] hover:text-[var(--color-primary)] transition-colors duration-300";

  return (
    <div className="w-full flex flex-col justify-around">
      <div className="bg-[var(--parrafos)] mx-auto mt-4 w-[85%] h-[2px]" />
      <div className="flex justify-center items-center p-4">
        <span className="flex gap-6">
          <Link to="https://github.com/waldir-xam" target="_blank" rel="noopener noreferrer" aria-label="Visita mi github" className={iconLink}>
            <Icon css="icon" icon={faGithub} />
          </Link>
          <Link to="http://www.discordapp.com/users/597457139736510505" target="_blank" rel="noopener noreferrer" aria-label="Contactame por discord" className={iconLink}>
            <Icon css="icon" icon={faDiscord} />
          </Link>
          <Link to="https://www.linkedin.com/in/waldirxam/" target="_blank" rel="noopener noreferrer" aria-label="Visita mi linkedin y conecta conmigo" className={iconLink}>
            <Icon css="icon" icon={faLinkedin} />
          </Link>
        </span>
      </div>
      <span className="flex justify-around p-4 text-[var(--LM-Title)] dark:text-[var(--DM-Title)]">
        Developed by Waldir Apaza
      </span>
    </div>
  );
};

export default Footer;
