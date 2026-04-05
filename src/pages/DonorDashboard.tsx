import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { getMyDonations } from "../services/donationService";
import type { Donation } from "../types/Dashboard";

export default function DonorDashboard() {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [donations, setDonations] = useState<Donation[]>([]);

	const fetchDonations = useCallback(async (): Promise<void> => {
		try {
			const data = await getMyDonations();
			setDonations(data);
		} catch {
			// Stats will show zeros on error
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void fetchDonations();
	}, [fetchDonations]);

	const stats = [
		{ label: "Total Donations", value: donations.length },
		{
			label: "Available",
			value: donations.filter((d) => d.status === "AVAILABLE").length,
		},
		{
			label: "Requested",
			value: donations.filter((d) => d.status === "REQUESTED").length,
		},
		{
			label: "Collected",
			value: donations.filter((d) => d.status === "COLLECTED").length,
		},
	];

	const quickActions = [
		{
			title: "Create Donation",
			description: "Add new surplus food for distribution centers to request.",
			icon: "➕",
			path: "/dashboard/donor/create",
		},
		{
			title: "My Donations",
			description: "View, filter, edit, and manage all your donation listings.",
			icon: "🍽️",
			path: "/dashboard/donor/my-donations",
		},
		{
			title: "Explore Requests",
			description:
				"Browse requirements from distribution centers and accept them to supply food.",
			icon: "🔍",
			path: "/dashboard/donor/explore",
		},
	];

	return (
		<DashboardLayout>
			{loading ? (
				<div className="space-y-3">
					<div className="skeleton-shimmer h-[100px]" />
					<div className="skeleton-shimmer h-[100px]" />
				</div>
			) : (
				<div className="space-y-8">
					{/* ── Stats Cards ── */}
					<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
						{stats.map((item) => (
							<div
								key={item.label}
								className="rounded-xl border border-white/10 bg-white/5 px-5 py-4"
							>
								<p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#F0EBE1]/60">
									{item.label}
								</p>
								<p className="mt-1 text-3xl font-black text-[#7DC542]">
									{item.value}
								</p>
							</div>
						))}
					</div>

					{/* ── Quick Actions ── */}
					<div>
						<h2 className="mb-4 text-lg font-bold text-[#F0EBE1]">
							Quick Actions
						</h2>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
							{quickActions.map((action) => (
								<button
									key={action.path}
									type="button"
									onClick={() => navigate(action.path)}
									className="group rounded-xl border border-white/10 bg-white/5 p-5 text-left transition hover:border-[#7DC542]/30 hover:bg-[#7DC542]/5"
								>
									<span className="text-2xl">{action.icon}</span>
									<h3 className="mt-2 text-base font-bold text-[#F0EBE1] transition group-hover:text-[#7DC542]">
										{action.title}
									</h3>
									<p className="mt-1 text-sm text-[#F0EBE1]/55">
										{action.description}
									</p>
								</button>
							))}
						</div>
					</div>
				</div>
			)}
		</DashboardLayout>
	);
}
