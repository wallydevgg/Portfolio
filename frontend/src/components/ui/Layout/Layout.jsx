import React, { useContext } from "react";
import { Header, Footer } from "../../../barrell";
import { ThemeContext } from "../../../barrell";
import "./Layout.scss";
import { Outlet } from "react-router";
import { GoogleFontsOptimizer } from "../../Context/FontsOptimizer";
//import SEO from "../../../pages/meta/HelmetSEO";

//import MetaTags from "../../../pages/meta/MetaTagsTS";

const Layout = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <div className={`App ${theme}-theme`}>
      <GoogleFontsOptimizer />
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
