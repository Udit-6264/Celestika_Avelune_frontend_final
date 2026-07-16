import { useEffect, useState } from "react";
import api from "../api/axios";

const AdminPincodes = () => {
  const [pins, setPins] = useState([]);

  const [form, setForm] = useState({
    pincode: "",
    city: "",
    state: "",
    estimatedDays: 3,
  });

  // ---------- Bulk add by location ----------
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [locationPincodes, setLocationPincodes] = useState([]); // [{pincode, alreadyAdded}]
  const [selectedPincodes, setSelectedPincodes] = useState(new Set());
  const [bulkDays, setBulkDays] = useState(3);
  const [loadingPincodes, setLoadingPincodes] = useState(false);
  const [bulkMsg, setBulkMsg] = useState("");

  const loadPins = async () => {
    const res = await api.get("/pincodes");
    setPins(res.data);
  };

  useEffect(() => {
    loadPins();
    api.get("/pincodes/lookup/states").then((res) => setStates(res.data));
  }, []);

  const handleStateChange = async (state) => {
    setSelectedState(state);
    setSelectedCity("");
    setLocationPincodes([]);
    setSelectedPincodes(new Set());
    setCities([]);
    setBulkMsg("");
    if (state) {
      const res = await api.get(`/pincodes/lookup/cities?state=${encodeURIComponent(state)}`);
      setCities(res.data);
    }
  };

  const handleCityChange = async (city) => {
    setSelectedCity(city);
    setSelectedPincodes(new Set());
    setBulkMsg("");
    if (city) {
      setLoadingPincodes(true);
      const res = await api.get(
        `/pincodes/lookup/pincodes?state=${encodeURIComponent(selectedState)}&city=${encodeURIComponent(city)}`
      );
      setLocationPincodes(res.data);
      setLoadingPincodes(false);
    } else {
      setLocationPincodes([]);
    }
  };

  const togglePincodeSelection = (pincode) => {
    setSelectedPincodes((prev) => {
      const next = new Set(prev);
      if (next.has(pincode)) next.delete(pincode);
      else next.add(pincode);
      return next;
    });
  };

  const availableToSelect = locationPincodes.filter((p) => !p.alreadyAdded).map((p) => p.pincode);
  const allSelected = availableToSelect.length > 0 && availableToSelect.every((p) => selectedPincodes.has(p));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedPincodes(new Set());
    } else {
      setSelectedPincodes(new Set(availableToSelect));
    }
  };

  const handleBulkAdd = async () => {
    if (selectedPincodes.size === 0) return;
    setBulkMsg("");
    try {
      const { data } = await api.post("/pincodes/bulk", {
        pincodes: Array.from(selectedPincodes),
        city: selectedCity,
        state: selectedState,
        estimatedDays: Number(bulkDays),
      });
      setBulkMsg(data.message);
      setSelectedPincodes(new Set());
      // refresh the alreadyAdded flags + main table
      handleCityChange(selectedCity);
      loadPins();
    } catch (err) {
      setBulkMsg(err.response?.data?.message || "Could not add pincodes");
    }
  };

  // ---------- Manual single add (unchanged) ----------
  const submitHandler = async (e) => {
    e.preventDefault();

    await api.post("/pincodes", form);

    setForm({
      pincode: "",
      city: "",
      state: "",
      estimatedDays: 3,
    });

    loadPins();
  };

  const deletePin = async (id) => {
    if (!window.confirm("Delete this pincode?")) return;

    await api.delete(`/pincodes/${id}`);

    loadPins();
  };

  const togglePin = async (id) => {
    await api.put(`/pincodes/${id}`);

    loadPins();
  };

  return (
    <div className="admin-page">

      <h2>Serviceable Pincodes</h2>

      {/* ============ Bulk Add by Location ============ */}
      <div className="bulk-pincode-section">
        <h3>Bulk Add by Location</h3>
        <p className="bulk-pincode-hint">
          Select a State and City to see all its pincodes, then choose which ones to make serviceable.
        </p>

        <div className="bulk-pincode-filters">
          <select value={selectedState} onChange={(e) => handleStateChange(e.target.value)}>
            <option value="">Select State</option>
            {states.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            value={selectedCity}
            onChange={(e) => handleCityChange(e.target.value)}
            disabled={!selectedState}
          >
            <option value="">Select City / District</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <input
            type="number"
            min="1"
            placeholder="Delivery Days"
            value={bulkDays}
            onChange={(e) => setBulkDays(e.target.value)}
          />
        </div>

        {loadingPincodes && <p>Loading pincodes...</p>}

        {!loadingPincodes && locationPincodes.length > 0 && (
          <>
            <div className="bulk-pincode-toolbar">
              <button type="button" onClick={toggleSelectAll}>
                {allSelected ? "Deselect All" : "Select All"}
              </button>
              <span>{selectedPincodes.size} selected</span>
            </div>

            <div className="bulk-pincode-grid">
              {locationPincodes.map(({ postOffice, pincode, alreadyAdded }) => (
                <label
                  key={`${postOffice}-${pincode}`}
                  className={alreadyAdded ? "bulk-pincode-chip disabled" : "bulk-pincode-chip"}
                  title={postOffice}
                >
                  <input
                    type="checkbox"
                    disabled={alreadyAdded}
                    checked={selectedPincodes.has(pincode)}
                    onChange={() => togglePincodeSelection(pincode)}
                  />
                  <span className="bulk-pincode-label">
                    <span className="bulk-pincode-post-office">{postOffice}</span>
                    <span className="bulk-pincode-number">{pincode}</span>
                  </span>
                  {alreadyAdded && <span className="already-added-tag">Added</span>}
                </label>
              ))}
            </div>

            <button
              type="button"
              className="bulk-add-btn"
              onClick={handleBulkAdd}
              disabled={selectedPincodes.size === 0}
            >
              Add Selected ({selectedPincodes.size})
            </button>
          </>
        )}

        {!loadingPincodes && selectedCity && locationPincodes.length === 0 && (
          <p className="empty-note">No pincodes found for this city in the dataset.</p>
        )}

        {bulkMsg && <p className="success-text">{bulkMsg}</p>}
      </div>

      {/* ============ Manual single add ============ */}
      <h3 style={{ marginTop: "30px" }}>Add Single Pincode</h3>
      <form className="pin-form" onSubmit={submitHandler}>

        <input
          placeholder="Pincode"
          value={form.pincode}
          onChange={(e) =>
            setForm({ ...form, pincode: e.target.value })
          }
        />

        <input
          placeholder="City"
          value={form.city}
          onChange={(e) =>
            setForm({ ...form, city: e.target.value })
          }
        />

        <input
          placeholder="State"
          value={form.state}
          onChange={(e) =>
            setForm({ ...form, state: e.target.value })
          }
        />

        <input
          type="number"
          placeholder="Days"
          value={form.estimatedDays}
          onChange={(e) =>
            setForm({
              ...form,
              estimatedDays: e.target.value,
            })
          }
        />

        <button>Add</button>

      </form>

      <table className="admin-table">

        <thead>

          <tr>

            <th>Pincode</th>
            <th>City</th>
            <th>State</th>
            <th>Delivery Days</th>
            <th>Status</th>
            <th>Action</th>

          </tr>

        </thead>

        <tbody>

          {pins.map((pin) => (

            <tr key={pin._id}>

              <td>{pin.pincode}</td>

              <td>{pin.city}</td>

              <td>{pin.state}</td>

              <td>{pin.estimatedDays}</td>

              <td>

                <button
                  onClick={() => togglePin(pin._id)}
                >
                  {pin.active ? "Active" : "Disabled"}
                </button>

              </td>

              <td>

                <button
                  onClick={() => deletePin(pin._id)}
                >
                  Delete
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
};

export default AdminPincodes;