import React, { useState, useEffect, useRef } from "react";
import logos from "../../../../Content/logos.json";

const Carousel = () => {
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef();
  const carouselRef = useRef();

  const startCarousel = () => {
    intervalRef.current = setInterval(() => {
      if (carouselRef.current) {
        carouselRef.current.scrollBy({ left: carouselRef.current.offsetWidth, behavior: "smooth" });
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
      ref={carouselRef}
      onMouseEnter={() => { setIsPaused(true); clearInterval(intervalRef.current); }}
      onMouseLeave={() => { setIsPaused(false); startCarousel(); }}
      className="w-full h-[200px] overflow-hidden relative mt-20"
    >
      <div className="flex transition-transform duration-1000 will-change-transform">
        {[...logos, ...logos].map((logo, index) => (
          <img
            key={index}
            src={logo.image}
            alt={logo.name}
            className="h-[5.7rem] object-contain cursor-pointer opacity-100 flex-shrink-0 mr-20 last:mr-0"
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
