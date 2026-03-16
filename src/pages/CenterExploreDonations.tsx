import { useState, useEffect } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { getAvailableDonations } from "../services/donationService";
import type { Donation } from "../types/Dashboard";

export default function CenterExploreDonations() {
	const [donations, setDonations] = useState<Donation[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Filter states
	const [foodTypeFilter, setFoodTypeFilter] = useState("");
	const [locationFilter, setLocationFilter] = useState("");
	const [sortBy, setSortBy] = useState("expirationDate");

	const fetchDonations = async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await getAvailableDonations({
				foodType: foodTypeFilter || undefined,
				location: locationFilter || undefined,
				sortBy: sortBy || undefined,
			});
			setDonations(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load donations");
		} finally {
			setLoading(false);
		}
	};

	// Refetch when filters/sort change
	useEffect(() => {
		// Debounce fetching if needed, but for simplicity we fetch right away
		const timer = setTimeout(() => {
			fetchDonations();
		}, 500);
		return () => clearTimeout(timer);
	}, [foodTypeFilter, locationFilter, sortBy]);

	const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setSortBy(e.target.value);
	};

	return (
		<DashboardLayout>
			<div className="flex flex-col gap-6">
				<div>
					<h2 className="text-[1.5rem] font-bold text-[#F0EBE1] tracking-tight mb-2">
						Available Donations
					</h2>
					<p className="text-[0.95rem] text-[rgba(240,235,225,0.6)]">
						Browse and filter currently available food donations.
					</p>
				</div>

				{/* Filters Row */}
				<div className="flex flex-col md:flex-row gap-4 mb-2">
					<div className="flex-1">
						<label className="block text-[0.85rem] font-bold text-[rgba(240,235,225,0.8)] mb-1.5 ml-1">
							Search by Food Type
						</label>
						<div className="relative">
							<span className="absolute left-4 top-1/2 -translate-y-1/2 text-[1.1rem] opacity-60">
								🔍
							</span>
							<input
								type="text"
								className="auth-input pl-11 py-3 text-[0.95rem] w-full"
								placeholder="e.g. Bread, Vegetables..."
								value={foodTypeFilter}
								onChange={(e) => setFoodTypeFilter(e.target.value)}
							/>
						</div>
					</div>
					<div className="flex-1">
						<label className="block text-[0.85rem] font-bold text-[rgba(240,235,225,0.8)] mb-1.5 ml-1">
							Filter by Location
						</label>
						<div className="relative">
							<span className="absolute left-4 top-1/2 -translate-y-1/2 text-[1.1rem] opacity-60">
								📍
							</span>
							<input
								type="text"
								className="auth-input pl-11 py-3 text-[0.95rem] w-full"
								placeholder="e.g. Colombo, Kandy..."
								value={locationFilter}
								onChange={(e) => setLocationFilter(e.target.value)}
							/>
						</div>
					</div>
					<div className="w-full md:w-[200px]">
						<label className="block text-[0.85rem] font-bold text-[rgba(240,235,225,0.8)] mb-1.5 ml-1">
							Sort By
						</label>
						<select
							className="auth-input py-3 text-[0.95rem] w-full cursor-pointer appearance-none"
							value={sortBy}
							onChange={handleSortChange}
							style={{
								backgroundImage:
									'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%237DC542%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
								backgroundRepeat: "no-repeat",
								backgroundPosition: "right 1rem top 50%",
								backgroundSize: "0.65rem auto",
								paddingRight: "40px",
							}}
						>
							<option value="expirationDate">Expiration Date</option>
							<option value="createdAt">Creation Date</option>
						</select>
					</div>
				</div>

				{/* Status/Error */}
				{error && (
					<div className="p-4 rounded-xl bg-[rgba(255,80,80,0.1)] border border-[rgba(255,80,80,0.2)] flex items-center gap-3">
						<span className="text-[1.2rem]">⚠️</span>
						<p className="text-[#ff6b6b] text-[0.9rem] font-medium">{error}</p>
					</div>
				)}

				{/* Loading Skeleton */}
				{loading && (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
						{[1, 2, 3, 4, 5, 6].map((i) => (
							<div key={i} className="skeleton-shimmer h-[220px]" />
						))}
					</div>
				)}

				{/* Donations Grid */}
				{!loading && !error && donations.length === 0 && (
					<div
						className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-[rgba(125,197,66,0.1)]"
						style={{ background: "rgba(255,255,255,0.02)" }}
					>
						<span className="text-[3rem] mb-4 opacity-50">🍽️</span>
						<h3 className="text-[1.2rem] font-bold text-[#F0EBE1] mb-2">
							No donations found
						</h3>
						<p className="text-[0.95rem] text-[rgba(240,235,225,0.5)] max-w-[400px]">
							We couldn't find any available donations matching your current
							filters. Try adjusting your search criteria.
						</p>
					</div>
				)}

				{!loading && !error && donations.length > 0 && (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
						{donations.map((donation) => (
							<div
								key={donation.donation_id}
								className="rounded-xl overflow-hidden border border-[rgba(125,197,66,0.12)] transition-[border-color,transform] duration-300 hover:border-[rgba(125,197,66,0.3)] hover:-translate-y-1 flex flex-col h-full bg-[rgba(255,255,255,0.03)]"
							>
								<div className="p-5 flex-1 flex flex-col">
									<div className="flex justify-between items-start mb-3 gap-3">
										<h3 className="text-[1.15rem] font-bold text-[#F0EBE1] leading-tight">
											{donation.food_type}
										</h3>
										<span className="shrink-0 text-[0.7rem] font-bold uppercase tracking-[0.05em] px-2 py-1 rounded bg-[rgba(125,197,66,0.12)] text-[#7DC542]">
											Available
										</span>
									</div>

									<div className="flex items-center gap-2 text-[0.95rem] font-bold text-[#7DC542] mb-4">
										<span className="text-[rgba(240,235,225,0.4)] font-normal text-[0.85rem]">
											Quantity:
										</span>
										{donation.quantity} {donation.unit}
									</div>

									<div className="flex flex-col gap-2.5 mt-auto text-[0.85rem]">
										<div className="flex items-start gap-2.5">
											<span className="text-[1.05rem] opacity-70 shrink-0">
												📍
											</span>
											<span className="text-[rgba(240,235,225,0.7)] leading-snug">
												{donation.pickup_location}
											</span>
										</div>
										<div className="flex items-center gap-2.5">
											<span className="text-[1.05rem] opacity-70 shrink-0">
												⏳
											</span>
											<span className="text-[rgba(240,235,225,0.7)] font-medium">
												Expires:{" "}
												{new Date(donation.expiry_date).toLocaleDateString()}
											</span>
										</div>
										<div className="flex items-center gap-2.5">
											<span className="text-[1.05rem] opacity-70 shrink-0">
												⏰
											</span>
											<span className="text-[rgba(240,235,225,0.7)]">
												Available: {donation.availability_time}
											</span>
										</div>
									</div>
								</div>

								<div className="p-4 border-t border-[rgba(125,197,66,0.08)] bg-[rgba(0,0,0,0.2)]">
									<button
										type="button"
										className="w-full py-2.5 rounded-lg font-bold text-[0.9rem] transition-all duration-200 bg-[rgba(125,197,66,0.15)] text-[#7DC542] hover:bg-[#7DC542] hover:text-[#0B1A08]"
										onClick={() =>
											console.log("Request donation", donation.donation_id)
										}
									>
										Request Pickup
									</button>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</DashboardLayout>
	);
}
