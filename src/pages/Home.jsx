import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import girlsBanner from "../assets/girls-coming-soon.png";
import ImageSlider from "../components/ImageSlider.jsx";
import ProductCard from "../components/ProductCard.jsx";
import ComboSection from "../components/ComboSection.jsx";
import OfferBar from "../components/OfferBar";
import FlowerByPrice from '../components/FlowerByPrice';
import FlowerOccasion from "../components/FlowerOccasion";
//import ReelsSection from "../components / ReelsSection";
const Home = () => {
  const [flowers, setFlowers] = useState([]);
  const [rakhi, setRakhi] = useState([]);
  const [women, setWomen] = useState([]);
  const [girls, setGirls] = useState([]);

  useEffect(() => {
    api.get("/products?category=flowers")
      .then((res) => setFlowers(res.data.filter((p) => p.subCategory !== "Rakhi")));

    // Rakhi section: dono cases cover karo —
    // (1) Category="Flowers" + SubCategory="Rakhi"
    // (2) standalone Category="Rakhi"
    Promise.all([
      api.get("/products?category=flowers&subCategory=Rakhi"),
      api.get("/products?category=Rakhi"),
    ]).then(([res1, res2]) => {
      const combined = [...res1.data, ...res2.data];
      const unique = Array.from(
        new Map(combined.map((p) => [p._id, p])).values()
      );
      setRakhi(unique);
    });

    api.get("/products?category=women-clothing")
      .then((res) => setWomen(res.data.slice(0, 4)));

    api.get("/products?category=girls-clothing")
      .then((res) => setGirls(res.data.slice(0, 4)));
  }, []);

  return (
    <div>
      <ImageSlider />
      <OfferBar />

      {/* ✅ Flowers Collection */}
      <section className="home-section">
        <div className="section-header">
          <h2>🌸 Flowers Collection</h2>
          <Link to="/products?category=flowers">View All</Link>
        </div>
        <div className="product-grid">
          {flowers.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
          {flowers.length === 0 && (
            <p className="empty-note">
              No flowers added yet. Add some from the admin panel.
            </p>
          )}
        </div>
      </section>

      {/* ✅ Rakhi Collection */}
      <section className="home-section">
        <div className="section-header">
          <h2>🎊 Rakhi Collection</h2>
          <Link to="/products?category=flowers&subcategory=Rakhi">View All</Link>
        </div>
        <div className="product-grid">
          {rakhi.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
          {rakhi.length === 0 && (
            <p className="empty-note">
              No Rakhi products added yet. Add some from the admin panel.
            </p>
          )}
        </div>
      </section>

      {/* ✅ Flower By Price Section - Flowers ke NEECHE add kiya */}
      <FlowerByPrice />
      <FlowerOccasion />


      {/* ✅ Girls Fashion */}

      {/*  <section className="home-section">
        <div className="section-header">
          <h2>👧 Girls' Fashion</h2>
          {girls.length > 0 && (
            <Link to="/products?category=girls-clothing">View All</Link>
          )}
        </div>

        {girls.length > 0 ? (
          <div className="product-grid">
            {girls.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        ) : (
          <div className="coming-soon-banner">
            {   /*   <img src={ } alt="Girls Wear Coming Soon" /> 
    </div>
  )
}
      </section > */}



      {/*  < section className="home-section" >
        <div className="section-header">
          <h2>👗 Women's Fashion</h2>
          <Link to="/products?category=women-clothing">View All</Link>
        </div>
        <div className="product-grid">
          {women.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
          {women.length === 0 && (
            <p className="empty-note">No products added yet.</p>
          )}
        </div>
      </section > */}

      {/* ✅ Reels Section 
      <ReelsSection />
*/}
    </div >
  );
};

export default Home;