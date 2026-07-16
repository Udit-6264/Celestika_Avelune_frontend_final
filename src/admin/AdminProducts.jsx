import { useEffect, useState, useRef } from "react";
import api from "../api/axios.js";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  discountPrice: "",
  category: "flowers",
  subCategory: "",
  sizes: "",
  stock: "",
  isFeatured: false,
  codAvailable: false,
  isReturnable: true,
  returnDays: 7,
  isExchangeable: true,
  exchangeDays: 7,
  returnPolicyNote: "",
};

const subCategories = {
  flowers: [
    "Fresh Flower Bouquet",
    "Handmade Flower Bouquet",
    "Crochet Flower Bouquet",
    "Knitted Flower Bouquet",
    "Artificial Flower Bouquet",
    "Rose Bouquet",
    "Tulip Bouquet",
    "Lily Bouquet",
    "Mixed Flower Bouquet",
    "Luxury Bouquet",
    "Flower Basket",
    "Money Bouquet",
    "Chocolate Bouquet",
    "Gift Hamper",
    "Birthday Bouquet",
    "Anniversary Bouquet",
    "Wedding Bouquet",
    "Proposal Bouquet",
    "Valentine Bouquet",
    "Get Well Soon Bouquet",
    "Thank You Bouquet",
    "Baby Shower Bouquet"
  ],
  "women-clothing": [
    "Kurti",
    "Co-ord Set",
    "Suit Set",
    "Dress",
    "Top",
    "T-Shirt",
    "Shirt",
    "Jeans",
    "Palazzo",
    "Leggings",
    "Saree",
    "Lehenga",
    "Gown",
    "Dupatta",
    "Jacket",
    "Sweater"
  ],
  "girls-clothing": [
    "Frock",
    "Party Wear",
    "Dress",
    "Top",
    "T-Shirt",
    "Skirt",
    "Jeans",
    "Shorts",
    "Co-ord Set",
    "Night Suit",
    "Ethnic Wear",
    "Lehenga",
    "Kurti",
    "Winter Wear",
    "Jumpsuit"
  ]
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const loadProducts = () => api.get("/products").then((res) => setProducts(res.data));

  useEffect(() => {
    loadProducts();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setExistingImages([]);
    newImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setNewImages([]);
    setNewImagePreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(files);
    setNewImagePreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!editingId && newImages.length === 0) {
      setMsg("Please choose at least one product image");
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("price", form.price);
    formData.append("discountPrice", form.discountPrice || 0);
    formData.append("category", form.category);
    formData.append("subCategory", form.subCategory);
    formData.append("sizes", form.sizes);
    formData.append("stock", form.stock);
    formData.append("isFeatured", form.isFeatured);
    formData.append("codAvailable", form.codAvailable);
    formData.append("isReturnable", form.isReturnable);
    formData.append("returnDays", form.returnDays);
    formData.append("isExchangeable", form.isExchangeable);
    formData.append("exchangeDays", form.exchangeDays);
    formData.append("returnPolicyNote", form.returnPolicyNote);
    newImages.forEach((file) => formData.append("images", file));

    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setMsg("Product updated!");
      } else {
        await api.post("/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setMsg("Product added!");
      }
      resetForm();
      loadProducts();
    } catch (err) {
      setMsg(err.response?.data?.message || "Error saving product");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (p) => {
    setEditingId(p._id);
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      discountPrice: p.discountPrice || "",
      category: p.category,
      subCategory: p.subCategory || "",
      sizes: (p.sizes || []).join(", "),
      stock: p.stock,
      isFeatured: p.isFeatured,
      codAvailable: p.codAvailable || false,
      isReturnable: p.returnPolicy?.isReturnable ?? true,
      returnDays: p.returnPolicy?.returnDays ?? 7,
      isExchangeable: p.returnPolicy?.isExchangeable ?? true,
      exchangeDays: p.returnPolicy?.exchangeDays ?? 7,
      returnPolicyNote: p.returnPolicy?.note || "",
    });
    setExistingImages(p.images || []);
    newImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setNewImages([]);
    setNewImagePreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await api.delete(`/products/${id}`);
    loadProducts();
  };

  return (
    <div>
      <h2>Manage Products</h2>

      <form className="admin-form" onSubmit={handleSubmit}>
        <h3>{editingId ? "Edit Product" : "Add New Product"}</h3>
        {msg && <p className="success-text">{msg}</p>}
        <div className="form-grid">
          <input placeholder="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select
            value={form.category}
            onChange={(e) =>
              setForm({
                ...form,
                category: e.target.value,
                subCategory: "",
              })
            }
          >
            <option value="flowers">Flowers</option>
            <option value="women-clothing">Women's Clothing</option>
            <option value="girls-clothing">Girls' Clothing</option>
          </select>
          <select
            required
            value={form.subCategory}
            onChange={(e) =>
              setForm({
                ...form,
                subCategory: e.target.value,
              })
            }
          >
            <option value="">Select Sub Category</option>
            {subCategories[form.category]?.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <input type="number" placeholder="Price (₹)" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <input type="number" placeholder="Discount Price (optional)" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} />
          <input type="number" placeholder="Stock" required value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          <input placeholder="Sizes, comma separated (S, M, L)" value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} />
          <label className="checkbox-label">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
            Featured
          </label>
        </div>

        <div className="payment-mode-section">
          <label>Payment Mode:</label>
          <div className="payment-mode-options">
            <label className={!form.codAvailable ? "payment-mode-pill active" : "payment-mode-pill"}>
              <input
                type="radio"
                name="paymentMode"
                checked={!form.codAvailable}
                onChange={() => setForm({ ...form, codAvailable: false })}
              />
              Online Only
            </label>
            <label className={form.codAvailable ? "payment-mode-pill active" : "payment-mode-pill"}>
              <input
                type="radio"
                name="paymentMode"
                checked={form.codAvailable}
                onChange={() => setForm({ ...form, codAvailable: true })}
              />
              Online + Cash on Delivery
            </label>
          </div>
        </div>

        <div className="return-policy-section">
          <label>Return / Exchange Policy:</label>

          <div className="return-policy-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.isReturnable}
                onChange={(e) => setForm({ ...form, isReturnable: e.target.checked })}
              />
              Returnable
            </label>
            {form.isReturnable && (
              <input
                type="number"
                min="0"
                className="return-days-input"
                placeholder="Return days"
                value={form.returnDays}
                onChange={(e) => setForm({ ...form, returnDays: e.target.value })}
              />
            )}
          </div>

          <div className="return-policy-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.isExchangeable}
                onChange={(e) => setForm({ ...form, isExchangeable: e.target.checked })}
              />
              Exchangeable
            </label>
            {form.isExchangeable && (
              <input
                type="number"
                min="0"
                className="return-days-input"
                placeholder="Exchange days"
                value={form.exchangeDays}
                onChange={(e) => setForm({ ...form, exchangeDays: e.target.value })}
              />
            )}
          </div>

          <input
            placeholder="Policy note (optional, e.g. 'Item must be unused with tags')"
            value={form.returnPolicyNote}
            onChange={(e) => setForm({ ...form, returnPolicyNote: e.target.value })}
          />
        </div>

        <textarea placeholder="Description" required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

        <label className="upload-label">Upload Product Images:</label>

        {existingImages.length > 0 && (
          <div className="existing-images-row">
            {existingImages.map((img, i) => (
              <img key={i} src={img} alt={`Current ${i + 1}`} className="admin-thumb" />
            ))}
          </div>
        )}

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          ref={fileInputRef}
          onChange={handleImageSelect}
        />

        {newImagePreviews.length > 0 && (
          <div className="existing-images-row">
            {newImagePreviews.map((src, i) => (
              <img key={i} src={src} alt={`New ${i + 1}`} className="admin-thumb" />
            ))}
          </div>
        )}

        <div className="form-actions">
          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : editingId ? "Update Product" : "Add Product"}
          </button>
          {editingId && <button type="button" onClick={resetForm}>Cancel</button>}
        </div>
      </form>

      <h3>All Products ({products.length})</h3>
      <table className="admin-table">
        <thead>
          <tr>
            {/* ✅ Added: Product ID Column header */}
            <th>Product ID</th>
            <th>Image</th>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Payment</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id}>
              {/* ✅ Added: Product ID Data Cell */}
              <td style={{ fontSize: "12px", fontFamily: "monospace", color: "#64748b" }}>{p._id}</td>
              <td><img src={p.images && p.images[0]} alt={p.name} className="admin-thumb" /></td>
              <td>{p.name}</td>
              <td>{p.category}</td>
              <td>₹{p.discountPrice || p.price}</td>
              <td>{p.stock}</td>
              <td>{p.codAvailable ? "Online + COD" : "Online Only"}</td>
              <td>
                <button onClick={() => handleEdit(p)}>Edit</button>
                <button onClick={() => handleDelete(p._id)} className="danger-btn">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminProducts;