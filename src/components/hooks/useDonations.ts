// new: hook for donation data fetching with polling support
import { useCallback, useEffect, useRef, useState } from "react";
import type { Donation } from "../../types/Dashboard";
import {
	getMyDonations,
	getAvailableDonations,
	type AvailableDonationsParams,
} from "../../services/donationService";

interface UseDonationsOptions {
	/** Polling interval in ms. Pass 0 or undefined to disable polling. */
	pollInterval?: number;
}

interface UseDonationsResult {
	donations: Donation[];
	loading: boolean;
	error: string | null;
	refresh: () => Promise<void>;
	setDonations: React.Dispatch<React.SetStateAction<Donation[]>>;
}

/**
 * Hook to fetch the current user's donations with optional polling.
 */
export function useMyDonations(
	options?: UseDonationsOptions,
): UseDonationsResult {
	const [donations, setDonations] = useState<Donation[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const refresh = useCallback(async () => {
		try {
			const data = await getMyDonations();
			setDonations(data);
			setError(null);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to load donations.",
			);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void refresh();
	}, [refresh]);

	useEffect(() => {
		if (!options?.pollInterval) return undefined;

		intervalRef.current = setInterval(() => {
			void refresh();
		}, options.pollInterval);

		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current);
		};
	}, [options?.pollInterval, refresh]);

	return { donations, loading, error, refresh, setDonations };
}

/**
 * Hook to fetch available donations (Flow 1 — Center side).
 */
export function useAvailableDonations(
	params?: AvailableDonationsParams,
	options?: UseDonationsOptions,
): UseDonationsResult {
	const [donations, setDonations] = useState<Donation[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const refresh = useCallback(async () => {
		try {
			const data = await getAvailableDonations(params);
			setDonations(data);
			setError(null);
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Failed to load available donations.",
			);
		} finally {
			setLoading(false);
		}
	}, [params]);

	useEffect(() => {
		void refresh();
	}, [refresh]);

	useEffect(() => {
		if (!options?.pollInterval) return undefined;

		intervalRef.current = setInterval(() => {
			void refresh();
		}, options.pollInterval);

		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current);
		};
	}, [options?.pollInterval, refresh]);

	return { donations, loading, error, refresh, setDonations };
}
