import React, { useState, useEffect } from "react";

import { Caruousel } from "../../../../barrell";
import "./About.scss";

const About = () => {
  return (
    <div className="aboutme-home" id="about">
      <div className="title-container">
        <h2>
          <span className="hashTag">#</span>about-me
        </h2>
        <div className="space-line"></div>
      </div>
      <div className="sector">
        <div className="aboutme">
          <p> Hi, I'm Waldir!</p>
          <p>
            I am a self-taught developer and passionate about technology, I am
            currently a frontend developer, of course I am going for more. I can
            develop responsive websites and apps from scratch and turn them into
            modern, easy-to-use web experiences.
          </p>
          <p>
            I have helped several clients establish their online presence and
            provide solutions. I always strive to learn about the latest
            technologies and frameworks.
          </p>
        </div>
        <Caruousel />
      </div>
    </div>
  );
};

export default About;
