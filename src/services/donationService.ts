import axios from "axios";
import apiClient from "../api/axiosSetup";
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

export async function createDonation(payload: CreateDonationPayload): Promise<Donation> {
	try {
		const { data } = await apiClient.post<DonationApiResponse>("/api/donations", payload);
		return mapDonationResponse(data, payload);
	} catch (err) {
		throw new Error(extractErrorMessage(err, "Failed to create donation. Please try again."));
	}
}
