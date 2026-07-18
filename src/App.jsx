import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";

import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute.jsx";

import Home from "./pages/Home.jsx";
import Auth from "./pages/Auth.jsx";
import ProductList from "./pages/ProductList.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import Profile from "./pages/Profile.jsx";
import Orders from "./pages/Orders.jsx";
import TrackOrder from "./pages/TrackOrder.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import OrderSuccess from "./pages/OrderSuccess.jsx";

import AdminLayout from "./admin/AdminLayout.jsx";
import AdminDashboard from "./admin/AdminDashboard.jsx";
import AdminProducts from "./admin/AdminProducts.jsx";
import AdminOrders from "./admin/AdminOrders.jsx";
import AdminOrderDetails from "./admin/AdminOrderDetails.jsx";
import AdminPincodes from "./admin/AdminPincodes.jsx";
import AdminSettings from "./admin/AdminSettings.jsx";
import AdminCoupons from "./admin/AdminCoupons.jsx";

function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <div className="app-body">
        <Routes>

          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<Cart />} />


          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/track-order/:id" element={<ProtectedRoute><TrackOrder /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/order-success/:id" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />

          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route path="/admin/orders/:id" element={<AdminOrderDetails />} />
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="pincodes" element={<AdminPincodes />} />
            <Route
              path="coupons"
              element={<AdminCoupons />}
            />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </div>
      <Footer />
    </>
  );
}

export default App;