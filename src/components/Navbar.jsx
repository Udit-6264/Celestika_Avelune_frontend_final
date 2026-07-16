import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

import {
  FiShoppingCart,
  FiUser,
  FiPackage,
  FiLogOut,
  FiSearch,
  FiMenu,
  FiX,
} from "react-icons/fi";

import { MdAdminPanelSettings } from "react-icons/md";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();

  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [show, setShow] = useState(false);

  const [mobileSearch, setMobileSearch] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (search.trim() === "") {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get(
          `/products/search?q=${search}`
        );

        setResults(data);
      } catch (err) {
        console.log(err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Lock body scroll while the mobile menu or full-screen search is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen || mobileSearch ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen, mobileSearch]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMobileMenu();
    navigate("/");
  };

  return (
    <nav className="navbar">

      {/* Hamburger — mobile only */}
      <button
        className="hamburger-btn"
        onClick={() => setMobileMenuOpen(true)}
        aria-label="Open menu"
      >
        <FiMenu size={24} />
      </button>

      {/* Logo */}

      <Link to="/" className="logo">
        🌸 Celestika Avelune
      </Link>

      {/* Navigation — desktop only */}

      <div className="nav-links">
        <Link to="/">Home</Link>

        <Link to="/products?category=flowers">
          Flowers
        </Link>

        <Link to="/products?category=women-clothing">
          Women
        </Link>

        <Link to="/products?category=girls-clothing">
          Girls
        </Link>

        <Link to="/about">
          About
        </Link>

        <Link to="/contact">
          Contact
        </Link>
      </div>      {/* ================= Desktop Search ================= */}

      <div className="desktop-search">

        <div className="search-container">

          <div className="search-box">

            <input
              type="text"
              placeholder="Search flowers, gifts..."
              value={search}
              onFocus={() => setShow(true)}
              onChange={(e) => setSearch(e.target.value)}
            />

            <FiSearch size={18} />

          </div>

          {show && search && (

            <div className="search-dropdown">

              {results.length === 0 ? (

                <div className="search-empty">
                  No Products Found
                </div>

              ) : (

                results.map((item) => (

                  <Link
                    key={item._id}
                    to={`/product/${item._id}`}
                    className="search-item"
                    onClick={() => {
                      setSearch("");
                      setShow(false);
                    }}
                  >

                    <img
                      src={item.images?.[0]}
                      alt={item.name}
                    />

                    <div className="search-details">

                      <h4>{item.name}</h4>

                      <p>
                        ₹{item.discountPrice || item.price}
                      </p>

                    </div>

                  </Link>

                ))

              )}

            </div>

          )}

        </div>

      </div>

      {/* ================= Mobile Search Icon ================= */}

      <div
        className="mobile-search-icon"
        onClick={() => setMobileSearch(true)}
      >

        <FiSearch size={22} />

      </div>

      {/* ================= Mobile Full-Screen Search ================= */}

      {mobileSearch && (

        <div className="mobile-search-overlay">

          <div className="mobile-search-overlay-header">
            <div className="search-box">
              <input
                autoFocus
                type="text"
                placeholder="Search flowers, gifts..."
                value={search}
                onFocus={() => setShow(true)}
                onChange={(e) => setSearch(e.target.value)}
              />
              <FiSearch size={18} />
            </div>
            <button
              className="mobile-search-close"
              onClick={() => {
                setMobileSearch(false);
                setSearch("");
                setShow(false);
              }}
              aria-label="Close search"
            >
              <FiX size={24} />
            </button>
          </div>

          <div className="mobile-search-overlay-results">
            {search && results.length === 0 && (
              <div className="search-empty">No Products Found</div>
            )}

            {results.map((item) => (
              <Link
                key={item._id}
                to={`/product/${item._id}`}
                className="search-item"
                onClick={() => {
                  setSearch("");
                  setShow(false);
                  setMobileSearch(false);
                }}
              >
                <img src={item.images?.[0]} alt={item.name} />
                <div className="search-details">
                  <h4>{item.name}</h4>
                  <p>₹{item.discountPrice || item.price}</p>
                </div>
              </Link>
            ))}
          </div>

        </div>

      )}

      {/* ================= Actions ================= */}

      <div className="nav-actions">

        {/* Cart — always visible */}

        <Link
          to="/cart"
          className="icon-btn cart-link"
        >

          <FiShoppingCart size={22} />

          {cartItems.length > 0 && (
            <span className="badge">
              {cartItems.length}
            </span>
          )}

        </Link>

        {/* Orders / Profile / Admin / Logout — desktop only, moved into hamburger menu on mobile */}
        <div className="desktop-account-actions">
          {user ? (
            <>
              <Link
                to="/orders"
                className="icon-btn"
                title="Orders"
              >
                <FiPackage size={22} />
              </Link>

              <Link
                to="/profile"
                className="icon-btn"
                title={user.name}
              >
                <FiUser size={22} />
              </Link>

              {user.role === "admin" && (
                <Link
                  to="/admin"
                  className="icon-btn"
                  title="Admin"
                >
                  <MdAdminPanelSettings size={24} />
                </Link>
              )}

              <button
                className="icon-btn logout-btn"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
              >
                <FiLogOut size={22} />
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="icon-btn"
              title="Login"
            >
              <FiUser size={22} />
            </Link>
          )}
        </div>

      </div>

      {/* ================= Mobile Slide-in Menu ================= */}

      {mobileMenuOpen && (
        <>
          <div className="mobile-menu-backdrop" onClick={closeMobileMenu} />
          <div className="mobile-menu-drawer">
            <div className="mobile-menu-header">
              <span className="logo">🌸 Celestika Avelune</span>
              <button
                className="mobile-menu-close"
                onClick={closeMobileMenu}
                aria-label="Close menu"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="mobile-menu-links">
              <Link to="/" onClick={closeMobileMenu}>Home</Link>
              <Link to="/products?category=flowers" onClick={closeMobileMenu}>Flowers</Link>
              <Link to="/products?category=women-clothing" onClick={closeMobileMenu}>Women</Link>
              <Link to="/products?category=girls-clothing" onClick={closeMobileMenu}>Girls</Link>
              <Link to="/about" onClick={closeMobileMenu}>About</Link>
              <Link to="/contact" onClick={closeMobileMenu}>Contact</Link>
            </div>

            <div className="mobile-menu-divider" />

            <div className="mobile-menu-links">
              {user ? (
                <>
                  <Link to="/profile" onClick={closeMobileMenu}>
                    <FiUser size={18} /> My Profile
                  </Link>
                  <Link to="/orders" onClick={closeMobileMenu}>
                    <FiPackage size={18} /> My Orders
                  </Link>
                  {user.role === "admin" && (
                    <Link to="/admin" onClick={closeMobileMenu}>
                      <MdAdminPanelSettings size={19} /> Admin Panel
                    </Link>
                  )}
                  <button className="mobile-menu-logout" onClick={handleLogout}>
                    <FiLogOut size={18} /> Logout
                  </button>
                </>
              ) : (
                <Link to="/auth" onClick={closeMobileMenu}>
                  <FiUser size={18} /> Login / Sign Up
                </Link>
              )}
            </div>
          </div>
        </>
      )}

    </nav>
  );
};

export default Navbar;