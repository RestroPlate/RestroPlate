import axios from "axios";
import apiClient from "../api/axiosSetup";
import type {
	DistributionInventoryResponseDto,
	UpdateCollectedQuantityDto,
} from "../types/Dashboard";

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

export async function getDistributionInventory(): Promise<
	DistributionInventoryResponseDto[]
> {
	try {
		const { data } = await apiClient.get<DistributionInventoryResponseDto[]>(
			"/api/distribution-inventory",
		);
		return data;
	} catch (err) {
		throw new Error(extractErrorMessage(err, "Failed to load inventory."));
	}
}

export async function updateCollectedQuantity(
	donationRequestId: number,
	payload: UpdateCollectedQuantityDto,
): Promise<DistributionInventoryResponseDto> {
	try {
		const { data } = await apiClient.put<DistributionInventoryResponseDto>(
			`/api/distribution-inventory/${donationRequestId}`,
			payload,
		);
		return data;
	} catch (err) {
		throw new Error(
			extractErrorMessage(err, "Failed to update collected quantity."),
		);
	}
}
