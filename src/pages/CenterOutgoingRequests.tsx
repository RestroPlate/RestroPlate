// modified: added expandable sub-list showing donations linked to each request (Flow 2),
// with "Mark as Collected" button and DCInventoryTable integration.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import CollectDonationAction from "../components/dashboard/CollectDonationAction";
import DCInventoryTable from "../components/dashboard/DCInventoryTable";
import StatusNotice from "../components/StatusNotice";
import { getCenterOutgoingRequests, getDonationsForRequest } from "../services/donationRequestService";
import type { Donation, DonationRequest, DonationRequestStatus } from "../types/Dashboard";

type RequestFilter = "all" | DonationRequestStatus;

const FILTERS: RequestFilter[] = ["all", "pending", "partially_filled", "completed"];

function formatDate(value: string): string {
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) return value;
	return parsed.toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});
}

function getStatusClasses(status: DonationRequestStatus): string {
	switch (status) {
		case "completed":
			return "bg-emerald-500/15 text-emerald-300";
		case "partially_filled":
			return "bg-sky-500/15 text-sky-300";
		default:
			return "bg-amber-500/15 text-amber-300";
	}
}

const DONATION_STATUS_CLASSES: Record<string, string> = {
	AVAILABLE: "bg-emerald-500/15 text-emerald-300",
	REQUESTED: "bg-amber-500/15 text-amber-300",
	ACCEPTED: "bg-sky-500/15 text-sky-300",
	COLLECTED: "bg-sky-500/15 text-sky-300",
	COMPLETED: "bg-violet-500/15 text-violet-300",
};

export default function CenterOutgoingRequests() {
	const [requests, setRequests] = useState<DonationRequest[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [statusFilter, setStatusFilter] = useState<RequestFilter>("all");
	const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);
	const [inventoryRefreshKey, setInventoryRefreshKey] = useState(0);

	// Expanded sub-list state
	const [expandedId, setExpandedId] = useState<number | null>(null);
	const [subDonations, setSubDonations] = useState<Donation[]>([]);
	const [subLoading, setSubLoading] = useState(false);

	useEffect(() => {
		let active = true;

		async function loadRequests(): Promise<void> {
			setLoading(true);
			setError(null);

			try {
				const data = await getCenterOutgoingRequests(
					statusFilter === "all" ? undefined : statusFilter,
				);
				if (active) {
					setRequests(data);
				}
			} catch (err) {
				if (active) {
					setError(
						err instanceof Error
							? err.message
							: "Failed to load outgoing donation requests.",
					);
				}
			} finally {
				if (active) {
					setLoading(false);
				}
			}
		}

		void loadRequests();

		return () => {
			active = false;
		};
	}, [statusFilter]);

	async function toggleExpand(requestId: number): Promise<void> {
		if (expandedId === requestId) {
			setExpandedId(null);
			setSubDonations([]);
			return;
		}

		setExpandedId(requestId);
		setSubLoading(true);
		try {
			const donations = await getDonationsForRequest(requestId);
			setSubDonations(donations);
		} catch {
			setSubDonations([]);
		} finally {
			setSubLoading(false);
		}
	}

	function handleCollected(requestId: number): void {
		setNotice({ type: "success", message: `Donation collected and added to inventory (Request #${requestId}).` });
		setInventoryRefreshKey((k) => k + 1);
		// Re-fetch sub-list
		void toggleExpand(requestId).then(() => toggleExpand(requestId));
	}

	return (
		<DashboardLayout>
			<div className="space-y-6">
				<div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 lg:flex-row lg:items-end lg:justify-between">
					<div className="max-w-2xl">
						<p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7DC542]">
							Flow 2 — My Donation Requests
						</p>
						<h2 className="mt-2 text-2xl font-black text-[#F0EBE1]">
							Track requests your center has posted for donors to fulfill.
						</h2>
						<p className="mt-2 text-sm text-[#F0EBE1]/65">
							Expand a request to see linked donations and collect them.
						</p>
					</div>

					<div className="flex flex-col gap-3 sm:flex-row sm:items-end">
						<label className="space-y-2">
							<span className="text-sm font-bold text-[#F0EBE1]">Status Filter</span>
							<select
								value={statusFilter}
								onChange={(event) => setStatusFilter(event.target.value as RequestFilter)}
								className="auth-input min-w-[12rem] cursor-pointer"
							>
								{FILTERS.map((filter) => (
									<option key={filter} value={filter}>
										{filter === "all"
											? "All statuses"
											: filter.replace("_", " ").replace(/^\w/, (c) => c.toUpperCase())}
									</option>
								))}
							</select>
						</label>

						<Link
							to="/dashboard/center/create-request"
							className="inline-flex items-center justify-center rounded-xl bg-[#7DC542] px-4 py-3 text-sm font-black text-[#0B1A08] transition hover:bg-[#90D85A]"
						>
							Post New Request
						</Link>
					</div>
				</div>

				{notice ? (
					<StatusNotice type={notice.type} message={notice.message} onClose={() => setNotice(null)} />
				) : null}

				{error ? (
					<div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-100">
						{error}
					</div>
				) : null}

				{loading ? (
					<div className="space-y-3">
						<div className="skeleton-shimmer h-[100px]" />
						<div className="skeleton-shimmer h-[100px]" />
						<div className="skeleton-shimmer h-[100px]" />
					</div>
				) : requests.length === 0 ? (
					<div className="rounded-2xl border border-dashed border-white/15 bg-white/5 px-6 py-12 text-center">
						<h3 className="text-lg font-bold text-[#F0EBE1]">
							No donation requests yet
						</h3>
						<p className="mt-2 text-sm text-[#F0EBE1]/55">
							Post a new request so donors can fulfill your center's needs.
						</p>
					</div>
				) : (
					<div className="space-y-3">
						{requests.map((request) => (
							<article
								key={request.donationRequestId}
								className="rounded-2xl border border-white/10 bg-white/5 transition hover:border-white/15"
							>
								{/* Request Row */}
								<button
									type="button"
									onClick={() => toggleExpand(request.donationRequestId)}
									className="flex w-full flex-wrap items-center justify-between gap-3 p-5 text-left"
								>
									<div>
										<p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7DC542]">
											Request #{request.donationRequestId}
										</p>
										<h3 className="mt-1 text-lg font-bold text-[#F0EBE1]">
											{request.foodType}
										</h3>
										<div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-[#F0EBE1]/60">
											<span>Needed: {request.requestedQuantity} {request.unit}</span>
											<span>Remaining: {request.requestedQuantity - request.donatedQuantity} {request.unit}</span>
											<span>Created: {formatDate(request.createdAt)}</span>
										</div>
									</div>

									<div className="flex items-center gap-3">
										<span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${getStatusClasses(request.status)}`}>
											{request.status.replace("_", " ")}
										</span>
										<span className="text-[#F0EBE1]/40 text-lg">
											{expandedId === request.donationRequestId ? "▲" : "▼"}
										</span>
									</div>
								</button>

								{/* Expandable Sub-List */}
								{expandedId === request.donationRequestId ? (
									<div className="border-t border-white/10 bg-white/[0.02] p-5">
										{subLoading ? (
											<div className="skeleton-shimmer h-[60px]" />
										) : subDonations.length === 0 ? (
											<p className="text-sm text-[#F0EBE1]/50">
												No donations linked to this request yet.
											</p>
										) : (
											<div className="space-y-3">
												<p className="text-xs font-bold uppercase tracking-[0.08em] text-[#F0EBE1]/50">
													Linked Donations
												</p>
												{subDonations.map((donation) => (
													<div
														key={donation.donationId}
														className="rounded-xl border border-white/10 bg-white/5 p-4"
													>
														<div className="flex flex-wrap items-center justify-between gap-2">
															<div>
																<span className="text-sm font-bold text-[#F0EBE1]">
																	{`Donor #${donation.providerUserId}`}
																</span>
																<span className="mx-2 text-[#F0EBE1]/30">·</span>
																<span className="text-sm text-[#F0EBE1]/60">
																	{donation.quantity} {donation.unit}
																</span>
															</div>
															<span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${DONATION_STATUS_CLASSES[donation.status] ?? "bg-white/10 text-white/60"}`}>
																{donation.status}
															</span>
														</div>

														{/* Mark as Collected for REQUESTED donations in Flow 2 */}
														{(donation.status === "REQUESTED" || donation.status === "ACCEPTED") ? (
															<CollectDonationAction
																donationId={donation.donationId}
																quantity={donation.quantity}
																unit={donation.unit}
																onCollected={() => handleCollected(request.donationRequestId)}
															/>
														) : null}
													</div>
												))}
											</div>
										)}
									</div>
								) : null}
							</article>
						))}
					</div>
				)}

				{/* ── DC Inventory Table ── */}
				<div className="space-y-3">
					<h3 className="text-lg font-bold text-[#F0EBE1]">Collected Inventory</h3>
					<DCInventoryTable refreshKey={inventoryRefreshKey} />
				</div>
			</div>
		</DashboardLayout>
	);
}
