// new: hook for donation request data fetching
import { useCallback, useEffect, useState } from "react";
import type {
	DonationRequest,
	DonationRequestStatus,
} from "../../types/Dashboard";
import {
	getAvailableRequests,
	getCenterOutgoingRequests,
} from "../../services/donationRequestService";

interface UseDonationRequestsResult {
	requests: DonationRequest[];
	loading: boolean;
	error: string | null;
	refresh: () => Promise<void>;
	setRequests: React.Dispatch<React.SetStateAction<DonationRequest[]>>;
}

/**
 * Hook to fetch available donation requests (Flow 2 — Donor side).
 */
export function useAvailableRequests(
	status?: DonationRequestStatus,
): UseDonationRequestsResult {
	const [requests, setRequests] = useState<DonationRequest[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const refresh = useCallback(async () => {
		try {
			const data = await getAvailableRequests(status);
			setRequests(data);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load requests.");
		} finally {
			setLoading(false);
		}
	}, [status]);

	useEffect(() => {
		void refresh();
	}, [refresh]);

	return { requests, loading, error, refresh, setRequests };
}

/**
 * Hook to fetch a center's outgoing requests (Flow 2 — Center side).
 */
export function useCenterOutgoingRequests(
	status?: DonationRequestStatus,
): UseDonationRequestsResult {
	const [requests, setRequests] = useState<DonationRequest[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const refresh = useCallback(async () => {
		try {
			const data = await getCenterOutgoingRequests(status);
			setRequests(data);
			setError(null);
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Failed to load outgoing requests.",
			);
		} finally {
			setLoading(false);
		}
	}, [status]);

	useEffect(() => {
		void refresh();
	}, [refresh]);

	return { requests, loading, error, refresh, setRequests };
}
