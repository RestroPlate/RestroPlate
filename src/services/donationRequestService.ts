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

export async function getProviderRequests(
	status?: DonationRequestStatus,
): Promise<DonationRequest[]> {
	try {
		const params = status ? { status } : undefined;
		const { data } = await apiClient.get<DonationRequestApiResponse[]>(
			"/api/donation-requests",
			{ params },
		);
		return data.map(mapDonationRequestResponse);
	} catch (err) {
		throw new Error(extractErrorMessage(err, "Failed to load incoming requests."));
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
