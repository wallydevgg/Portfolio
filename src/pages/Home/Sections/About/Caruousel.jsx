import React, { useState, useEffect, useRef } from "react";
import "./Carousel.scss";
import logos from "../../../../Content/logos.json";

const Carousel = () => {
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef();
  const carouselRef = useRef();

  const handleMouseEnter = () => {
    setIsPaused(true);
    clearInterval(intervalRef.current);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    startCarousel();
  };

  const startCarousel = () => {
    intervalRef.current = setInterval(() => {
      if (carouselRef.current) {
        carouselRef.current.scrollBy({
          left: carouselRef.current.offsetWidth,
          behavior: 'smooth'
        });

        if (carouselRef.current.scrollLeft + carouselRef.current.offsetWidth >= carouselRef.current.scrollWidth) {
          carouselRef.current.scrollLeft = 0;
        }
      }
    }, 1750);
  };

  useEffect(() => {
    startCarousel();
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div
      className="carousel"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={carouselRef}
    >
      <div className="carousel-images">
        {[...logos, ...logos].map((logo, index) => (
          <img
            key={index}
            src={logo.image}
            alt={logo.name}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
