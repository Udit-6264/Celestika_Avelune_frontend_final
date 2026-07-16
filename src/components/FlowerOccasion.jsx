import { Link } from "react-router-dom";

import birthday from "../assets/occasion/birthday.jpg";
import anniversary from "../assets/occasion/anniversary.jpg";
import wedding from "../assets/occasion/velantine.jpg";
import valentine from "../assets/occasion/wedding.jpg";

const occasions = [
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