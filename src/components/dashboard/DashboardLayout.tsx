import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockLogout, getCurrentUser } from "../../services/mockAuth";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const SIDEBAR_LINKS_DONOR = [
    { label: "Dashboard", icon: "📊", path: "/dashboard/donor" },
    { label: "My Donations", icon: "🍽️", path: "/dashboard/donor" },
    { label: "Create Donation", icon: "➕", path: "/dashboard/donor" },
];

const SIDEBAR_LINKS_CENTER = [
    { label: "Dashboard", icon: "📊", path: "/dashboard/center" },
    { label: "Inventory", icon: "📦", path: "/dashboard/center" },
    { label: "Browse Donations", icon: "🔍", path: "/dashboard/center" },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const navigate = useNavigate();
    const user = getCurrentUser();
    const [hoveredLink, setHoveredLink] = useState<string | null>(null);
    const [hoveredLogout, setHoveredLogout] = useState(false);

    const sidebarLinks = user?.role === "donator" ? SIDEBAR_LINKS_DONOR : SIDEBAR_LINKS_CENTER;

    const handleLogout = () => {
        mockLogout();
        navigate("/");
    };

    const roleBadge = user?.role === "donator" ? "🍽️ Donation Provider" : "🏢 Distribution Center";

    return (
        <>
            <style>{`
				@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@700;900&family=Nunito:wght@400;600;800&display=swap');

				*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

				html, body {
					background: #0B1A08;
					min-height: 100vh;
				}

				::-webkit-scrollbar { width: 6px; }
				::-webkit-scrollbar-track { background: #0B1A08; }
				::-webkit-scrollbar-thumb { background: #7DC542; border-radius: 3px; }

				.dash-layout {
					display: flex;
					min-height: 100vh;
				}

				/* ── SIDEBAR (desktop) ── */
				.dash-sidebar {
					width: 260px;
					background: rgba(255,255,255,0.02);
					border-right: 1px solid rgba(125,197,66,0.12);
					display: flex;
					flex-direction: column;
					padding: 28px 0;
					position: fixed;
					top: 0;
					left: 0;
					bottom: 0;
					z-index: 50;
				}

				.dash-sidebar-logo {
					display: flex;
					align-items: center;
					gap: 10px;
					padding: 0 24px 24px;
					border-bottom: 1px solid rgba(125,197,66,0.1);
					margin-bottom: 8px;
					cursor: pointer;
					font-family: 'Roboto', sans-serif;
					font-size: 1.25rem;
					font-weight: 700;
					color: #7DC542;
					text-decoration: none;
				}

				.dash-sidebar-nav {
					flex: 1;
					display: flex;
					flex-direction: column;
					gap: 2px;
					padding: 12px 12px;
				}

				.dash-sidebar-link {
					display: flex;
					align-items: center;
					gap: 12px;
					padding: 12px 16px;
					border-radius: 8px;
					font-family: 'Nunito', sans-serif;
					font-size: 0.88rem;
					font-weight: 600;
					color: rgba(240,235,225,0.6);
					cursor: pointer;
					transition: background 0.2s ease, color 0.2s ease;
					border: none;
					background: none;
					width: 100%;
					text-align: left;
				}

				.dash-sidebar-link:hover,
				.dash-sidebar-link.active {
					background: rgba(125,197,66,0.1);
					color: #F0EBE1;
				}

				.dash-sidebar-link .link-icon {
					font-size: 1.1rem;
				}

				.dash-sidebar-footer {
					padding: 16px 12px 0;
					border-top: 1px solid rgba(125,197,66,0.1);
					margin-top: auto;
				}

				.dash-logout-btn {
					display: flex;
					align-items: center;
					gap: 10px;
					width: 100%;
					padding: 12px 16px;
					border-radius: 8px;
					font-family: 'Nunito', sans-serif;
					font-size: 0.85rem;
					font-weight: 700;
					color: rgba(240,235,225,0.5);
					background: none;
					border: none;
					cursor: pointer;
					transition: background 0.2s ease, color 0.2s ease;
				}

				.dash-logout-btn:hover {
					background: rgba(255,80,80,0.1);
					color: #ff6b6b;
				}

				/* ── MAIN CONTENT ── */
				.dash-main {
					flex: 1;
					margin-left: 260px;
					min-height: 100vh;
				}

				.dash-header {
					padding: 28px 40px 20px;
					border-bottom: 1px solid rgba(125,197,66,0.08);
					display: flex;
					align-items: center;
					justify-content: space-between;
					flex-wrap: wrap;
					gap: 12px;
				}

				.dash-header-greeting {
					font-family: 'Roboto', sans-serif;
					font-size: 1.5rem;
					font-weight: 700;
					color: #F0EBE1;
				}

				.dash-header-role {
					font-family: 'Nunito', sans-serif;
					font-size: 0.78rem;
					font-weight: 700;
					color: #7DC542;
					background: rgba(125,197,66,0.12);
					padding: 5px 14px;
					border-radius: 20px;
					letter-spacing: 0.03em;
				}

				.dash-content {
					padding: 32px 40px 100px;
				}

				/* ── MOBILE BOTTOM NAV ── */
				.dash-bottom-nav {
					display: none;
					position: fixed;
					bottom: 0;
					left: 0;
					right: 0;
					background: rgba(11,26,8,0.97);
					backdrop-filter: blur(16px);
					border-top: 1px solid rgba(125,197,66,0.15);
					z-index: 50;
					padding: 8px 0 calc(8px + env(safe-area-inset-bottom, 0px));
				}

				.dash-bottom-nav-inner {
					display: flex;
					justify-content: space-around;
					align-items: center;
				}

				.dash-bottom-nav-btn {
					display: flex;
					flex-direction: column;
					align-items: center;
					gap: 3px;
					padding: 6px 12px;
					background: none;
					border: none;
					cursor: pointer;
					font-family: 'Nunito', sans-serif;
					font-size: 0.68rem;
					font-weight: 600;
					color: rgba(240,235,225,0.5);
					transition: color 0.2s ease;
				}

				.dash-bottom-nav-btn:hover,
				.dash-bottom-nav-btn.active {
					color: #7DC542;
				}

				.dash-bottom-nav-btn .bnav-icon {
					font-size: 1.25rem;
				}

				/* ── RESPONSIVE ── */
				@media (max-width: 768px) {
					.dash-sidebar { display: none; }
					.dash-main { margin-left: 0; }
					.dash-bottom-nav { display: block; }
					.dash-header { padding: 20px 20px 16px; }
					.dash-header-greeting { font-size: 1.2rem; }
					.dash-content { padding: 24px 20px 120px; }
				}
			`}</style>

            <div className="dash-layout">
                {/* ── Desktop Sidebar ── */}
                <aside className="dash-sidebar">
                    <a
                        className="dash-sidebar-logo"
                        onClick={() => navigate("/")}
                        onKeyDown={() => { }}
                        role="button"
                        tabIndex={0}
                    >
                        <span>🍃</span> RestroPlate
                    </a>

                    <nav className="dash-sidebar-nav">
                        {sidebarLinks.map(({ label, icon }) => (
                            <button
                                key={label}
                                type="button"
                                className={`dash-sidebar-link${hoveredLink === label ? " active" : ""}`}
                                onMouseEnter={() => setHoveredLink(label)}
                                onMouseLeave={() => setHoveredLink(null)}
                            >
                                <span className="link-icon">{icon}</span>
                                {label}
                            </button>
                        ))}
                    </nav>

                    <div className="dash-sidebar-footer">
                        <div
                            style={{
                                padding: "0 16px 16px",
                                fontFamily: "'Nunito', sans-serif",
                                fontSize: "0.78rem",
                                color: "rgba(240,235,225,0.4)",
                            }}
                        >
                            <div style={{ color: "#F0EBE1", fontWeight: 700, fontSize: "0.85rem", marginBottom: "2px" }}>
                                {user?.name}
                            </div>
                            {user?.email}
                        </div>
                        <button
                            type="button"
                            className="dash-logout-btn"
                            onClick={handleLogout}
                            onMouseEnter={() => setHoveredLogout(true)}
                            onMouseLeave={() => setHoveredLogout(false)}
                            style={{
                                color: hoveredLogout ? "#ff6b6b" : "rgba(240,235,225,0.5)",
                            }}
                        >
                            <span>🚪</span> Log Out
                        </button>
                    </div>
                </aside>

                {/* ── Main Area ── */}
                <main className="dash-main">
                    <header className="dash-header">
                        <h1 className="dash-header-greeting">
                            Welcome back, {user?.name?.split(" ")[0] ?? "User"} 👋
                        </h1>
                        <span className="dash-header-role">{roleBadge}</span>
                    </header>
                    <div className="dash-content">{children}</div>
                </main>

                {/* ── Mobile Bottom Nav ── */}
                <nav className="dash-bottom-nav">
                    <div className="dash-bottom-nav-inner">
                        {sidebarLinks.map(({ label, icon }) => (
                            <button key={label} type="button" className="dash-bottom-nav-btn">
                                <span className="bnav-icon">{icon}</span>
                                {label}
                            </button>
                        ))}
                        <button type="button" className="dash-bottom-nav-btn" onClick={handleLogout}>
                            <span className="bnav-icon">🚪</span>
                            Log Out
                        </button>
                    </div>
                </nav>
            </div>
        </>
    );
}
