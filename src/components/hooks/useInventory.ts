// new: hook for inventory data fetching
import { useCallback, useEffect, useState } from "react";
import type { InventoryItem } from "../../types/Dashboard";
import { getInventory } from "../../services/inventoryService";

interface UseInventoryResult {
    inventory: InventoryItem[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

/**
 * Hook to fetch DC inventory items.
 */
export function useInventory(dcId?: number): UseInventoryResult {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        try {
            const data = await getInventory(dcId);
            setInventory(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load inventory.");
        } finally {
            setLoading(false);
        }
    }, [dcId]);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    return { inventory, loading, error, refresh };
}
