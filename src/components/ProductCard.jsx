import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  const price = product.discountPrice || product.price;
  const discountPercent =
    product.discountPrice > 0
      ? Math.round(
        ((product.price - product.discountPrice) / product.price) * 100
      )
      : 0;
  return (
    <Link to={`/product/${product._id}`} className="product-card">
      <div className="product-image">

        <img src={product.images[0]} alt={product.name} />

        {discountPercent > 0 && (
          <span className="discount-badge">
            {discountPercent}% OFF
          </span>
        )}

      </div>
      <div className="product-info">

        <h3>{product.name}</h3>

        <div className="product-bottom">

          <div className="price-row">
            <span className="price">₹{price}</span>

            {product.discountPrice > 0 && (
              <span className="old-price">₹{product.price}</span>
            )}
          </div>

          <div className="product-rating">
            {product.numReviews > 0 ? (
              <>
                <span className="rating-star">⭐</span>
                <span>{Number(product.rating || 0).toFixed(1)}</span>
                <span className="review-count">
                  ({product.numReviews})
                </span>
              </>
            ) : (
              <span className="review-count">No Reviews</span>
            )}
          </div>

        </div>

      </div>
    </Link>
  );
};

export default ProductCard;