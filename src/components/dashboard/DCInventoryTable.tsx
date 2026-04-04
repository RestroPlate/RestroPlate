// new: DC Inventory table component (used by both Flow 1 and Flow 2)
import { useEffect } from "react";
import { useInventory } from "../hooks/useInventory";

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

	// Re-fetch when refreshKey changes
	useEffect(() => {
		if (refreshKey && refreshKey > 0) {
			void refresh();
		}
	}, [refreshKey, refresh]);

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

	if (inventory.length === 0) {
		return (
			<div className="rounded-xl border border-dashed border-white/15 bg-white/5 px-6 py-8 text-center">
				<p className="text-sm font-bold text-[#F0EBE1]">
					No inventory items yet
				</p>
				<p className="mt-1 text-xs text-[#F0EBE1]/55">
					Claimed donations will appear here.
				</p>
			</div>
		);
	}

	return (
		<div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
			<table className="w-full border-collapse">
				<thead className="bg-white/5">
					<tr className="text-left text-xs font-bold uppercase tracking-[0.08em] text-[#F0EBE1]/50">
						<th className="px-5 py-3">Item Name</th>
						<th className="px-5 py-3">Qty Collected</th>
						<th className="px-5 py-3">Status</th>
						<th className="px-5 py-3">Collected At</th>
					</tr>
				</thead>
				<tbody>
					{inventory.map((item) => (
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
							<td className="px-5 py-3 text-xs uppercase">{item.status}</td>
							<td className="px-5 py-3 text-xs text-[#F0EBE1]/50">
								{formatDate(item.availabilityTime)}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
