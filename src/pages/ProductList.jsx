import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios.js";
import ProductCard from "../components/ProductCard.jsx";

const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category");
  const subCategory = searchParams.get("subcategory");
  const maxPrice = searchParams.get("max_price");
  const minPrice = searchParams.get("min_price");

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false); // ✅ Filter open/close

  const [selectedPrice, setSelectedPrice] = useState(
    maxPrice ? `max_${maxPrice}` : minPrice ? `min_${minPrice}` : "all"
  );

  const priceRanges = [
    { label: "All Prices", value: "all" },
    { label: "Under ₹599", value: "max_599" },
    { label: "Under ₹999", value: "max_999" },
    { label: "Under ₹1999", value: "max_1999" },
    { label: "Above ₹2000", value: "min_2000" },
  ];

  // Active filter ka label
  const activeLabel = priceRanges.find((r) => r.value === selectedPrice)?.label || "All Prices";

  useEffect(() => {
    setLoading(true);
    let query = "";

    if (category) {
      query += `?category=${category}`;
    }

    if (subCategory) {
      query += category
        ? `&subCategory=${encodeURIComponent(subCategory)}`
        : `?subCategory=${encodeURIComponent(subCategory)}`;
    }
    api.get(`/products${query}`).then((res) => {
      setProducts(res.data);
      setLoading(false);
    });
  }, [category]);

  useEffect(() => {
    let result = [...products];

    if (selectedPrice === "all") {
      setFilteredProducts(result);
      return;
    }

    const getActualPrice = (product) => {
      return product.discountPrice > 0
        ? product.discountPrice
        : product.price;
    };

    if (selectedPrice.startsWith("max_")) {
      const max = parseFloat(selectedPrice.split("_")[1]);
      result = result.filter((p) => getActualPrice(p) <= max);
    }

    if (selectedPrice.startsWith("min_")) {
      const min = parseFloat(selectedPrice.split("_")[1]);
      result = result.filter((p) => getActualPrice(p) >= min);
    }

    setFilteredProducts(result);
  }, [selectedPrice, products]);

  useEffect(() => {
    if (maxPrice) setSelectedPrice(`max_${maxPrice}`);
    else if (minPrice) setSelectedPrice(`min_${minPrice}`);
    else setSelectedPrice("all");
  }, [maxPrice, minPrice]);

  const handlePriceFilter = (value) => {
    setSelectedPrice(value);
    setFilterOpen(false); // ✅ Select karne ke baad band ho jaye

    const newParams = {};
    if (category) newParams.category = category;

    if (value === "all") {
      // price params nahi
    } else if (value.startsWith("max_")) {
      newParams.max_price = value.split("_")[1];
    } else if (value.startsWith("min_")) {
      newParams.min_price = value.split("_")[1];
    }

    setSearchParams(newParams);
  };

  const titles = {
    flowers: subCategory
      ? `🌸 ${subCategory}`
      : "🌸 Flowers",
    "women-clothing": "👗 Women's Fashion",
    "girls-clothing": "👧 Girls' Fashion",
  };

  return (
    <div className="page-container">

      {/* ===== Top Bar ===== */}
      <div className="product-list-topbar">
        <h2>{titles[category] || "All Products"}</h2>

        <div className="filter-right">
          <span className="product-count">
            {filteredProducts.length} Products
          </span>

          {/* ✅ Filter Dropdown Button */}
          <div className="filter-dropdown-wrapper">
            <button
              className={`filter-toggle-btn ${filterOpen ? "open" : ""}`}
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <span className="filter-icon">⚡</span>
              <span>Price: {activeLabel}</span>
              <span className={`arrow ${filterOpen ? "up" : "down"}`}>
                ▾
              </span>
            </button>

            {/* ✅ Dropdown Options */}
            {filterOpen && (
              <div className="filter-dropdown-menu">
                {priceRanges.map((range) => (
                  <button
                    key={range.value}
                    className={`filter-option-btn ${selectedPrice === range.value ? "active" : ""
                      }`}
                    onClick={() => handlePriceFilter(range.value)}
                  >
                    <span className="option-dot"></span>
                    {range.label}
                    {selectedPrice === range.value && (
                      <span className="option-check">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ✅ Clear Filter Badge */}
          {selectedPrice !== "all" && (
            <button
              className="active-filter-badge"
              onClick={() => handlePriceFilter("all")}
            >
              {activeLabel} ✕
            </button>
          )}
        </div>
      </div>

      {/* ===== Products Grid ===== */}
      <div className="products-section">
        {loading ? (
          <div className="loading-container">
            <p>Loading...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-container">
            <p className="empty-note">
              ❌ No products found in this price range.
            </p>
            <button
              className="show-all-btn"
              onClick={() => handlePriceFilter("all")}
            >
              Show All Products
            </button>
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;