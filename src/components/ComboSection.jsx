import { Link } from "react-router-dom";

const combos = [
  {
    title: "Flower ",
    image:
      "https://imgcdn.floweraura.com/Flower-By-Combos_Flower-&-Cake-Combos_0.png?tr=w-289,h-290,dpr-1.5,q-70",
    link: "/products?combo=flower-cake",
  },
  {
    title: "Flower with Chocolates",
    image:
      "https://imgcdn.floweraura.com/Flower-By-Combos_Flower-&-Chocolate-Combos_0.png?tr=w-289,h-290,dpr-1.5,q-70",
    link: "/products?combo=flower-chocolates",
  },
  {
    title: "Flower with Teddy",
    image:
      "https://imgcdn.floweraura.com/Flower-By-Combos_Flowers-&-Teddy-Combos_0.png?tr=w-289,h-290,dpr-1.5,q-70",
    link: "/products?combo=flower-teddy",
  },
  {
    title: "All Flower Combos",
    image:
      "https://imgcdn.floweraura.com/Flower-By-Combos_All-Flower-Combos_0.png?tr=w-289,h-290,dpr-1.5,q-70",
    link: "/products?category=combos",
  },
];

const ComboSection = () => {
  return (
    <section className="combo-section">
      <div className="combo-header">
        <h2>Flower By Combos</h2>
        <p>Explore Special Combos</p>
      </div>

      <div className="combo-grid">
        {combos.map((combo) => (
          <Link
            key={combo.title}
            to={combo.link}
            className="combo-card"
          >
            <div className="combo-image">
              <img src={combo.image} alt={combo.title} />
            </div>

            <div className="combo-title">
              {combo.title}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default ComboSection;