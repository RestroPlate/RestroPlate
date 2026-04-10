import { useState, useEffect } from "react";
import Pagination from "../Pagination";
import type { Donation, DonationClaim } from "../../types/Dashboard";
import { updateClaimStatus } from "../../services/claimService";
import StatusNotice from "../StatusNotice";
import ClaimDetailsModal from "./ClaimDetailsModal";

interface DonorNotificationPanelProps {
	claims: DonationClaim[];
	donations: Donation[];
	onRefresh: () => Promise<void>;
}

export default function DonorNotificationPanel({
	claims,
	donations,
	onRefresh,
}: DonorNotificationPanelProps) {
	const [activeClaimId, setActiveClaimId] = useState<number | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [processingId, setProcessingId] = useState<number | null>(null);
	const [notice, setNotice] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);

	const pendingClaims = claims.filter((c) => c.status === "PENDING");

	const PAGE_SIZE = 5;

	useEffect(() => {
		setCurrentPage(1);
	}, [claims]);

	const totalPages = Math.ceil(pendingClaims.length / PAGE_SIZE);
	const paginatedClaims = pendingClaims.slice(
		(currentPage - 1) * PAGE_SIZE,
		currentPage * PAGE_SIZE,
	);

	if (pendingClaims.length === 0 && !notice) return null;

	function getDonation(donationId: number): Donation | undefined {
		return donations.find((d) => d.donationId === donationId);
	}

	async function handleAccept(claimId: number): Promise<void> {
		setProcessingId(claimId);
		setNotice(null);
		try {
			await updateClaimStatus(claimId, "ACCEPTED");
			setNotice({ type: "success", message: "Claim accepted!" });
			setActiveClaimId(null);
			await onRefresh();
		} catch (err) {
			setNotice({
				type: "error",
				message: err instanceof Error ? err.message : "Failed to accept.",
			});
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
			setActiveClaimId(null);
			await onRefresh();
		} catch (err) {
			setNotice({
				type: "error",
				message: err instanceof Error ? err.message : "Failed to reject.",
			});
		} finally {
			setProcessingId(null);
		}
	}

	const activeClaim = pendingClaims.find((c) => c.claimId === activeClaimId);
	const activeDonation = activeClaim
		? getDonation(activeClaim.donationId)
		: undefined;

	return (
		<section className="space-y-3">
			<h3 className="text-sm font-bold uppercase tracking-[0.08em] text-amber-300">
				🔔 Incoming Claim Requests
			</h3>

			{notice ? (
				<StatusNotice
					type={notice.type}
					message={notice.message}
					onClose={() => setNotice(null)}
				/>
			) : null}

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{paginatedClaims.map((claim) => {
					const donation = getDonation(claim.donationId);
					return (
						<article
							key={claim.claimId}
							className="group flex flex-col justify-between rounded-xl border border-amber-400/20 bg-amber-500/5 p-4 transition hover:bg-amber-400/10"
						>
							<div className="space-y-1">
								<h4 className="line-clamp-1 text-sm font-bold text-amber-300">
									{claim.center?.name || "A Distribution Center"}
								</h4>
								<p className="line-clamp-1 text-xs text-[#F0EBE1]/60">
									📍 {claim.center?.address || "Address not provided"}
								</p>
								<div className="mt-2 text-xs font-semibold text-[#F0EBE1]">
									Requesting:{" "}
									<span className="text-[#7DC542]">
										{donation?.foodType || "Loading..."}
									</span>
								</div>
							</div>

							<button
								type="button"
								onClick={() => setActiveClaimId(claim.claimId)}
								className="mt-4 inline-flex items-center justify-center rounded-lg bg-amber-400/10 py-2 text-[10px] font-bold uppercase tracking-widest text-amber-300 transition hover:bg-amber-400/20"
							>
								Review Request
							</button>
						</article>
					);
				})}
			</div>

			<Pagination
				currentPage={currentPage}
				totalPages={totalPages}
				onPageChange={setCurrentPage}
			/>

			{activeClaim && (
				<ClaimDetailsModal
					claim={activeClaim}
					donation={activeDonation}
					processing={processingId === activeClaim.claimId}
					onAccept={handleAccept}
					onReject={handleReject}
					onClose={() => setActiveClaimId(null)}
				/>
			)}
		</section>
	);
}
