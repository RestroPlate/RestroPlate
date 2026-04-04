import { useState } from "react";
import type { Donation } from "../../types/Dashboard";
import { distributeInventory } from "../../services/inventoryService";

interface DistributionModalProps {
	donation: Donation;
	onClose: () => void;
	onSuccess: () => void;
}

export default function DistributionModal({
	donation,
	onClose,
	onSuccess,
}: DistributionModalProps) {
	const [amount, setAmount] = useState<number>(0);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const totalCollected = donation.collectedAmount ?? donation.quantity;
	const alreadyDistributed = donation.distributedQuantity ?? 0;
	const remaining = totalCollected - alreadyDistributed;

	const handleDistribute = async () => {
		if (amount <= 0 || amount > remaining) {
			setError(`Please enter a valid quantity between 0 and ${remaining}.`);
			return;
		}

		try {
			setIsSubmitting(true);
			setError(null);
			
			// Backend expects the NEW TOTAL distributed quantity (UpdateDistributedQuantityDto)
			const id = donation.inventoryLogId ?? donation.donationId;
			const newTotal = alreadyDistributed + amount;
			
			await distributeInventory(id, newTotal);
			onSuccess();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to distribute.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
			<div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-sky-400/20 bg-[#0F1D0C] shadow-2xl">
				{/* Header */}
				<div className="flex items-center justify-between border-b border-white/10 bg-sky-500/5 px-6 py-4">
					<h3 className="text-lg font-bold text-sky-300">Distribute Item</h3>
					<button
						type="button"
						onClick={onClose}
						className="rounded-lg p-1.5 text-[#F0EBE1]/50 transition hover:bg-white/10 hover:text-[#F0EBE1]"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-5 w-5"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fillRule="evenodd"
								d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
								clipRule="evenodd"
							/>
						</svg>
					</button>
				</div>

				<div className="p-6 space-y-6">
					<div className="space-y-1">
						<p className="text-xs font-bold uppercase tracking-wider text-[#F0EBE1]/40">
							Food Item
						</p>
						<p className="text-base font-black text-[#F0EBE1]">{donation.foodType}</p>
					</div>

					<div className="grid grid-cols-2 gap-4 rounded-xl bg-white/5 p-4 text-center">
						<div>
							<p className="text-[10px] font-bold uppercase text-[#F0EBE1]/30">Remaining</p>
							<p className="text-lg font-black text-[#7DC542]">
								{remaining} <span className="text-xs font-normal opacity-60 ml-0.5">{donation.unit}</span>
							</p>
						</div>
						<div className="border-l border-white/10">
							<p className="text-[10px] font-bold uppercase text-[#F0EBE1]/30">Unit</p>
							<p className="text-lg font-black text-[#F0EBE1] opacity-80">{donation.unit}</p>
						</div>
					</div>

					<div className="space-y-2">
						<label htmlFor="dist-qty" className="text-xs font-bold uppercase tracking-wider text-[#F0EBE1]/40">
							Distributed Quantity
						</label>
						<div className="relative">
							<input
								id="dist-qty"
								type="number"
								min="0"
								max={remaining}
								step="any"
								value={amount || ""}
								onChange={(e) => setAmount(Number.parseFloat(e.target.value) || 0)}
								placeholder={`Max ${remaining}`}
								className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-lg font-bold text-[#F0EBE1] outline-none transition focus:border-[#7DC542]/50 focus:bg-[#7DC542]/5"
							/>
						</div>
					</div>

					{error && (
						<p className="text-xs font-bold text-rose-400 bg-rose-400/10 p-2.5 rounded-lg border border-rose-400/20">
							{error}
						</p>
					)}

					<div className="flex gap-3">
						<button
							type="button"
							onClick={onClose}
							className="flex-1 rounded-xl bg-white/5 py-3 text-sm font-bold text-[#F0EBE1]/60 transition hover:bg-white/10"
						>
							Cancel
						</button>
						<button
							type="button"
							disabled={isSubmitting || amount <= 0 || amount > remaining}
							onClick={handleDistribute}
							className="flex-[2] rounded-xl bg-[#7DC542] py-3 text-sm font-extrabold text-[#0B1A08] transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(125,197,66,0.25)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
						>
							{isSubmitting ? "Processing..." : "Confirm Distribution"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
