// new: DC Inventory table component (used by both Flow 1 and Flow 2)
import { useEffect, useState, useMemo } from "react";
import { useInventory } from "../hooks/useInventory";
import type { Donation } from "../../types/Dashboard";
import CollectionConfirmationModal from "./CollectionConfirmationModal";

function formatDate(value: string | undefined): string {
    if (!value) return "N/A";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

interface DCInventoryTableProps {
    dcId?: number;
    /** Extra refresh trigger — increment to force refetch */
    refreshKey?: number;
}

export default function DCInventoryTable({
    dcId,
    refreshKey,
}: DCInventoryTableProps) {
    const { inventory, loading, error, refresh } = useInventory(dcId);
    const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Re-fetch when refreshKey changes
    useEffect(() => {
        if (refreshKey && refreshKey > 0) {
            void refresh();
        }
    }, [refreshKey, refresh]);

    const filteredInventory = useMemo(() => {
        let items = inventory.filter(item => String(item.status).toUpperCase() === "REQUESTED");
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            items = items.filter(item => 
                item.foodType?.toLowerCase().includes(query)
            );
        }
        return items;
    }, [inventory, searchQuery]);

    if (loading) {
        return (
            <div className="space-y-2">
                <div className="skeleton-shimmer h-[60px]" />
                <div className="skeleton-shimmer h-[60px]" />
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

    if (inventory.length === 0 || filteredInventory.length === 0 && !searchQuery.trim()) {
        return (
            <div className="rounded-xl border border-dashed border-white/15 bg-white/5 px-6 py-8 text-center">
                <p className="text-sm font-bold text-[#F0EBE1]">
                    No items pending collection
                </p>
                <p className="mt-1 text-xs text-[#F0EBE1]/55">
                    Donations ready to be collected will appear here.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex w-full md:max-w-md">
                <div className="relative w-full">
                    <input
                        type="text"
                        placeholder="Search by item name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-[#F0EBE1] placeholder-[#F0EBE1]/40 outline-none transition focus:border-[#7DC542]/50 focus:bg-[#7DC542]/5"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
                <table className="w-full border-collapse">
                    <thead className="bg-white/5">
                        <tr className="text-left text-xs font-bold uppercase tracking-[0.08em] text-[#F0EBE1]/50">
                            <th className="px-5 py-3">Item Name</th>
                            <th className="px-5 py-3">Qty Collected</th>
                            <th className="px-5 py-3">Collected At</th>
                            <th className="px-5 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInventory.length > 0 ? (
                            filteredInventory.map((item) => (
                                <tr
                                    key={item.donationId}
                                    className="border-t border-white/10 text-sm text-[#F0EBE1]/75 transition hover:bg-white/[0.03]"
                                >
                                    <td className="px-5 py-3 font-bold text-[#F0EBE1] capitalize">
                                        {item.foodType}
                                    </td>
                                    <td className="px-5 py-3">
                                        {item.quantity} {item.unit}
                                    </td>
                                    <td className="px-5 py-3 text-xs text-[#F0EBE1]/50">
                                        {formatDate(item.availabilityTime)}
                                    </td>
                                    <td className="px-5 py-3">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedDonation(item)}
                                            className="rounded-xl bg-sky-500/15 px-3 py-1.5 text-xs font-bold text-sky-400 transition hover:bg-sky-500/25 whitespace-nowrap"
                                        >
                                            Mark as Collected
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-5 py-8 text-center text-sm text-[#F0EBE1]/50">
                                   No items match your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {selectedDonation && (
                <CollectionConfirmationModal
                    isOpen={!!selectedDonation}
                    onClose={() => setSelectedDonation(null)}
                    onSuccess={() => {
                        setSelectedDonation(null);
                        void refresh();
                    }}
                    donationId={selectedDonation.donationId}
                    defaultQuantity={selectedDonation.quantity}
                    unit={selectedDonation.unit}
                    foodType={selectedDonation.foodType}
                />
            )}
        </div>
    );
}
