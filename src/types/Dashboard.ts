import type { AccountType } from "./Auth";

// modified: added ACCEPTED status for Flow 1 accept/reject lifecycle
export type DonationStatus = "AVAILABLE" | "REQUESTED" | "ACCEPTED" | "COLLECTED" | "COMPLETED";

export interface Donation {
	donationId: number;
	donationRequestId?: number | null;
	providerUserId: number;
	foodType: string;
	description?: string;
	quantity: number;
	unit: string;
	expirationDate: string;
	pickupAddress: string;
	availabilityTime: string;
	status: DonationStatus;
	createdAt: string;
	/** Name of the center that requested this donation (Flow 1) */
	requesterName?: string | null;
}

export interface CreateDonationPayload {
	donationRequestId?: number | null;
	foodType: string;
	description?: string;
	quantity: number;
	unit: string;
	expirationDate: string;
	pickupAddress: string;
	availabilityTime: string;
}

export interface UpdateDonationPayload {
	foodType: string;
	quantity: number;
	unit: string;
	expirationDate: string;
	pickupAddress: string;
	availabilityTime: string;
}

export interface DistributionInventory {
	inventory_id: number;
	donation_id: number;
	food_type: string;
	collected_quantity: number;
	distributed_quantity: number;
	available_quantity: number;
	is_public: boolean;
	collection_date: string;
}

export interface MockUser {
	email: string;
	name: string;
	role: AccountType;
}

// modified: added partially_filled status for Flow 2 requests
export type DonationRequestStatus = "pending" | "partially_filled" | "completed";


export interface DonationRequest {
	donationRequestId: number;
	distributionCenterUserId: number;
	distributionCenterName: string | null;
	distributionCenterAddress: string | null;
	requestedQuantity: number;
	donatedQuantity: number;
	status: DonationRequestStatus;
	createdAt: string;
	foodType: string;
	unit: string;
}

export interface SubmitDonationRequestPayload {
	foodType: string;
	description?: string;
	requestedQuantity: number;
	unit: string;
}

// new: inventory item returned from GET /inventory
export interface InventoryItem {
	inventoryId: number;
	itemName: string;
	quantityCollected: number;
	source: string;
	collectedAt: string;
}
