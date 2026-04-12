import { useMemo, useState } from "react";
import { useInventory } from "../hooks/useInventory";
import type { Donation } from "../../types/Dashboard";
import DonationDetailsModal from "./DonationDetailsModal";

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

interface CompletedInventoryTableProps {
	dcId?: number;
}

export default function CompletedInventoryTable({ dcId }: CompletedInventoryTableProps) {
	const { inventory, loading, error, refresh } = useInventory(dcId);
	const [viewingDonation, setViewingDonation] = useState<Donation | null>(null);
	const [searchQuery, setSearchQuery] = useState("");

	const filteredInventory = useMemo(() => {
		const items = inventory.filter(item => String(item.status).toUpperCase() === "COMPLETED");
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			return items.filter(item =>
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

	if (inventory.length === 0 || (filteredInventory.length === 0 && !searchQuery.trim())) {
		return (
			<div className="rounded-xl border border-dashed border-white/15 bg-white/5 px-6 py-8 text-center">
				<p className="text-sm font-bold text-[#F0EBE1]">
					No completed donations found
				</p>
				<p className="mt-1 text-xs text-[#F0EBE1]/55">
					Donations that have been fully completed will appear here.
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
							<th className="px-5 py-3">Qty Finalized</th>
							<th className="px-5 py-3">Expired / Available At</th>
						</tr>
					</thead>
					<tbody>
						{filteredInventory.length > 0 ? (
							filteredInventory.map((item) => (
								<tr
									key={item.donationId}
									onClick={() => setViewingDonation(item)}
									className="border-t border-white/10 text-sm text-[#F0EBE1]/75 transition cursor-pointer hover:bg-white/[0.06]"
								>
									<td className="px-5 py-4 font-bold text-[#F0EBE1] capitalize">
										{item.foodType}
									</td>
									<td className="px-5 py-4">
										{item.quantity} {item.unit}
									</td>
									<td className="px-5 py-4 text-xs text-[#F0EBE1]/50">
										{formatDate(item.availabilityTime)}
									</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan={3} className="px-5 py-8 text-center text-sm text-[#F0EBE1]/50">
									No items match your search.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{viewingDonation && (
				<DonationDetailsModal
					donation={viewingDonation}
					onClose={() => setViewingDonation(null)}
				/>
			)}
		</div>
	);
}
