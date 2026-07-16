import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import flowerBanner from "../assets/slider/ChatGPT Image Jul 14, 2026, 05_01_31 PM.png";
import womenBanner from "../assets/slider/ChatGPT Image Jul 14, 2026, 04_24_39 PM.png";
import girlsBanner from "../assets/slider/ChatGPT Image Jul 14, 2026, 04_53_51 PM.png";

const slides = [
  {
    image: flowerBanner,
    link: "/products?category=flowers",
  },
  {
    image: womenBanner,
    link: "/products?category=women-clothing",
  },
  {
    image: girlsBanner,
    link: "/products?category=girls-clothing",
  },
];

const ImageSlider = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="slider">

      {slides.map((slide, index) => (
        <Link
          key={index}
          to={slide.link}
          className={`slide ${current === index ? "active" : ""}`}
          style={{
            backgroundImage: `url(${slide.image})`,
          }}
        />
      ))}

      <div className="slider-dots">
        {slides.map((_, index) => (
          <span
            key={index}
            className={current === index ? "dot active-dot" : "dot"}
            onClick={() => setCurrent(index)}
          />
        ))}
      </div>

    </section>
  );
};

export default ImageSlider;