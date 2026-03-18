import { useEffect, useState } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { getAvailableRequests } from "../services/donationRequestService";
import { createDonation } from "../services/donationService";
import { updateDonationRequestQuantity } from "../services/donationRequestService";
import type { DonationRequest, DonationRequestStatus } from "../types/Dashboard";

type RequestFilter = "all" | DonationRequestStatus;

const FILTERS: RequestFilter[] = ["all", "pending", "approved", "rejected"];

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
		case "approved":
			return "bg-emerald-500/15 text-emerald-300";
		case "rejected":
			return "bg-rose-500/15 text-rose-300";
		default:
			return "bg-amber-500/15 text-amber-300";
	}
}

export default function DonorExploreRequests() {
	const [requests, setRequests] = useState<DonationRequest[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [statusFilter, setStatusFilter] = useState<RequestFilter>("all");

	// Modal state
	const [selectedRequest, setSelectedRequest] = useState<DonationRequest | null>(null);
	const [acceptedQuantity, setAcceptedQuantity] = useState("");
	const [expirationDate, setExpirationDate] = useState("");
	const [pickupAddress, setPickupAddress] = useState("");
	const [availabilityTime, setAvailabilityTime] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [modalError, setModalError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	useEffect(() => {
		let active = true;

		async function loadRequests(): Promise<void> {
			setLoading(true);
			setError(null);

			try {
				const data = await getAvailableRequests(
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
							: "Failed to load donation requests.",
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

	useEffect(() => {
		if (!successMessage) return undefined;
		const timeoutId = window.setTimeout(() => {
			setSuccessMessage(null);
		}, 4000);

		return () => window.clearTimeout(timeoutId);
	}, [successMessage]);

	const totalRequests = requests.length;
	const pendingRequests = requests.filter((request) => request.status === "pending").length;
	const approvedRequests = requests.filter((request) => request.status === "approved").length;
	const rejectedRequests = requests.filter((request) => request.status === "rejected").length;

	function openAcceptModal(request: DonationRequest): void {
		setSelectedRequest(request);
		setAcceptedQuantity(String(request.requestedQuantity));
		setExpirationDate("");
		setPickupAddress("");
		setAvailabilityTime("");
		setModalError(null);
	}

	function closeAcceptModal(): void {
		if (submitting) return;
		setSelectedRequest(null);
	}

	async function handleAcceptSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
		event.preventDefault();
		if (!selectedRequest) return;

		const quantity = Number(acceptedQuantity);
		if (Number.isNaN(quantity) || quantity <= 0) {
			setModalError("Quantity must be greater than 0");
			return;
		}

		if (!expirationDate || !pickupAddress.trim() || !availabilityTime) {
			setModalError("Please fill out all fields");
			return;
		}

		setSubmitting(true);
		setModalError(null);

		try {
			await createDonation({
				donationRequestId: selectedRequest.donationRequestId,
				foodType: selectedRequest.foodType,
				quantity,
				unit: selectedRequest.unit,
				expirationDate,
				pickupAddress: pickupAddress.trim(),
				availabilityTime
			});

			setSuccessMessage(`Successfully created donation to fulfill request #${selectedRequest.donationRequestId}`);

			// Update the donation request quantity on the server
			await updateDonationRequestQuantity(selectedRequest.donationRequestId, { donatedQuantity: quantity });

			// Update local list: reduce requestedQuantity, remove if fulfilled
			setRequests(current => {
				return current.map(r => {
					if (r.donationRequestId === selectedRequest.donationRequestId) {
						const newQty = r.requestedQuantity - quantity;
						return { ...r, requestedQuantity: newQty > 0 ? newQty : 0 };
					}
					return r;
				}).filter(r => r.requestedQuantity > 0);
			});

			closeAcceptModal();
		} catch (err) {
			setModalError(err instanceof Error ? err.message : "Failed to accept request.");
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<DashboardLayout>
			<div className="space-y-6">
				<div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 lg:flex-row lg:items-end lg:justify-between">
					<div className="max-w-2xl">
						<p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7DC542]">
							Available Requests
						</p>
						<h2 className="mt-2 text-2xl font-black text-[#F0EBE1]">
							View and fulfill open requests from distribution centers.
						</h2>
						<p className="mt-2 text-sm text-[#F0EBE1]/65">
							Distribution centers raise requirements. Accept a request to supply the required food directly to them.
						</p>
					</div>

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
				</div>

				<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
					{[
						{ label: "Total", value: totalRequests },
						{ label: "Pending", value: pendingRequests },
						{ label: "Approved", value: approvedRequests },
						{ label: "Rejected", value: rejectedRequests },
					].map((item) => (
						<div
							key={item.label}
							className="rounded-xl border border-white/10 bg-white/5 px-5 py-4"
						>
							<p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#F0EBE1]/60">
								{item.label}
							</p>
							<p className="mt-1 text-3xl font-black text-[#7DC542]">{item.value}</p>
						</div>
					))}
				</div>

				{successMessage ? (
					<div className="rounded-xl border border-[#7DC542]/30 bg-[#7DC542]/10 px-4 py-3 text-sm font-semibold text-[#D6F2BE]">
						{successMessage}
					</div>
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
							No requests found
						</h3>
						<p className="mt-2 text-sm text-[#F0EBE1]/55">
							No distribution centers have open requests for your current filters.
						</p>
					</div>
				) : (
					<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
						{requests.map((request) => (
							<article
								key={request.donationRequestId}
								className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-[#7DC542]/30 hover:bg-white/[0.06]"
							>
								<div className="flex items-start justify-between gap-3">
									<div>
										<p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7DC542]">
											Request #{request.donationRequestId}
										</p>
										<h3 className="mt-2 text-xl font-bold text-[#F0EBE1]">
											{request.foodType}
										</h3>
									</div>

									<span
										className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${getStatusClasses(request.status)}`}
									>
										{request.status}
									</span>
								</div>

								<div className="mt-5 space-y-3 text-sm text-[#F0EBE1]/70">
									<div className="flex items-center justify-between gap-3">
										<span>Requested Quantity</span>
										<span className="font-bold text-[#F0EBE1]">
											{request.requestedQuantity} {request.unit}
										</span>
									</div>
									<div className="flex items-center justify-between gap-3">
										<span>Requested By Center</span>
										<span className="font-medium text-[#F0EBE1]">
											User #{request.distributionCenterUserId}
										</span>
									</div>
									<div className="flex items-center justify-between gap-3">
										<span>Created</span>
										<span className="font-medium text-[#F0EBE1]">
											{formatDate(request.createdAt)}
										</span>
									</div>
								</div>

								{request.status === "pending" && (
									<button
										type="button"
										onClick={() => openAcceptModal(request)}
										className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#7DC542] px-4 py-3 text-sm font-black text-[#0B1A08] transition hover:bg-[#90D85A]"
									>
										Accept Request
									</button>
								)}
							</article>
						))}
					</div>
				)}
			</div>

			{selectedRequest ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 overflow-y-auto">
					<div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#10170D] shadow-2xl">
						<div className="border-b border-white/10 px-6 py-5">
							<p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7DC542]">
								Fulfill Request
							</p>
							<h3 className="mt-2 text-xl font-black text-[#F0EBE1]">
								Accept Request #{selectedRequest.donationRequestId}
							</h3>
							<p className="mt-2 text-sm text-[#F0EBE1]/60">
								Provide the details of your donation to fulfill this center's requirements.
							</p>
						</div>

						<form onSubmit={handleAcceptSubmit} className="space-y-4 px-6 py-6">
							<div className="grid gap-2 mb-4 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-[#F0EBE1]/70">
								<div className="flex items-center justify-between gap-3">
									<span>Food Type</span>
									<span className="font-bold text-[#F0EBE1]">
										{selectedRequest.foodType}
									</span>
								</div>
								<div className="flex items-center justify-between gap-3">
									<span>Requested Quantity</span>
									<span className="font-bold text-[#F0EBE1]">
										{selectedRequest.requestedQuantity} {selectedRequest.unit}
									</span>
								</div>
							</div>

							<label className="block space-y-1.5">
								<span className="text-xs font-bold text-[#F0EBE1] uppercase tracking-[0.08em]">
									Quantity You Can Provide ({selectedRequest.unit})
								</span>
								<input
									type="number"
									min="0.01"
									step="0.01"
									value={acceptedQuantity}
									onChange={(e) => setAcceptedQuantity(e.target.value)}
									className="auth-input w-full"
									required
								/>
							</label>

							<label className="block space-y-1.5">
								<span className="text-xs font-bold text-[#F0EBE1] uppercase tracking-[0.08em]">Expiration Date</span>
								<input
									type="date"
									value={expirationDate}
									onChange={(e) => setExpirationDate(e.target.value)}
									className="auth-input w-full"
									required
								/>
							</label>

							<label className="block space-y-1.5">
								<span className="text-xs font-bold text-[#F0EBE1] uppercase tracking-[0.08em]">Pickup Address</span>
								<input
									type="text"
									value={pickupAddress}
									onChange={(e) => setPickupAddress(e.target.value)}
									placeholder="No. 12, Main Street"
									className="auth-input w-full"
									required
								/>
							</label>

							<label className="block space-y-1.5">
								<span className="text-xs font-bold text-[#F0EBE1] uppercase tracking-[0.08em]">Availability Time</span>
								<input
									type="time"
									value={availabilityTime}
									onChange={(e) => setAvailabilityTime(e.target.value)}
									className="auth-input w-full"
									required
								/>
							</label>

							{modalError ? (
								<div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-100">
									{modalError}
								</div>
							) : null}

							<div className="flex gap-3 pt-2">
								<button
									type="button"
									onClick={closeAcceptModal}
									disabled={submitting}
									className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-[#F0EBE1] transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={submitting}
									className="flex-1 rounded-xl bg-[#7DC542] px-4 py-3 text-sm font-black text-[#0B1A08] transition hover:bg-[#90D85A] disabled:cursor-not-allowed disabled:opacity-60"
								>
									{submitting ? "Submitting..." : "Accept Request"}
								</button>
							</div>
						</form>
					</div>
				</div>
			) : null}
		</DashboardLayout>
	);
}
