import { useEffect, useState } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import type { Donation } from "../types/Dashboard";

// TODO: Replace with API call to GET /api/donations?provider=current_user
const mockDonations: Donation[] = [
    {
        donation_id: 1,
        food_type: "Fresh Bread",
        description: "20 loaves of whole wheat bread, baked this morning",
        quantity: 20,
        unit: "loaves",
        expiry_date: "2026-02-27",
        pickup_location: "Main Street Bakery, Colombo 03",
        status: "AVAILABLE",
        created_at: "2026-02-25T10:30:00Z",
    },
    {
        donation_id: 2,
        food_type: "Rice & Curry",
        description: "Bulk prepared rice with mixed vegetable curry, sealed containers",
        quantity: 50,
        unit: "servings",
        expiry_date: "2026-02-26",
        pickup_location: "Hilton Colombo, Colombo 01",
        status: "REQUESTED",
        created_at: "2026-02-24T14:15:00Z",
    },
    {
        donation_id: 3,
        food_type: "Fresh Vegetables",
        description: "Assorted vegetables — carrots, beans, tomatoes, leafy greens",
        quantity: 30,
        unit: "kg",
        expiry_date: "2026-02-28",
        pickup_location: "Pettah Market Stall 12, Colombo 11",
        status: "COLLECTED",
        created_at: "2026-02-23T08:00:00Z",
    },
    {
        donation_id: 4,
        food_type: "Pastries & Cakes",
        description: "Leftover pastries from today's display — croissants, muffins, slices",
        quantity: 15,
        unit: "boxes",
        expiry_date: "2026-02-26",
        pickup_location: "Sugar & Spice Café, Colombo 07",
        status: "COMPLETED",
        created_at: "2026-02-20T17:45:00Z",
    },
    {
        donation_id: 5,
        food_type: "Canned Goods",
        description: "Canned lentils, chickpeas, and coconut milk — long shelf life",
        quantity: 40,
        unit: "cans",
        expiry_date: "2027-06-15",
        pickup_location: "Keells Super, Colombo 05",
        status: "AVAILABLE",
        created_at: "2026-02-25T09:00:00Z",
    },
];

const STATUS_COLORS: Record<Donation["status"], { bg: string; text: string; label: string }> = {
    AVAILABLE: { bg: "rgba(125,197,66,0.15)", text: "#7DC542", label: "Available" },
    REQUESTED: { bg: "rgba(255,193,7,0.15)", text: "#FFC107", label: "Requested" },
    COLLECTED: { bg: "rgba(66,165,245,0.15)", text: "#42A5F5", label: "Collected" },
    COMPLETED: { bg: "rgba(158,158,158,0.15)", text: "#9E9E9E", label: "Completed" },
};

export default function DonorDashboard() {
    const [loading, setLoading] = useState(true);
    const [donations, setDonations] = useState<Donation[]>([]);
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDonations(mockDonations);
            setLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const stats = [
        { label: "Total Donations", value: donations.length, icon: "📦", accent: "#7DC542" },
        { label: "Active Listings", value: donations.filter((d) => d.status === "AVAILABLE" || d.status === "REQUESTED").length, icon: "🟢", accent: "#66BB6A" },
        { label: "Completed", value: donations.filter((d) => d.status === "COMPLETED").length, icon: "✅", accent: "#42A5F5" },
    ];

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
                    <div className="flex flex-col gap-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="skeleton-shimmer h-[120px]" />
                        ))}
                    </div>
                </>
            )}

            {/* ── Stats + Content ── */}
            {!loading && (
                <>
                    {/* Stats grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                        {stats.map(({ label, value, icon, accent }) => (
                            <div
                                key={label}
                                className="rounded-xl p-6 border border-[rgba(125,197,66,0.12)] transition-[border-color,transform] duration-[250ms] hover:border-[rgba(125,197,66,0.3)] hover:-translate-y-0.5"
                                style={{ background: "rgba(255,255,255,0.03)" }}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-[1.8rem]">{icon}</span>
                                    <span className="text-[2rem] font-black" style={{ color: accent }}>
                                        {value}
                                    </span>
                                </div>
                                <div className="mt-2 text-[0.82rem] font-semibold text-[rgba(240,235,225,0.5)] tracking-[0.04em] uppercase">
                                    {label}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Action bar */}
                    <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                        <h2 className="text-[1.15rem] font-bold text-[#F0EBE1]">
                            Your Donations
                        </h2>
                        {/* TODO: Replace with modal/form to POST /api/donations */}
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 bg-[#7DC542] text-[#0B1A08] border-none rounded-[10px] px-7 py-[14px] text-[0.9rem] font-extrabold tracking-[0.06em] cursor-pointer transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(125,197,66,0.35)]"
                        >
                            <span className="text-[1.1rem]">➕</span>
                            Create New Donation
                        </button>
                    </div>

                    {/* Donations list */}
                    <div className="flex flex-col gap-3">
                        {donations.map((donation) => {
                            const statusStyle = STATUS_COLORS[donation.status];
                            return (
                                <div
                                    key={donation.donation_id}
                                    className="rounded-xl px-6 py-5 border cursor-pointer transition-[border-color,background,transform] duration-[250ms]"
                                    onMouseEnter={() => setHoveredCard(donation.donation_id)}
                                    onMouseLeave={() => setHoveredCard(null)}
                                    style={{
                                        background: hoveredCard === donation.donation_id ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.03)",
                                        border: `1px solid ${hoveredCard === donation.donation_id ? "rgba(125,197,66,0.25)" : "rgba(125,197,66,0.1)"}`,
                                        transform: hoveredCard === donation.donation_id ? "translateY(-1px)" : "none",
                                    }}
                                >
                                    <div className="flex items-start justify-between gap-4 flex-wrap">
                                        <div className="flex-1 min-w-[200px]">
                                            <div className="flex items-center gap-2.5 mb-1.5">
                                                <span className="text-[1.05rem] font-bold text-[#F0EBE1]">
                                                    {donation.food_type}
                                                </span>
                                                <span
                                                    className="text-[0.72rem] font-bold px-2.5 py-[3px] rounded-xl tracking-[0.04em]"
                                                    style={{ color: statusStyle.text, background: statusStyle.bg }}
                                                >
                                                    {statusStyle.label}
                                                </span>
                                            </div>
                                            <p className="text-[0.84rem] text-[rgba(240,235,225,0.6)] leading-[1.5] mb-2.5">
                                                {donation.description}
                                            </p>
                                            <div className="flex gap-5 flex-wrap text-[0.78rem] text-[rgba(240,235,225,0.45)]">
                                                <span>📦 {donation.quantity} {donation.unit}</span>
                                                <span>📍 {donation.pickup_location}</span>
                                                <span>⏰ Expires {donation.expiry_date}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </DashboardLayout>
    );
}
