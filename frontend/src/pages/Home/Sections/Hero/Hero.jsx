import { Icon } from "@/barrell";
import { Link } from "react-router-dom";
import fotowaldir from "@/images/fotowaldir.webp";
import { faEnvelope, faDownload, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { faLinkedin, faGithub } from "@fortawesome/free-brands-svg-icons";
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
    <div
      className="w-full mx-auto flex justify-center max-[599px]:flex-col max-[599px]:flex-grow max-[599px]:mt-[7.5vh] max-[599px]:mb-20 max-[991px]:flex-col max-[991px]:h-screen lg:h-[90vh] lg:mt-0 xl:mt-16"
      id="hero"
    >
      {/* Left: text + buttons */}
      <div className="w-1/2 p-12 flex flex-col justify-center max-[599px]:w-full max-[599px]:order-1 max-[599px]:p-0 max-[991px]:w-full max-[991px]:items-center lg:p-4 lg:items-start xl:justify-center xl:p-8 text-[var(--LM-Title)] dark:text-[var(--DM-Title)]">
        <h1 className="font-semibold text-[2em] max-[599px]:text-[1.75rem]">
          <Trans>
            Hi! I'm <span className="hashTag">Waldir Apaza</span>
          </Trans>
        </h1>
        <p className="mt-4 font-semibold text-[1.25rem]">
          <Trans>
            +3 Years of experience{" "}
            <span className="hashTag">Fullstack Web Developer</span> with a
            solid background in{" "}
            <span className="hashTag">software development</span>
          </Trans>
        </p>
        <div className="mt-6 flex flex-wrap gap-[8%]">
          <button className="social-btn" onClick={() => scrollToSection("projects")}>
            <Icon css="icon" icon={faArrowRight} /> {t`hero.viewProjects`}
          </button>
          <Link to="/blog" className="social-btn">
            <Icon css="icon" icon={faArrowRight} /> {t`hero.readBlog`}
          </Link>
          <Link to="https://github.com/wallydevgg" className="social-btn" target="_blank" rel="noreferrer">
            <Icon css="icon" icon={faGithub} /> GitHub
          </Link>
          <Link to="https://www.linkedin.com/in/waldirxam/" className="social-btn" target="_blank" rel="noreferrer">
            <Icon css="icon" icon={faLinkedin} /> LinkedIn
          </Link>
          <Link to="mailto:contact@wallydev.dev" className="social-btn">
            <Icon css="icon" icon={faEnvelope} /> {t`hero.contactButton`}
          </Link>
          <button className="social-btn" onClick={handleDownloadCV}>
            <Icon css="icon" icon={faDownload} /> {t`hero.downloadCV`}
          </button>
        </div>
      </div>

      {/* Right: photo + status */}
      <div className="w-1/2 p-12 flex flex-col justify-center items-center max-[599px]:w-full max-[599px]:p-2 max-[599px]:pt-8 max-[599px]:relative max-[599px]:justify-start max-[599px]:items-start max-[991px]:w-full max-[991px]:p-0">
        <img
          src={fotowaldir}
          alt="profile pic"
          className="rounded-full border-[0.2rem] border-[var(--color-primary)] w-[19rem] aspect-square max-[599px]:w-24"
        />
        <div className="border-[1.75px] border-solid rounded-[2.5rem] px-3 py-1 flex items-center text-[#166534] bg-[#dcfce7] -mt-4 max-[599px]:absolute max-[599px]:left-[6.5rem] max-[599px]:bottom-12 max-[599px]:text-[0.95rem]">
          {t`hero.status`}
        </div>
      </div>
    </div>
  );
};

export default Hero;
