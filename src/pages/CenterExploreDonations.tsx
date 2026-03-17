import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { getAvailableDonations } from "../services/donationService";
import { submitDonationRequest } from "../services/donationRequestService";
import type { Donation } from "../types/Dashboard";

function formatDate(value: string): string {
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) return value;
	return parsed.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

export default function CenterExploreDonations() {
	const [donations, setDonations] = useState<Donation[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [foodTypeFilter, setFoodTypeFilter] = useState("");
	const [locationFilter, setLocationFilter] = useState("");
	const [sortBy, setSortBy] = useState("expirationDate");
	const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
	const [requestedQuantity, setRequestedQuantity] = useState("");
	const [requesting, setRequesting] = useState(false);
	const [requestError, setRequestError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	useEffect(() => {
		const timeoutId = window.setTimeout(async () => {
			setLoading(true);
			setError(null);
			try {
				const data = await getAvailableDonations({
					foodType: foodTypeFilter || undefined,
					location: locationFilter || undefined,
					sortBy: sortBy || undefined,
				});
				setDonations(data);
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: "Failed to load available donations.",
				);
			} finally {
				setLoading(false);
			}
		}, 250);

		return () => window.clearTimeout(timeoutId);
	}, [foodTypeFilter, locationFilter, sortBy]);

	useEffect(() => {
		if (!successMessage) return undefined;
		const timeoutId = window.setTimeout(() => {
			setSuccessMessage(null);
		}, 4000);

		return () => window.clearTimeout(timeoutId);
	}, [successMessage]);

	function openRequestModal(donation: Donation): void {
		setSelectedDonation(donation);
		setRequestedQuantity(String(donation.quantity));
		setRequestError(null);
	}

	function closeRequestModal(): void {
		if (requesting) return;
		setSelectedDonation(null);
		setRequestedQuantity("");
		setRequestError(null);
	}

	async function handleRequestSubmit(
		event: React.FormEvent<HTMLFormElement>,
	): Promise<void> {
		event.preventDefault();
		if (!selectedDonation) return;

		const quantity = Number(requestedQuantity);
		if (Number.isNaN(quantity) || quantity <= 0) {
			setRequestError("Enter a requested quantity greater than 0.");
			return;
		}

		if (quantity > selectedDonation.quantity) {
			setRequestError(
				`Requested quantity cannot exceed ${selectedDonation.quantity} ${selectedDonation.unit}.`,
			);
			return;
		}

		setRequesting(true);
		setRequestError(null);

		try {
			const response = await submitDonationRequest({
				donationId: selectedDonation.donation_id,
				requestedQuantity: quantity,
			});

			setDonations((current) =>
				current.filter(
					(donation) => donation.donation_id !== selectedDonation.donation_id,
				),
			);
			setSuccessMessage(
				`Request #${response.donationRequestId} submitted with ${response.status} status.`,
			);
			setSelectedDonation(null);
			setRequestedQuantity("");
		} catch (err) {
			setRequestError(
				err instanceof Error
					? err.message
					: "Failed to submit donation request.",
			);
		} finally {
			setRequesting(false);
		}
	}

	return (
		<DashboardLayout>
			<div className="space-y-6">
				<div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 lg:flex-row lg:items-end lg:justify-between">
					<div className="max-w-2xl">
						<p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7DC542]">
							Request Donation
						</p>
						<h2 className="mt-2 text-2xl font-black text-[#F0EBE1]">
							Browse provider listings and request the quantity your center can collect.
						</h2>
						<p className="mt-2 text-sm text-[#F0EBE1]/65">
							Creating a request uses the backend `POST /api/donation-requests`
							endpoint and moves that donation into the requested state for the provider.
						</p>
					</div>

					<Link
						to="/dashboard/center/requests"
						className="inline-flex items-center justify-center rounded-xl border border-[#7DC542]/35 bg-[#7DC542]/10 px-4 py-3 text-sm font-bold text-[#7DC542] transition hover:border-[#7DC542]/60 hover:bg-[#7DC542]/15"
					>
						View Outgoing Requests
					</Link>
				</div>

				<div className="grid gap-4 md:grid-cols-3">
					<label className="space-y-2">
						<span className="text-sm font-bold text-[#F0EBE1]">Food Type</span>
						<input
							type="text"
							value={foodTypeFilter}
							onChange={(event) => setFoodTypeFilter(event.target.value)}
							placeholder="Rice, bread, vegetables"
							className="auth-input w-full"
						/>
					</label>

					<label className="space-y-2">
						<span className="text-sm font-bold text-[#F0EBE1]">Location</span>
						<input
							type="text"
							value={locationFilter}
							onChange={(event) => setLocationFilter(event.target.value)}
							placeholder="Colombo, Kandy"
							className="auth-input w-full"
						/>
					</label>

					<label className="space-y-2">
						<span className="text-sm font-bold text-[#F0EBE1]">Sort By</span>
						<select
							value={sortBy}
							onChange={(event) => setSortBy(event.target.value)}
							className="auth-input w-full cursor-pointer"
						>
							<option value="expirationDate">Expiration Date</option>
							<option value="createdAt">Newest First</option>
						</select>
					</label>
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
					<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
						{[1, 2, 3, 4, 5, 6].map((item) => (
							<div key={item} className="skeleton-shimmer h-[240px]" />
						))}
					</div>
				) : donations.length === 0 ? (
					<div className="rounded-2xl border border-dashed border-white/15 bg-white/5 px-6 py-12 text-center">
						<h3 className="text-lg font-bold text-[#F0EBE1]">
							No available donations match these filters
						</h3>
						<p className="mt-2 text-sm text-[#F0EBE1]/55">
							Adjust the food type or location filters, or check back after providers post
							new donations.
						</p>
					</div>
				) : (
					<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
						{donations.map((donation) => (
							<article
								key={donation.donation_id}
								className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-[#7DC542]/30 hover:bg-white/[0.06]"
							>
								<div className="flex items-start justify-between gap-3">
									<div>
										<p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7DC542]">
											Donation #{donation.donation_id}
										</p>
										<h3 className="mt-2 text-xl font-bold text-[#F0EBE1]">
											{donation.food_type}
										</h3>
									</div>

									<span className="rounded-full bg-[#7DC542]/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#7DC542]">
										{donation.status}
									</span>
								</div>

								<div className="mt-5 space-y-3 text-sm text-[#F0EBE1]/70">
									<div className="flex items-center justify-between gap-3">
										<span>Quantity</span>
										<span className="font-bold text-[#F0EBE1]">
											{donation.quantity} {donation.unit}
										</span>
									</div>
									<div className="flex items-center justify-between gap-3">
										<span>Pickup Address</span>
										<span className="max-w-[13rem] text-right font-medium text-[#F0EBE1]">
											{donation.pickup_location}
										</span>
									</div>
									<div className="flex items-center justify-between gap-3">
										<span>Availability</span>
										<span className="font-medium text-[#F0EBE1]">
											{donation.availability_time}
										</span>
									</div>
									<div className="flex items-center justify-between gap-3">
										<span>Expires</span>
										<span className="font-medium text-[#F0EBE1]">
											{formatDate(donation.expiry_date)}
										</span>
									</div>
								</div>

								<button
									type="button"
									onClick={() => openRequestModal(donation)}
									className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#7DC542] px-4 py-3 text-sm font-black text-[#0B1A08] transition hover:bg-[#90D85A]"
								>
									Request Donation
								</button>
							</article>
						))}
					</div>
				)}
			</div>

			{selectedDonation ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
					<div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#10170D] shadow-2xl">
						<div className="border-b border-white/10 px-6 py-5">
							<p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7DC542]">
								Confirm Request
							</p>
							<h3 className="mt-2 text-xl font-black text-[#F0EBE1]">
								Request donation #{selectedDonation.donation_id}
							</h3>
							<p className="mt-2 text-sm text-[#F0EBE1]/60">
								This creates a donation request for your distribution center and marks
								the donation as requested on the provider side.
							</p>
						</div>

						<form onSubmit={handleRequestSubmit} className="space-y-5 px-6 py-6">
							<div className="grid gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-[#F0EBE1]/70">
								<div className="flex items-center justify-between gap-3">
									<span>Food Type</span>
									<span className="font-bold text-[#F0EBE1]">
										{selectedDonation.food_type}
									</span>
								</div>
								<div className="flex items-center justify-between gap-3">
									<span>Available Quantity</span>
									<span className="font-bold text-[#F0EBE1]">
										{selectedDonation.quantity} {selectedDonation.unit}
									</span>
								</div>
								<div className="flex items-center justify-between gap-3">
									<span>Pickup Address</span>
									<span className="max-w-[14rem] text-right font-medium text-[#F0EBE1]">
										{selectedDonation.pickup_location}
									</span>
								</div>
							</div>

							<label className="space-y-2">
								<span className="text-sm font-bold text-[#F0EBE1]">
									Requested Quantity ({selectedDonation.unit})
								</span>
								<input
									type="number"
									min="0.01"
									step="0.01"
									value={requestedQuantity}
									onChange={(event) => setRequestedQuantity(event.target.value)}
									className="auth-input w-full"
									required
								/>
							</label>

							{requestError ? (
								<div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-100">
									{requestError}
								</div>
							) : null}

							<div className="flex gap-3">
								<button
									type="button"
									onClick={closeRequestModal}
									disabled={requesting}
									className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-[#F0EBE1] transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={requesting}
									className="flex-1 rounded-xl bg-[#7DC542] px-4 py-3 text-sm font-black text-[#0B1A08] transition hover:bg-[#90D85A] disabled:cursor-not-allowed disabled:opacity-60"
								>
									{requesting ? "Submitting..." : "Confirm Request"}
								</button>
							</div>
						</form>
					</div>
				</div>
			) : null}
		</DashboardLayout>
	);
}
