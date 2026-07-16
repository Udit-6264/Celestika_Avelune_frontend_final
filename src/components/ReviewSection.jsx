import { useEffect, useState } from "react";
import api from "../api/axios";

import RatingBreakdown from "./RatingBreakdown";
import WriteReview from "./WriteReview";
import ReviewCard from "./ReviewCard";

const ReviewSection = ({ product }) => {
  const [reviews, setReviews] = useState([]);

  const loadReviews = async () => {
    try {
      const { data } = await api.get(`/reviews/${product._id}`);
      setReviews(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (product?._id) {
      loadReviews();
    }
  }, [product]);

  return (
    <div className="review-section">

      <RatingBreakdown reviews={reviews} />

      <WriteReview
        productId={product._id}
        onReviewAdded={loadReviews}
      />

      <div className="customer-reviews">

        <h2>
          Customer Reviews ({reviews.length})
        </h2>

        {reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          reviews
            .slice()
            .reverse()
            .map((review) => (
              <ReviewCard
                key={review._id}
                review={review}
              />
            ))
        )}

      </div>

    </div>
  );
};

export default ReviewSection;