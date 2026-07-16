import { useState } from "react";
import RatingStars from "./RatingStars.jsx";

const ReviewCard = ({ review }) => {
  const [lightbox, setLightbox] = useState(null);

  return (
    <div className="review-card">

      <div className="review-header">

        <div className="review-user">

          <div className="review-avatar">
            {review.name?.charAt(0).toUpperCase()}
          </div>

          <div>

            <h4>{review.name}</h4>

            {review.verifiedPurchase && (
              <span className="verified-badge">
                ✔ Verified Purchase
              </span>
            )}

          </div>

        </div>

        <RatingStars
          rating={review.rating}
          size={20}
        />

      </div>

      <p className="review-comment">
        {review.comment}
      </p>

      {review.images && review.images.length > 0 && (
        <div className="review-images">
          {review.images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Review photo ${i + 1}`}
              onClick={() => setLightbox(img)}
            />
          ))}
        </div>
      )}

      <div className="review-footer">

        <span>
          {new Date(review.createdAt).toLocaleDateString()}
        </span>

        <button className="helpful-btn">
          👍 Helpful
        </button>

      </div>

      {lightbox && (
        <div className="review-lightbox" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="Review full view" />
        </div>
      )}

    </div>
  );
};

export default ReviewCard;