import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, size = null, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.product === product._id && i.size === size);
      if (existing) {
        return prev.map((i) =>
          i.product === product._id && i.size === size
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [
        ...prev,
        {
          product: product._id,
          name: product.name,
          image: product.images[0],
          price: product.discountPrice || product.price,
          size,
          quantity,
          codAvailable: product.codAvailable || false,
        },
      ];
    });
  };

  const removeFromCart = (productId, size) => {
    setCartItems((prev) => prev.filter((i) => !(i.product === productId && i.size === size)));
  };

  const updateQuantity = (productId, size, quantity) => {
    setCartItems((prev) =>
      prev.map((i) =>
        i.product === productId && i.size === size ? { ...i, quantity } : i
      )
    );
  };

  const clearCart = () => setCartItems([]);

  const itemsPrice = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, itemsPrice }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);