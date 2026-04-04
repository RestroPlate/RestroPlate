// modified: fetches donation claims and passes to DonorNotificationPanel
import { useCallback, useEffect, useRef, useState } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import DonationHistory from "../components/dashboard/DonationHistory";
import DonorNotificationPanel from "../components/dashboard/DonorNotificationPanel";
import { getMyDonations } from "../services/donationService";
import { getMyClaims } from "../services/claimService";
import type { Donation, DonationClaim } from "../types/Dashboard";

const POLL_INTERVAL = 10_000; // 10 seconds

export default function DonorMyDonations() {
	const [loading, setLoading] = useState(true);
	const [donations, setDonations] = useState<Donation[]>([]);
	const [claims, setClaims] = useState<DonationClaim[]>([]);
	const [error, setError] = useState<string | null>(null);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const fetchData = useCallback(async (): Promise<void> => {
		try {
			const [donationsData, claimsData] = await Promise.all([
				getMyDonations(),
				getMyClaims(),
			]);
			setDonations(donationsData);
			setClaims(claimsData);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load donations.");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void fetchData();
	}, [fetchData]);

	// Poll every 10s for status updates (claim notifications)
	useEffect(() => {
		intervalRef.current = setInterval(() => {
			void fetchData();
		}, POLL_INTERVAL);

		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current);
		};
	}, [fetchData]);

	const pendingClaims = claims.filter((c) => c.status === "PENDING");

	return (
		<DashboardLayout>
			<div className="space-y-6">
				<div>
					<h2 className="text-xl font-bold text-[#F0EBE1]">My Donations</h2>
					<p className="mt-1 text-sm text-[#F0EBE1]/65">
						View, filter, and manage all your donation listings.
					</p>
				</div>

				{/* Flow 1 — Notification panel for incoming claim requests */}
				{!loading && pendingClaims.length > 0 ? (
					<DonorNotificationPanel claims={claims} donations={donations} onRefresh={fetchData} />
				) : null}

				{loading ? (
					<div className="space-y-3">
						<div className="skeleton-shimmer h-[100px]" />
						<div className="skeleton-shimmer h-[100px]" />
						<div className="skeleton-shimmer h-[100px]" />
					</div>
				) : error ? (
					<div className="rounded-xl border border-rose-400/35 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-100" role="alert">
						{error}
					</div>
				) : (
					<DonationHistory donations={donations} onRefresh={fetchData} />
				)}
			</div>
		</DashboardLayout>
	);
}
