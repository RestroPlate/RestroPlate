import { useEffect, useState } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import type { DistributionInventory } from "../types/Dashboard";

// TODO: Replace with API call to GET /api/inventory?center=current_user
const mockInventory: DistributionInventory[] = [
    { inventory_id: 1, donation_id: 5, food_type: "Rice", collected_quantity: 50, distributed_quantity: 30, available_quantity: 20, is_public: true, collection_date: "2026-02-24" },
    { inventory_id: 2, donation_id: 8, food_type: "Fresh Bread", collected_quantity: 40, distributed_quantity: 25, available_quantity: 15, is_public: true, collection_date: "2026-02-25" },
    { inventory_id: 3, donation_id: 12, food_type: "Canned Lentils", collected_quantity: 100, distributed_quantity: 60, available_quantity: 40, is_public: false, collection_date: "2026-02-22" },
    { inventory_id: 4, donation_id: 15, food_type: "Mixed Vegetables", collected_quantity: 25, distributed_quantity: 10, available_quantity: 15, is_public: true, collection_date: "2026-02-25" },
    { inventory_id: 5, donation_id: 18, food_type: "Pastries", collected_quantity: 30, distributed_quantity: 28, available_quantity: 2, is_public: false, collection_date: "2026-02-23" },
    { inventory_id: 6, donation_id: 21, food_type: "Coconut Milk", collected_quantity: 45, distributed_quantity: 15, available_quantity: 30, is_public: true, collection_date: "2026-02-24" },
];

export default function CenterDashboard() {
    const [loading, setLoading] = useState(true);
    const [inventory, setInventory] = useState<DistributionInventory[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editValues, setEditValues] = useState<{ distributed: number; available: number }>({ distributed: 0, available: 0 });

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

    const handleToggleVisibility = (id: number) => {
        setInventory((prev) =>
            prev.map((item) => item.inventory_id === id ? { ...item, is_public: !item.is_public } : item),
        );
    };

    const startEdit = (item: DistributionInventory) => {
        setEditingId(item.inventory_id);
        setEditValues({ distributed: item.distributed_quantity, available: item.available_quantity });
    };

    const saveEdit = (id: number) => {
        setInventory((prev) =>
            prev.map((item) =>
                item.inventory_id === id
                    ? { ...item, distributed_quantity: editValues.distributed, available_quantity: editValues.available }
                    : item,
            ),
        );
        setEditingId(null);
    };

    const cancelEdit = () => setEditingId(null);

    return (
        <DashboardLayout>
            {/* ── Loading Skeleton ── */}
            {loading && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="skeleton-shimmer h-[100px]" />
                        ))}
                    </div>
                    <div className="skeleton-shimmer h-[320px]" />
                </>
            )}

            {/* ── Stats + Content ── */}
            {!loading && (
                <>
                    {/* Stats grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                        {stats.map(({ label, value, icon, accent, unit }) => (
                            <div
                                key={label}
                                className="rounded-xl p-6 border border-[rgba(125,197,66,0.12)] transition-[border-color,transform] duration-[250ms] hover:border-[rgba(125,197,66,0.3)] hover:-translate-y-0.5"
                                style={{ background: "rgba(255,255,255,0.03)" }}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-[1.8rem]">{icon}</span>
                                    <div className="text-right">
                                        <span className="text-[2rem] font-black" style={{ color: accent }}>
                                            {value}
                                        </span>
                                        <span className="text-[0.75rem] text-[rgba(240,235,225,0.4)] ml-1">
                                            {unit}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-2 text-[0.82rem] font-semibold text-[rgba(240,235,225,0.5)] tracking-[0.04em] uppercase">
                                    {label}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Section header */}
                    <h2 className="text-[1.15rem] font-bold text-[#F0EBE1] mb-5">
                        Inventory Management
                    </h2>

                    {/* ── Desktop Table ── */}
                    <div className="hidden md:block rounded-xl overflow-hidden border border-[rgba(125,197,66,0.1)]"
                        style={{ background: "rgba(255,255,255,0.02)" }}>
                        <table className="w-full border-collapse">
                            <thead className="bg-[rgba(125,197,66,0.06)]">
                                <tr>
                                    {["Food Type", "Collected", "Distributed", "Available", "Visible", "Collected On", "Actions"].map((col) => (
                                        <th key={col} className="px-[18px] py-[14px] text-left text-[0.75rem] font-bold text-[rgba(240,235,225,0.5)] uppercase tracking-[0.06em] border-b border-[rgba(125,197,66,0.08)]">
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {inventory.map((item) => (
                                    <tr
                                        key={item.inventory_id}
                                        className="border-b border-[rgba(125,197,66,0.05)] last:border-b-0 transition-[background] duration-200 hover:bg-[rgba(125,197,66,0.04)]"
                                    >
                                        <td className="px-[18px] py-[14px] text-[0.85rem] text-[#F0EBE1] align-middle">
                                            <span className="font-bold">{item.food_type}</span>
                                        </td>
                                        <td className="px-[18px] py-[14px] text-[0.85rem] text-[#F0EBE1] align-middle">
                                            {item.collected_quantity}
                                        </td>
                                        <td className="px-[18px] py-[14px] text-[0.85rem] text-[#F0EBE1] align-middle">
                                            {editingId === item.inventory_id ? (
                                                <input
                                                    type="number"
                                                    className="center-edit-input"
                                                    value={editValues.distributed}
                                                    onChange={(e) => setEditValues((prev) => ({ ...prev, distributed: Number(e.target.value) }))}
                                                    min={0}
                                                    max={item.collected_quantity}
                                                />
                                            ) : item.distributed_quantity}
                                        </td>
                                        <td className="px-[18px] py-[14px] text-[0.85rem] text-[#F0EBE1] align-middle">
                                            {editingId === item.inventory_id ? (
                                                <input
                                                    type="number"
                                                    className="center-edit-input"
                                                    value={editValues.available}
                                                    onChange={(e) => setEditValues((prev) => ({ ...prev, available: Number(e.target.value) }))}
                                                    min={0}
                                                    max={item.collected_quantity}
                                                />
                                            ) : (
                                                <span className="font-bold" style={{ color: item.available_quantity > 0 ? "#7DC542" : "#9E9E9E" }}>
                                                    {item.available_quantity}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-[18px] py-[14px] align-middle">
                                            <label className="toggle-switch">
                                                <input
                                                    type="checkbox"
                                                    checked={item.is_public}
                                                    onChange={() => handleToggleVisibility(item.inventory_id)}
                                                />
                                                <span className="toggle-slider" />
                                            </label>
                                        </td>
                                        <td className="px-[18px] py-[14px] text-[0.82rem] text-[rgba(240,235,225,0.5)] align-middle">
                                            {item.collection_date}
                                        </td>
                                        <td className="px-[18px] py-[14px] align-middle">
                                            {editingId === item.inventory_id ? (
                                                <div className="flex gap-1.5">
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
                                                        style={{ background: "rgba(255,255,255,0.08)", color: "rgba(240,235,225,0.7)" }}
                                                        onClick={cancelEdit}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="center-action-btn"
                                                    style={{ background: "rgba(125,197,66,0.12)", color: "#7DC542" }}
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

                    {/* ── Mobile Cards (< md) ── */}
                    <div className="flex md:hidden flex-col gap-3">
                        {inventory.map((item) => (
                            <div
                                key={item.inventory_id}
                                className="rounded-xl px-5 py-[18px] border border-[rgba(125,197,66,0.1)]"
                                style={{ background: "rgba(255,255,255,0.03)" }}
                            >
                                <div className="flex items-center justify-between mb-2.5">
                                    <span className="text-base font-bold text-[#F0EBE1]">
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

                                {[
                                    { label: "Collected", value: item.collected_quantity },
                                    { label: "Distributed", value: item.distributed_quantity },
                                    { label: "Available", value: item.available_quantity, style: { color: item.available_quantity > 0 ? "#7DC542" : "#9E9E9E" } },
                                    { label: "Collected On", value: item.collection_date, style: { color: "rgba(240,235,225,0.5)" } },
                                ].map(({ label, value, style }) => (
                                    <div key={label} className="flex justify-between items-center py-1.5 text-[0.82rem]">
                                        <span className="text-[rgba(240,235,225,0.5)] font-semibold">{label}</span>
                                        <span className="text-[#F0EBE1] font-bold" style={style}>{value}</span>
                                    </div>
                                ))}

                                <div className="mt-2.5">
                                    <button
                                        type="button"
                                        className="center-action-btn w-full py-2.5"
                                        style={{ background: "rgba(125,197,66,0.12)", color: "#7DC542" }}
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
