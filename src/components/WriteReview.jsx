import { useState } from "react";
import api from "../api/axios";
import RatingStars from "./RatingStars";

const MAX_IMAGES = 4;

const WriteReview = ({ productId, onReviewAdded }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, MAX_IMAGES - images.length);
    if (files.length === 0) return;

    setImages((prev) => [...prev, ...files].slice(0, MAX_IMAGES));
    setPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))].slice(0, MAX_IMAGES));

    // allow re-selecting the same file again later
    e.target.value = "";
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const submitReview = async (e) => {
    e.preventDefault();

    if (!rating) {
      setMessage("Please select a rating.");
      return;
    }

    if (!comment.trim()) {
      setMessage("Please write your review.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("rating", rating);
      formData.append("comment", comment);
      images.forEach((img) => formData.append("images", img));

      await api.post(`/reviews/${productId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage("✅ Review submitted successfully.");

      setRating(0);
      setComment("");
      previews.forEach((url) => URL.revokeObjectURL(url));
      setImages([]);
      setPreviews([]);

      if (onReviewAdded) {
        onReviewAdded();
      }
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
        "Failed to submit review."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="write-review">

      <h3>Write a Review</h3>

      <form onSubmit={submitReview}>

        <label>Your Rating</label>

        <RatingStars
          editable={true}
          rating={rating}
          onRatingChange={setRating}
        />

        <label style={{ marginTop: "20px" }}>
          Your Review
        </label>

        <textarea
          rows="5"
          placeholder="Share your experience..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <label style={{ marginTop: "16px" }}>
          Add Photos (optional, up to {MAX_IMAGES})
        </label>

        <div className="review-image-upload">
          {previews.map((src, i) => (
            <div className="review-image-preview" key={i}>
              <img src={src} alt={`preview ${i + 1}`} />
              <button type="button" onClick={() => removeImage(i)} aria-label="Remove image">
                ×
              </button>
            </div>
          ))}

          {images.length < MAX_IMAGES && (
            <label className="review-image-add">
              +
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleImageChange}
                hidden
              />
            </label>
          )}
        </div>

        {message && (
          <p className="review-message">
            {message}
          </p>
        )}

        <button
          className="review-submit-btn"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Review"}
        </button>

      </form>

    </div>
  );
};

export default WriteReview;