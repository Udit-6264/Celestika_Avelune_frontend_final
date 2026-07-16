import { useEffect, useState, useMemo } from "react";
import api from "../api/axios.js";
import "./Dashboard.css"; // CSS फाइल को इम्पोर्ट करना न भूलें

// ✅ Helper: group paid orders into the last 6 months and sum revenue
const buildMonthlyRevenue = (orders) => {
  const months = [];
  const now = new Date();

  // Build last 6 month buckets (oldest -> newest)
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleString("en-IN", { month: "short" }),
      revenue: 0,
    });
  }

  orders.forEach((o) => {
    if (!o.isPaid) return;
    const dateStr = o.createdAt || o.paidAt || o.date;
    if (!dateStr) return;

    const d = new Date(dateStr);
    const key = `${d.getFullYear()}-${d.getMonth()}`;

    const bucket = months.find((m) => m.key === key);
    if (bucket) bucket.revenue += o.totalPrice || 0;
  });

  return months;
};

// ✅ Simple, dependency-free SVG bar chart
const RevenueChart = ({ data }) => {
  const width = 700;
  const height = 260;
  const padding = { top: 20, right: 20, bottom: 40, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  const barWidth = chartWidth / data.length - 24;

  const [hovered, setHovered] = useState(null);

  const formatINR = (val) =>
    "₹" + val.toLocaleString("en-IN", { maximumFractionDigits: 0 });

  // ✅ Y-axis grid lines (4 steps)
  const gridSteps = 4;
  const gridValues = Array.from({ length: gridSteps + 1 }, (_, i) =>
    Math.round((maxRevenue / gridSteps) * i)
  );

  return (
    <div className="revenue-chart-wrapper">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        style={{ maxWidth: "100%", height: "auto" }}
      >
        {/* Grid lines + Y labels */}
        {gridValues.map((val, i) => {
          const y =
            padding.top + chartHeight - (val / maxRevenue) * chartHeight;
          return (
            <g key={i}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
                stroke="#eee"
                strokeWidth="1"
              />
              <text
                x={padding.left - 10}
                y={y + 4}
                textAnchor="end"
                fontSize="11"
                fill="#999"
              >
                {val >= 1000 ? `${Math.round(val / 1000)}k` : val}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const barHeight =
            maxRevenue > 0 ? (d.revenue / maxRevenue) * chartHeight : 0;
          const x =
            padding.left + i * (chartWidth / data.length) + 12;
          const y = padding.top + chartHeight - barHeight;

          const isHovered = hovered === i;

          return (
            <g
              key={d.key}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer" }}
            >
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx="6"
                fill={isHovered ? "#d63384" : "#ec6bab"}
              />

              {/* Value label on hover */}
              {isHovered && (
                <text
                  x={x + barWidth / 2}
                  y={y - 8}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="600"
                  fill="#d63384"
                >
                  {formatINR(d.revenue)}
                </text>
              )}

              {/* Month label */}
              <text
                x={x + barWidth / 2}
                y={height - padding.bottom + 20}
                textAnchor="middle"
                fontSize="12"
                fill="#666"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, pending: 0 });
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: products }, { data: orders }] = await Promise.all([
          api.get("/products"),
          api.get("/orders/all"),
        ]);
        const revenue = orders.reduce((sum, o) => sum + (o.isPaid ? o.totalPrice : 0), 0);
        const pending = orders.filter((o) => !["Delivered", "Cancelled"].includes(o.orderStatus)).length;
        setStats({ products: products.length, orders: orders.length, revenue, pending });
        setAllOrders(orders);
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ✅ Compute monthly revenue only when orders change
  const monthlyRevenue = useMemo(() => buildMonthlyRevenue(allOrders), [allOrders]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Fetching insights...</p>
      </div>
    );
  }

  return (
    <div className="modern-dashboard">
      <div className="dashboard-header">
        <h2>Welcome Back, Admin 👋</h2>
        <p>Here's what's happening with Celestika Avelune today.</p>
      </div>

      <div className="stats-grid">
        {/* Card 1: Products */}
        <div className="stat-card modern-card-blue">
          <div className="card-icon">🛍️</div>
          <div className="card-info">
            <h4>Total Products</h4>
            <p className="card-value">{stats.products}</p>
          </div>
        </div>

        {/* Card 2: Orders */}
        <div className="stat-card modern-card-purple">
          <div className="card-icon">📦</div>
          <div className="card-info">
            <h4>Total Orders</h4>
            <p className="card-value">{stats.orders}</p>
          </div>
        </div>

        {/* Card 3: Revenue */}
        <div className="stat-card modern-card-pink">
          <div className="card-icon">💰</div>
          <div className="card-info">
            <h4>Total Revenue</h4>
            <p className="card-value">₹{stats.revenue.toLocaleString("en-IN")}</p>
          </div>
        </div>

        {/* Card 4: Pending */}
        <div className="stat-card modern-card-orange">
          <div className="card-icon">⏳</div>
          <div className="card-info">
            <h4>Pending Orders</h4>
            <p className="card-value">{stats.pending}</p>
          </div>
        </div>
      </div>

      {/* ✅ Revenue Chart */}
      <div className="revenue-chart-card">
        <h3 style={{ marginBottom: "4px" }}>Revenue — Last 6 Months</h3>
        <p style={{ color: "#999", fontSize: "13px", marginBottom: "16px" }}>
          Based on paid orders
        </p>
        <RevenueChart data={monthlyRevenue} />
      </div>
    </div>
  );
};

export default AdminDashboard;