import axios from "axios";
import apiClient from "../api/axiosSetup";
import type {
	DonationRequest,
	DonationRequestStatus,
	SubmitDonationRequestPayload,
} from "../types/Dashboard";

interface DonationRequestApiResponse {
	donationRequestId?: number;
	requestId?: number;
	donationId?: number;
	providerUserId?: number;
	distributionCenterUserId?: number;
	distributionCenterName?: string | null;
	distributionCenterAddress?: string | null;
	requestedQuantity?: number;
	status?: string | null;
	createdAt?: string;
	foodType?: string | null;
	unit?: string | null;
	donatedQuantity?: number;
}

function extractErrorMessage(err: unknown, fallback: string): string {
	if (axios.isAxiosError(err)) {
		const data = err.response?.data as
			| { message?: string; title?: string; detail?: string }
			| undefined;
		if (data?.detail) return data.detail;
		if (data?.message) return data.message;
		if (data?.title) return data.title;
	}
	if (err instanceof Error) return err.message;
	return fallback;
}

function normalizeRequestStatus(status: string | null | undefined): DonationRequestStatus {
	switch (status?.toLowerCase()) {
		case "completed":
			return "completed";
		case "partially_filled":
			return "partially_filled";
		default:
			return "pending";
	}
}

function mapDonationRequestResponse(data: DonationRequestApiResponse): DonationRequest {
	return {
		donationRequestId: data.donationRequestId ?? data.requestId ?? 0,
		distributionCenterUserId: data.distributionCenterUserId ?? 0,
		distributionCenterName: data.distributionCenterName ?? null,
		distributionCenterAddress: data.distributionCenterAddress ?? null,
		requestedQuantity: data.requestedQuantity ?? 0,
		donatedQuantity: data.donatedQuantity ?? 0,
		status: normalizeRequestStatus(data.status),
		createdAt: data.createdAt ?? new Date().toISOString(),
		foodType: data.foodType ?? "Unknown",
		unit: data.unit ?? "units",
	};
}

export async function submitDonationRequest(
	payload: SubmitDonationRequestPayload,
): Promise<DonationRequest> {
	try {
		const { data } = await apiClient.post<DonationRequestApiResponse>(
			"/api/donation-requests",
			payload,
		);
		return mapDonationRequestResponse(data);
	} catch (err) {
		throw new Error(extractErrorMessage(err, "Failed to submit donation request."));
	}
}



export async function getCenterOutgoingRequests(
	status?: DonationRequestStatus,
): Promise<DonationRequest[]> {
	try {
		const params = status ? { status } : undefined;
		const { data } = await apiClient.get<DonationRequestApiResponse[]>(
			"/api/donation-requests/outgoing",
			{ params },
		);
		return data.map(mapDonationRequestResponse);
	} catch (err) {
		throw new Error(extractErrorMessage(err, "Failed to load outgoing requests."));
	}
}

export async function getAvailableRequests(
	status?: DonationRequestStatus,
): Promise<DonationRequest[]> {
	try {
		const params = status ? { status } : undefined;
		const { data } = await apiClient.get<DonationRequestApiResponse[]>(
			"/api/donation-requests/available",
			{ params },
		);
		return data.map(mapDonationRequestResponse);
	} catch (err) {
		throw new Error(extractErrorMessage(err, "Failed to load available requests."));
	}
}
export interface UpdateDonationRequestQuantityPayload {
	donatedQuantity: number;
}

export async function updateDonationRequestQuantity(
	donationRequestId: number,
	payload: UpdateDonationRequestQuantityPayload,
): Promise<DonationRequest> {
	try {
		const { data } = await apiClient.put<DonationRequestApiResponse>(
			`/api/donation-requests/${donationRequestId}/quantity`,
			payload,
		);
		return mapDonationRequestResponse(data);
	} catch (err) {
		throw new Error(extractErrorMessage(err, "Failed to update donation request quantity."));
	}
}

// new: fetch donations linked to a specific request (Flow 2 sub-list)
import type { Donation } from "../types/Dashboard";

export async function getDonationsForRequest(
	requestId: number,
): Promise<Donation[]> {
	try {
		const { data } = await apiClient.get(
			`/api/donation-requests/${requestId}/donations`,
		);
		const items = Array.isArray(data) ? data : (data as Record<string, unknown>)?.donations ?? (data as Record<string, unknown>)?.items ?? (data as Record<string, unknown>)?.data ?? [];
		return (items as Array<Record<string, unknown>>).map((item) => ({
			donationId: (item.donation_id ?? item.donationId ?? 0) as number,
			donationRequestId: (item.donation_request_id ?? item.donationRequestId ?? null) as number | null,
			providerUserId: (item.providerUserId ?? 0) as number,
			foodType: (item.foodType ?? "Unknown") as string,
			quantity: (item.quantity ?? 0) as number,
			unit: (item.unit ?? "units") as string,
			expirationDate: (item.expiry_date ?? item.expirationDate ?? new Date().toISOString()) as string,
			pickupAddress: (item.pickup_location ?? item.pickupAddress ?? "") as string,
			availabilityTime: (item.availability_time ?? item.availabilityTime ?? "") as string,
			status: ((item.status as string)?.toUpperCase() === "COLLECTED" ? "COLLECTED" : (item.status as string)?.toUpperCase() === "ACCEPTED" ? "ACCEPTED" : (item.status as string)?.toUpperCase() === "REQUESTED" ? "REQUESTED" : "AVAILABLE") as Donation["status"],
			createdAt: (item.created_at ?? item.createdAt ?? new Date().toISOString()) as string,
			claimedByCenterUserId: (item.claimedByCenterUserId ?? null) as number | null,
		}));
	} catch (err) {
		throw new Error(extractErrorMessage(err, "Failed to load donations for this request."));
	}
}

