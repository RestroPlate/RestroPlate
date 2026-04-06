import type { Donation, DonationClaim } from "../../types/Dashboard";
import LocationView from "./LocationView";

interface ClaimDetailsModalProps {
	claim: DonationClaim;
	donation?: Donation;
	processing: boolean;
	onAccept: (claimId: number) => Promise<void>;
	onReject: (claimId: number) => Promise<void>;
	onClose: () => void;
}

const DETAIL_SECTION_CLASS =
	"space-y-4 rounded-xl border border-white/5 bg-white/5 p-4";
const LABEL_CLASS =
	"text-[10px] font-bold uppercase tracking-wider text-[#F0EBE1]/40";
const VALUE_CLASS = "text-sm font-semibold text-[#F0EBE1]";

export default function ClaimDetailsModal({
	claim,
	donation,
	processing,
	onAccept,
	onReject,
	onClose,
}: ClaimDetailsModalProps) {
	const center = claim.center;

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
			<div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-amber-400/20 bg-[#0F1D0C] shadow-2xl">
				{/* Header */}
				<div className="flex items-center justify-between border-b border-white/10 bg-amber-500/5 px-6 py-4">
					<h3 className="text-lg font-bold text-amber-300">
						Review Claim Request
					</h3>
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

				<div className="max-h-[70vh] overflow-y-auto p-6 space-y-6">
					{/* Center Details */}
					<section>
						<h4 className={LABEL_CLASS + " mb-3"}>Distribution Center</h4>
						<div className={DETAIL_SECTION_CLASS}>
							<div>
								<p className={LABEL_CLASS}>Name</p>
								<p className={VALUE_CLASS}>
									{center?.name || "Unknown Center"}
								</p>
							</div>
							{center?.address && (
								<div>
									<p className={LABEL_CLASS}>Address</p>
									<div className="mt-2">
										<LocationView address={center.address} height="160px" />
									</div>
								</div>
							)}
							<div className="grid grid-cols-2 gap-4">
								{center?.phoneNumber && (
									<div>
										<p className={LABEL_CLASS}>Phone Number</p>
										<p className={VALUE_CLASS}>{center.phoneNumber}</p>
									</div>
								)}
								{center?.email && (
									<div>
										<p className={LABEL_CLASS}>Email Address</p>
										<p className={VALUE_CLASS}>{center.email}</p>
									</div>
								)}
							</div>
						</div>
					</section>

					{/* Donation Details */}
					<section>
						<h4 className={LABEL_CLASS + " mb-3"}>Donation Info</h4>
						<div className={DETAIL_SECTION_CLASS}>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className={LABEL_CLASS}>Item(s)</p>
									<p className={VALUE_CLASS}>
										{donation?.foodType || "Loading..."}
									</p>
								</div>
								<div>
									<p className={LABEL_CLASS}>Quantity Ordered</p>
									<p className={VALUE_CLASS}>
										{donation?.quantity} {donation?.unit}
									</p>
								</div>
							</div>
							{donation?.description && (
								<div>
									<p className={LABEL_CLASS}>Description</p>
									<p className="text-sm text-[#F0EBE1]/70">
										{donation.description}
									</p>
								</div>
							)}
						</div>
					</section>

					<p className="text-xs text-center text-[#F0EBE1]/40 px-4">
						By accepting this request, you agree to fulfill the donation as
						specified. The center will be notified of your decision.
					</p>
				</div>

				{/* Footer Actions */}
				<div className="flex gap-3 border-t border-white/10 bg-black/20 p-6">
					<button
						type="button"
						disabled={processing}
						onClick={() => onAccept(claim.claimId)}
						className="flex-1 rounded-xl bg-[#7DC542] py-3 text-sm font-extrabold text-[#0B1A08] transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(125,197,66,0.25)] disabled:cursor-not-allowed disabled:opacity-60"
					>
						{processing ? "Accepting..." : "Accept Request"}
					</button>
					<button
						type="button"
						disabled={processing}
						onClick={() => onReject(claim.claimId)}
						className="flex-1 rounded-xl border border-rose-400/30 bg-rose-500/10 py-3 text-sm font-bold text-rose-300 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
					>
						Reject
					</button>
				</div>
			</div>
		</div>
	);
}
