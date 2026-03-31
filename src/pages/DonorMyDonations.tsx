// modified: added DonorNotificationPanel with polling, added ACCEPTED status filter
import { useCallback, useEffect, useRef, useState } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import DonationHistory from "../components/dashboard/DonationHistory";
import DonorNotificationPanel from "../components/dashboard/DonorNotificationPanel";
import { getMyDonations } from "../services/donationService";
import type { Donation } from "../types/Dashboard";

const POLL_INTERVAL = 10_000; // 10 seconds

export default function DonorMyDonations() {
	const [loading, setLoading] = useState(true);
	const [donations, setDonations] = useState<Donation[]>([]);
	const [error, setError] = useState<string | null>(null);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const fetchDonations = useCallback(async (): Promise<void> => {
		try {
			const data = await getMyDonations();
			setDonations(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load donations.");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void fetchDonations();
	}, [fetchDonations]);

	// Poll every 10s for status updates (Flow 1 notifications)
	useEffect(() => {
		intervalRef.current = setInterval(() => {
			void fetchDonations();
		}, POLL_INTERVAL);

		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current);
		};
	}, [fetchDonations]);

	return (
		<DashboardLayout>
			<div className="space-y-6">
				<div>
					<h2 className="text-xl font-bold text-[#F0EBE1]">My Donations</h2>
					<p className="mt-1 text-sm text-[#F0EBE1]/65">
						View, filter, and manage all your donation listings.
					</p>
				</div>

				{/* Flow 1 — Notification panel for incoming requests */}
				{!loading && donations.some((d) => d.status === "REQUESTED") ? (
					<DonorNotificationPanel donations={donations} onRefresh={fetchDonations} />
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
					<DonationHistory donations={donations} onRefresh={fetchDonations} />
				)}
			</div>
		</DashboardLayout>
	);
}
