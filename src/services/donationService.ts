import axios from "axios";
import apiClient from "../api/axiosSetup";
import type { CreateDonationPayload, Donation, DonationStatus, UpdateDonationPayload } from "../types/Dashboard";

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
	if (status === "COMPLETED") return "COMPLETED";
	if (status === "REQUESTED") return "REQUESTED";
	if (status === "COLLECTED") return "COLLECTED";
	return "AVAILABLE";
}

let mockIdCounter = Date.now();
function generateMockId() {
	return mockIdCounter++;
}

function mapDonationResponse(data: DonationApiResponse | undefined | null, payload?: Partial<CreateDonationPayload>): Donation {
	if (!data) data = {};
	return {
		donationId: data.donation_id ?? data.donationId ?? generateMockId(),
		donationRequestId: data.donationRequestId,
		providerUserId: data.providerUserId ?? 0,
		foodType: data.foodType ?? payload?.foodType ?? "Unknown",
		quantity: data.quantity ?? payload?.quantity ?? 1,
		unit: data.unit ?? payload?.unit ?? "Unit",
		expirationDate: data.expiry_date ?? data.expirationDate ?? payload?.expirationDate ?? new Date().toISOString(),
		pickupAddress: data.pickup_location ?? data.pickupAddress ?? payload?.pickupAddress ?? "Unknown",
		availabilityTime: data.availability_time ?? data.availabilityTime ?? payload?.availabilityTime ?? "Unknown",
		status: normalizeStatus(data.status),
		createdAt: data.created_at ?? data.createdAt ?? new Date().toISOString(),
	};
}

interface DonationsListResponse {
	items?: DonationApiResponse[];
	donations?: DonationApiResponse[];
	data?: DonationApiResponse[];
}

const CACHE_KEY = "donations_cache";

function readCachedDonations(): Donation[] {
	try {
		const parsed = JSON.parse(localStorage.getItem(CACHE_KEY) || "[]");
		if (Array.isArray(parsed)) {
			return parsed.filter(d => d && d.donationId != null && d.foodType);
		}
		return [];
	} catch {
		return [];
	}
}

function writeCachedDonations(donations: Donation[]): void {
	localStorage.setItem(CACHE_KEY, JSON.stringify(donations));
}

function mergeDonations(server: Donation[], cached: Donation[]): Donation[] {
	const map = new Map<number, Donation>();
	cached.forEach(d => {
		if (d && d.donationId != null) map.set(d.donationId, d);
	});
	server.forEach(d => {
		if (d && d.donationId != null) map.set(d.donationId, d);
	});
	return Array.from(map.values());
}

function extractDonationsList(data: any): DonationApiResponse[] {
	if (!data) return [];
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

export async function getAllDonations(status?: string): Promise<Donation[]> {
	try {
		const params = status ? { status } : {};
		const { data } = await apiClient.get<DonationApiResponse[] | DonationsListResponse>("/api/donations", { params });
		return extractDonationsList(data).map((item) => mapDonationResponse(item));
	} catch (err) {
		throw new Error(extractErrorMessage(err, "Failed to load donations. Please try again."));
	}
}

export interface AvailableDonationsParams {
	location?: string;
	foodType?: string;
	sortBy?: string;
	status?: string;
}

export async function getAvailableDonations(params?: AvailableDonationsParams): Promise<Donation[]> {
	try {
		const queryParams = { status: "AVAILABLE", ...params };
		const { data } = await apiClient.get<DonationApiResponse[] | DonationsListResponse>("/api/donations/available", { params: queryParams });
		return extractDonationsList(data).map((item) => mapDonationResponse(item));
	} catch (err) {
		throw new Error(extractErrorMessage(err, "Failed to load available donations. Please try again."));
	}
}

export async function createDonation(payload: CreateDonationPayload): Promise<Donation> {
	try {
		const { data } = await apiClient.post<DonationApiResponse>("/api/donations", payload);
		return mapDonationResponse(data, payload);
	} catch (err) {
		throw new Error(extractErrorMessage(err, "Failed to create donation. Please try again."));
	}
}

export async function updateDonation(id: number, payload: UpdateDonationPayload): Promise<Donation> {
	try {
		const { data } = await apiClient.put<DonationApiResponse>(`/api/donations/${id}`, payload);
		const updatedDonation = mapDonationResponse(data);
		const cached = readCachedDonations().map((d) =>
			d.donationId === id ? updatedDonation : d,
		);
		writeCachedDonations(cached);
		return updatedDonation;
	} catch (err) {
		throw new Error(extractErrorMessage(err, "Failed to update donation. Please try again."));
	}
}

export async function deleteDonation(id: number): Promise<void> {
	try {
		await apiClient.delete(`/api/donations/${id}`);
		const cached = readCachedDonations().filter((d) => d.donationId !== id);
		writeCachedDonations(cached);
	} catch (err) {
		throw new Error(extractErrorMessage(err, "Failed to delete donation. Please try again."));
	}
}
