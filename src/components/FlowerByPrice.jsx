import React from 'react';
import { useNavigate } from 'react-router-dom';
import './FlowerByPrice.css';

const priceCategories = [
  {
    id: 1,
    label: 'Under 599',
    displayText: 'Under',
    amount: '599',
    type: 'under',
    params: { max_price: 599 }
  },
  {
    id: 2,
    label: 'Under 999',
    displayText: 'Under',
    amount: '999',
    type: 'under',
    params: { max_price: 999 }
  },
  {
    id: 3,
    label: 'Under 1999',
    displayText: 'Under',
    amount: '1999',
    type: 'under',
    params: { max_price: 1999 }
  },
  {
    id: 4,
    label: 'Above Rs. 2000',
    displayText: 'Above',
    amount: '2000',
    type: 'above',
    params: { min_price: 2000 }
  }
];

const FlowerByPrice = () => {
  const navigate = useNavigate();

  const handleCardClick = (item) => {
    // URL params banao
    const queryParams = new URLSearchParams();

    if (item.params.max_price) {
      queryParams.set('max_price', item.params.max_price);
    }
    if (item.params.min_price) {
      queryParams.set('min_price', item.params.min_price);
    }
    queryParams.set('category', 'flowers');
    queryParams.set('title', item.label);

    // Products page par navigate karo with filters
    navigate(`/products?${queryParams.toString()}`);
  };

  return (
    <section className="flower-by-price">
      <h2 className="section-title">Flower Bouquet By Price</h2>

      <div className="price-cards-container">
        {priceCategories.map((item) => (
          <div
            key={item.id}
            className="price-card-wrapper"
            onClick={() => handleCardClick(item)}
          >
            <div className="arch-card">
              {/* Sparkles */}
              <div className="sparkles">
                <span className="sparkle top-left">✦</span>
                <span className="sparkle top-right">✦</span>
                <span className="sparkle bottom-left">✦</span>
                <span className="sparkle bottom-right">✦</span>
              </div>

              {/* Price Content */}
              <div className="price-content">
                <span className="under-text">{item.displayText}</span>
                <div className="amount-wrapper">
                  <span className="rupee-symbol">₹</span>
                  <span className="price-number">{item.amount}</span>
                </div>
              </div>
            </div>

            {/* Label */}
            <p className="card-label">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FlowerByPrice;