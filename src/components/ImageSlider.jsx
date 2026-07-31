import { Link } from "react-router-dom";

import flowerBanner from "../assets/slider/new2.jpg";

const ImageSlider = () => {
  return (
    <section className="slider">
      <Link
        to="/products?category=flowers"
        className="slide active"
        style={{
          backgroundImage: `url(${flowerBanner})`,
        }}
      />
    </section>
  );
};

export default ImageSlider;