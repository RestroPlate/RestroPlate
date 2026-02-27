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
    const [hoveredCreate, setHoveredCreate] = useState(false);

    // TODO: Replace with API call to GET /api/donations
    useEffect(() => {
        const timer = setTimeout(() => {
            setDonations(mockDonations);
            setLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const stats = [
        {
            label: "Total Donations",
            value: donations.length,
            icon: "📦",
            accent: "#7DC542",
        },
        {
            label: "Active Listings",
            value: donations.filter((d) => d.status === "AVAILABLE" || d.status === "REQUESTED").length,
            icon: "🟢",
            accent: "#66BB6A",
        },
        {
            label: "Completed",
            value: donations.filter((d) => d.status === "COMPLETED").length,
            icon: "✅",
            accent: "#42A5F5",
        },
    ];

    return (
        <DashboardLayout>
            <style>{`
				.donor-stats-grid {
					display: grid;
					grid-template-columns: repeat(3, 1fr);
					gap: 20px;
					margin-bottom: 32px;
				}

				.donor-stat-card {
					background: rgba(255,255,255,0.03);
					border: 1px solid rgba(125,197,66,0.12);
					border-radius: 12px;
					padding: 24px;
					transition: border-color 0.25s ease, transform 0.25s ease;
				}

				.donor-stat-card:hover {
					border-color: rgba(125,197,66,0.3);
					transform: translateY(-2px);
				}

				.donor-donation-card {
					background: rgba(255,255,255,0.03);
					border: 1px solid rgba(125,197,66,0.1);
					border-radius: 12px;
					padding: 20px 24px;
					transition: border-color 0.25s ease, transform 0.25s ease, background 0.25s ease;
					cursor: pointer;
				}

				.donor-donation-card:hover {
					border-color: rgba(125,197,66,0.25);
					background: rgba(255,255,255,0.04);
					transform: translateY(-1px);
				}

				.donor-create-btn {
					display: inline-flex;
					align-items: center;
					gap: 8px;
					background: #7DC542;
					color: #0B1A08;
					border: none;
					border-radius: 10px;
					padding: 14px 28px;
					font-family: 'Nunito', sans-serif;
					font-size: 0.9rem;
					font-weight: 800;
					letter-spacing: 0.06em;
					cursor: pointer;
					transition: transform 0.2s ease, box-shadow 0.2s ease;
				}

				.donor-create-btn:hover {
					transform: translateY(-2px);
					box-shadow: 0 8px 28px rgba(125,197,66,0.35);
				}

				.donor-skeleton {
					background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 75%);
					background-size: 200% 100%;
					animation: shimmer 1.5s ease-in-out infinite;
					border-radius: 8px;
				}

				@keyframes shimmer {
					0% { background-position: 200% 0; }
					100% { background-position: -200% 0; }
				}

				@media (max-width: 768px) {
					.donor-stats-grid { grid-template-columns: 1fr; gap: 12px; }
				}

				@media (min-width: 769px) and (max-width: 1024px) {
					.donor-stats-grid { grid-template-columns: repeat(2, 1fr); }
				}
			`}</style>

            {/* ── Loading Skeleton ── */}
            {loading && (
                <>
                    <div className="donor-stats-grid">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="donor-skeleton" style={{ height: "100px" }} />
                        ))}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="donor-skeleton" style={{ height: "120px" }} />
                        ))}
                    </div>
                </>
            )}

            {/* ── Stats Cards ── */}
            {!loading && (
                <>
                    <div className="donor-stats-grid">
                        {stats.map(({ label, value, icon, accent }) => (
                            <div key={label} className="donor-stat-card">
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <span style={{ fontSize: "1.8rem" }}>{icon}</span>
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

                    {/* ── Action Bar ── */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: "24px",
                            flexWrap: "wrap",
                            gap: "12px",
                        }}
                    >
                        <h2
                            style={{
                                fontFamily: "'Roboto', sans-serif",
                                fontSize: "1.15rem",
                                fontWeight: 700,
                                color: "#F0EBE1",
                            }}
                        >
                            Your Donations
                        </h2>
                        {/* TODO: Replace with modal/form to POST /api/donations */}
                        <button
                            type="button"
                            className="donor-create-btn"
                            onMouseEnter={() => setHoveredCreate(true)}
                            onMouseLeave={() => setHoveredCreate(false)}
                            style={{
                                transform: hoveredCreate ? "translateY(-2px)" : "translateY(0)",
                                boxShadow: hoveredCreate ? "0 8px 28px rgba(125,197,66,0.35)" : "none",
                            }}
                        >
                            <span style={{ fontSize: "1.1rem" }}>➕</span>
                            Create New Donation
                        </button>
                    </div>

                    {/* ── Donations List ── */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {donations.map((donation) => {
                            const statusStyle = STATUS_COLORS[donation.status];
                            return (
                                <div
                                    key={donation.donation_id}
                                    className="donor-donation-card"
                                    onMouseEnter={() => setHoveredCard(donation.donation_id)}
                                    onMouseLeave={() => setHoveredCard(null)}
                                    style={{
                                        transform: hoveredCard === donation.donation_id ? "translateY(-1px)" : "none",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "flex-start",
                                            justifyContent: "space-between",
                                            gap: "16px",
                                            flexWrap: "wrap",
                                        }}
                                    >
                                        <div style={{ flex: 1, minWidth: "200px" }}>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "10px",
                                                    marginBottom: "6px",
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        fontFamily: "'Roboto', sans-serif",
                                                        fontSize: "1.05rem",
                                                        fontWeight: 700,
                                                        color: "#F0EBE1",
                                                    }}
                                                >
                                                    {donation.food_type}
                                                </span>
                                                <span
                                                    style={{
                                                        fontFamily: "'Nunito', sans-serif",
                                                        fontSize: "0.72rem",
                                                        fontWeight: 700,
                                                        color: statusStyle.text,
                                                        background: statusStyle.bg,
                                                        padding: "3px 10px",
                                                        borderRadius: "12px",
                                                        letterSpacing: "0.04em",
                                                    }}
                                                >
                                                    {statusStyle.label}
                                                </span>
                                            </div>
                                            <p
                                                style={{
                                                    fontFamily: "'Nunito', sans-serif",
                                                    fontSize: "0.84rem",
                                                    color: "rgba(240,235,225,0.6)",
                                                    lineHeight: 1.5,
                                                    marginBottom: "10px",
                                                }}
                                            >
                                                {donation.description}
                                            </p>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: "20px",
                                                    flexWrap: "wrap",
                                                    fontFamily: "'Nunito', sans-serif",
                                                    fontSize: "0.78rem",
                                                    color: "rgba(240,235,225,0.45)",
                                                }}
                                            >
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
