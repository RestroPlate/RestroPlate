import type { AccountType, UserProfileDto } from "./Auth";
export type { UserProfileDto };

// modified: added COLLECTED status for Flow 1 lifecycle (removed ACCEPTED)
export type DonationStatus =
	| "AVAILABLE"
	| "REQUESTED"
	| "COLLECTED"
	| "COMPLETED";

export interface CenterDetails {
	userId: number;
	name: string;
	email: string;
	phoneNumber: string;
	address: string;
}

export interface Donation {
	donationId: number;
	inventoryId?: number;
	inventoryLogId?: number;
	is_public?: boolean;
	isPublished?: boolean;
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
	collectedAmount?: number;
	distributedQuantity?: number;
	claimedByCenterUserId?: number | null;
	centerDetails?: CenterDetails;
}

// Claim status for donation claim requests (Flow 1 claims)
export type ClaimStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface DonationClaim {
	claimId: number;
	donationId: number;
	centerUserId: number;
	donatorUserId: number;
	status: ClaimStatus;
	createdAt: string;
	center?: UserProfileDto;
}

export interface CreateDonationPayload {
	donationRequestId?: number | null;
	foodType: string;
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

/**
 * Item in distribution inventory (returned by /api/distribution-inventory)
 */
export interface DistributionInventoryResponseDto {
	inventory_id: number;
	donation_id: number;
	food_type: string;
	collected_quantity: number;
	distributed_quantity: number;
	available_quantity: number;
	is_public: boolean;
	collection_date: string;
}

/**
 * Body for updating collected quantity via PUT /api/distribution-inventory/{id}
 */
export interface UpdateCollectedQuantityDto {
	collected_quantity: number;
}


export interface MockUser {
	email: string;
	name: string;
	role: AccountType;
}

// modified: added partially_filled status for Flow 2 requests
export type DonationRequestStatus =
	| "pending"
	| "partially_filled"
	| "completed";

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
	requestedQuantity: number;
	unit: string;
}

// new: payload for POST /api/inventory/{id}/collect
export interface CollectDonationDto {
	collectedAmount: number;
}

// new: response from POST /api/inventory/{id}/collect
export interface InventoryLogResponseDto {
	inventoryLogId: number;
	donationId: number;
	donationRequestId: number | null;
	distributionCenterUserId: number;
	collectedAmount: number;
	collectedAt: string;
}

// new: inventory item returned from GET /inventory
export interface InventoryItem {
	inventoryId: number;
	itemName: string;
	quantityCollected: number;
	source: string;
	collectedAt: string;
}
