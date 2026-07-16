import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useCart } from "../context/CartContext.jsx";
import ShareIcon from "../components/ShareIcon.jsx";
import ShareMenu from "../components/ShareMenu.jsx";
import ReviewSection from "../components/ReviewSection.jsx";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState("");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    api.get(`/products/${id}`).then((res) => {
      setProduct(res.data);
      setActiveImage(0);
    });
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  if (!product) return <p className="page-container">Loading...</p>;

  const images = product.images || [];
  const productUrl = window.location.href;
  const shareText = `Check out ${product.name} on Bloom & Belle`;

  const handleAddToCart = () => {
    addToCart(product, size || null, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const prevImage = () => setActiveImage((i) => (i === 0 ? images.length - 1 : i - 1));
  const nextImage = () => setActiveImage((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <div className="page-container">
      <div className="product-details">
        {/* Image gallery */}
        <div className="pd-gallery">
          {images.length > 1 && (
            <div className="pd-thumbs">
              {images.map((img, i) => (
                <button
                  key={i}
                  className={i === activeImage ? "pd-thumb active" : "pd-thumb"}
                  onClick={() => setActiveImage(i)}
                >
                  <img src={img} alt={`${product.name} ${i + 1}`} />
                </button>
              ))}
            </div>
          )}

          <div className="pd-main-image">
            {images.length > 1 && (
              <button className="pd-arrow pd-arrow-left" onClick={prevImage} aria-label="Previous image">
                ‹
              </button>
            )}
            <img src={images[activeImage]} alt={product.name} />
            {images.length > 1 && (
              <button className="pd-arrow pd-arrow-right" onClick={nextImage} aria-label="Next image">
                ›
              </button>
            )}
          </div>
        </div>

        <div className="pd-info">
          <div className="pd-title-row">
            <h2>{product.name}</h2>

            <div className="product-share-wrapper" ref={menuRef}>
              <button
                className="share-icon-btn share-icon-btn-lg"
                onClick={() => setMenuOpen((open) => !open)}
                title="Share this product"
                aria-label="Share this product"
              >
                <ShareIcon size={18} />
              </button>

              {menuOpen && (
                <ShareMenu
                  url={productUrl}
                  title={product.name}
                  text={shareText}
                  onClose={() => setMenuOpen(false)}
                />
              )}
            </div>
          </div>

          <p className="pd-desc">{product.description}</p>
          <div className="price-row">
            <span className="price">₹{product.discountPrice || product.price}</span>
            {product.discountPrice > 0 && <span className="old-price">₹{product.price}</span>}
          </div>

          {product.sizes && product.sizes.length > 0 && (
            <div className="size-select">
              <label>Size:</label>
              {product.sizes.map((s) => (
                <button
                  key={s}
                  className={size === s ? "size-btn active" : "size-btn"}
                  onClick={() => setSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="qty-select">
            <label>Quantity:</label>
            <div className="qty-stepper">
              <button
                type="button"
                className="qty-btn"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="qty-value">{qty}</span>
              <button
                type="button"
                className="qty-btn"
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                disabled={qty >= product.stock}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          <p className="stock-note">{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</p>

          <div className="pd-actions">
            <button onClick={handleAddToCart} disabled={product.stock === 0} className="btn-primary">
              {added ? "Added ✓" : "Add to Cart"}
            </button>
            <button
              onClick={() => {
                handleAddToCart();
                navigate("/cart");
              }}
              disabled={product.stock === 0}
              className="btn-secondary"
            >
              Buy Now
            </button>
          </div>

          {product.returnPolicy && (
            <div className="return-policy-card">
              {product.returnPolicy.isReturnable && (
                <div className="return-policy-item">
                  <span className="return-policy-icon">↩️</span>
                  <span>{product.returnPolicy.returnDays}-Day Return Available</span>
                </div>
              )}
              {product.returnPolicy.isExchangeable && (
                <div className="return-policy-item">
                  <span className="return-policy-icon">🔄</span>
                  <span>{product.returnPolicy.exchangeDays}-Day Exchange Available</span>
                </div>
              )}
              {!product.returnPolicy.isReturnable && !product.returnPolicy.isExchangeable && (
                <div className="return-policy-item no-return">
                  <span className="return-policy-icon">🚫</span>
                  <span>This item is not eligible for return or exchange</span>
                </div>
              )}
              {product.returnPolicy.note && (
                <p className="return-policy-note">{product.returnPolicy.note}</p>
              )}
            </div>
          )}
        </div>
      </div>

      <ReviewSection product={product} />
    </div>
  );
};

export default ProductDetails;