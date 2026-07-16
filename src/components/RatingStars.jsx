import { useState } from "react";

const RatingStars = ({
  rating = 0,
  editable = false,
  onRatingChange,
  size = 28,
}) => {
  const [hover, setHover] = useState(0);

  return (
    <div
      style={{
        display: "flex",
        gap: "5px",
        alignItems: "center",
      }}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{
            cursor: editable ? "pointer" : "default",
            fontSize: size,
            color:
              (hover || rating) >= star ? "#FFD700" : "#d1d5db",
            transition: "0.2s",
            userSelect: "none",
          }}
          onMouseEnter={() => editable && setHover(star)}
          onMouseLeave={() => editable && setHover(0)}
          onClick={() => editable && onRatingChange(star)}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default RatingStars;