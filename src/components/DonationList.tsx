import { useMemo, useState } from "react";
import type { Donation, DonationStatus } from "../types/Dashboard";

interface DonationListProps {
	donations: Donation[];
}

type DonationFilter = "ALL" | DonationStatus;

const FILTER_OPTIONS: Array<{ label: string; value: DonationFilter }> = [
	{ label: "All", value: "ALL" },
	{ label: "Available", value: "AVAILABLE" },
	{ label: "Requested", value: "REQUESTED" },
	{ label: "Collected", value: "COLLECTED" },
	{ label: "Completed", value: "COMPLETED" },
];

const STATUS_CLASSES: Record<DonationStatus, string> = {
	AVAILABLE: "bg-emerald-500/15 text-emerald-300",
	REQUESTED: "bg-amber-500/15 text-amber-300",
	ACCEPTED: "bg-sky-500/15 text-sky-300",
	COLLECTED: "bg-sky-500/15 text-sky-300",
	COMPLETED: "bg-violet-500/15 text-violet-300",
};

function formatCreatedDate(value: string): string {
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) {
		return value;
	}

	return new Intl.DateTimeFormat("en-LK", {
		year: "numeric",
		month: "short",
		day: "numeric",
	}).format(parsed);
}

export default function DonationList({ donations }: DonationListProps) {
	const [activeFilter, setActiveFilter] = useState<DonationFilter>("ALL");

	const filteredDonations = useMemo(() => {
		if (activeFilter === "ALL") {
			return donations;
		}

		return donations.filter((donation) => donation.status === activeFilter);
	}, [activeFilter, donations]);

	return (
		<section className="space-y-4">
			<div className="flex flex-wrap items-center gap-2">
				{FILTER_OPTIONS.map((option) => {
					const isActive = option.value === activeFilter;

					return (
						<button
							key={option.value}
							type="button"
							onClick={() => setActiveFilter(option.value)}
							className={`rounded-full border px-4 py-2 text-xs font-extrabold uppercase tracking-[0.08em] transition ${
								isActive
									? "border-[#7DC542] bg-[#7DC542] text-[#0B1A08]"
									: "border-white/12 bg-white/5 text-[#F0EBE1]/70 hover:border-[#7DC542]/50 hover:text-[#F0EBE1]"
							}`}
						>
							{option.label}
						</button>
					);
				})}
			</div>

			{filteredDonations.length === 0 ? (
				<div className="rounded-xl border border-dashed border-white/10 bg-white/4 px-5 py-8 text-center">
					<p className="text-base font-bold text-[#F0EBE1]">No donations found</p>
					<p className="mt-1 text-sm text-[#F0EBE1]/60">Try another status filter or create a new donation listing.</p>
				</div>
			) : (
				<div className="space-y-3">
					{filteredDonations.map((donation) => (
						<article key={donation.donationId} className="rounded-xl border border-white/10 bg-white/5 p-4">
							<div className="flex flex-wrap items-start justify-between gap-3">
								<div>
									<p className="text-base font-bold text-[#F0EBE1]">{donation.foodType}</p>
									<p className="mt-1 text-sm text-[#F0EBE1]/65">
										Quantity: {donation.quantity} {donation.unit}
									</p>
								</div>
								<span className={`rounded-full px-3 py-1 text-xs font-extrabold tracking-wide ${STATUS_CLASSES[donation.status]}`}>
									{donation.status}
								</span>
							</div>

							<div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
								<div className="rounded-lg border border-white/6 bg-[#111F0F]/80 px-3 py-2">
									<p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#F0EBE1]/45">Created</p>
									<p className="mt-1 text-[#F0EBE1]">{formatCreatedDate(donation.createdAt)}</p>
								</div>
								<div className="rounded-lg border border-white/6 bg-[#111F0F]/80 px-3 py-2">
									<p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#F0EBE1]/45">Pickup</p>
									<p className="mt-1 text-[#F0EBE1]">{donation.pickupAddress}</p>
								</div>
								<div className="rounded-lg border border-white/6 bg-[#111F0F]/80 px-3 py-2">
									<p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#F0EBE1]/45">Available At</p>
									<p className="mt-1 text-[#F0EBE1]">{donation.availabilityTime}</p>
								</div>
								<div className="rounded-lg border border-white/6 bg-[#111F0F]/80 px-3 py-2">
									<p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#F0EBE1]/45">Expires</p>
									<p className="mt-1 text-[#F0EBE1]">{formatCreatedDate(donation.expirationDate)}</p>
								</div>
							</div>
						</article>
					))}
				</div>
			)}
		</section>
	);
}
