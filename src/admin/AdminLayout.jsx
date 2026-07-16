import { NavLink, Outlet } from "react-router-dom";

const AdminLayout = () => (
  <div className="admin-layout">
    <aside className="admin-sidebar">
      <h3>Admin Panel</h3>
      <NavLink to="/admin" end>Dashboard</NavLink>
      <NavLink to="/admin/products">Products</NavLink>
      <NavLink to="/admin/orders">Orders</NavLink>

      <NavLink to="/admin/pincodes">
        Pincodes</NavLink>
      <NavLink to="/admin/coupons">Coupons</NavLink>
      <NavLink to="/admin/settings">Settings</NavLink>
    </aside>
    <main className="admin-content">
      <Outlet />
    </main>
  </div >
);

export default AdminLayout;