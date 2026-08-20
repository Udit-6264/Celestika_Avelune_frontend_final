import { Link } from "react-router-dom";

import birthday from "../assets/occasion/s2.jpg";
import anniversary from "../assets/occasion/s3.jpg";
import wedding from "../assets/occasion/s4.jpg";
import valentine from "../assets/occasion/s1.jpg";
import Rakhi from "../assets/occasion/Rakhi.jpeg";
import spiderman from "../assets/occasion/spidermen.jpg";
const occasions = [
  {
    title: "Rakhi",
    image: Rakhi,
    subCategory: "Rakhi",
  },
  {
    title: "Spider Man Bouquet",
    image: spiderman,
    subCategory: "Spiderman Bouquet",
  },
  {
    title: "Birthday Bouquet",
    image: birthday,
    subCategory: "Birthday Bouquet",
  },
  {
    title: "Anniversary Bouquet",
    image: anniversary,
    subCategory: "Anniversary Bouquet",
  },
  {
    title: "Wedding Bouquet",
    image: wedding,
    subCategory: "Wedding Bouquet",
  },
  {
    title: "Valentine's Day",
    image: valentine,
    subCategory: "Valentine Bouquet",
  },

];

export default function FlowerOccasion() {
  return (
    <section className="occasion-section">

      <h2 className="occasion-title">
        Shop By Occasion
      </h2>

      <div className="occasion-grid">

        {occasions.map((item) => (

          <Link
            key={item.title}
            className="occasion-card"
            to={`/products?category=flowers&subcategory=${encodeURIComponent(
              item.subCategory
            )}`}
          >

            <img
              src={item.image}
              alt={item.title}
            />

            <div className="occasion-overlay">
              <h3>{item.title}</h3>
            </div>

          </Link>

        ))}

      </div>

    </section>
  );
}