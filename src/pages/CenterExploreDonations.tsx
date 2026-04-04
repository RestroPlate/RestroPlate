// modified: uses donation-claims API instead of direct requestDonation
import { useCallback, useEffect, useRef, useState } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import CollectDonationAction from "../components/dashboard/CollectDonationAction";
import DCInventoryTable from "../components/dashboard/DCInventoryTable";
import StatusNotice from "../components/StatusNotice";
import { getAvailableDonations } from "../services/donationService";
import { createClaim, getMyClaims } from "../services/claimService";
import type { Donation, DonationStatus } from "../types/Dashboard";

const POLL_INTERVAL = 10_000;

function formatDate(value: string): string {
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) return value;
	return parsed.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

const STATUS_CLASSES: Record<DonationStatus, string> = {
	AVAILABLE: "bg-emerald-500/15 text-emerald-300",
	REQUESTED: "bg-amber-500/15 text-amber-300",
	ACCEPTED: "bg-sky-500/15 text-sky-300",
	COLLECTED: "bg-sky-500/15 text-sky-300",
	COMPLETED: "bg-violet-500/15 text-violet-300",
};

export default function CenterExploreDonations() {
	const [donations, setDonations] = useState<Donation[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [requestingId, setRequestingId] = useState<number | null>(null);
	const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);
	const [inventoryRefreshKey, setInventoryRefreshKey] = useState(0);
	const [foodTypeFilter, setFoodTypeFilter] = useState("");
	const [locationFilter, setLocationFilter] = useState("");
	const [claimedDonationIds, setClaimedDonationIds] = useState<Set<number>>(new Set());
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const fetchDonations = useCallback(async () => {
		try {
			const data = await getAvailableDonations({
				foodType: foodTypeFilter || undefined,
				location: locationFilter || undefined,
			});
			setDonations(data);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load available donations.");
		} finally {
			setLoading(false);
		}
	}, [foodTypeFilter, locationFilter]);

	// Fetch existing claims to know which donations are already claimed
	const fetchMyClaims = useCallback(async () => {
		try {
			const claims = await getMyClaims();
			const pendingIds = new Set(claims.filter((c) => c.status === "PENDING").map((c) => c.donationId));
			setClaimedDonationIds(pendingIds);
		} catch {
			// silently fail, claim badges won't show
		}
	}, []);

	useEffect(() => {
		const timeoutId = window.setTimeout(() => {
			void fetchDonations();
			void fetchMyClaims();
		}, 250);
		return () => window.clearTimeout(timeoutId);
	}, [fetchDonations, fetchMyClaims]);

	// Poll for status updates (donor accepting/rejecting)
	useEffect(() => {
		intervalRef.current = setInterval(() => {
			void fetchDonations();
		}, POLL_INTERVAL);
		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current);
		};
	}, [fetchDonations]);

	async function handleRequest(donationId: number): Promise<void> {
		setRequestingId(donationId);
		setNotice(null);
		try {
			await createClaim(donationId);
			// Optimistically track the claim
			setClaimedDonationIds((prev) => new Set(prev).add(donationId));
			setNotice({ type: "success", message: "Claim sent — waiting for donor approval." });
		} catch (err) {
			setNotice({ type: "error", message: err instanceof Error ? err.message : "Failed to send claim." });
		} finally {
			setRequestingId(null);
		}
	}

	function handleCollected(): void {
		setNotice({ type: "success", message: "Donation collected and added to inventory!" });
		setInventoryRefreshKey((k) => k + 1);
		void fetchDonations();
	}

	return (
		<DashboardLayout>
			<div className="space-y-6">
				{/* ── Header ── */}
				<div className="rounded-2xl border border-white/10 bg-white/5 p-6">
					<p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7DC542]">
						Flow 1 — Available Donations
					</p>
					<h2 className="mt-2 text-2xl font-black text-[#F0EBE1]">
						Browse and request standalone donations from providers.
					</h2>
					<p className="mt-2 text-sm text-[#F0EBE1]/65">
						Request a donation, wait for donor approval, then mark it as collected.
					</p>
				</div>

				{/* ── Filters ── */}
				<div className="grid gap-4 md:grid-cols-2">
					<label className="space-y-2">
						<span className="text-sm font-bold text-[#F0EBE1]">Food Type</span>
						<input
							type="text"
							value={foodTypeFilter}
							onChange={(e) => setFoodTypeFilter(e.target.value)}
							placeholder="Rice, bread, vegetables"
							className="auth-input w-full"
						/>
					</label>
					<label className="space-y-2">
						<span className="text-sm font-bold text-[#F0EBE1]">Location</span>
						<input
							type="text"
							value={locationFilter}
							onChange={(e) => setLocationFilter(e.target.value)}
							placeholder="Colombo, Kandy"
							className="auth-input w-full"
						/>
					</label>
				</div>

				{notice ? (
					<StatusNotice type={notice.type} message={notice.message} onClose={() => setNotice(null)} />
				) : null}

				{error ? (
					<div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-100">
						{error}
					</div>
				) : null}

				{/* ── Donation Cards ── */}
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
							Adjust the filters, or check back after providers post new donations.
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
									<span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${STATUS_CLASSES[donation.status]}`}>
										{donation.status}
									</span>
								</div>

								<div className="mt-5 flex-1 space-y-3 text-sm text-[#F0EBE1]/70">
									<div className="flex items-center justify-between gap-3">
										<span>Quantity</span>
										<span className="font-bold text-[#F0EBE1]">
											{donation.quantity} {donation.unit}
										</span>
									</div>
									<div className="flex items-center justify-between gap-3">
										<span>Pickup</span>
										<span className="max-w-[13rem] text-right font-medium text-[#F0EBE1]">
											{donation.pickupAddress}
										</span>
									</div>
									<div className="flex items-center justify-between gap-3">
										<span>Expires</span>
										<span className="font-medium text-[#F0EBE1]">
											{formatDate(donation.expirationDate)}
										</span>
									</div>
								</div>

								{/* Flow 1 Action Buttons */}
								{claimedDonationIds.has(donation.donationId) ? (
									<p className="mt-6 rounded-lg bg-amber-500/10 px-3 py-2.5 text-center text-xs font-bold uppercase tracking-[0.08em] text-amber-300">
										Claim Pending — awaiting donor approval
									</p>
								) : donation.status === "AVAILABLE" ? (
									<button
										type="button"
										disabled={requestingId === donation.donationId}
										onClick={() => handleRequest(donation.donationId)}
										className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#7DC542] px-4 py-3 text-sm font-black text-[#0B1A08] transition hover:bg-[#90D85A] disabled:cursor-not-allowed disabled:opacity-60"
									>
										{requestingId === donation.donationId ? "Claiming..." : "Claim"}
									</button>
								) : donation.status === "ACCEPTED" ? (
									<CollectDonationAction
										donationId={donation.donationId}
										quantity={donation.quantity}
										unit={donation.unit}
										onCollected={handleCollected}
									/>
								) : null}
							</article>
						))}
					</div>
				)}

				{/* ── DC Inventory Table ── */}
				<div className="space-y-3">
					<h3 className="text-lg font-bold text-[#F0EBE1]">Collected Inventory</h3>
					<DCInventoryTable refreshKey={inventoryRefreshKey} />
				</div>
			</div>
		</DashboardLayout>
	);
}
