// new: Donor notification panel for Flow 1 accept/reject lifecycle
import { useState } from "react";
import type { Donation } from "../../types/Dashboard";
import { acceptDonation, rejectDonation } from "../../services/donationService";
import StatusNotice from "../StatusNotice";

interface DonorNotificationPanelProps {
	donations: Donation[];
	onRefresh: () => Promise<void>;
}

/**
 * Shows notification cards for donations that have been requested by a DC.
 * Donor can Accept or Reject each request.
 */
export default function DonorNotificationPanel({ donations, onRefresh }: DonorNotificationPanelProps) {
	const [processingId, setProcessingId] = useState<number | null>(null);
	const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);

	const requestedDonations = donations.filter((d) => d.status === "REQUESTED" && !d.donationRequestId);

	if (requestedDonations.length === 0 && !notice) return null;

	async function handleAccept(donationId: number): Promise<void> {
		setProcessingId(donationId);
		setNotice(null);
		try {
			await acceptDonation(donationId);
			setNotice({ type: "success", message: "Donation accepted — awaiting delivery." });
			await onRefresh();
		} catch (err) {
			setNotice({ type: "error", message: err instanceof Error ? err.message : "Failed to accept." });
		} finally {
			setProcessingId(null);
		}
	}

	async function handleReject(donationId: number): Promise<void> {
		setProcessingId(donationId);
		setNotice(null);
		try {
			await rejectDonation(donationId);
			setNotice({ type: "success", message: "Donation rejected — returned to available." });
			await onRefresh();
		} catch (err) {
			setNotice({ type: "error", message: err instanceof Error ? err.message : "Failed to reject." });
		} finally {
			setProcessingId(null);
		}
	}

	return (
		<section className="space-y-3">
			<h3 className="text-sm font-bold uppercase tracking-[0.08em] text-amber-300">
				🔔 Incoming Requests
			</h3>

			{notice ? (
				<StatusNotice type={notice.type} message={notice.message} onClose={() => setNotice(null)} />
			) : null}

			{requestedDonations.map((donation) => (
				<article
					key={donation.donationId}
					className="rounded-xl border border-amber-400/20 bg-amber-500/5 p-4"
				>
					<p className="text-sm font-semibold text-[#F0EBE1]">
						<span className="font-bold text-amber-300">
							{donation.requesterName ?? "A distribution center"}
						</span>{" "}
						has requested your donation{" "}
						<span className="font-bold text-[#7DC542]">"{donation.foodType}"</span>
					</p>
					<p className="mt-1 text-xs text-[#F0EBE1]/55">
						Quantity: {donation.quantity} {donation.unit}
					</p>

					{donation.status === "REQUESTED" ? (
						<div className="mt-3 flex gap-2">
							<button
								type="button"
								disabled={processingId === donation.donationId}
								onClick={() => handleAccept(donation.donationId)}
								className="inline-flex items-center rounded-lg bg-[#7DC542] px-4 py-2 text-xs font-extrabold text-[#0B1A08] transition hover:bg-[#90D85A] disabled:cursor-not-allowed disabled:opacity-60"
							>
								{processingId === donation.donationId ? "Processing..." : "Accept"}
							</button>
							<button
								type="button"
								disabled={processingId === donation.donationId}
								onClick={() => handleReject(donation.donationId)}
								className="inline-flex items-center rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-300 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
							>
								Reject
							</button>
						</div>
					) : donation.status === "ACCEPTED" ? (
						<p className="mt-3 text-xs font-bold uppercase tracking-[0.08em] text-sky-300">
							✓ Accepted — Awaiting delivery
						</p>
					) : null}
				</article>
			))}
		</section>
	);
}
