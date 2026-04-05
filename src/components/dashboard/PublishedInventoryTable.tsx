import { useMemo, useState } from "react";
import { useInventory } from "../hooks/useInventory";
import { publishInventory } from "../../services/inventoryService";
import type { Donation } from "../../types/Dashboard";

export default function PublishedInventoryTable() {
    const { inventory, loading, error, refresh } = useInventory();
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [optimisticStates, setOptimisticStates] = useState<Record<number, boolean>>({});

    const collectedInventory = useMemo(() => {
        return inventory.filter(item => item.status?.toUpperCase() === "COLLECTED");
    }, [inventory]);

    const getIsPublic = (item: Donation) => {
        const id = item.inventoryLogId ?? item.inventoryId ?? item.donationId;
        if (optimisticStates[id] !== undefined) return optimisticStates[id];
        // backend uses isPublished
        return item.isPublished ?? item.is_public ?? false;
    };

    const handleToggle = async (item: Donation) => {
        const id = item.inventoryLogId ?? item.inventoryId ?? item.donationId;
        const currentStatus = getIsPublic(item);
        const newStatus = !currentStatus;
        
        try {
            setUpdatingId(id);
            // set optimistic state
            setOptimisticStates(prev => ({ ...prev, [id]: newStatus }));
            
            await publishInventory(id, newStatus);
            await refresh();
        } catch (err) {
            console.error("Failed to toggle publish status:", err);
            // revert optimistic state only on error
            setOptimisticStates(prev => {
                const updated = { ...prev };
                delete updated[id];
                return updated;
            });
        } finally {
            setUpdatingId(null);
            // Note: we DON'T clear optimisticStates here yet to prevent "flicker" 
            // if the refresh response is slightly delayed or backend is slow to update its view.
            // On a full page refresh, the state will be lost anyway, which is fine if the backend persisted it.
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
               <div className="skeleton-shimmer h-24 rounded-2xl" />
               <div className="skeleton-shimmer h-48 rounded-xl" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-100">
                {error}
                <button
                    type="button"
                    onClick={() => void refresh()}
                    className="ml-3 text-xs font-bold text-rose-200 underline hover:text-rose-50"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-xl font-bold text-[#F0EBE1]">
                    Current Inventory Visibility
                </h3>
                <p className="text-sm text-[#F0EBE1]/65">
                    Toggle visibility to publish the available quantities to community members. Only collected items are shown here.
                </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
                <table className="w-full border-collapse">
                    <thead className="bg-white/5">
                        <tr className="text-left text-xs font-bold uppercase tracking-[0.08em] text-[#F0EBE1]/50">
                            <th className="px-5 py-3">Food Item</th>
                            <th className="px-5 py-3">Available Qty</th>
                            <th className="px-5 py-3">Publish to Consumers</th>
                        </tr>
                    </thead>
                    <tbody>
                        {collectedInventory.length > 0 ? (
                            collectedInventory.map((item) => {
                                const id = item.inventoryLogId ?? item.inventoryId ?? item.donationId;
                                const isUpdating = updatingId === id;
                                const isPublic = getIsPublic(item);
                                
                                return (
                                    <tr
                                        key={id}
                                        className={`border-t border-white/10 text-sm text-[#F0EBE1]/75 transition hover:bg-white/[0.03] ${isUpdating ? "opacity-50 pointer-events-none" : ""}`}
                                    >
                                        <td className="px-5 py-3 font-bold text-[#F0EBE1]">
                                            {item.foodType}
                                        </td>
                                        <td className="px-5 py-3">
                                            {item.quantity} {item.unit}
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center">
                                                <button
                                                    type="button"
                                                    disabled={isUpdating}
                                                    onClick={() => handleToggle(item)}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                        isPublic ? "bg-[#7DC542]" : "bg-white/20"
                                                    } ${isUpdating ? "cursor-not-allowed" : "cursor-pointer"}`}
                                                    aria-pressed={isPublic}
                                                >
                                                    <span className="sr-only">Toggle publish status</span>
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                            isPublic ? "translate-x-6" : "translate-x-1"
                                                        }`}
                                                    />
                                                </button>
                                                <span className="ml-3 text-xs font-semibold w-16">
                                                    {isUpdating ? "Updating..." : (isPublic ? "Published" : "Hidden")}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={3} className="px-5 py-8 text-center text-sm text-[#F0EBE1]/50">
                                   No collected inventory items found to publish.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
