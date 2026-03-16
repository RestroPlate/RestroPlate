import axios from "axios";
import apiClient from "../api/axiosSetup";
<<<<<<< Updated upstream
import type { CreateDonationPayload, Donation, DonationStatus } from "../types/Dashboard";
=======
import { getCurrentUser } from "./authService";
import type { CreateDonationPayload, Donation, DonationStatus, UpdateDonationPayload } from "../types/Dashboard";
>>>>>>> Stashed changes

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
	if (status === "COMPLETED") return "COMPLETED";
	return "AVAILABLE";
}

function mapDonationResponse(data: DonationApiResponse, payload: CreateDonationPayload): Donation {
	return {
		donation_id: data.donation_id ?? data.donationId ?? Date.now(),
		food_type: data.food_type ?? data.foodType ?? payload.foodType,
		description: data.description ?? `Surplus ${payload.foodType}`,
		quantity: data.quantity ?? payload.quantity,
		unit: data.unit ?? payload.unit,
		expiry_date: data.expiry_date ?? data.expirationDate ?? payload.expirationDate,
		pickup_location: data.pickup_location ?? data.pickupAddress ?? payload.pickupAddress,
		availability_time: data.availability_time ?? data.availabilityTime ?? payload.availabilityTime,
		status: normalizeStatus(data.status),
		created_at: data.created_at ?? data.createdAt ?? new Date().toISOString(),
	};
}

<<<<<<< Updated upstream
=======
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

export async function getAllDonations(status?: string): Promise<Donation[]> {
	try {
		const params = status ? { status } : {};
		const { data } = await apiClient.get<DonationApiResponse[] | DonationsListResponse>("/api/donations", { params });
		return extractDonationsList(data).map((item) => mapDonationResponse(item));
	} catch (err) {
		throw new Error(extractErrorMessage(err, "Failed to load donations. Please try again."));
	}
}

>>>>>>> Stashed changes
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
			d.donation_id === id ? updatedDonation : d,
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
		const cached = readCachedDonations().filter((d) => d.donation_id !== id);
		writeCachedDonations(cached);
	} catch (err) {
		throw new Error(extractErrorMessage(err, "Failed to delete donation. Please try again."));
	}
}
