import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { getCenterOutgoingRequests } from "../services/donationRequestService";
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

export default function CenterOutgoingRequests() {
	const [requests, setRequests] = useState<DonationRequest[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [statusFilter, setStatusFilter] = useState<RequestFilter>("all");

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

	const pendingRequests = requests.filter((request) => request.status === "pending").length;
	const approvedRequests = requests.filter((request) => request.status === "approved").length;
	const rejectedRequests = requests.filter((request) => request.status === "rejected").length;

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
							follow request status changes from pending through approval or rejection.
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

				<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
					{[
						{ label: "Total", value: requests.length },
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
								</article>
							))}
						</div>
					</>
				)}
			</div>
		</DashboardLayout>
	);
}
