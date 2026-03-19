import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { getCenterOutgoingRequests } from "../services/donationRequestService";
import type { DonationRequest, DonationRequestStatus } from "../types/Dashboard";
import CollectionConfirmationModal from "../components/dashboard/CollectionConfirmationModal";

type RequestFilter = "all" | DonationRequestStatus;

const FILTERS: RequestFilter[] = ["all", "pending", "completed", "collected"];

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
		default:
			return "bg-amber-500/15 text-amber-300";
	}
}

export default function CenterOutgoingRequests() {
	const [requests, setRequests] = useState<DonationRequest[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [statusFilter, setStatusFilter] = useState<RequestFilter>("all");
	const [refreshTrigger, setRefreshTrigger] = useState(0);

	const [selectedRequest, setSelectedRequest] = useState<DonationRequest | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

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
	}, [statusFilter, refreshTrigger]);

	function handleCollectionSuccess() {
		setRefreshTrigger((prev) => prev + 1);
	}

	function openCollectionModal(request: DonationRequest) {
		setSelectedRequest(request);
		setIsModalOpen(true);
	}

	return (
		<DashboardLayout>
			<div className="space-y-6">
				<div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 lg:flex-row lg:items-end lg:justify-between">
					<div className="max-w-2xl">
						<p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7DC542]">
							Outgoing Requests
						</p>
						<h2 className="mt-2 text-2xl font-black text-[#F0EBE1]">
							Track every donation request your center has sent to providers.
						</h2>
						<p className="mt-2 text-sm text-[#F0EBE1]/65">
							This page reads `GET /api/donation-requests/outgoing` so your center can
							follow request status changes from pending to completed.
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
											: `${filter.charAt(0).toUpperCase()}${filter.slice(1)}`}
									</option>
								))}
							</select>
						</label>

						<Link
							to="/dashboard/center/explore"
							className="inline-flex items-center justify-center rounded-xl bg-[#7DC542] px-4 py-3 text-sm font-black text-[#0B1A08] transition hover:bg-[#90D85A]"
						>
							Request Another Donation
						</Link>
					</div>
				</div>

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
							No outgoing requests yet
						</h3>
						<p className="mt-2 text-sm text-[#F0EBE1]/55">
							Start from the browse donations page to create your first provider request.
						</p>
					</div>
				) : (
					<>
						<div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-white/5 lg:block">
							<table className="w-full border-collapse">
								<thead className="bg-white/5">
									<tr className="text-left text-xs font-bold uppercase tracking-[0.12em] text-[#F0EBE1]/55">
										<th className="px-5 py-4">Request</th>
										<th className="px-5 py-4">Quantity</th>
										<th className="px-5 py-4">Food</th>
										<th className="px-5 py-4">Status</th>
										<th className="px-5 py-4">Created</th>
										<th className="px-5 py-4 text-right">Actions</th>
									</tr>
								</thead>
								<tbody>
									{requests.map((request) => (
										<tr
											key={request.donationRequestId}
											className="border-t border-white/10 text-sm text-[#F0EBE1]/75"
										>
											<td className="px-5 py-4 font-bold text-[#F0EBE1]">
												#{request.donationRequestId}
											</td>
											<td className="px-5 py-4">
												{request.requestedQuantity} {request.unit}
											</td>
											<td className="px-5 py-4">{request.foodType}</td>
											<td className="px-5 py-4">
												<span
													className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${getStatusClasses(request.status)}`}
												>
													{request.status}
												</span>
											</td>
											<td className="px-5 py-4">{formatDate(request.createdAt)}</td>
											<td className="px-5 py-4 text-right">
												{request.status === "completed" && (
													<button
														type="button"
														onClick={() => openCollectionModal(request)}
														className="rounded-lg bg-[#7DC542]/10 px-3 py-1.5 text-xs font-bold text-[#7DC542] transition hover:bg-[#7DC542]/20"
													>
														Mark Collected
													</button>
												)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						<div className="grid gap-4 lg:hidden">
							{requests.map((request) => (
								<article
									key={request.donationRequestId}
									className="rounded-2xl border border-white/10 bg-white/5 p-5"
								>
									<div className="flex items-start justify-between gap-3">
										<div>
											<p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7DC542]">
												Request #{request.donationRequestId}
											</p>
											<h3 className="mt-2 text-lg font-bold text-[#F0EBE1]">
												{request.foodType}
											</h3>
										</div>
										<span
											className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${getStatusClasses(request.status)}`}
										>
											{request.status}
										</span>
									</div>

									<div className="mt-4 space-y-2 text-sm text-[#F0EBE1]/70">
										<div className="flex items-center justify-between gap-3">
											<span>Requested Quantity</span>
											<span className="font-medium text-[#F0EBE1]">
												{request.requestedQuantity} {request.unit}
											</span>
										</div>
										<div className="flex items-center justify-between gap-3">
											<span>Created</span>
											<span className="font-medium text-[#F0EBE1]">
												{formatDate(request.createdAt)}
											</span>
										</div>
									</div>

									{request.status === "completed" && (
										<div className="mt-4 pt-4 border-t border-white/10">
											<button
												type="button"
												onClick={() => openCollectionModal(request)}
												className="w-full rounded-xl bg-[#7DC542]/10 px-4 py-2.5 text-sm font-bold text-[#7DC542] transition hover:bg-[#7DC542]/20"
											>
												Mark Collected
											</button>
										</div>
									)}
								</article>
							))}
						</div>
					</>
				)}
			</div>

			{selectedRequest && (
				<CollectionConfirmationModal
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
					onSuccess={handleCollectionSuccess}
					donationRequestId={selectedRequest.donationRequestId}
					defaultQuantity={selectedRequest.requestedQuantity}
					unit={selectedRequest.unit}
					foodType={selectedRequest.foodType}
				/>
			)}
		</DashboardLayout>
	);
}
