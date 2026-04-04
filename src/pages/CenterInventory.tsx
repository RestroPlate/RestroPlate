import { useCallback, useEffect, useState } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { getInventory } from "../services/inventoryService";
import type { Donation } from "../types/Dashboard";
import CollectionConfirmationModal from "../components/dashboard/CollectionConfirmationModal";

function formatDate(value: string): string {
	if (!value) return "N/A";
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) return value;
	return parsed.toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function getStatusClasses(status: string | null): string {
	if (!status) return "bg-gray-500/15 text-gray-300";
	switch (status.toUpperCase()) {
		case "COLLECTED":
		case "AVAILABLE":
		case "COMPLETED":
			return "bg-emerald-500/15 text-emerald-300";
		case "REQUESTED":
			return "bg-amber-500/15 text-amber-300";
		default:
			return "bg-gray-500/15 text-gray-300";
	}
}

export default function CenterInventory() {
	const [inventory, setInventory] = useState<Donation[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [selectedDonation, setSelectedDonation] = useState<Donation | null>(
		null,
	);

	const loadInventory = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await getInventory();
			setInventory(data);
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Failed to load distribution inventory.",
			);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void loadInventory();
	}, [loadInventory]);

	return (
		<DashboardLayout>
			<div className="space-y-6">
				<div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 lg:flex-row lg:items-end lg:justify-between">
					<div className="max-w-2xl">
						<p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7DC542]">
							Center Inventory
						</p>
						<h2 className="mt-2 text-2xl font-black text-[#F0EBE1]">
							Manage Collected Donations
						</h2>
						<p className="mt-2 text-sm text-[#F0EBE1]/65">
							This page reads `GET /api/inventory` so your center can track
							claimed items and update effectively collected quantities.
						</p>
					</div>
				</div>

				{error ? (
					<div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-100">
						{error}
					</div>
				) : null}

				{loading ? (
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						<div className="skeleton-shimmer h-[160px]" />
						<div className="skeleton-shimmer h-[160px]" />
						<div className="skeleton-shimmer h-[160px]" />
					</div>
				) : inventory.length === 0 ? (
					<div className="rounded-2xl border border-dashed border-white/15 bg-white/5 px-6 py-12 text-center">
						<h3 className="text-lg font-bold text-[#F0EBE1]">
							Your inventory is currently empty
						</h3>
						<p className="mt-2 text-sm text-[#F0EBE1]/55">
							Claim donations from providers and mark them as collected here to
							track your stock.
						</p>
					</div>
				) : (
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{inventory.map((item) => (
							<article
								key={item.donationId}
								className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#0B1A08] transition hover:border-[#7DC542]/30 hover:bg-[#7DC542]/5"
							>
								{/* Decorative Background Glow */}
								<div className="pointer-events-none absolute -inset-x-24 -top-24 h-48 bg-gradient-to-full from-[#7DC542]/10 via-[#7DC542]/5 to-transparent opacity-0 blur-2xl transition group-hover:opacity-100" />

								<div className="relative p-5">
									<div className="flex items-start justify-between gap-3">
										<div>
											<p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7DC542]">
												Donation #{item.donationId}
											</p>
											<h3 className="mt-2 text-lg font-black text-[#F0EBE1] capitalize">
												{item.foodType}
											</h3>
										</div>
										<span
											className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${getStatusClasses(item.status)}`}
										>
											{item.status || "COLLECTED"}
										</span>
									</div>

									<div className="mt-5 space-y-3">
										<div className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2 text-sm transition group-hover:bg-white/10">
											<span className="text-[#F0EBE1]/55">Volume</span>
											<span className="font-bold text-[#F0EBE1]">
												{item.quantity} {item.unit}
											</span>
										</div>

										<div className="flex flex-col gap-1 rounded-xl bg-white/5 px-3 py-2 text-sm transition group-hover:bg-white/10">
											<div className="flex items-center justify-between">
												<span className="text-[#F0EBE1]/55">Pickup Time</span>
											</div>
											<span className="font-bold text-[#F0EBE1]">
												{formatDate(item.availabilityTime)}
											</span>
										</div>
									</div>
								</div>

								<div className="relative border-t border-white/5 p-4">
									<button
										type="button"
										onClick={() => setSelectedDonation(item)}
										className="w-full rounded-xl bg-sky-500/15 py-3 text-sm font-bold text-sky-400 transition hover:bg-sky-500/25"
									>
										Update Collected Qty
									</button>
								</div>
							</article>
						))}
					</div>
				)}
			</div>

			{selectedDonation && (
				<CollectionConfirmationModal
					isOpen={!!selectedDonation}
					onClose={() => setSelectedDonation(null)}
					onSuccess={() => {
						setSelectedDonation(null);
						void loadInventory();
					}}
					donationId={selectedDonation.donationId}
					defaultQuantity={selectedDonation.quantity}
					unit={selectedDonation.unit}
					foodType={selectedDonation.foodType}
				/>
			)}
		</DashboardLayout>
	);
}
