import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { logout, getCurrentUser, getUserProfile } from "../../services/authService";
import React from "react";
import type { UserProfileDto } from "../../types/Auth";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const SIDEBAR_LINKS_DONOR = [
    { label: "Dashboard", icon: "📊", path: "/dashboard/donor" },
    { label: "My Donations", icon: "🍽️", path: "/dashboard/donor/my-donations" },
    { label: "Create Donation", icon: "➕", path: "/dashboard/donor/create" },
    { label: "Explore Requests", icon: "🔍", path: "/dashboard/donor/explore" },
];

const SIDEBAR_LINKS_CENTER = [
    { label: "Dashboard", icon: "📊", path: "/dashboard/center" },
    { label: "Inventory", icon: "📦", path: "/dashboard/center" },
    { label: "Browse Donations", icon: "🔍", path: "/dashboard/center" },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const user = getCurrentUser();
    const [userProfile, setUserProfile] = useState<UserProfileDto | null>(null);

    useEffect(() => {
        async function fetchProfile() {
            try {
                const profile = await getUserProfile();
                setUserProfile(profile);
            } catch (err) {
                console.error("Error fetching user profile:", err);
            }
        }
        fetchProfile();
    }, []);

    const [hoveredLink, setHoveredLink] = useState<string | null>(null);

    const sidebarLinks = user?.role === "DONOR" ? SIDEBAR_LINKS_DONOR : SIDEBAR_LINKS_CENTER;

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const roleBadge = user?.role === "DONOR" ? "🍽️ Donation Provider" : "🏢 Distribution Center";

    function isActive(path: string): boolean {
        return location.pathname === path;
    }

    return (
        <div className="flex min-h-screen bg-[#0B1A08]">

            {/* ── Desktop Sidebar ── */}
            <aside className="hidden md:flex w-[260px] fixed inset-y-0 left-0 z-50 flex-col py-7 bg-[rgba(255,255,255,0.02)] border-r border-[rgba(125,197,66,0.12)]">
                {/* Logo */}
                <a
                    className="flex items-center gap-2.5 px-6 pb-6 mb-2 border-b border-[rgba(125,197,66,0.1)] cursor-pointer text-[1.25rem] font-bold text-[#7DC542] no-underline"
                    onClick={() => navigate("/")}
                    onKeyDown={() => { }}
                    role="button"
                    tabIndex={0}
                >
                    <span>🍃</span> RestroPlate
                </a>

                {/* Nav links */}
                <nav className="flex-1 flex flex-col gap-0.5 px-3 py-3">
                    {sidebarLinks.map(({ label, icon, path }) => {
                        const active = isActive(path);
                        return (
                            <button
                                key={label}
                                type="button"
                                onClick={() => navigate(path)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[0.88rem] font-semibold cursor-pointer border-none text-left w-full transition-[background,color] duration-200 ${active
                                    ? "bg-[rgba(125,197,66,0.15)] text-[#7DC542]"
                                    : ""
                                    }`}
                                onMouseEnter={() => setHoveredLink(label)}
                                onMouseLeave={() => setHoveredLink(null)}
                                style={
                                    active
                                        ? {}
                                        : {
                                            background: hoveredLink === label ? "rgba(125,197,66,0.1)" : "none",
                                            color: hoveredLink === label ? "#F0EBE1" : "rgba(240,235,225,0.6)",
                                        }
                                }
                            >
                                <span className="text-[1.1rem]">{icon}</span>
                                {label}
                            </button>
                        );
                    })}
                </nav>

                {/* Footer area */}
                <div className="px-3 pt-4 border-t border-[rgba(125,197,66,0.1)] mt-auto">
                    <div className="px-4 pb-4 text-[0.78rem] text-[rgba(240,235,225,0.4)]">
                        <div className="text-[#F0EBE1] font-bold text-[0.85rem] mb-0.5">{user?.name}</div>
                        {user?.email}
                    </div>
                    <button
                        type="button"
                        className="flex items-center gap-2.5 w-full px-4 py-3 rounded-lg text-[0.85rem] font-bold cursor-pointer border-none bg-none transition-[background,color] duration-200 hover:bg-[rgba(255,80,80,0.1)] hover:text-[#ff6b6b] text-[rgba(240,235,225,0.5)]"
                        onClick={handleLogout}
                    >
                        <span>🚪</span> Log Out
                    </button>
                </div>
            </aside>

            {/* ── Main Area ── */}
            <main className="flex-1 md:ml-[260px] min-h-screen">
                <header className="px-10 pt-7 pb-5 md:px-5 md:pt-5 md:pb-4 border-b border-[rgba(125,197,66,0.08)] flex items-center justify-between flex-wrap gap-3">
                    <h1 className="text-2xl md:text-[1.2rem] font-bold text-[#F0EBE1]">
                        Welcome back, {userProfile?.name} 👋
                    </h1>
                    <span className="text-[0.78rem] font-bold text-[#7DC542] bg-[rgba(125,197,66,0.12)] px-[14px] py-[5px] rounded-[20px] tracking-[0.03em]">
                        {roleBadge}
                    </span>
                </header>
                <div className="px-10 pt-8 pb-[100px] md:px-5 md:pt-6 md:pb-[120px]">
                    {children}
                </div>
            </main>

            {/* ── Mobile Bottom Nav ── */}
            <nav className="flex md:hidden fixed bottom-0 left-0 right-0 bg-[rgba(11,26,8,0.97)] backdrop-blur-[16px] border-t border-[rgba(125,197,66,0.15)] z-50 py-2">
                <div className="flex justify-around items-center w-full">
                    {sidebarLinks.map(({ label, icon, path }) => {
                        const active = isActive(path);
                        return (
                            <button
                                key={label}
                                type="button"
                                onClick={() => navigate(path)}
                                className={`flex flex-col items-center gap-[3px] px-3 py-1.5 bg-none border-none cursor-pointer text-[0.68rem] font-semibold transition-colors duration-200 ${active
                                    ? "text-[#7DC542]"
                                    : "text-[rgba(240,235,225,0.5)] hover:text-[#7DC542]"
                                    }`}
                            >
                                <span className="text-[1.25rem]">{icon}</span>
                                {label}
                            </button>
                        );
                    })}
                    <button
                        type="button"
                        className="flex flex-col items-center gap-[3px] px-3 py-1.5 bg-none border-none cursor-pointer text-[0.68rem] font-semibold text-[rgba(240,235,225,0.5)] transition-colors duration-200 hover:text-[#7DC542]"
                        onClick={handleLogout}
                    >
                        <span className="text-[1.25rem]">🚪</span>
                        Log Out
                    </button>
                </div>
            </nav>
        </div>
    );
}
