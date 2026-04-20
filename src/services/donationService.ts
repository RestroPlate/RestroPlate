import axios from "axios";
import apiClient from "../api/axiosSetup";
import { getCurrentUser } from "./authService";
import type {
	CreateDonationPayload,
	Donation,
	DonationImage,
	DonationStatus,
	UpdateDonationPayload,
} from "../types/Dashboard";

// ── Types & Interfaces ───────────────────────────────────────────────────────

interface DonationApiResponse {
	donation_id?: number;
	donationId?: number;
	donationRequestId?: number;
	providerUserId?: number;
	foodType?: string;
	description?: string;
	quantity?: number;
	unit?: string;
	expiry_date?: string;
	expirationDate?: string;
	pickup_location?: string;
	pickupAddress?: string;
	availability_time?: string;
	availabilityTime?: string;
	status?: string;
	created_at?: string;
	createdAt?: string;
	claimedByCenterUserId?: number | null;
	centerDetails?: {
		userId: number;
		name: string;
		email: string;
		phoneNumber: string;
		address: string;
	};
	images?: Array<{
		imageId: number;
		donationId: number;
		imageUrl: string;
		fileName: string;
		uploadedAt: string;
	}>;
}

interface DonationsListResponse {
	items?: DonationApiResponse[];
	donations?: DonationApiResponse[];
	data?: DonationApiResponse[];
}

export interface AvailableDonationsParams {
	location?: string;
	foodType?: string;
	sortBy?: string;
	status?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Extracts a human-readable error message from an API error.
 */
function extractErrorMessage(err: unknown, fallback: string): string {
	if (axios.isAxiosError(err)) {
		const data = err.response?.data as
			| { message?: string; title?: string }
			| undefined;
		if (data?.message) return data.message;
		if (data?.title) return data.title;
	}
	if (err instanceof Error) return err.message;
	return fallback;
}

/**
 * Maps a single API donation item to our frontend Donation type.
 */
function mapDonationResponse(
	data: DonationApiResponse | undefined | null,
	payload?: Partial<CreateDonationPayload>,
): Donation {
	if (!data) data = {};
	return {
		donationId: data.donation_id ?? data.donationId ?? generateMockId(),
		donationRequestId: data.donationRequestId,
		providerUserId: data.providerUserId ?? 0,
		foodType: data.foodType ?? payload?.foodType ?? "Unknown",
		description: data.description ?? "",
		quantity: data.quantity ?? payload?.quantity ?? 1,
		unit: data.unit ?? payload?.unit ?? "Unit",
		expirationDate:
			data.expiry_date ??
			data.expirationDate ??
			payload?.expirationDate ??
			new Date().toISOString(),
		pickupAddress:
			data.pickup_location ??
			data.pickupAddress ??
			payload?.pickupAddress ??
			"Unknown",
		availabilityTime:
			data.availability_time ??
			data.availabilityTime ??
			payload?.availabilityTime ??
			"Unknown",
		status: normalizeStatus(data.status),
		createdAt: data.created_at ?? data.createdAt ?? new Date().toISOString(),
		claimedByCenterUserId: data.claimedByCenterUserId ?? null,
		centerDetails: data.centerDetails,
		images: (data.images ?? []).map(
			(img): DonationImage => ({
				imageId: img.imageId,
				donationId: img.donationId,
				imageUrl: img.imageUrl,
				fileName: img.fileName,
				uploadedAt: img.uploadedAt,
			}),
		),
	};
}

/**
 * Normalizes different backend status strings to our DonationStatus union.
 */
function normalizeStatus(status: string | undefined): DonationStatus {
	const s = status?.toUpperCase();
	if (s === "COMPLETED") return "COMPLETED";
	if (s === "REQUESTED") return "REQUESTED";
	if (s === "COLLECTED") return "COLLECTED";
	return "AVAILABLE";
}

/**
 * Extracts a list of donation items from various response formats.
 */
function extractDonationsList(data: any): DonationApiResponse[] {
	if (!data) return [];
	if (Array.isArray(data)) return data;
	if (Array.isArray(data.items)) return data.items;
	if (Array.isArray(data.donations)) return data.donations;
	if (Array.isArray(data.data)) return data.data;
	return [];
}

// ── Caching Logic ────────────────────────────────────────────────────────────

let mockIdCounter = Date.now();
function generateMockId() {
	return mockIdCounter++;
}

/**
 * Returns a user-specific cache key for donations.
 */
function getDonationCacheKey(): string | null {
	const user = getCurrentUser();
	if (!user) return null;
	const identity = user.userId ?? user.email;
	if (!identity) return null;
	return `restroplate_donations_${identity}`;
}

/**
 * Reads cached donations from localStorage.
 */
function readCachedDonations(): Donation[] {
	try {
		const key = getDonationCacheKey();
		if (!key) return [];
		const parsed = JSON.parse(localStorage.getItem(key) || "[]");
		if (Array.isArray(parsed)) {
			return parsed.filter((d) => d && d.donationId != null && d.foodType);
		}
		return [];
	} catch {
		return [];
	}
}

/**
 * Writes donations to user-specific localStorage cache.
 */
function writeCachedDonations(donations: Donation[]): void {
	try {
		const key = getDonationCacheKey();
		if (!key) return;
		localStorage.setItem(key, JSON.stringify(donations));
	} catch {
		// ignore
	}
}

/**
 * Merges server-side donations with locally cached ones, prioritizing server data.
 */
function mergeDonations(server: Donation[], cached: Donation[]): Donation[] {
	const map = new Map<number, Donation>();
	cached.forEach((d) => {
		if (d && d.donationId != null) map.set(d.donationId, d);
	});
	server.forEach((d) => {
		if (d && d.donationId != null) map.set(d.donationId, d);
	});
	return Array.from(map.values()).sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
	);
}

// ── API Functions ────────────────────────────────────────────────────────────

/**
 * Fetches donations provided by the current user.
 * Merges with cache for offline/instant feel.
 */
export async function getMyDonations(): Promise<Donation[]> {
	try {
		const { data } = await apiClient.get<
			DonationApiResponse[] | DonationsListResponse
		>("/api/donations/me");
		const serverDonations = extractDonationsList(data).map((item) =>
			mapDonationResponse(item),
		);
		const merged = mergeDonations(serverDonations, readCachedDonations());
		writeCachedDonations(merged);
		return merged;
	} catch (err) {
		// If 405 or other network errors, fallback to cache
		if (
			axios.isAxiosError(err) &&
			(err.response?.status === 405 || !err.response)
		) {
			return readCachedDonations();
		}
		throw new Error(
			extractErrorMessage(err, "Failed to load donations. Please try again."),
		);
	}
}

/**
 * Fetches all donations, optionally filtered by status.
 */
export async function getAllDonations(status?: string): Promise<Donation[]> {
	try {
		const params = status ? { status } : {};
		const { data } = await apiClient.get<
			DonationApiResponse[] | DonationsListResponse
		>("/api/donations", { params });
		return extractDonationsList(data).map((item) => mapDonationResponse(item));
	} catch (err) {
		throw new Error(
			extractErrorMessage(err, "Failed to load donations. Please try again."),
		);
	}
}

/**
 * Fetches available donations (those that can be requested).
 */
export async function getAvailableDonations(
	params?: AvailableDonationsParams,
): Promise<Donation[]> {
	try {
		const queryParams = { ...params };
		const { data } = await apiClient.get<
			DonationApiResponse[] | DonationsListResponse
		>("/api/donations/available", { params: queryParams });
		return extractDonationsList(data).map((item) => mapDonationResponse(item));
	} catch (err) {
		throw new Error(
			extractErrorMessage(
				err,
				"Failed to load available donations. Please try again.",
			),
		);
	}
}

/**
 * Creates a new donation.
 */
export async function createDonation(
	payload: CreateDonationPayload,
): Promise<Donation> {
	try {
		const { data } = await apiClient.post<DonationApiResponse>(
			"/api/donations",
			payload,
		);
		const createdDonation = mapDonationResponse(data, payload);

		// Update cache
		const currentCache = readCachedDonations();
		writeCachedDonations(mergeDonations([createdDonation], currentCache));

		return createdDonation;
	} catch (err) {
		throw new Error(
			extractErrorMessage(err, "Failed to create donation. Please try again."),
		);
	}
}

/**
 * Updates an existing donation.
 */
export async function updateDonation(
	id: number,
	payload: UpdateDonationPayload,
): Promise<Donation> {
	try {
		const { data } = await apiClient.put<DonationApiResponse>(
			`/api/donations/${id}`,
			payload,
		);
		const updatedDonation = mapDonationResponse(data);

		// Update cache
		const cached = readCachedDonations().map((d) =>
			d.donationId === id ? updatedDonation : d,
		);
		writeCachedDonations(cached);

		return updatedDonation;
	} catch (err) {
		throw new Error(
			extractErrorMessage(err, "Failed to update donation. Please try again."),
		);
	}
}

/**
 * Deletes a donation.
 */
export async function deleteDonation(id: number): Promise<void> {
	try {
		await apiClient.delete(`/api/donations/${id}`);

		// Remove from cache
		const cached = readCachedDonations().filter((d) => d.donationId !== id);
		writeCachedDonations(cached);
	} catch (err) {
		throw new Error(
			extractErrorMessage(err, "Failed to delete donation. Please try again."),
		);
	}
}

// ── Flow 1 Status Transition Functions ───────────────────────────────────────
// new: status transition endpoints for Flow 1 lifecycle

/**
 * Center requests a donation (Flow 1). AVAILABLE → REQUESTED.
 */
export async function requestDonation(id: number): Promise<Donation> {
	try {
		const { data } = await apiClient.patch<DonationApiResponse>(
			`/api/donations/${id}/request`,
		);
		return mapDonationResponse(data);
	} catch (err) {
		throw new Error(extractErrorMessage(err, "Failed to request donation."));
	}
}

/**
 * Center marks a donation as collected (Flow 1 & Flow 2). ACCEPTED → COLLECTED.
 */
export async function collectDonation(
	id: number,
	collectedAmount: number,
): Promise<Donation> {
	try {
		const { data } = await apiClient.patch<DonationApiResponse>(
			`/api/donations/${id}/collect`,
			{
				collected_amount: collectedAmount,
			},
		);
		return mapDonationResponse(data);
	} catch (err) {
		throw new Error(
			extractErrorMessage(err, "Failed to mark donation as collected."),
		);
	}
}
