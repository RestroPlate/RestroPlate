// rewritten: uses donation-claims API instead of filtering donations by status
import { useState } from "react";
import type { Donation, DonationClaim } from "../../types/Dashboard";
import { updateClaimStatus } from "../../services/claimService";
import StatusNotice from "../StatusNotice";

interface DonorNotificationPanelProps {
	claims: DonationClaim[];
	donations: Donation[];
	onRefresh: () => Promise<void>;
}

/**
 * Shows notification cards for pending claim requests on the donor's donations.
 * Donor can Accept or Reject each claim.
 */
export default function DonorNotificationPanel({ claims, donations, onRefresh }: DonorNotificationPanelProps) {
	const [processingId, setProcessingId] = useState<number | null>(null);
	const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);

	const pendingClaims = claims.filter((c) => c.status === "PENDING");

	if (pendingClaims.length === 0 && !notice) return null;

	// Look up donation details for a claim
	function getDonation(donationId: number): Donation | undefined {
		return donations.find((d) => d.donationId === donationId);
	}

	async function handleAccept(claimId: number): Promise<void> {
		setProcessingId(claimId);
		setNotice(null);
		try {
			await updateClaimStatus(claimId, "ACCEPTED");
			setNotice({ type: "success", message: "Claim accepted — donation assigned to center." });
			await onRefresh();
		} catch (err) {
			setNotice({ type: "error", message: err instanceof Error ? err.message : "Failed to accept." });
		} finally {
			setProcessingId(null);
		}
	}

	async function handleReject(claimId: number): Promise<void> {
		setProcessingId(claimId);
		setNotice(null);
		try {
			await updateClaimStatus(claimId, "REJECTED");
			setNotice({ type: "success", message: "Claim rejected." });
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
				🔔 Incoming Claim Requests
			</h3>

			{notice ? (
				<StatusNotice type={notice.type} message={notice.message} onClose={() => setNotice(null)} />
			) : null}

			{pendingClaims.map((claim) => {
				const donation = getDonation(claim.donationId);
				return (
					<article
						key={claim.claimId}
						className="rounded-xl border border-amber-400/20 bg-amber-500/5 p-4"
					>
						<p className="text-sm font-semibold text-[#F0EBE1]">
							<span className="font-bold text-amber-300">
								A distribution center
							</span>{" "}
							has claimed your donation{" "}
							<span className="font-bold text-[#7DC542]">
								"{donation?.foodType ?? `#${claim.donationId}`}"
							</span>
						</p>
						{donation ? (
							<p className="mt-1 text-xs text-[#F0EBE1]/55">
								Quantity: {donation.quantity} {donation.unit}
							</p>
						) : null}

						<div className="mt-3 flex gap-2">
							<button
								type="button"
								disabled={processingId === claim.claimId}
								onClick={() => handleAccept(claim.claimId)}
								className="inline-flex items-center rounded-lg bg-[#7DC542] px-4 py-2 text-xs font-extrabold text-[#0B1A08] transition hover:bg-[#90D85A] disabled:cursor-not-allowed disabled:opacity-60"
							>
								{processingId === claim.claimId ? "Processing..." : "Accept"}
							</button>
							<button
								type="button"
								disabled={processingId === claim.claimId}
								onClick={() => handleReject(claim.claimId)}
								className="inline-flex items-center rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-300 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
							>
								Reject
							</button>
						</div>
					</article>
				);
			})}
		</section>
	);
}
