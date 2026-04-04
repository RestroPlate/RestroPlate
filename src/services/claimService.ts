import axios from "axios";
import apiClient from "../api/axiosSetup";
import type { ClaimStatus, DonationClaim, UserProfileDto } from "../types/Dashboard";

// ── Types ───────────────────────────────────────────────────────────────────

interface ClaimApiResponse {
    claimId?: number;
    claim_id?: number;
    donationId?: number;
    donation_id?: number;
    centerUserId?: number;
    center_user_id?: number;
    donatorUserId?: number;
    donator_user_id?: number;
    status?: string;
    createdAt?: string;
    created_at?: string;
    center?: UserProfileDto;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function extractErrorMessage(err: unknown, fallback: string): string {
    if (axios.isAxiosError(err)) {
        const data = err.response?.data as { message?: string; title?: string } | undefined;
        if (data?.message) return data.message;
        if (data?.title) return data.title;
    }
    if (err instanceof Error) return err.message;
    return fallback;
}

function normalizeClaimStatus(status: string | undefined): ClaimStatus {
    const s = status?.toUpperCase();
    if (s === "ACCEPTED") return "ACCEPTED";
    if (s === "REJECTED") return "REJECTED";
    return "PENDING";
}

function mapClaimResponse(data: ClaimApiResponse): DonationClaim {
    return {
        claimId: data.claimId ?? data.claim_id ?? 0,
        donationId: data.donationId ?? data.donation_id ?? 0,
        centerUserId: data.centerUserId ?? data.center_user_id ?? 0,
        donatorUserId: data.donatorUserId ?? data.donator_user_id ?? 0,
        status: normalizeClaimStatus(data.status),
        createdAt: data.createdAt ?? data.created_at ?? new Date().toISOString(),
        center: data.center,
    };
}

function extractClaimsList(data: unknown): ClaimApiResponse[] {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === "object" && data !== null) {
        const obj = data as Record<string, unknown>;
        if (Array.isArray(obj.items)) return obj.items as ClaimApiResponse[];
        if (Array.isArray(obj.claims)) return obj.claims as ClaimApiResponse[];
        if (Array.isArray(obj.data)) return obj.data as ClaimApiResponse[];
    }
    return [];
}

// ── API Functions ───────────────────────────────────────────────────────────

/**
 * Center creates a claim on a donation.
 * POST /api/donation-claims
 */
export async function createClaim(donationId: number): Promise<DonationClaim> {
    try {
        const { data } = await apiClient.post<ClaimApiResponse>("/api/donation-claims", {
            donationId,
        });
        return mapClaimResponse(data);
    } catch (err) {
        throw new Error(extractErrorMessage(err, "Failed to create claim. Please try again."));
    }
}

/**
 * Fetches claims for the current user.
 * For donors: returns pending claims on their donations.
 * For centers: returns their outgoing claims.
 * GET /api/donation-claims/my
 */
export async function getMyClaims(): Promise<DonationClaim[]> {
    try {
        const { data } = await apiClient.get<ClaimApiResponse[] | Record<string, unknown>>("/api/donation-claims/my");
        return extractClaimsList(data).map(mapClaimResponse);
    } catch (err) {
        throw new Error(extractErrorMessage(err, "Failed to load claims. Please try again."));
    }
}

/**
 * Updates the status of a claim (accept/reject).
 * PATCH /api/donation-claims/{id}/status
 */
export async function updateClaimStatus(claimId: number, status: ClaimStatus): Promise<DonationClaim> {
    try {
        const { data } = await apiClient.patch<ClaimApiResponse>(`/api/donation-claims/${claimId}/status`, {
            status,
        });
        return mapClaimResponse(data);
    } catch (err) {
        throw new Error(extractErrorMessage(err, `Failed to ${status.toLowerCase()} claim.`));
    }
}
