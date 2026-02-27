import type { AccountType } from "./Auth";

export interface Donation {
    donation_id: number;
    food_type: string;
    description: string;
    quantity: number;
    unit: string;
    expiry_date: string;
    pickup_location: string;
    status: "AVAILABLE" | "REQUESTED" | "COLLECTED" | "COMPLETED";
    created_at: string;
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
