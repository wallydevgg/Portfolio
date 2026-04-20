// ✅ GENERADO POR CLAUDE - Archivo: frontend/src/pages/Home/Home.jsx
import { About, Projects } from "../../barrell";
import Experience from "./Sections/Experience/Experience";
import Hero from "./Sections/Hero/Hero";
import Skills from "./Sections/Skills/Skills";
import Contact from "./Sections/Contact/Contact";
import PageSEO from "@/components/SEO/PageSEO";
import "./Home.scss";

const Home = () => {
  return (
    <div className="home-background">
      <PageSEO
        title="wallydev | Fullstack Web Developer"
        description="Portfolio de Waldir Apaza — Fullstack Developer especializado en React 19, FastAPI, PostgreSQL y DevOps. Disponible para proyectos."
        url="https://wallydev.dev"
      />
      <div className="home-container">
        <Hero />
        <Experience />
        <Skills />
        <Projects />
        <About />
        <Contact />
      </div>
    </div>
  );
};

export default Home;
