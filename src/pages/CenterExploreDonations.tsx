import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { getAvailableDonations } from "../services/donationService";
import type { Donation } from "../types/Dashboard";

function formatDate(value: string): string {
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) return value;
	return parsed.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

export default function CenterExploreDonations() {
	const navigate = useNavigate();
	const [donations, setDonations] = useState<Donation[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [foodTypeFilter, setFoodTypeFilter] = useState("");
	const [locationFilter, setLocationFilter] = useState("");
	const [sortBy, setSortBy] = useState("expirationDate");

	useEffect(() => {
		const timeoutId = window.setTimeout(async () => {
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
				setError(
					err instanceof Error
						? err.message
						: "Failed to load available donations.",
				);
			} finally {
				setLoading(false);
			}
		}, 250);

		return () => window.clearTimeout(timeoutId);
	}, [foodTypeFilter, locationFilter, sortBy]);

	function handleCreateRequestForDonation(donation: Donation) {
		const params = new URLSearchParams({
			foodType: donation.foodType,
			unit: donation.unit,
		});
		navigate(`/dashboard/center/create-request?${params.toString()}`);
	}

	return (
		<DashboardLayout>
			<div className="space-y-6">
				<div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 lg:flex-row lg:items-end lg:justify-between">
					<div className="max-w-2xl">
						<p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7DC542]">
							Browse Donations
						</p>
						<h2 className="mt-2 text-2xl font-black text-[#F0EBE1]">
							View standalone donations from providers.
						</h2>
						<p className="mt-2 text-sm text-[#F0EBE1]/65">
							See what is available directly. If you need any of these items, you can create a targeted requirement.
						</p>
					</div>

					<Link
						to="/dashboard/center/create-request"
						className="inline-flex items-center justify-center rounded-xl bg-[#7DC542] px-4 py-3 text-sm font-black text-[#0B1A08] transition hover:bg-[#90D85A]"
					>
						Create New Request
					</Link>
				</div>

				<div className="grid gap-4 md:grid-cols-3">
					<label className="space-y-2">
						<span className="text-sm font-bold text-[#F0EBE1]">Food Type</span>
						<input
							type="text"
							value={foodTypeFilter}
							onChange={(event) => setFoodTypeFilter(event.target.value)}
							placeholder="Rice, bread, vegetables"
							className="auth-input w-full"
						/>
					</label>

					<label className="space-y-2">
						<span className="text-sm font-bold text-[#F0EBE1]">Location</span>
						<input
							type="text"
							value={locationFilter}
							onChange={(event) => setLocationFilter(event.target.value)}
							placeholder="Colombo, Kandy"
							className="auth-input w-full"
						/>
					</label>

					<label className="space-y-2">
						<span className="text-sm font-bold text-[#F0EBE1]">Sort By</span>
						<select
							value={sortBy}
							onChange={(event) => setSortBy(event.target.value)}
							className="auth-input w-full cursor-pointer"
						>
							<option value="expirationDate">Expiration Date</option>
							<option value="createdAt">Newest First</option>
						</select>
					</label>
				</div>

				{error ? (
					<div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-100">
						{error}
					</div>
				) : null}

				{loading ? (
					<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
						{[1, 2, 3, 4, 5, 6].map((item) => (
							<div key={item} className="skeleton-shimmer h-[240px]" />
						))}
					</div>
				) : donations.length === 0 ? (
					<div className="rounded-2xl border border-dashed border-white/15 bg-white/5 px-6 py-12 text-center">
						<h3 className="text-lg font-bold text-[#F0EBE1]">
							No available donations match these filters
						</h3>
						<p className="mt-2 text-sm text-[#F0EBE1]/55">
							Adjust the food type or location filters, or check back after providers post
							new donations.
						</p>
					</div>
				) : (
					<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
						{donations.map((donation) => (
							<article
								key={donation.donationId}
								className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-[#7DC542]/30 hover:bg-white/[0.06]"
							>
								<div className="flex items-start justify-between gap-3">
									<div>
										<p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7DC542]">
											Donation #{donation.donationId}
										</p>
										<h3 className="mt-2 text-xl font-bold text-[#F0EBE1]">
											{donation.foodType}
										</h3>
									</div>

									<span className="rounded-full bg-[#7DC542]/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#7DC542]">
										{donation.status}
									</span>
								</div>

								<div className="mt-5 space-y-3 text-sm text-[#F0EBE1]/70">
									<div className="flex items-center justify-between gap-3">
										<span>Quantity</span>
										<span className="font-bold text-[#F0EBE1]">
											{donation.quantity} {donation.unit}
										</span>
									</div>
									<div className="flex items-center justify-between gap-3">
										<span>Pickup Address</span>
										<span className="max-w-[13rem] text-right font-medium text-[#F0EBE1]">
											{donation.pickupAddress}
										</span>
									</div>
									<div className="flex items-center justify-between gap-3">
										<span>Availability</span>
										<span className="font-medium text-[#F0EBE1]">
											{donation.availabilityTime}
										</span>
									</div>
									<div className="flex items-center justify-between gap-3">
										<span>Expires</span>
										<span className="font-medium text-[#F0EBE1]">
											{formatDate(donation.expirationDate)}
										</span>
									</div>
								</div>

								<button
									type="button"
									onClick={() => handleCreateRequestForDonation(donation)}
									className="mt-6 inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-[#F0EBE1] transition hover:bg-white/10"
								>
									Create Request for this Food Type
								</button>
							</article>
						))}
					</div>
				)}
			</div>
		</DashboardLayout>
	);
}
