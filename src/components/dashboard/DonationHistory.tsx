import { useState } from "react";
import EditDonationModal from "./EditDonationModal";
import CenterDetailsModal from "./CenterDetailsModal";
import LocationView from "./LocationView";
import StatusNotice from "../StatusNotice";
import type {
	CenterDetails,
	Donation,
	DonationStatus,
	UpdateDonationPayload,
} from "../../types/Dashboard";
import { updateDonation, deleteDonation } from "../../services/donationService";
import { updateDonationRequestQuantity } from "../../services/donationRequestService";

interface DonationHistoryProps {
	donations: Donation[];
	onRefresh: () => Promise<void>;
}

// modified: removed ACCEPTED from filter options
type FilterStatus = "AVAILABLE" | "REQUESTED" | "COLLECTED" | "COMPLETED";

const FILTER_OPTIONS: { label: string; value: FilterStatus }[] = [
	{ label: "Available", value: "AVAILABLE" },
	{ label: "Requested", value: "REQUESTED" },
	{ label: "Collected", value: "COLLECTED" },
	{ label: "Completed", value: "COMPLETED" },
];

const STATUS_CLASSES: Record<DonationStatus, string> = {
	AVAILABLE: "bg-emerald-500/15 text-emerald-300",
	REQUESTED: "bg-amber-500/15 text-amber-300",
	COLLECTED: "bg-sky-500/15 text-sky-300",
	COMPLETED: "bg-violet-500/15 text-violet-300",
};

function formatDate(dateStr: string): string {
	if (!dateStr) return "—";
	const d = new Date(dateStr);
	if (Number.isNaN(d.getTime())) return dateStr;
	return d.toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

export default function DonationHistory({
	donations,
	onRefresh,
}: DonationHistoryProps) {
	const [filter, setFilter] = useState<FilterStatus>("AVAILABLE");
	const [editingDonation, setEditingDonation] = useState<Donation | null>(null);
	const [viewingCenter, setViewingCenter] = useState<CenterDetails | null>(
		null,
	);
	const [deletingId, setDeletingId] = useState<number | null>(null);
	const [notice, setNotice] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);

	const filtered = donations.filter((d) => d.status === filter);

	async function handleEdit(
		id: number,
		payload: UpdateDonationPayload,
	): Promise<void> {
		const originalDonation = donations.find((d) => d.donationId === id);
		await updateDonation(id, payload);

		// If this donation is linked to a request, update the request's remaining quantity
		if (originalDonation?.donationRequestId) {
			const quantityDiff = payload.quantity - originalDonation.quantity;
			if (quantityDiff !== 0) {
				try {
					await updateDonationRequestQuantity(
						originalDonation.donationRequestId,
						{
							donatedQuantity: quantityDiff,
						},
					);
				} catch (err) {
					console.error("Failed to sync donation request quantity:", err);
				}
			}
		}

		setNotice({ type: "success", message: "Donation updated successfully." });
		await onRefresh();
	}

	async function handleDelete(id: number): Promise<void> {
		const donationToDelete = donations.find((d) => d.donationId === id);
		setDeletingId(id);
		try {
			await deleteDonation(id);

			// If this donation was linked to a request, restore the quantity to the request
			if (donationToDelete?.donationRequestId) {
				try {
					await updateDonationRequestQuantity(
						donationToDelete.donationRequestId,
						{
							donatedQuantity: -donationToDelete.quantity,
						},
					);
				} catch (err) {
					console.error("Failed to restore donation request quantity:", err);
				}
			}

			setNotice({ type: "success", message: "Donation deleted successfully." });
			await onRefresh();
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Failed to delete donation.";
			setNotice({ type: "error", message });
		} finally {
			setDeletingId(null);
		}
	}

	return (
		<>
			{/* ── Filter Bar ── */}
			<div className="mb-4 flex flex-wrap items-center gap-2">
				<span className="mr-1 text-xs font-bold uppercase tracking-[0.08em] text-[#F0EBE1]/50">
					Filter:
				</span>
				{FILTER_OPTIONS.map((opt) => (
					<button
						key={opt.value}
						type="button"
						onClick={() => setFilter(opt.value)}
						className={`rounded-full px-4 py-1.5 text-xs font-bold tracking-wide transition ${
							filter === opt.value
								? "bg-[#7DC542] text-[#0B1A08] shadow-[0_4px_12px_rgba(125,197,66,0.25)]"
								: "border border-white/10 bg-white/5 text-[#F0EBE1]/60 hover:bg-white/10 hover:text-[#F0EBE1]"
						}`}
					>
						{opt.label}
					</button>
				))}
			</div>

			{notice ? (
				<div className="mb-4">
					<StatusNotice
						type={notice.type}
						message={notice.message}
						onClose={() => setNotice(null)}
					/>
				</div>
			) : null}

			{/* ── Donation Cards ── */}
			<section className="space-y-3">
				{filtered.length === 0 ? (
					<div className="rounded-xl border border-dashed border-white/15 bg-white/5 p-6 text-center text-sm text-[#F0EBE1]/65">
						No donations with status "{filter}" found.
					</div>
				) : (
					filtered.map((donation) => {
						const isRequested =
							donation.status === "REQUESTED" && !!donation.centerDetails;

						return (
							<article
								key={donation.donationId}
								onClick={
									isRequested
										? () => setViewingCenter(donation.centerDetails!)
										: undefined
								}
								className={`group rounded-xl border border-white/10 bg-white/5 p-4 transition ${
									isRequested
										? "cursor-pointer hover:border-amber-400/30 hover:bg-white/10"
										: "hover:border-white/15"
								}`}
							>
								<div className="flex flex-wrap items-center justify-between gap-3">
									<div>
										<p className="text-base font-bold text-[#F0EBE1]">
											{donation.foodType}
										</p>
										{isRequested && (
											<div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-amber-300/80 transition group-hover:text-amber-300">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													className="h-3.5 w-3.5"
													viewBox="0 0 20 20"
													fill="currentColor"
												>
													<path
														fillRule="evenodd"
														d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-1h2v1zm0-2H9V7h2v4z"
														clipRule="evenodd"
													/>
												</svg>
												Claimed by:{" "}
												<span className="underline decoration-amber-300/30 underline-offset-2">
													{donation.centerDetails!.name}
												</span>
											</div>
										)}
									</div>
									<span
										className={`rounded-full px-3 py-1 text-xs font-extrabold tracking-wide ${STATUS_CLASSES[donation.status]}`}
									>
										{donation.status}
									</span>
								</div>

								<div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#F0EBE1]/70">
									<span>
										Quantity: {donation.quantity} {donation.unit}
									</span>
									<div className="w-full mt-2">
										<p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#F0EBE1]/40">Pickup Location</p>
										<LocationView address={donation.pickupAddress} height="120px" />
									</div>
									<span>Expires: {formatDate(donation.expirationDate)}</span>
									<span>Available At: {donation.availabilityTime}</span>
									<span>Created: {formatDate(donation.createdAt)}</span>
								</div>

								{/* ── Action Buttons (only for AVAILABLE) ── */}
								{donation.status === "AVAILABLE" ? (
									<div className="mt-3 flex gap-2 border-t border-white/5 pt-3">
										<button
											type="button"
											onClick={() => setEditingDonation(donation)}
											className="inline-flex items-center gap-1.5 rounded-lg border border-[#7DC542]/30 bg-[#7DC542]/10 px-4 py-2 text-xs font-bold text-[#7DC542] transition hover:bg-[#7DC542]/20"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												className="h-3.5 w-3.5"
												viewBox="0 0 20 20"
												fill="currentColor"
											>
												<path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
											</svg>
											Edit
										</button>
										<button
											type="button"
											disabled={deletingId === donation.donationId}
											onClick={() => handleDelete(donation.donationId)}
											className="inline-flex items-center gap-1.5 rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-300 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												className="h-3.5 w-3.5"
												viewBox="0 0 20 20"
												fill="currentColor"
											>
												<path
													fillRule="evenodd"
													d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
													clipRule="evenodd"
												/>
											</svg>
											{deletingId === donation.donationId
												? "Deleting..."
												: "Delete"}
										</button>
									</div>
								) : null}
							</article>
						);
					})
				)}
			</section>

			{/* ── Edit Modal ── */}
			{editingDonation ? (
				<EditDonationModal
					donation={editingDonation}
					onSave={handleEdit}
					onClose={() => setEditingDonation(null)}
				/>
			) : null}

			{/* ── Center Details Modal ── */}
			{viewingCenter ? (
				<CenterDetailsModal
					center={viewingCenter}
					onClose={() => setViewingCenter(null)}
				/>
			) : null}
		</>
	);
}
