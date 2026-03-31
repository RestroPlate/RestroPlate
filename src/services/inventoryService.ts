// new: inventory service for DCInventoryTable
import axios from "axios";
import apiClient from "../api/axiosSetup";
import type { InventoryItem } from "../types/Dashboard";

interface InventoryApiResponse {
    inventoryId?: number;
    inventory_id?: number;
    itemName?: string;
    item_name?: string;
    food_type?: string;
    quantityCollected?: number;
    quantity_collected?: number;
    collected_quantity?: number;
    source?: string;
    collectedAt?: string;
    collected_at?: string;
    collection_date?: string;
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

function mapInventoryItem(data: InventoryApiResponse): InventoryItem {
    return {
        inventoryId: data.inventoryId ?? data.inventory_id ?? 0,
        itemName: data.itemName ?? data.item_name ?? data.food_type ?? "Unknown",
        quantityCollected: data.quantityCollected ?? data.quantity_collected ?? data.collected_quantity ?? 0,
        source: data.source ?? "Direct Donation",
        collectedAt: data.collectedAt ?? data.collected_at ?? data.collection_date ?? new Date().toISOString(),
    };
}

function extractInventoryList(data: unknown): InventoryApiResponse[] {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === "object" && data !== null) {
        const obj = data as Record<string, unknown>;
        if (Array.isArray(obj.items)) return obj.items as InventoryApiResponse[];
        if (Array.isArray(obj.inventory)) return obj.inventory as InventoryApiResponse[];
        if (Array.isArray(obj.data)) return obj.data as InventoryApiResponse[];
    }
    return [];
}

/**
 * Fetches inventory items for a specific distribution center.
 */
export async function getInventory(dcId?: number): Promise<InventoryItem[]> {
    try {
        const params = dcId ? { dc_id: dcId } : {};
        const { data } = await apiClient.get("/api/inventory", { params });
        return extractInventoryList(data).map(mapInventoryItem);
    } catch (err) {
        throw new Error(extractErrorMessage(err, "Failed to load inventory."));
    }
}
