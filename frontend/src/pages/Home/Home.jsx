// ✅ GENERADO POR CLAUDE - Archivo: frontend/src/pages/Home/Home.jsx
import { About, Projects } from "../../barrell";
import Experience from "./Sections/Experience/Experience";
import Hero from "./Sections/Hero/Hero";
import Skills from "./Sections/Skills/Skills";
import Contact from "./Sections/Contact/Contact";
import PageSEO from "@/components/SEO/PageSEO";

const Home = () => {
  return (
    <div className="flex">
      <PageSEO
        title="wallydev | Fullstack Web Developer"
        description="Portfolio de Waldir Apaza — Fullstack Developer especializado en React 19, FastAPI, PostgreSQL y DevOps. Disponible para proyectos."
        url="https://wallydev.dev"
      />
      <div className="w-full max-w-[85%] mx-auto max-[599px]:px-5 max-[599px]:max-w-full max-[991px]:w-full lg:max-w-[95%] xl:max-w-[70%] min-[1600px]:max-w-[75%]">
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
