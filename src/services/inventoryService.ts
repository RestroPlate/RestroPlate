// new: inventory service for DCInventoryTable and CenterInventory
import axios from "axios";
import apiClient from "../api/axiosSetup";
import type {
	Donation,
	CollectDonationDto,
	InventoryLogResponseDto,
} from "../types/Dashboard";

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
 * Fetches claimed donations in the distribution center's inventory.
 */
export async function getInventory(): Promise<Donation[]> {
	try {
		const { data } = await apiClient.get<Donation[]>("/api/inventory");
		return data;
	} catch (err) {
		throw new Error(extractErrorMessage(err, "Failed to load inventory."));
	}
}

/**
 * Updates collected quantities after picking up donations.
 */
export async function collectDonation(
	donationId: number,
	payload: CollectDonationDto,
): Promise<InventoryLogResponseDto> {
	try {
		const { data } = await apiClient.post<InventoryLogResponseDto>(
			`/api/inventory/${donationId}/collect`,
			payload,
		);
		return data;
	} catch (err) {
		throw new Error(extractErrorMessage(err, "Failed to collect donation."));
	}
}
