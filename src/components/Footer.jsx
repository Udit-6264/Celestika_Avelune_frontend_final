import { Link } from "react-router-dom";
import { FaInstagram, FaFacebookF, FaWhatsapp, FaTwitter } from "react-icons/fa";
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";

const Footer = () => (
  <footer className="footer-v2">
    <div className="footer-v2-top">
      <div className="footer-v2-col footer-v2-brand">
        <h3>🌸 Celestika Avelune</h3>
        <p>Fresh flowers & fashion, delivered with love — for every moment that matters.</p>
        <div className="footer-v2-socials">
          <a href="https://www.instagram.com/celestika_avelune?igsh=NjQ3NWlweWF1c2ht" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <FaInstagram />
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <FaFacebookF />
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
            <FaWhatsapp />
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
            <FaTwitter />
          </a>
        </div>
      </div>

      <div className="footer-v2-col">
        <h4>Quick Links</h4>
        <Link to="/">Home</Link>
        <Link to="/about">About Us</Link>
        <Link to="/contact">Contact Us</Link>
        <Link to="/orders">Track Order</Link>
      </div>

      <div className="footer-v2-col">
        <h4>Shop</h4>
        <Link to="/products?category=flowers">Flowers</Link>
        <Link to="/products?category=women-clothing">Women's Fashion</Link>
        <Link to="/products?category=girls-clothing">Girls' Fashion</Link>
      </div>

      <div className="footer-v2-col">
        <h4>Get in Touch</h4>
        <p><FiMail />celestikaavelune@gmail.com</p>
        <p><FiPhone />8305962646</p>
        <p><FiMapPin /> Jabalpur, Madhya Pradesh, India</p>
      </div>
    </div>

    <div className="footer-v2-bottom">
      <p>© {new Date().getFullYear()} Celestika Avelune. All rights reserved.</p>
      <p className="footer-v2-credit">
        Designed &amp; Developed with ❤️ cdby <span>Udit Rawat</span>
      </p>
    </div>
  </footer>
);

export default Footer;