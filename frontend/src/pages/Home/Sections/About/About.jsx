import React, { useState, useEffect } from "react";
import "./About.scss";
import { useLingui } from "@lingui/react";

const API_BASE = "/api/v1";

const About = () => {
  const { i18n } = useLingui();
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const res = await fetch(`${API_BASE}/about`);
        if (res.ok) {
          const data = await res.json();
          setAboutData(data);
        }
      } catch (err) {
        console.error("Failed to fetch about section", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAbout();
  }, []);

  if (loading) return null; // Or a skeleton loader
  if (!aboutData) return null;

  // Get text for current language, fallback to 'en'
  const currentLang = i18n.locale || "en";
  const textContent = aboutData.text[currentLang] || aboutData.text["en"] || "";
  
  // Split by blank lines to create paragraphs
  const paragraphs = textContent.split(/\n\s*\n/).filter(p => p.trim() !== "");

  return (
    <div className="aboutme-home" id="about">
      <div className="title-container">
        <h2>
          <span className="hashTag">#</span>about-me
        </h2>
        <div className="space-line"></div>
      </div>
      
      <div className={`sector about--${aboutData.layout}`}>
        <div className="aboutme">
          {paragraphs.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>
        
        {aboutData.image_url && (
          <div className="about-image-wrapper">
            <img src={aboutData.image_url} alt="About me" className="about-image" />
          </div>
        )}
      </div>
    </div>
  );
};

export default About;
