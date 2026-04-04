// new: Collect donation action button for Flow 1 (Center marks accepted donation as collected)
import { useState } from "react";
import { collectDonation } from "../../services/donationService";

interface CollectDonationActionProps {
	donationId: number;
	quantity: number;
	unit: string;
	onCollected: () => void;
}

/**
 * Renders a "Mark as Collected" button with a quantity input.
 * Used when a donation has been accepted by the donor and is ready for collection.
 */
export default function CollectDonationAction({
	donationId,
	quantity,
	unit,
	onCollected,
}: CollectDonationActionProps) {
	const [collectedAmount, setCollectedAmount] = useState(String(quantity));
	const [collecting, setCollecting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleCollect(): Promise<void> {
		const amount = Number(collectedAmount);
		if (Number.isNaN(amount) || amount <= 0) {
			setError("Enter a valid collected amount.");
			return;
		}

		setCollecting(true);
		setError(null);
		try {
			await collectDonation(donationId, amount);
			onCollected();
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to mark as collected.",
			);
		} finally {
			setCollecting(false);
		}
	}

	return (
		<div className="mt-3 flex flex-wrap items-end gap-2 border-t border-white/5 pt-3">
			<label className="space-y-1">
				<span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#F0EBE1]/50">
					Collected ({unit})
				</span>
				<input
					type="number"
					min="0.01"
					step="0.01"
					max={quantity}
					value={collectedAmount}
					onChange={(e) => {
						setCollectedAmount(e.target.value);
						setError(null);
					}}
					className="w-24 rounded-lg border border-white/15 bg-[#111F0F] px-2.5 py-1.5 text-sm text-[#F0EBE1] outline-none transition focus:border-[#7DC542]"
				/>
			</label>
			<button
				type="button"
				disabled={collecting}
				onClick={handleCollect}
				className="inline-flex items-center rounded-lg bg-sky-500/15 px-4 py-2 text-xs font-bold text-sky-300 transition hover:bg-sky-500/25 disabled:cursor-not-allowed disabled:opacity-60"
			>
				{collecting ? "Collecting..." : "Mark as Collected"}
			</button>
			{error ? (
				<p className="w-full text-xs font-semibold text-rose-300">{error}</p>
			) : null}
		</div>
	);
}
