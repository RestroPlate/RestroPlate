import type { AccountType } from "./Auth";

export type DonationStatus = "AVAILABLE" | "REQUESTED" | "COLLECTED" | "COMPLETED";

export interface Donation {
	donationId: number;
	donationRequestId?: number | null;
	providerUserId: number;
	foodType: string;
	quantity: number;
	unit: string;
	expirationDate: string;
	pickupAddress: string;
	availabilityTime: string;
	status: DonationStatus;
	createdAt: string;
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

export interface MockUser {
	email: string;
	name: string;
	role: AccountType;
}

export type DonationRequestStatus = "pending" | "completed" | "collected";


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

export interface DistributionInventoryResponseDto {
	inventoryId: number;
	donationRequestId: number;
	collectedQuantity: number;
	collectionDate: string;
	status: string | null;
}

export interface UpdateCollectedQuantityDto {
	collectedQuantity: number;
}


export interface SubmitDonationRequestPayload {
	foodType: string;
	requestedQuantity: number;
	unit: string;
}
