import { useEffect, useState } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import type { DistributionInventory } from "../types/Dashboard";

// TODO: Replace with API call to GET /api/inventory?center=current_user
const mockInventory: DistributionInventory[] = [
    {
        inventory_id: 1,
        donation_id: 5,
        food_type: "Rice",
        collected_quantity: 50,
        distributed_quantity: 30,
        available_quantity: 20,
        is_public: true,
        collection_date: "2026-02-24",
    },
    {
        inventory_id: 2,
        donation_id: 8,
        food_type: "Fresh Bread",
        collected_quantity: 40,
        distributed_quantity: 25,
        available_quantity: 15,
        is_public: true,
        collection_date: "2026-02-25",
    },
    {
        inventory_id: 3,
        donation_id: 12,
        food_type: "Canned Lentils",
        collected_quantity: 100,
        distributed_quantity: 60,
        available_quantity: 40,
        is_public: false,
        collection_date: "2026-02-22",
    },
    {
        inventory_id: 4,
        donation_id: 15,
        food_type: "Mixed Vegetables",
        collected_quantity: 25,
        distributed_quantity: 10,
        available_quantity: 15,
        is_public: true,
        collection_date: "2026-02-25",
    },
    {
        inventory_id: 5,
        donation_id: 18,
        food_type: "Pastries",
        collected_quantity: 30,
        distributed_quantity: 28,
        available_quantity: 2,
        is_public: false,
        collection_date: "2026-02-23",
    },
    {
        inventory_id: 6,
        donation_id: 21,
        food_type: "Coconut Milk",
        collected_quantity: 45,
        distributed_quantity: 15,
        available_quantity: 30,
        is_public: true,
        collection_date: "2026-02-24",
    },
];

export default function CenterDashboard() {
    const [loading, setLoading] = useState(true);
    const [inventory, setInventory] = useState<DistributionInventory[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editValues, setEditValues] = useState<{ distributed: number; available: number }>({
        distributed: 0,
        available: 0,
    });

    // TODO: Replace with API call to GET /api/inventory
    useEffect(() => {
        const timer = setTimeout(() => {
            setInventory(mockInventory);
            setLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const totalCollected = inventory.reduce((sum, item) => sum + item.collected_quantity, 0);
    const totalDistributed = inventory.reduce((sum, item) => sum + item.distributed_quantity, 0);
    const totalAvailable = inventory.reduce((sum, item) => sum + item.available_quantity, 0);

    const stats = [
        { label: "Total Collected", value: totalCollected, icon: "📥", accent: "#7DC542", unit: "items" },
        { label: "Distributed", value: totalDistributed, icon: "🤝", accent: "#66BB6A", unit: "items" },
        { label: "Available Now", value: totalAvailable, icon: "📦", accent: "#42A5F5", unit: "items" },
    ];

    // TODO: Replace with API call to PATCH /api/inventory/:id/visibility
    const handleToggleVisibility = (id: number) => {
        setInventory((prev) =>
            prev.map((item) =>
                item.inventory_id === id ? { ...item, is_public: !item.is_public } : item,
            ),
        );
    };

    const startEdit = (item: DistributionInventory) => {
        setEditingId(item.inventory_id);
        setEditValues({
            distributed: item.distributed_quantity,
            available: item.available_quantity,
        });
    };

    // TODO: Replace with API call to PATCH /api/inventory/:id
    const saveEdit = (id: number) => {
        setInventory((prev) =>
            prev.map((item) =>
                item.inventory_id === id
                    ? {
                        ...item,
                        distributed_quantity: editValues.distributed,
                        available_quantity: editValues.available,
                    }
                    : item,
            ),
        );
        setEditingId(null);
    };

    const cancelEdit = () => {
        setEditingId(null);
    };

    return (
        <DashboardLayout>
            <style>{`
				.center-stats-grid {
					display: grid;
					grid-template-columns: repeat(3, 1fr);
					gap: 20px;
					margin-bottom: 32px;
				}

				.center-stat-card {
					background: rgba(255,255,255,0.03);
					border: 1px solid rgba(125,197,66,0.12);
					border-radius: 12px;
					padding: 24px;
					transition: border-color 0.25s ease, transform 0.25s ease;
				}

				.center-stat-card:hover {
					border-color: rgba(125,197,66,0.3);
					transform: translateY(-2px);
				}

				.center-table-wrap {
					background: rgba(255,255,255,0.02);
					border: 1px solid rgba(125,197,66,0.1);
					border-radius: 12px;
					overflow: hidden;
				}

				.center-table {
					width: 100%;
					border-collapse: collapse;
					font-family: 'Nunito', sans-serif;
				}

				.center-table thead {
					background: rgba(125,197,66,0.06);
				}

				.center-table th {
					padding: 14px 18px;
					text-align: left;
					font-size: 0.75rem;
					font-weight: 700;
					color: rgba(240,235,225,0.5);
					text-transform: uppercase;
					letter-spacing: 0.06em;
					border-bottom: 1px solid rgba(125,197,66,0.08);
				}

				.center-table td {
					padding: 14px 18px;
					font-size: 0.85rem;
					color: #F0EBE1;
					border-bottom: 1px solid rgba(125,197,66,0.05);
					vertical-align: middle;
				}

				.center-table tbody tr {
					transition: background 0.2s ease;
				}

				.center-table tbody tr:hover {
					background: rgba(125,197,66,0.04);
				}

				.center-table tbody tr:last-child td {
					border-bottom: none;
				}

				/* Toggle switch */
				.toggle-switch {
					position: relative;
					display: inline-block;
					width: 44px;
					height: 24px;
				}

				.toggle-switch input {
					opacity: 0;
					width: 0;
					height: 0;
				}

				.toggle-slider {
					position: absolute;
					cursor: pointer;
					top: 0; left: 0; right: 0; bottom: 0;
					background: rgba(255,255,255,0.1);
					border-radius: 24px;
					transition: background 0.3s ease;
				}

				.toggle-slider::before {
					content: '';
					position: absolute;
					height: 18px;
					width: 18px;
					left: 3px;
					bottom: 3px;
					background: #F0EBE1;
					border-radius: 50%;
					transition: transform 0.3s ease;
				}

				.toggle-switch input:checked + .toggle-slider {
					background: #7DC542;
				}

				.toggle-switch input:checked + .toggle-slider::before {
					transform: translateX(20px);
				}

				/* Inline edit inputs */
				.center-edit-input {
					width: 70px;
					background: rgba(255,255,255,0.06);
					border: 1px solid rgba(125,197,66,0.3);
					border-radius: 6px;
					padding: 6px 8px;
					color: #F0EBE1;
					font-family: 'Nunito', sans-serif;
					font-size: 0.85rem;
					outline: none;
					transition: border-color 0.2s ease;
				}

				.center-edit-input:focus {
					border-color: #7DC542;
				}

				.center-action-btn {
					padding: 6px 14px;
					border-radius: 6px;
					font-family: 'Nunito', sans-serif;
					font-size: 0.75rem;
					font-weight: 700;
					cursor: pointer;
					border: none;
					transition: transform 0.15s ease, opacity 0.2s ease;
				}

				.center-action-btn:hover {
					transform: translateY(-1px);
				}

				.center-skeleton {
					background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 75%);
					background-size: 200% 100%;
					animation: center-shimmer 1.5s ease-in-out infinite;
					border-radius: 8px;
				}

				@keyframes center-shimmer {
					0% { background-position: 200% 0; }
					100% { background-position: -200% 0; }
				}

				/* ── Responsive table → card layout ── */
				.center-mobile-cards { display: none; }

				@media (max-width: 768px) {
					.center-stats-grid { grid-template-columns: 1fr; gap: 12px; }
					.center-table-wrap { display: none; }
					.center-mobile-cards { display: flex; flex-direction: column; gap: 12px; }
				}

				@media (min-width: 769px) and (max-width: 1024px) {
					.center-stats-grid { grid-template-columns: repeat(2, 1fr); }
				}

				.center-mobile-card {
					background: rgba(255,255,255,0.03);
					border: 1px solid rgba(125,197,66,0.1);
					border-radius: 12px;
					padding: 18px 20px;
				}

				.center-mobile-card-row {
					display: flex;
					justify-content: space-between;
					align-items: center;
					padding: 6px 0;
					font-family: 'Nunito', sans-serif;
					font-size: 0.82rem;
				}

				.center-mobile-card-label {
					color: rgba(240,235,225,0.5);
					font-weight: 600;
				}

				.center-mobile-card-value {
					color: #F0EBE1;
					font-weight: 700;
				}
			`}</style>

            {/* ── Loading Skeleton ── */}
            {loading && (
                <>
                    <div className="center-stats-grid">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="center-skeleton" style={{ height: "100px" }} />
                        ))}
                    </div>
                    <div className="center-skeleton" style={{ height: "320px" }} />
                </>
            )}

            {/* ── Stats Cards ── */}
            {!loading && (
                <>
                    <div className="center-stats-grid">
                        {stats.map(({ label, value, icon, accent, unit }) => (
                            <div key={label} className="center-stat-card">
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <span style={{ fontSize: "1.8rem" }}>{icon}</span>
                                    <div style={{ textAlign: "right" }}>
                                        <span
                                            style={{
                                                fontFamily: "'Roboto', sans-serif",
                                                fontSize: "2rem",
                                                fontWeight: 900,
                                                color: accent,
                                            }}
                                        >
                                            {value}
                                        </span>
                                        <span
                                            style={{
                                                fontFamily: "'Nunito', sans-serif",
                                                fontSize: "0.75rem",
                                                color: "rgba(240,235,225,0.4)",
                                                marginLeft: "4px",
                                            }}
                                        >
                                            {unit}
                                        </span>
                                    </div>
                                </div>
                                <div
                                    style={{
                                        marginTop: "8px",
                                        fontFamily: "'Nunito', sans-serif",
                                        fontSize: "0.82rem",
                                        fontWeight: 600,
                                        color: "rgba(240,235,225,0.5)",
                                        letterSpacing: "0.04em",
                                        textTransform: "uppercase",
                                    }}
                                >
                                    {label}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── Section Header ── */}
                    <h2
                        style={{
                            fontFamily: "'Roboto', sans-serif",
                            fontSize: "1.15rem",
                            fontWeight: 700,
                            color: "#F0EBE1",
                            marginBottom: "20px",
                        }}
                    >
                        Inventory Management
                    </h2>

                    {/* ── Desktop Table ── */}
                    <div className="center-table-wrap">
                        <table className="center-table">
                            <thead>
                                <tr>
                                    <th>Food Type</th>
                                    <th>Collected</th>
                                    <th>Distributed</th>
                                    <th>Available</th>
                                    <th>Visible</th>
                                    <th>Collected On</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventory.map((item) => (
                                    <tr key={item.inventory_id}>
                                        <td>
                                            <span style={{ fontWeight: 700 }}>{item.food_type}</span>
                                        </td>
                                        <td>{item.collected_quantity}</td>
                                        <td>
                                            {editingId === item.inventory_id ? (
                                                <input
                                                    type="number"
                                                    className="center-edit-input"
                                                    value={editValues.distributed}
                                                    onChange={(e) =>
                                                        setEditValues((prev) => ({
                                                            ...prev,
                                                            distributed: Number(e.target.value),
                                                        }))
                                                    }
                                                    min={0}
                                                    max={item.collected_quantity}
                                                />
                                            ) : (
                                                item.distributed_quantity
                                            )}
                                        </td>
                                        <td>
                                            {editingId === item.inventory_id ? (
                                                <input
                                                    type="number"
                                                    className="center-edit-input"
                                                    value={editValues.available}
                                                    onChange={(e) =>
                                                        setEditValues((prev) => ({
                                                            ...prev,
                                                            available: Number(e.target.value),
                                                        }))
                                                    }
                                                    min={0}
                                                    max={item.collected_quantity}
                                                />
                                            ) : (
                                                <span
                                                    style={{
                                                        color: item.available_quantity > 0 ? "#7DC542" : "#9E9E9E",
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    {item.available_quantity}
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <label className="toggle-switch">
                                                <input
                                                    type="checkbox"
                                                    checked={item.is_public}
                                                    onChange={() => handleToggleVisibility(item.inventory_id)}
                                                />
                                                <span className="toggle-slider" />
                                            </label>
                                        </td>
                                        <td style={{ color: "rgba(240,235,225,0.5)", fontSize: "0.82rem" }}>
                                            {item.collection_date}
                                        </td>
                                        <td>
                                            {editingId === item.inventory_id ? (
                                                <div style={{ display: "flex", gap: "6px" }}>
                                                    <button
                                                        type="button"
                                                        className="center-action-btn"
                                                        style={{ background: "#7DC542", color: "#0B1A08" }}
                                                        onClick={() => saveEdit(item.inventory_id)}
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="center-action-btn"
                                                        style={{
                                                            background: "rgba(255,255,255,0.08)",
                                                            color: "rgba(240,235,225,0.7)",
                                                        }}
                                                        onClick={cancelEdit}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="center-action-btn"
                                                    style={{
                                                        background: "rgba(125,197,66,0.12)",
                                                        color: "#7DC542",
                                                    }}
                                                    onClick={() => startEdit(item)}
                                                >
                                                    Edit
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* ── Mobile Cards (replaces table below 768px) ── */}
                    <div className="center-mobile-cards">
                        {inventory.map((item) => (
                            <div key={item.inventory_id} className="center-mobile-card">
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        marginBottom: "10px",
                                    }}
                                >
                                    <span
                                        style={{
                                            fontFamily: "'Roboto', sans-serif",
                                            fontSize: "1rem",
                                            fontWeight: 700,
                                            color: "#F0EBE1",
                                        }}
                                    >
                                        {item.food_type}
                                    </span>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={item.is_public}
                                            onChange={() => handleToggleVisibility(item.inventory_id)}
                                        />
                                        <span className="toggle-slider" />
                                    </label>
                                </div>
                                <div className="center-mobile-card-row">
                                    <span className="center-mobile-card-label">Collected</span>
                                    <span className="center-mobile-card-value">{item.collected_quantity}</span>
                                </div>
                                <div className="center-mobile-card-row">
                                    <span className="center-mobile-card-label">Distributed</span>
                                    <span className="center-mobile-card-value">{item.distributed_quantity}</span>
                                </div>
                                <div className="center-mobile-card-row">
                                    <span className="center-mobile-card-label">Available</span>
                                    <span
                                        className="center-mobile-card-value"
                                        style={{ color: item.available_quantity > 0 ? "#7DC542" : "#9E9E9E" }}
                                    >
                                        {item.available_quantity}
                                    </span>
                                </div>
                                <div className="center-mobile-card-row">
                                    <span className="center-mobile-card-label">Collected On</span>
                                    <span className="center-mobile-card-value" style={{ color: "rgba(240,235,225,0.5)" }}>
                                        {item.collection_date}
                                    </span>
                                </div>
                                <div style={{ marginTop: "10px" }}>
                                    <button
                                        type="button"
                                        className="center-action-btn"
                                        style={{
                                            background: "rgba(125,197,66,0.12)",
                                            color: "#7DC542",
                                            width: "100%",
                                            padding: "10px",
                                        }}
                                        onClick={() => startEdit(item)}
                                    >
                                        Edit Quantities
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </DashboardLayout>
    );
}
