import { useCallback, useEffect, useState } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { getAllDonations } from "../services/donationService";
import type { Donation } from "../types/Dashboard";

function formatDate(dateStr: string): string {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function DonorExploreRequests() {
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState<Donation[]>([]);
    const [error, setError] = useState<string | null>(null);

    const fetchRequests = useCallback(async (): Promise<void> => {
        try {
            const data = await getAllDonations("REQUESTED");
            setRequests(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load requests.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchRequests();
    }, [fetchRequests]);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-bold text-[#F0EBE1]">Explore Requests</h2>
                    <p className="mt-1 text-sm text-[#F0EBE1]/65">
                        Browse donation requests from distribution centers and help fulfill their needs.
                    </p>
                </div>

                {loading ? (
                    <div className="space-y-3">
                        <div className="skeleton-shimmer h-[100px]" />
                        <div className="skeleton-shimmer h-[100px]" />
                        <div className="skeleton-shimmer h-[100px]" />
                    </div>
                ) : error ? (
                    <div className="rounded-xl border border-rose-400/35 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-100" role="alert">
                        {error}
                    </div>
                ) : requests.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-white/15 bg-white/5 p-8 text-center">
                        <p className="text-lg font-bold text-[#F0EBE1]/70">No Requests Found</p>
                        <p className="mt-1 text-sm text-[#F0EBE1]/50">
                            There are currently no donation requests from distribution centers. Check back later!
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {requests.map((request) => (
                            <article
                                key={request.donation_id}
                                className="rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-white/15"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <p className="text-base font-bold text-[#F0EBE1]">{request.food_type}</p>
                                        <p className="mt-0.5 text-sm text-[#F0EBE1]/65">{request.description}</p>
                                    </div>
                                    <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-extrabold tracking-wide text-amber-300">
                                        REQUESTED
                                    </span>
                                </div>

                                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#F0EBE1]/70">
                                    <span>Quantity: {request.quantity} {request.unit}</span>
                                    <span>Pickup: {request.pickup_location}</span>
                                    <span>Expires: {formatDate(request.expiry_date)}</span>
                                    <span>Available At: {request.availability_time}</span>
                                    <span>Created: {formatDate(request.created_at)}</span>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
