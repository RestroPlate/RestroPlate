import DashboardLayout from "../components/dashboard/DashboardLayout";

// TODO: Replace with API call to GET /api/inventory?center=current_user
// For now stats are static as requested to remove legacy table

export default function CenterDashboard() {
	function isCurrentPath(currentPath: string, targetPath: string): string {
		if (currentPath === targetPath) return targetPath;
		const prefixMatch = currentPath.match(/^\/[^/]+/);
		const prefix = prefixMatch ? prefixMatch[0] : "";
		return `${prefix}${targetPath}`;
	}

	const stats = [
		{
			label: "Total Collected",
			value: 0,
			icon: "📥",
			accent: "#7DC542",
			unit: "items",
		},
		{
			label: "Distributed",
			value: 0,
			icon: "🤝",
			accent: "#66BB6A",
			unit: "items",
		},
		{
			label: "Available Now",
			value: 0,
			icon: "📦",
			accent: "#42A5F5",
			unit: "items",
		},
	];

	return (
		<DashboardLayout>
			{/* ── Stats + Content ── */}
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
                                <span
                                    className="text-[2rem] font-black"
                                    style={{ color: accent }}
                                >
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

            {/* ── Quick Actions ── */}
            <div className="mb-8">
                <h2 className="mb-4 text-[1.15rem] font-bold text-[#F0EBE1]">
                    Quick Actions
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <a
                        href={isCurrentPath(
                            location.pathname,
                            "/dashboard/center/explore",
                        )}
                        className="group rounded-xl border border-[rgba(125,197,66,0.12)] bg-[rgba(255,255,255,0.03)] p-5 text-left transition hover:border-[rgba(125,197,66,0.3)] hover:bg-[rgba(125,197,66,0.05)]"
                    >
                        <span className="text-2xl">📦</span>
                        <h3 className="mt-2 text-base font-bold text-[#F0EBE1] transition group-hover:text-[#7DC542]">
                            Browse Donations
                        </h3>
                        <p className="mt-1 text-sm text-[rgba(240,235,225,0.5)]">
                            View available standalone donations.
                        </p>
                    </a>
                    <a
                        href={isCurrentPath(
                            location.pathname,
                            "/dashboard/center/create-request",
                        )}
                        className="group rounded-xl border border-[rgba(125,197,66,0.12)] bg-[rgba(255,255,255,0.03)] p-5 text-left transition hover:border-[rgba(125,197,66,0.3)] hover:bg-[rgba(125,197,66,0.05)]"
                    >
                        <span className="text-2xl">📝</span>
                        <h3 className="mt-2 text-base font-bold text-[#F0EBE1] transition group-hover:text-[#7DC542]">
                            Create Request
                        </h3>
                        <p className="mt-1 text-sm text-[rgba(240,235,225,0.5)]">
                            Submit a new requirement to donors.
                        </p>
                    </a>
                    <a
                        href={isCurrentPath(
                            location.pathname,
                            "/dashboard/center/requests",
                        )}
                        className="group rounded-xl border border-[rgba(125,197,66,0.12)] bg-[rgba(255,255,255,0.03)] p-5 text-left transition hover:border-[rgba(125,197,66,0.3)] hover:bg-[rgba(125,197,66,0.05)]"
                    >
                        <span className="text-2xl">📨</span>
                        <h3 className="mt-2 text-base font-bold text-[#F0EBE1] transition group-hover:text-[#7DC542]">
                            Outgoing Requests
                        </h3>
                        <p className="mt-1 text-sm text-[rgba(240,235,225,0.5)]">
                            Track status of your submitted requests.
                        </p>
                    </a>
                </div>
            </div>
		</DashboardLayout>
	);
}
