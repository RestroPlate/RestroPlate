import type { AccountType } from "./Auth";

export type DonationStatus = "AVAILABLE" | "REQUESTED" | "COLLECTED" | "COMPLETED";

export interface Donation {
	donation_id: number;
	food_type: string;
	description: string;
	quantity: number;
	unit: string;
	expiry_date: string;
	pickup_location: string;
	availability_time: string;
	status: DonationStatus;
	created_at: string;
}

export interface CreateDonationPayload {
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

export type DonationRequestStatus = "pending" | "approved" | "rejected";

export interface DonationRequest {
	donationRequestId: number;
	donationId: number;
	providerUserId: number;
	distributionCenterUserId: number;
	requestedQuantity: number;
	status: DonationRequestStatus;
	createdAt: string;
	foodType: string;
	unit: string;
}

export interface SubmitDonationRequestPayload {
	donationId: number;
	requestedQuantity: number;
}
