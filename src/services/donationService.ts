import axios from "axios";
import apiClient from "../api/axiosSetup";
import { getCurrentUser } from "./authService";
import type { CreateDonationPayload, Donation, DonationStatus, UpdateDonationPayload } from "../types/Dashboard";

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

interface DonationsListResponse {
    items?: DonationApiResponse[];
    donations?: DonationApiResponse[];
    data?: DonationApiResponse[];
}

function getDonationCacheKey(): string | null {
    const user = getCurrentUser();
    if (!user) return null;
    const identity = user.userId ?? user.email;
    if (!identity) return null;
    return `restroplate_donations_${identity}`;
}

function readCachedDonations(): Donation[] {
    try {
        const key = getDonationCacheKey();
        if (!key) return [];
        const item = localStorage.getItem(key);
        if (!item) return [];
        const parsed = JSON.parse(item) as Donation[];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function writeCachedDonations(donations: Donation[]): void {
    try {
        const key = getDonationCacheKey();
        if (!key) return;
        localStorage.setItem(key, JSON.stringify(donations));
    } catch {
        // ignore
    }
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
    if (status === "COMPLETED") return "COMPLETED";
    if (status === "REQUESTED") return "REQUESTED";
    if (status === "COLLECTED") return "COLLECTED";
    return "AVAILABLE";
}

function mapDonationResponse(data: DonationApiResponse, payload?: Partial<CreateDonationPayload>): Donation {
    return {
        donation_id: data.donation_id ?? data.donationId ?? Date.now(),
        food_type: data.food_type ?? data.foodType ?? payload?.foodType ?? "Unknown",
        description: data.description ?? `Surplus ${payload?.foodType ?? "Food"}`,
        quantity: data.quantity ?? payload?.quantity ?? 1,
        unit: data.unit ?? payload?.unit ?? "Unit",
        expiry_date: data.expiry_date ?? data.expirationDate ?? payload?.expirationDate ?? new Date().toISOString().slice(0, 10),
        pickup_location: data.pickup_location ?? data.pickupAddress ?? payload?.pickupAddress ?? "Unknown",
        availability_time: data.availability_time ?? data.availabilityTime ?? payload?.availabilityTime ?? "Unknown",
        status: normalizeStatus(data.status),
        created_at: data.created_at ?? data.createdAt ?? new Date().toISOString(),
    };
}

function parseDonationsResponse(response: DonationApiResponse[] | DonationsListResponse): DonationApiResponse[] {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.items)) return response.items;
    if (Array.isArray(response.donations)) return response.donations;
    if (Array.isArray(response.data)) return response.data;
    return [];
}

function mergeDonations(server: Donation[], cached: Donation[]): Donation[] {
    const map = new Map<number, Donation>();
    for (const donation of cached) map.set(donation.donation_id, donation);
    for (const donation of server) map.set(donation.donation_id, donation);
    return Array.from(map.values()).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getMyDonations(): Promise<Donation[]> {
    try {
        const { data } = await apiClient.get<DonationApiResponse[] | DonationsListResponse>("/api/donations/me");
        const serverDonations = parseDonationsResponse(data).map((item) => mapDonationResponse(item));
        const merged = mergeDonations(serverDonations, readCachedDonations());
        writeCachedDonations(merged);
        return merged;
    } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 405) {
            return readCachedDonations();
        }
        throw new Error(extractErrorMessage(err, "Failed to load donations. Please try again."));
    }
}

export async function getAllDonations(status?: string): Promise<Donation[]> {
    try {
        const params = status ? { status } : {};
        const { data } = await apiClient.get<DonationApiResponse[] | DonationsListResponse>("/api/donations", { params });
        return parseDonationsResponse(data).map((item) => mapDonationResponse(item));
    } catch (err) {
        throw new Error(extractErrorMessage(err, "Failed to load donations. Please try again."));
    }
}

export interface AvailableDonationsParams {
	location?: string;
	foodType?: string;
	sortBy?: string;
	status?: string;
}

export async function getAvailableDonations(params?: AvailableDonationsParams): Promise<Donation[]> {
	try {
		const queryParams = { status: "AVAILABLE", ...params };
		const { data } = await apiClient.get<DonationApiResponse[] | DonationsListResponse>("/api/donations/available", { params: queryParams });
		return extractDonationsList(data).map((item) => mapDonationResponse(item));
	} catch (err) {
		throw new Error(extractErrorMessage(err, "Failed to load available donations. Please try again."));
	}
}

export async function createDonation(payload: CreateDonationPayload): Promise<Donation> {
    try {
        const { data } = await apiClient.post<DonationApiResponse>("/api/donations", payload);
        const createdDonation = mapDonationResponse(data, payload);
        writeCachedDonations(mergeDonations([createdDonation], readCachedDonations()));
        return createdDonation;
    } catch (err) {
        throw new Error(extractErrorMessage(err, "Failed to create donation. Please try again."));
    }
}

export async function updateDonation(id: number, payload: UpdateDonationPayload): Promise<Donation> {
    try {
        const { data } = await apiClient.put<DonationApiResponse>(`/api/donations/${id}`, payload);
        const updatedDonation = mapDonationResponse(data);
        const cached = readCachedDonations().map((d) => (d.donation_id === id ? updatedDonation : d));
        writeCachedDonations(cached);
        return updatedDonation;
    } catch (err) {
        throw new Error(extractErrorMessage(err, "Failed to update donation. Please try again."));
    }
}

export async function deleteDonation(id: number): Promise<void> {
    try {
        await apiClient.delete(`/api/donations/${id}`);
        const cached = readCachedDonations().filter((d) => d.donation_id !== id);
        writeCachedDonations(cached);
    } catch (err) {
        throw new Error(extractErrorMessage(err, "Failed to delete donation. Please try again."));
    }
}
