import type { Donation } from "../../types/Dashboard";

interface DonationDetailsModalProps {
	donation: Donation;
	onClose: () => void;
}

const DETAIL_SECTION_CLASS =
	"space-y-4 rounded-xl border border-white/5 bg-white/5 p-4";
const LABEL_CLASS =
	"text-[10px] font-bold uppercase tracking-wider text-[#F0EBE1]/40";
const VALUE_CLASS = "text-sm font-semibold text-[#F0EBE1]";

export default function DonationDetailsModal({
	donation,
	onClose,
}: DonationDetailsModalProps) {
	const formatDate = (dateStr?: string) => {
		if (!dateStr) return "N/A";
		try {
			return new Date(dateStr).toLocaleString("en-US", {
				month: "short",
				day: "numeric",
				year: "numeric",
				hour: "numeric",
				minute: "2-digit",
			});
		} catch {
			return dateStr;
		}
	};

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
			<div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[#7DC542]/20 bg-[#0F1D0C] shadow-2xl">
				{/* Header */}
				<div className="flex items-center justify-between border-b border-white/10 bg-[#7DC542]/5 px-6 py-4">
					<h3 className="text-lg font-bold text-[#7DC542]">Donation Details</h3>
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

				<div className="max-h-[80vh] overflow-y-auto p-6 space-y-6 custom-scrollbar">
					{/* Basic Info */}
					<div className={DETAIL_SECTION_CLASS}>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<p className={LABEL_CLASS}>Food Type</p>
								<p className="text-base font-black text-[#F0EBE1] capitalize">
									{donation.foodType}
								</p>
							</div>
							<div>
								<p className={LABEL_CLASS}>Status</p>
								<span className="inline-flex rounded-full bg-[#7DC542]/10 px-2.5 py-0.5 text-xs font-bold text-[#7DC542]">
									{donation.status}
								</span>
							</div>
						</div>
						<div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
							<div>
								<p className={LABEL_CLASS}>Quantity</p>
								<p className={VALUE_CLASS}>
									{donation.quantity} {donation.unit}
								</p>
							</div>
							<div>
								<p className={LABEL_CLASS}>Expiration</p>
								<p className={VALUE_CLASS}>{formatDate(donation.expirationDate)}</p>
							</div>
						</div>
					</div>

					{/* Distribution Stats (If collected) */}
					{(donation.collectedAmount !== undefined ||
						donation.distributedQuantity !== undefined) && (
						<div className={`${DETAIL_SECTION_CLASS} border-emerald-500/10`}>
							<p className={LABEL_CLASS}>Inventory Stats</p>
							<div className="grid grid-cols-3 gap-4 pt-2">
								<div>
									<p className="text-[9px] uppercase text-[#F0EBE1]/40">
										Collected
									</p>
									<p className="text-sm font-bold text-emerald-400">
										{donation.collectedAmount ?? donation.quantity}{" "}
										{donation.unit}
									</p>
								</div>
								<div>
									<p className="text-[9px] uppercase text-[#F0EBE1]/40">
										Distributed
									</p>
									<p className="text-sm font-bold text-sky-400">
										{donation.distributedQuantity ?? 0} {donation.unit}
									</p>
								</div>
								<div>
									<p className="text-[9px] uppercase text-[#F0EBE1]/40">
										Remaining
									</p>
									{/* Remaining = Collected - Distributed */}
									<p className="text-sm font-bold text-[#7DC542]">
										{(donation.collectedAmount ?? donation.quantity) -
											(donation.distributedQuantity ?? 0)}{" "}
										{donation.unit}
									</p>
								</div>
							</div>
						</div>
					)}

					{/* Pickup Info */}
					<div className={DETAIL_SECTION_CLASS}>
						<div>
							<p className={LABEL_CLASS}>Pickup Address</p>
							<p className={VALUE_CLASS}>{donation.pickupAddress}</p>
						</div>
						<div className="pt-2">
							<p className={LABEL_CLASS}>Availability Time</p>
							<p className={VALUE_CLASS}>{donation.availabilityTime}</p>
						</div>
					</div>

					{/* Extra Metadata */}
					<div className="grid grid-cols-2 gap-4">
						<div className="rounded-xl bg-white/5 p-4">
							<p className={LABEL_CLASS}>Donation ID</p>
							<p className="text-xs font-mono text-[#F0EBE1]/60">
								#{donation.donationId}
							</p>
						</div>
						<div className="rounded-xl bg-white/5 p-4">
							<p className={LABEL_CLASS}>Created At</p>
							<p className="text-xs font-mono text-[#F0EBE1]/60">
								{formatDate(donation.createdAt)}
							</p>
						</div>
					</div>

					<button
						type="button"
						onClick={onClose}
						className="w-full rounded-xl bg-[#7DC542] py-3 text-sm font-extrabold text-[#0B1A08] transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(125,197,66,0.25)]"
					>
						Close Details
					</button>
				</div>
			</div>
		</div>
	);
}
