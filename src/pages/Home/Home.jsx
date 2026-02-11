import { About, Projects } from "../../barrell";
import Experience from "./Sections/Experience/Experience";
import Hero from "./Sections/Hero/Hero";
//import MetaTags from "../meta/MetaTags";

import "./Home.scss";
import { Helmet } from "react-helmet-async";

const Home = () => {
  return (
    <div className="home-background">
      {/*       <MetaTags
        title="Portfolio de Waldir - Desarrollador y programador web con mas de 3 años de experiencia"
        description="Contrata a Waldir para crear tu aplicación web o webapp. Desarrollador Web. Especializado en crear webs y apps únicos."
        url="https://wallydev.dev"
        image="https://i.postimg.cc/s2CN39F3/Screenshot-from-2024-09-17-21-41-35.png"
      /> */}
      <Helmet>
        <title>Portfolio de wallydev</title>
        <meta name="description" content="Página de inicio" />
        <meta property="og:title" content="wallydev-Home" />
        <meta
          property="og:description"
          content="Contrata a Waldir para crear tu aplicación web o webapp. Desarrollador Web. Especializado en crear webs y apps únicos."
        />
        <meta
          property="og:image"
          content="https://i.postimg.cc/s2CN39F3/Screenshot-from-2024-09-17-21-41-35.png"
        />
        <meta property="og:url" content="https://wallydev.dev" />
        <meta property="og:type" content="website" />
      </Helmet>
      <div className="home-container">
        <Hero />
        <Experience />
        <Projects />
        <About />
      </div>
    </div>
  );
};

export default Home;
