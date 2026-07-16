const offers = [
  "🎉 First Order? Get Flat 10% OFF with Code WELCOME10",
  "🚚 Free Shipping Above ₹999",
  "💳 Secure Online Payment & COD Available",
  "🎁 Buy Combo & Save More",
  "🌸 Fresh Flowers Delivered Across India",
];

export default function OfferBar() {
  return (
    <div className="offer-bar">
      <div className="offer-track">
        {[...offers, ...offers].map((offer, index) => (
          <span key={index} className="offer-item">
            {offer}
          </span>
        ))}
      </div>
    </div>
  );
}