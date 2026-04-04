import type { CenterDetails } from "../../types/Dashboard";

interface CenterDetailsModalProps {
	center: CenterDetails;
	onClose: () => void;
}

const DETAIL_SECTION_CLASS = "space-y-4 rounded-xl border border-white/5 bg-white/5 p-4";
const LABEL_CLASS = "text-[10px] font-bold uppercase tracking-wider text-[#F0EBE1]/40";
const VALUE_CLASS = "text-sm font-semibold text-[#F0EBE1]";

export default function CenterDetailsModal({
	center,
	onClose,
}: CenterDetailsModalProps) {
	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
			<div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-emerald-400/20 bg-[#0F1D0C] shadow-2xl">
				{/* Header */}
				<div className="flex items-center justify-between border-b border-white/10 bg-emerald-500/5 px-6 py-4">
					<h3 className="text-lg font-bold text-emerald-300">Distribution Center Details</h3>
					<button
						type="button"
						onClick={onClose}
						className="rounded-lg p-1.5 text-[#F0EBE1]/50 transition hover:bg-white/10 hover:text-[#F0EBE1]"
					>
						<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
							<path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
						</svg>
					</button>
				</div>

				<div className="p-6 space-y-6">
					<div className={DETAIL_SECTION_CLASS}>
						<div>
							<p className={LABEL_CLASS}>Center Name</p>
							<p className={VALUE_CLASS}>{center.name}</p>
						</div>
						<div>
							<p className={LABEL_CLASS}>Address</p>
							<p className={VALUE_CLASS}>{center.address}</p>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<p className={LABEL_CLASS}>Phone Number</p>
								<p className={VALUE_CLASS}>{center.phoneNumber}</p>
							</div>
							<div>
								<p className={LABEL_CLASS}>Email Address</p>
								<p className={VALUE_CLASS}>{center.email}</p>
							</div>
						</div>
					</div>

					<button
						type="button"
						onClick={onClose}
						className="w-full rounded-xl bg-[#7DC542] py-3 text-sm font-extrabold text-[#0B1A08] transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(125,197,66,0.25)]"
					>
						Close
					</button>
				</div>
			</div>
		</div>
	);
}
