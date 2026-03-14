import axios from "axios";
import apiClient from "../api/axiosSetup";
import { getCurrentUser } from "./authService";
import type { CreateDonationPayload, Donation, DonationStatus } from "../types/Dashboard";

interface DonationApiResponse {
	donation_id?: number;
	donationId?: number;
	food_type?: string;
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
}

interface DonationsListResponse {
	items?: DonationApiResponse[];
	donations?: DonationApiResponse[];
	data?: DonationApiResponse[];
}

function getDonationCacheKey(): string | null {
	const user = getCurrentUser();
	if (!user) return null;
	const identity = user.userId ?? user.email;
	if (!identity) return null;
	return `restroplate_donations_${identity}`;
}

function readCachedDonations(): Donation[] {
	try {
		const key = getDonationCacheKey();
		if (!key) return [];
		const raw = localStorage.getItem(key);
		if (!raw) return [];
		const parsed = JSON.parse(raw) as Donation[];
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

function writeCachedDonations(donations: Donation[]): void {
	try {
		const key = getDonationCacheKey();
		if (!key) return;
		localStorage.setItem(key, JSON.stringify(donations));
	} catch {
		// Ignore cache write failures and keep runtime flow intact.
	}
}

function mergeDonations(primary: Donation[], secondary: Donation[]): Donation[] {
	const merged = new Map<number, Donation>();
	for (const donation of secondary) {
		merged.set(donation.donation_id, donation);
	}
	for (const donation of primary) {
		merged.set(donation.donation_id, donation);
	}
	return Array.from(merged.values()).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

function extractErrorMessage(err: unknown, fallback: string): string {
	if (axios.isAxiosError(err)) {
		const data = err.response?.data as { message?: string; title?: string } | undefined;
		if (data?.message) return data.message;
		if (data?.title) return data.title;
	}
	if (err instanceof Error) return err.message;
	return fallback;
}

function normalizeStatus(status: string | undefined): DonationStatus {
	if (status === "REQUESTED") return "REQUESTED";
	if (status === "COLLECTED") return "COLLECTED";
	return "AVAILABLE";
}

function mapDonationResponse(data: DonationApiResponse, payload?: CreateDonationPayload): Donation {
	return {
		donation_id: data.donation_id ?? data.donationId ?? Date.now(),
		food_type: data.food_type ?? data.foodType ?? payload?.foodType ?? "Donation",
		description: data.description ?? (payload ? `Surplus ${payload.foodType}` : "Surplus food donation"),
		quantity: data.quantity ?? payload?.quantity ?? 0,
		unit: data.unit ?? payload?.unit ?? "",
		expiry_date: data.expiry_date ?? data.expirationDate ?? payload?.expirationDate ?? "",
		pickup_location: data.pickup_location ?? data.pickupAddress ?? payload?.pickupAddress ?? "",
		availability_time: data.availability_time ?? data.availabilityTime ?? payload?.availabilityTime ?? "",
		status: normalizeStatus(data.status),
		created_at: data.created_at ?? data.createdAt ?? new Date().toISOString(),
	};
}

function extractDonationsList(data: DonationApiResponse[] | DonationsListResponse): DonationApiResponse[] {
	if (Array.isArray(data)) return data;
	if (Array.isArray(data.items)) return data.items;
	if (Array.isArray(data.donations)) return data.donations;
	if (Array.isArray(data.data)) return data.data;
	return [];
}

export async function getMyDonations(): Promise<Donation[]> {
	try {
		const { data } = await apiClient.get<DonationApiResponse[] | DonationsListResponse>("/api/donations/me");
		const serverDonations = extractDonationsList(data).map((item) => mapDonationResponse(item));
		const mergedDonations = mergeDonations(serverDonations, readCachedDonations());
		writeCachedDonations(mergedDonations);
		return mergedDonations;
	} catch (err) {
		if (axios.isAxiosError(err) && err.response?.status === 405) {
			return readCachedDonations();
		}
		throw new Error(extractErrorMessage(err, "Failed to load donations. Please try again."));
	}
}

export async function createDonation(payload: CreateDonationPayload): Promise<Donation> {
	try {
		const { data } = await apiClient.post<DonationApiResponse>("/api/donations", payload);
		const createdDonation = mapDonationResponse(data, payload);
		writeCachedDonations(mergeDonations([createdDonation], readCachedDonations()));
		return createdDonation;
	} catch (err) {
		throw new Error(extractErrorMessage(err, "Failed to create donation. Please try again."));
	}
}
