// new: dedicated page for center to view their donation claim requests
import { useCallback, useEffect, useRef, useState } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { getMyClaims } from "../services/claimService";
import { getAvailableDonations } from "../services/donationService";
import type { Donation, DonationClaim, ClaimStatus } from "../types/Dashboard";

const POLL_INTERVAL = 15_000;

type FilterStatus = "ALL" | "PENDING" | "ACCEPTED" | "REJECTED";

const FILTERS: { label: string; value: FilterStatus }[] = [
	{ label: "All", value: "ALL" },
	{ label: "Pending", value: "PENDING" },
	{ label: "Accepted", value: "ACCEPTED" },
	{ label: "Rejected", value: "REJECTED" },
];

const STATUS_CLASSES: Record<ClaimStatus, string> = {
	PENDING: "bg-amber-500/15 text-amber-300",
	ACCEPTED: "bg-emerald-500/15 text-emerald-300",
	REJECTED: "bg-rose-500/15 text-rose-300",
};

function formatDate(value: string): string {
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) return value;
	return parsed.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});
}

export default function CenterMyClaims() {
	const [claims, setClaims] = useState<DonationClaim[]>([]);
	const [donations, setDonations] = useState<Map<number, Donation>>(new Map());
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [filter, setFilter] = useState<FilterStatus>("ALL");
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const fetchData = useCallback(async () => {
		try {
			const [claimsData, donationsData] = await Promise.all([
				getMyClaims(),
				getAvailableDonations(),
			]);
			setClaims(claimsData);
			const donationMap = new Map<number, Donation>();
			for (const d of donationsData) {
				donationMap.set(d.donationId, d);
			}
			setDonations(donationMap);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load claims.");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void fetchData();
	}, [fetchData]);

	// Poll for updates
	useEffect(() => {
		intervalRef.current = setInterval(() => {
			void fetchData();
		}, POLL_INTERVAL);
		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current);
		};
	}, [fetchData]);

	const filteredClaims =
		filter === "ALL" ? claims : claims.filter((c) => c.status === filter);

	const stats = [
		{ label: "Total Claims", value: claims.length, accent: "#7DC542" },
		{
			label: "Pending",
			value: claims.filter((c) => c.status === "PENDING").length,
			accent: "#F59E0B",
		},
		{
			label: "Accepted",
			value: claims.filter((c) => c.status === "ACCEPTED").length,
			accent: "#10B981",
		},
		{
			label: "Rejected",
			value: claims.filter((c) => c.status === "REJECTED").length,
			accent: "#F43F5E",
		},
	];

	return (
		<DashboardLayout>
			<div className="space-y-6">
				{/* ── Header ── */}
				<div className="rounded-2xl border border-white/10 bg-white/5 p-6">
					<p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7DC542]">
						My Donation Claims
					</p>
					<h2 className="mt-2 text-2xl font-black text-[#F0EBE1]">
						Track your claim requests on available donations.
					</h2>
					<p className="mt-2 text-sm text-[#F0EBE1]/65">
						View the status of claims you&apos;ve submitted to donation
						providers.
					</p>
				</div>

				{/* ── Stats ── */}
				<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
					{stats.map(({ label, value, accent }) => (
						<div
							key={label}
							className="rounded-xl border border-white/10 bg-white/5 px-5 py-4"
						>
							<p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#F0EBE1]/60">
								{label}
							</p>
							<p className="mt-1 text-3xl font-black" style={{ color: accent }}>
								{value}
							</p>
						</div>
					))}
				</div>

				{/* ── Filters ── */}
				<div className="flex flex-wrap gap-2">
					{FILTERS.map(({ label, value }) => (
						<button
							key={value}
							type="button"
							onClick={() => setFilter(value)}
							className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] transition ${
								filter === value
									? "bg-[#7DC542]/20 text-[#7DC542]"
									: "bg-white/5 text-[#F0EBE1]/55 hover:bg-white/10 hover:text-[#F0EBE1]"
							}`}
						>
							{label}
						</button>
					))}
				</div>

				{error ? (
					<div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-100">
						{error}
					</div>
				) : null}

				{/* ── Claims List ── */}
				{loading ? (
					<div className="space-y-3">
						{[1, 2, 3].map((i) => (
							<div key={i} className="skeleton-shimmer h-[120px]" />
						))}
					</div>
				) : filteredClaims.length === 0 ? (
					<div className="rounded-2xl border border-dashed border-white/15 bg-white/5 px-6 py-12 text-center">
						<h3 className="text-lg font-bold text-[#F0EBE1]">
							No claims found
						</h3>
						<p className="mt-2 text-sm text-[#F0EBE1]/55">
							{filter === "ALL"
								? "You haven't submitted any claims yet. Browse available donations to get started."
								: `No ${filter.toLowerCase()} claims.`}
						</p>
					</div>
				) : (
					<div className="space-y-4">
						{filteredClaims.map((claim) => {
							const donation = donations.get(claim.donationId);
							return (
								<article
									key={claim.claimId}
									className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-white/15"
								>
									<div className="flex flex-wrap items-start justify-between gap-3">
										<div>
											<p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7DC542]">
												Claim #{claim.claimId}
											</p>
											<h3 className="mt-1 text-lg font-bold text-[#F0EBE1]">
												{donation?.foodType ?? `Donation #${claim.donationId}`}
											</h3>
										</div>
										<span
											className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${STATUS_CLASSES[claim.status]}`}
										>
											{claim.status}
										</span>
									</div>

									<div className="mt-4 grid gap-2 text-sm text-[#F0EBE1]/70 sm:grid-cols-3">
										{donation ? (
											<>
												<div className="flex items-center justify-between gap-2 sm:flex-col sm:items-start">
													<span className="text-[#F0EBE1]/50">Quantity</span>
													<span className="font-bold text-[#F0EBE1]">
														{donation.quantity} {donation.unit}
													</span>
												</div>
												<div className="flex items-center justify-between gap-2 sm:flex-col sm:items-start">
													<span className="text-[#F0EBE1]/50">Pickup</span>
													<span className="font-medium text-[#F0EBE1]">
														{donation.pickupAddress}
													</span>
												</div>
											</>
										) : null}
										<div className="flex items-center justify-between gap-2 sm:flex-col sm:items-start">
											<span className="text-[#F0EBE1]/50">Claimed on</span>
											<span className="font-medium text-[#F0EBE1]">
												{formatDate(claim.createdAt)}
											</span>
										</div>
									</div>

									{claim.status === "PENDING" ? (
										<p className="mt-4 rounded-lg bg-amber-500/10 px-3 py-2 text-center text-xs font-bold uppercase tracking-[0.08em] text-amber-300">
											⏳ Awaiting donor approval
										</p>
									) : claim.status === "ACCEPTED" ? (
										<p className="mt-4 rounded-lg bg-emerald-500/10 px-3 py-2 text-center text-xs font-bold uppercase tracking-[0.08em] text-emerald-300">
											✓ Donor accepted — proceed with collection
										</p>
									) : (
										<p className="mt-4 rounded-lg bg-rose-500/10 px-3 py-2 text-center text-xs font-bold uppercase tracking-[0.08em] text-rose-300">
											✕ Donor declined this claim
										</p>
									)}
								</article>
							);
						})}
					</div>
				)}
			</div>
		</DashboardLayout>
	);
}
