import React from "react";
import { Caruousel } from "../../../../barrell";

const About = () => {
  return (
    <div className="w-full" id="about">
      <div className="flex items-center gap-4 mb-10">
        <h2 className="text-[2rem] font-semibold whitespace-nowrap text-[var(--LM-Title)] dark:text-[var(--DM-Title)]">
          <span className="hashTag">#</span>about-me
        </h2>
        <div className="flex-1 h-px bg-gradient-to-r from-[var(--color-primary)] to-transparent" />
      </div>
      <div className="pt-12 pb-0 flex flex-col">
        <div className="flex flex-col justify-center w-full">
          <p className="px-2 py-1 text-left"> Hi, I'm Waldir!</p>
          <p className="px-2 py-1 text-left">
            I am a self-taught developer and passionate about technology, I am
            currently a frontend developer, of course I am going for more. I can
            develop responsive websites and apps from scratch and turn them into
            modern, easy-to-use web experiences.
          </p>
          <p className="px-2 py-1 text-left">
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
