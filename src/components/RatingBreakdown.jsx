const RatingBreakdown = ({ reviews = [] }) => {
  const totalReviews = reviews.length;

  const counts = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  reviews.forEach((review) => {
    counts[review.rating]++;
  });

  const average =
    totalReviews === 0
      ? 0
      : (
        reviews.reduce((sum, r) => sum + r.rating, 0) /
        totalReviews
      ).toFixed(1);

  return (
    <div className="rating-breakdown">

      <h3>Customer Ratings</h3>

      <div className="rating-summary">

        <h1>{average}</h1>

        <div className="rating-stars">
          {"★".repeat(Math.round(average))}
          {"☆".repeat(5 - Math.round(average))}
        </div>

        <p>{totalReviews} Reviews</p>

      </div>

      {[5, 4, 3, 2, 1].map((star) => {

        const percentage =
          totalReviews === 0
            ? 0
            : (counts[star] / totalReviews) * 100;

        return (

          <div className="rating-row" key={star}>

            <span>{star} ★</span>

            <div className="progress">

              <div
                className="progress-fill"
                style={{
                  width: `${percentage}%`,
                }}
              ></div>

            </div>

            <span>{counts[star]}</span>

          </div>

        );
      })}
    </div>
  );
};

export default RatingBreakdown;