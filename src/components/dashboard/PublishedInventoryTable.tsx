import { useMemo, useState } from "react";
import { useInventory } from "../hooks/useInventory";
import { publishInventory } from "../../services/inventoryService";
import type { Donation } from "../../types/Dashboard";
import DonationDetailsModal from "./DonationDetailsModal";
import DistributionModal from "./DistributionModal";

export default function PublishedInventoryTable() {
	const { inventory, loading, error, refresh } = useInventory();
	const [updatingId, setUpdatingId] = useState<number | null>(null);
	const [optimisticStates, setOptimisticStates] = useState<Record<number, boolean>>({});
	
	// Modal states
	const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
	const [distributingDonation, setDistributingDonation] = useState<Donation | null>(null);

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
					Distribution Management
				</h3>
				<p className="text-sm text-[#F0EBE1]/65">
					Track distributions to community members and manage inventory visibility. Click on any row to view full donation details.
				</p>
			</div>

			<div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5">
				<table className="w-full border-collapse">
					<thead className="bg-white/5">
						<tr className="text-left text-xs font-bold uppercase tracking-[0.08em] text-[#F0EBE1]/50">
							<th className="px-5 py-3 min-w-[150px]">Food Item</th>
							<th className="px-5 py-3">Collected Qty</th>
							<th className="px-5 py-3 text-center">Remaining Qty</th>
							<th className="px-5 py-3">Visibility</th>
							<th className="px-5 py-3 text-right">Action</th>
						</tr>
					</thead>
					<tbody>
						{collectedInventory.length > 0 ? (
							collectedInventory.map((item) => {
								const id = item.inventoryLogId ?? item.inventoryId ?? item.donationId;
								const isUpdating = updatingId === id;
								const isPublic = getIsPublic(item);
								
								const totalCollected = item.collectedAmount ?? item.quantity;
								const totalDistributed = item.distributedQuantity ?? 0;
								const remaining = totalCollected - totalDistributed;
								
								return (
									<tr
										key={id}
										onClick={() => setSelectedDonation(item)}
										className={`border-t border-white/10 text-sm text-[#F0EBE1]/75 transition cursor-pointer hover:bg-white/[0.06] ${isUpdating ? "opacity-50 pointer-events-none" : ""}`}
									>
										<td className="px-5 py-5 font-bold text-[#F0EBE1]">
											{item.foodType}
										</td>
										<td className="px-5 py-5">
											{totalCollected} {item.unit}
										</td>
										<td className="px-5 py-5 text-center">
											<span className={`px-3 py-1 rounded-full font-bold text-xs ${remaining <= 0 ? "bg-rose-500/10 text-rose-400" : "bg-[#7DC542]/10 text-[#7DC542]"}`}>
												{remaining} {item.unit}
											</span>
										</td>
										<td className="px-5 py-5" onClick={(e) => e.stopPropagation()}>
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
												<span className="ml-3 text-[10px] font-bold uppercase tracking-wider w-12 opacity-60">
													{isUpdating ? "..." : (isPublic ? "Public" : "Private")}
												</span>
											</div>
										</td>
										<td className="px-5 py-5 text-right" onClick={(e) => e.stopPropagation()}>
											<button
												type="button"
												disabled={remaining <= 0}
												onClick={() => setDistributingDonation(item)}
												className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
													remaining > 0 
														? "bg-sky-500/10 text-sky-400 hover:bg-sky-500 hover:text-white" 
														: "bg-white/5 text-[#F0EBE1]/30 cursor-not-allowed"
												}`}
											>
												Distribute
											</button>
										</td>
									</tr>
								);
							})
						) : (
							<tr>
								<td colSpan={5} className="px-5 py-12 text-center text-sm text-[#F0EBE1]/50 italic">
								   No collected inventory items items found in your center database.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{selectedDonation && (
				<DonationDetailsModal
					donation={selectedDonation}
					onClose={() => setSelectedDonation(null)}
				/>
			)}

			{distributingDonation && (
				<DistributionModal
					donation={distributingDonation}
					onClose={() => setDistributingDonation(null)}
					onSuccess={() => {
						setDistributingDonation(null);
						void refresh();
					}}
				/>
			)}
		</div>
	);
}



