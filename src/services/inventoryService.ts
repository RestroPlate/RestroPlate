// new: inventory service for DCInventoryTable
import axios from "axios";
import type { InventoryItem } from "../types/Dashboard";

// Keep extractErrorMessage here just in case, though unused if we just return [].
// We will drop apiClient.

// Removed unused interface

function extractErrorMessage(err: unknown, fallback: string): string {
    if (axios.isAxiosError(err)) {
        const data = err.response?.data as { message?: string; title?: string } | undefined;
        if (data?.message) return data.message;
        if (data?.title) return data.title;
    }
    if (err instanceof Error) return err.message;
    return fallback;
}



/**
 * Fetches inventory items for a specific distribution center.
 */
export async function getInventory(_dcId?: number): Promise<InventoryItem[]> {
    try {
        // Backend currently lacks the /api/inventory GET list endpoint in Swagger.
        // We mock it to an empty array to prevent 404/403 crashes until it's implemented.
        return [];
    } catch (err) {
        throw new Error(extractErrorMessage(err, "Failed to load inventory."));
    }
}
