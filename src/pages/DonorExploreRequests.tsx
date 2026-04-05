// modified: renamed button to "Fulfill", added inline validation capping quantity at remaining,
// appends to "My Donations" with REQUESTED badge (no AVAILABLE phase in Flow 2),
// shows toast "Donation submitted — deliver to [DC Name]"
import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import StatusNotice from "../components/StatusNotice";
import { getAvailableRequests } from "../services/donationRequestService";
import { createDonation } from "../services/donationService";
import { updateDonationRequestQuantity } from "../services/donationRequestService";
import type {
	DonationRequest,
	DonationRequestStatus,
} from "../types/Dashboard";
// @ts-ignore
import LocationPicker from "react-location-picker";
import LocationView from "../components/dashboard/LocationView";

type SortOrder = "newest" | "oldest";

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

/* ── SVG icon helpers ── */
function SearchIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 20 20"
			fill="currentColor"
			className="h-4 w-4"
		>
			<path
				fillRule="evenodd"
				d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
				clipRule="evenodd"
			/>
		</svg>
	);
}

function MapPinIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 20 20"
			fill="currentColor"
			className={className}
		>
			<path
				fillRule="evenodd"
				d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z"
				clipRule="evenodd"
			/>
		</svg>
	);
}

function SortIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 20 20"
			fill="currentColor"
			className="h-4 w-4"
		>
			<path
				fillRule="evenodd"
				d="M2.24 6.8a.75.75 0 001.06-.04l1.95-2.1v8.59a.75.75 0 001.5 0V4.66l1.95 2.1a.75.75 0 101.1-1.02l-3.25-3.5a.75.75 0 00-1.1 0L2.2 5.74a.75.75 0 00.04 1.06zm8.6 9.2a.75.75 0 01-.04-1.06l3.25-3.5a.75.75 0 011.1 0l3.25 3.5a.75.75 0 11-1.1 1.02l-1.95-2.1v8.59a.75.75 0 01-1.5 0v-8.59l-1.95 2.1a.75.75 0 01-1.06.04z"
				clipRule="evenodd"
			/>
		</svg>
	);
}

function XIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 20 20"
			fill="currentColor"
			className="h-3.5 w-3.5"
		>
			<path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
		</svg>
	);
}

export default function DonorExploreRequests() {
	/* ── Data state ── */
	const [requests, setRequests] = useState<DonationRequest[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	/* ── Filter / search state ── */
	const [centerSearch, setCenterSearch] = useState("");
	const [locationSearch, setLocationSearch] = useState("");
	const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

	/* ── Modal state ── */
	const [selectedRequest, setSelectedRequest] =
		useState<DonationRequest | null>(null);
	const [providedQuantity, setProvidedQuantity] = useState("");
	const [expirationDate, setExpirationDate] = useState("");
	const [pickupAddress, setPickupAddress] = useState("");
	const [availabilityTime, setAvailabilityTime] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [modalError, setModalError] = useState<string | null>(null);
	const [mapCenter, setMapCenter] = useState({ lat: 6.927079, lng: 79.861244 });
	const [notice, setNotice] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);

	/* ── Computed ── */
	const remainingQuantity = selectedRequest
		? selectedRequest.requestedQuantity - selectedRequest.donatedQuantity
		: 0;

	/* ── Data fetching ── */
	useEffect(() => {
		let active = true;

		async function loadRequests(): Promise<void> {
			setLoading(true);
			setError(null);

			try {
				const data = await getAvailableRequests();
				if (active) setRequests(data);
			} catch (err) {
				if (active) {
					setError(
						err instanceof Error
							? err.message
							: "Failed to load donation requests.",
					);
				}
			} finally {
				if (active) setLoading(false);
			}
		}

		void loadRequests();
		return () => {
			active = false;
		};
	}, []);

	/* ── Auto-dismiss success toast ── */
	useEffect(() => {
		if (!notice) return undefined;
		const timeoutId = window.setTimeout(() => setNotice(null), 4000);
		return () => window.clearTimeout(timeoutId);
	}, [notice]);

	/* ── Client-side filtering & sorting ── */
	const filteredRequests = useMemo(() => {
		const centerQuery = centerSearch.trim().toLowerCase();
		const locationQuery = locationSearch.trim().toLowerCase();

		let result = requests;

		if (centerQuery) {
			result = result.filter((r) => {
				const name = (r.distributionCenterName ?? "").toLowerCase();
				return name.includes(centerQuery);
			});
		}

		if (locationQuery) {
			result = result.filter((r) => {
				const addr = (r.distributionCenterAddress ?? "").toLowerCase();
				return addr.includes(locationQuery);
			});
		}

		const sorted = [...result].sort((a, b) => {
			const dateA = new Date(a.createdAt).getTime();
			const dateB = new Date(b.createdAt).getTime();
			return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
		});

		return sorted;
	}, [requests, centerSearch, locationSearch, sortOrder]);

	const hasActiveFilters =
		centerSearch.trim() !== "" || locationSearch.trim() !== "";

	function clearAllFilters(): void {
		setCenterSearch("");
		setLocationSearch("");
		setSortOrder("newest");
	}

	/* ── Modal handlers ── */
	function openFulfillModal(request: DonationRequest): void {
		setSelectedRequest(request);
		const remaining = request.requestedQuantity - request.donatedQuantity;
		setProvidedQuantity(String(remaining));
		setExpirationDate("");
		setPickupAddress("");
		setAvailabilityTime("");
		setModalError(null);
	}

	function closeFulfillModal(): void {
		if (submitting) return;
		setSelectedRequest(null);
	}

	async function handleFulfillSubmit(
		event: React.FormEvent<HTMLFormElement>,
	): Promise<void> {
		event.preventDefault();
		if (!selectedRequest) return;

		const quantity = Number(providedQuantity);
		const remaining =
			selectedRequest.requestedQuantity - selectedRequest.donatedQuantity;

		if (Number.isNaN(quantity) || quantity <= 0) {
			setModalError("Quantity must be greater than 0.");
			return;
		}

		// Inline validation: cap at remaining quantity
		if (quantity > remaining) {
			setModalError(
				`Quantity cannot exceed remaining amount (${remaining} ${selectedRequest.unit}).`,
			);
			return;
		}

		if (!expirationDate || !pickupAddress.trim() || !availabilityTime) {
			setModalError("Please fill out all fields.");
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
				availabilityTime,
			});

			const dcName =
				selectedRequest.distributionCenterName ??
				`Center #${selectedRequest.distributionCenterUserId}`;
			setNotice({
				type: "success",
				message: `Donation submitted — deliver to ${dcName}`,
			});

			await updateDonationRequestQuantity(selectedRequest.donationRequestId, {
				donatedQuantity: quantity,
			});

			// Optimistically update remaining quantity
			setRequests((current) => {
				return current
					.map((r) => {
						if (r.donationRequestId === selectedRequest.donationRequestId) {
							const newDonated = r.donatedQuantity + quantity;
							return { ...r, donatedQuantity: newDonated };
						}
						return r;
					})
					.filter((r) => r.requestedQuantity - r.donatedQuantity > 0);
			});

			closeFulfillModal();
		} catch (err) {
			setModalError(
				err instanceof Error ? err.message : "Failed to fulfill request.",
			);
		} finally {
			setSubmitting(false);
		}
	}

	/* ── Render ── */
	return (
		<DashboardLayout>
			<div className="space-y-6">
				{/* ── Header ── */}
				<div className="rounded-2xl border border-white/10 bg-white/5 p-6">
					<p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7DC542]">
						Flow 2 — Browse Requests
					</p>
					<h2 className="mt-2 text-2xl font-black text-[#F0EBE1]">
						View and fulfill open requests from distribution centers.
					</h2>
					<p className="mt-2 text-sm text-[#F0EBE1]/65">
						Distribution centers post requirements. Fulfill a request to supply
						the required food directly to them.
					</p>
				</div>

				{/* ── Search & Filter Toolbar ── */}
				<div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
					<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
						{/* Search by Center Name */}
						<label className="space-y-1.5">
							<span className="text-xs font-bold uppercase tracking-[0.08em] text-[#F0EBE1]/70">
								Search Center
							</span>
							<div className="relative">
								<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#F0EBE1]/40">
									<SearchIcon />
								</div>
								<input
									id="search-center-name"
									type="text"
									value={centerSearch}
									onChange={(e) => setCenterSearch(e.target.value)}
									placeholder="Type center name..."
									className="auth-input w-full pl-9"
								/>
							</div>
						</label>

						{/* Search by Location */}
						<label className="space-y-1.5">
							<span className="text-xs font-bold uppercase tracking-[0.08em] text-[#F0EBE1]/70">
								Search Location
							</span>
							<div className="overflow-hidden rounded-xl border border-white/10">
								<LocationPicker
									defaultPosition={{ lat: 6.927079, lng: 79.861244 }}
									onChange={({ position, address }: { position: { lat: number; lng: number }; address: string }) => {
										const locString = address || `${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`;
										setLocationSearch(locString);
									}}
									mapContainerStyle={{ height: '140px', width: '100%' }}
								/>
								<div className="p-1.5 text-[11px] text-[#F0EBE1] break-all bg-[#0F1D0C]/50">
									<span className="opacity-50">Filter: </span>
									{locationSearch || "(Any)"}
								</div>
							</div>
						</label>

						{/* Sort Order */}
						<label className="space-y-1.5">
							<span className="text-xs font-bold uppercase tracking-[0.08em] text-[#F0EBE1]/70">
								Sort By Date
							</span>
							<div className="relative">
								<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#F0EBE1]/40">
									<SortIcon />
								</div>
								<select
									id="sort-order"
									value={sortOrder}
									onChange={(e) => setSortOrder(e.target.value as SortOrder)}
									className="auth-input w-full cursor-pointer pl-9"
								>
									<option value="newest">Newest First</option>
									<option value="oldest">Oldest First</option>
								</select>
							</div>
						</label>
					</div>

					{/* Active filter summary & clear */}
					{hasActiveFilters && (
						<div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
							<span className="text-xs font-semibold text-[#F0EBE1]/50">
								Active filters:
							</span>

							{centerSearch.trim() && (
								<span className="inline-flex items-center gap-1.5 rounded-full bg-[#7DC542]/15 px-3 py-1 text-xs font-bold text-[#7DC542]">
									Center: "{centerSearch.trim()}"
									<button
										type="button"
										onClick={() => setCenterSearch("")}
										className="rounded-full p-0.5 transition hover:bg-[#7DC542]/25"
									>
										<XIcon />
									</button>
								</span>
							)}

							{locationSearch.trim() && (
								<span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/15 px-3 py-1 text-xs font-bold text-sky-300">
									Location: "{locationSearch.trim()}"
									<button
										type="button"
										onClick={() => setLocationSearch("")}
										className="rounded-full p-0.5 transition hover:bg-sky-500/25"
									>
										<XIcon />
									</button>
								</span>
							)}

							<button
								type="button"
								onClick={clearAllFilters}
								className="ml-auto rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-[#F0EBE1]/70 transition hover:bg-white/10 hover:text-[#F0EBE1]"
							>
								Clear All
							</button>
						</div>
					)}
				</div>

				{/* ── Notices ── */}
				{notice ? (
					<StatusNotice
						type={notice.type}
						message={notice.message}
						onClose={() => setNotice(null)}
					/>
				) : null}

				{error ? (
					<div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-100">
						{error}
					</div>
				) : null}

				{/* ── Request Cards ── */}
				{loading ? (
					<div className="space-y-3">
						<div className="skeleton-shimmer h-[100px]" />
						<div className="skeleton-shimmer h-[100px]" />
						<div className="skeleton-shimmer h-[100px]" />
					</div>
				) : filteredRequests.length === 0 ? (
					<div className="rounded-2xl border border-dashed border-white/15 bg-white/5 px-6 py-12 text-center">
						<h3 className="text-lg font-bold text-[#F0EBE1]">
							No requests found
						</h3>
						<p className="mt-2 text-sm text-[#F0EBE1]/55">
							{hasActiveFilters
								? "No requests match your current search or filters. Try adjusting your criteria."
								: "No distribution centers have open requests right now."}
						</p>
						{hasActiveFilters && (
							<button
								type="button"
								onClick={clearAllFilters}
								className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-[#F0EBE1]/70 transition hover:bg-white/10 hover:text-[#F0EBE1]"
							>
								<XIcon />
								Clear All Filters
							</button>
						)}
					</div>
				) : (
					<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
						{filteredRequests.map((request) => (
							<article
								key={request.donationRequestId}
								className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-[#7DC542]/30 hover:bg-white/[0.06]"
							>
								{/* Card Header */}
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
										className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${getStatusClasses(request.status)}`}
									>
										{request.status.replace("_", " ")}
									</span>
								</div>

								{/* Card Body */}
								<div className="mt-5 flex-1 space-y-3 text-sm text-[#F0EBE1]/70">
									<div className="flex items-center justify-between gap-3">
										<span>Needed</span>
										<span className="font-bold text-[#F0EBE1]">
											{request.requestedQuantity} {request.unit}
										</span>
									</div>
									<div className="flex items-center justify-between gap-3">
										<span>Remaining</span>
										<span className="font-bold text-amber-300">
											{request.requestedQuantity - request.donatedQuantity}{" "}
											{request.unit}
										</span>
									</div>
									<div className="flex items-center justify-between gap-3">
										<span>Distribution Center</span>
										<span className="font-bold text-[#F0EBE1] text-right">
											{request.distributionCenterName ??
												`Center #${request.distributionCenterUserId}`}
										</span>
									</div>
									{request.distributionCenterAddress && (
										<div className="space-y-2">
											<div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#F0EBE1]/40">
												<MapPinIcon className="h-3.5 w-3.5 text-[#7DC542]/70" />
												Center Location
											</div>
											<LocationView address={request.distributionCenterAddress} height="120px" />
										</div>
									)}
									<div className="flex items-center justify-between gap-3">
										<span>Created</span>
										<span className="font-medium text-[#F0EBE1]">
											{formatDate(request.createdAt)}
										</span>
									</div>
								</div>

								{/* Fulfill Button */}
								{request.status === "pending" && (
									<button
										type="button"
										onClick={() => openFulfillModal(request)}
										className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#7DC542] px-4 py-3 text-sm font-black text-[#0B1A08] transition hover:bg-[#90D85A] active:scale-[0.98]"
									>
										Fulfill
									</button>
								)}
							</article>
						))}
					</div>
				)}
			</div>

			{/* ── Fulfill Request Modal ── */}
			{selectedRequest ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 overflow-y-auto">
					<div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#10170D] shadow-2xl">
						<div className="border-b border-white/10 px-6 py-5">
							<p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7DC542]">
								Fulfill Request
							</p>
							<h3 className="mt-2 text-xl font-black text-[#F0EBE1]">
								Fulfill Request #{selectedRequest.donationRequestId}
							</h3>
							<p className="mt-2 text-sm text-[#F0EBE1]/60">
								Provide food to fulfill this center's requirements. Deliver to{" "}
								<span className="font-bold text-[#F0EBE1]">
									{selectedRequest.distributionCenterName ??
										`Center #${selectedRequest.distributionCenterUserId}`}
								</span>
								.
							</p>
						</div>

						<form
							onSubmit={handleFulfillSubmit}
							className="space-y-4 px-6 py-6"
						>
							<div className="grid gap-2 mb-4 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-[#F0EBE1]/70">
								<div className="flex items-center justify-between gap-3">
									<span>Food Type</span>
									<span className="font-bold text-[#F0EBE1]">
										{selectedRequest.foodType}
									</span>
								</div>
								<div className="flex items-center justify-between gap-3">
									<span>Remaining Quantity</span>
									<span className="font-bold text-amber-300">
										{remainingQuantity} {selectedRequest.unit}
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
									max={remainingQuantity}
									value={providedQuantity}
									onChange={(e) => {
										setProvidedQuantity(e.target.value);
										// Inline validation
										const val = Number(e.target.value);
										if (val > remainingQuantity) {
											setModalError(
												`Cannot exceed ${remainingQuantity} ${selectedRequest.unit}.`,
											);
										} else {
											setModalError(null);
										}
									}}
									className="auth-input w-full"
									required
								/>
								{Number(providedQuantity) > remainingQuantity ? (
									<p className="text-xs font-semibold text-rose-300">
										Max: {remainingQuantity} {selectedRequest.unit}
									</p>
								) : null}
							</label>

							<label className="block space-y-1.5">
								<span className="text-xs font-bold text-[#F0EBE1] uppercase tracking-[0.08em]">
									Expiration Date
								</span>
								<input
									type="date"
									value={expirationDate}
									onChange={(e) => setExpirationDate(e.target.value)}
									className="auth-input w-full"
									required
								/>
							</label>

							<label className="block space-y-1.5">
								<span className="text-xs font-bold text-[#F0EBE1] uppercase tracking-[0.08em]">
									Pickup Location / Coordinates
								</span>
								<input
									type="text"
									placeholder="Manual Lat, Lng (e.g. 6.9271, 79.8612)"
									className="auth-input w-full text-xs"
									value={pickupAddress}
									onChange={(e) => {
										const val = e.target.value;
										setPickupAddress(val);
										const parts = val.split(",").map(p => p.trim());
										if (parts.length === 2) {
											const lat = parseFloat(parts[0]);
											const lng = parseFloat(parts[1]);
											if (!isNaN(lat) && !isNaN(lng)) {
												setMapCenter({ lat, lng });
											}
										}
									}}
								/>
								<div className="overflow-hidden rounded-xl border border-white/10 bg-[#0F1D0C]">
									<LocationPicker
										defaultPosition={mapCenter}
										onChange={({ position, address }: { position: { lat: number; lng: number }; address: string }) => {
											const locString = address || `${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`;
											setPickupAddress(locString);
										}}
										mapContainerStyle={{ height: '200px', width: '100%' }}
									/>
									<div className="p-2 text-xs text-[#F0EBE1] break-all border-t border-white/5">
										<span className="opacity-50">Selected: </span>
										{pickupAddress || "(None)"}
									</div>
								</div>
							</label>

							<label className="block space-y-1.5">
								<span className="text-xs font-bold text-[#F0EBE1] uppercase tracking-[0.08em]">
									Availability Time
								</span>
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
									onClick={closeFulfillModal}
									disabled={submitting}
									className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-[#F0EBE1] transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={
										submitting || Number(providedQuantity) > remainingQuantity
									}
									className="flex-1 rounded-xl bg-[#7DC542] px-4 py-3 text-sm font-black text-[#0B1A08] transition hover:bg-[#90D85A] disabled:cursor-not-allowed disabled:opacity-60"
								>
									{submitting ? "Submitting..." : "Fulfill"}
								</button>
							</div>
						</form>
					</div>
				</div>
			) : null}
		</DashboardLayout>
	);
}
