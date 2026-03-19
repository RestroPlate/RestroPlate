import { useState } from "react";
import { updateCollectedQuantity } from "../../services/distributionInventoryService";

interface CollectionConfirmationModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
	donationRequestId: number;
	defaultQuantity: number;
	unit: string;
	foodType: string;
}

export default function CollectionConfirmationModal({
	isOpen,
	onClose,
	onSuccess,
	donationRequestId,
	defaultQuantity,
	unit,
	foodType,
}: CollectionConfirmationModalProps) {
	const [collectedQuantity, setCollectedQuantity] = useState<string>(
		defaultQuantity.toString(),
	);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	if (!isOpen) return null;

	async function handleSubmit(event: React.FormEvent) {
		event.preventDefault();

		const quantity = Number.parseFloat(collectedQuantity);
		if (Number.isNaN(quantity) || quantity <= 0) {
			setError("Please enter a valid positive quantity.");
			return;
		}

		setLoading(true);
		setError(null);

		try {
			await updateCollectedQuantity(donationRequestId, {
				collectedQuantity: quantity,
			});
			onSuccess();
			onClose();
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Failed to confirm collection. Please try again.",
			);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
			{/* Backdrop */}
			<div
				className="fixed inset-0 bg-[#0B1A08]/80 backdrop-blur-sm transition-opacity"
				onClick={onClose}
				onKeyDown={(e) => e.key === "Escape" && onClose()}
				role="button"
				tabIndex={0}
				aria-label="Close modal"
			/>

			{/* Modal Content */}
			<div className="relative w-full max-w-md scale-100 rounded-2xl border border-white/10 bg-[#0B1A08] p-6 shadow-2xl transition-all sm:p-8">
				<button
					type="button"
					onClick={onClose}
					className="absolute right-4 top-4 rounded-xl p-2 text-[#F0EBE1]/55 transition hover:bg-white/5 hover:text-[#F0EBE1]"
					aria-label="Close"
				>
					<span className="flex h-5 w-5 items-center justify-center font-bold">
						X
					</span>
				</button>

				<h2 className="text-xl font-black text-[#F0EBE1] sm:text-2xl">
					Confirm Collection
				</h2>
				<p className="mt-2 text-sm text-[#F0EBE1]/65">
					Enter the actual quantity of <strong className="text-white">{foodType}</strong> collected from the provider.
				</p>

				{error && (
					<div className="mt-4 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-100">
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} className="mt-6 space-y-5">
					<div className="space-y-2">
						<label
							htmlFor="collectedQuantity"
							className="block text-sm font-bold text-[#F0EBE1]"
						>
							Collected Quantity ({unit})
						</label>
						<input
							id="collectedQuantity"
							type="number"
							step="0.01"
							min="0.01"
							required
							placeholder={`e.g., ${defaultQuantity}`}
							value={collectedQuantity}
							onChange={(e) => setCollectedQuantity(e.target.value)}
							className="auth-input w-full"
							disabled={loading}
						/>
						<p className="text-xs text-[#F0EBE1]/40">
							Requested amount was {defaultQuantity} {unit}. The actual collected amount may differ.
						</p>
					</div>

					<div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
						<button
							type="button"
							onClick={onClose}
							disabled={loading}
							className="rounded-xl px-5 py-3 text-sm font-bold text-[#F0EBE1]/70 transition hover:bg-white/5 hover:text-[#F0EBE1] disabled:opacity-50"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={loading || !collectedQuantity}
							className="inline-flex items-center justify-center rounded-xl bg-[#7DC542] px-6 py-3 text-sm font-black text-[#0B1A08] transition hover:bg-[#90D85A] disabled:opacity-50"
						>
							{loading ? "Processing..." : "Confirm Collection"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
